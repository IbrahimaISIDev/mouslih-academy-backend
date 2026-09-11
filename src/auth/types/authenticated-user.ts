import type { UserRole } from '../../generated/prisma/enums.js';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
}
