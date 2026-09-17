import { randomUUID } from 'node:crypto';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { parseDurationToMs } from '../common/duration.js';
import type { UserModel } from '../generated/prisma/models.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { SignupDto } from './dto/signup.dto.js';
import type { AccessTokenPayload, RefreshTokenPayload } from './types/authenticated-user.js';

const PASSWORD_SALT_ROUNDS = 10;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; firstName: string; lastName: string; role: string };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthTokens> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Un compte existe déjà avec cette adresse e-mail');
    }

    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      },
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || user.status === 'DISABLED' || user.deletedAt) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Session unique : toute connexion révoque les sessions précédentes de ce compte, pour
    // empêcher qu'un même accès (payant) soit utilisé simultanément depuis plusieurs appareils.
    // La session évincée survit jusqu'à l'expiration de son jeton d'accès en cours (15 min par
    // défaut), faute de pouvoir invalider un JWT déjà signé — refresh() la rejettera ensuite.
    await this.revokeAllSessions(user.id);

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const payload = await this.verifyRefreshToken(refreshToken);

    const stored = await this.prisma.authToken.findUnique({ where: { id: payload.tokenId } });
    if (!stored || stored.type !== 'REFRESH' || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expirée, merci de vous reconnecter');
    }

    const tokenMatches = await bcrypt.compare(refreshToken, stored.tokenHash);
    if (!tokenMatches) {
      throw new UnauthorizedException('Session expirée, merci de vous reconnecter');
    }

    // Rotation : l'ancien jeton de rafraîchissement est révoqué dès qu'il sert une fois.
    await this.prisma.authToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: stored.userId } });
    return this.issueTokens(user);
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = await this.verifyRefreshToken(refreshToken);
      await this.prisma.authToken.updateMany({
        where: { id: payload.tokenId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Jeton déjà invalide/expiré : la déconnexion est de toute façon effective côté client.
    }
  }

  private async revokeAllSessions(userId: string): Promise<void> {
    await this.prisma.authToken.updateMany({
      where: { userId, type: 'REFRESH', revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async verifyRefreshToken(refreshToken: string): Promise<RefreshTokenPayload> {
    try {
      return await this.jwt.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Jeton de rafraîchissement invalide');
    }
  }

  private async issueTokens(user: UserModel): Promise<AuthTokens> {
    const accessExpiresMs = parseDurationToMs(
      this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
      15 * 60_000,
    );
    const accessPayload: AccessTokenPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(accessPayload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: Math.floor(accessExpiresMs / 1000),
    });

    const tokenId = randomUUID();
    const refreshExpiresMs = parseDurationToMs(
      this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '30d',
      30 * 86_400_000,
    );
    const refreshPayload: RefreshTokenPayload = { sub: user.id, tokenId };
    const refreshToken = await this.jwt.signAsync(refreshPayload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: Math.floor(refreshExpiresMs / 1000),
    });

    const tokenHash = await bcrypt.hash(refreshToken, PASSWORD_SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + refreshExpiresMs);
    await this.prisma.authToken.create({
      data: { id: tokenId, userId: user.id, type: 'REFRESH', tokenHash, expiresAt },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
