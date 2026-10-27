import { Injectable } from '@nestjs/common';
import type { VideoProvider, VideoStatus } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CloudflareStreamService } from './cloudflare-stream.service.js';
import { CloudinaryService } from './cloudinary.service.js';

/** Ce dont le lecteur de leçon a besoin pour jouer la vidéo. `provider: null` : pas encore de
 *  vidéo exploitable (non envoyée, encore en préparation, ou fournisseur non configuré). */
export type LessonPlayback =
  | { provider: 'youtube'; videoId: string }
  | { provider: 'stream'; url: string }
  | { provider: 'file'; url: string; posterUrl?: string }
  | { provider: null };

interface VideoRow {
  id: string;
  provider: VideoProvider;
  externalId: string;
  status: VideoStatus;
}

/**
 * Traduit la vidéo d'une leçon en source de lecture. Aucune vérification d'accès ici : l'appelant
 * (inscription vérifiée, ou leçon en accès libre) en a la responsabilité.
 */
@Injectable()
export class LessonPlaybackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stream: CloudflareStreamService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async resolve(video: VideoRow | null): Promise<LessonPlayback> {
    if (!video) return { provider: null };

    // Vidéo Cloudinary encore en préparation : on revérifie au passage (pas besoin de webhook).
    const status = video.status === 'PROCESSING' ? await this.refreshCloudinaryStatus(video) : video.status;
    if (status !== 'READY') return { provider: null };

    if (video.provider === 'YOUTUBE') {
      return { provider: 'youtube', videoId: video.externalId };
    }
    if (video.provider === 'CLOUDINARY') {
      return this.cloudinary.isConfigured
        ? { provider: 'file', ...this.cloudinary.signedPlayback(video.externalId) }
        : { provider: null };
    }
    if (this.stream.canSignPlaybackUrls) {
      return { provider: 'stream', url: this.stream.getSignedPlaybackUrl(video.externalId) };
    }
    return { provider: null };
  }

  /** Passe une vidéo Cloudinary à READY dès que son rendu de lecture est prêt (durée incluse). */
  async refreshCloudinaryStatus(video: VideoRow): Promise<VideoStatus> {
    if (video.provider !== 'CLOUDINARY' || video.status !== 'PROCESSING' || !this.cloudinary.isConfigured) {
      return video.status;
    }
    const info = await this.cloudinary.getVideoInfo(video.externalId);
    if (!info?.ready) return video.status;

    await this.prisma.video.update({
      where: { id: video.id },
      data: { status: 'READY', ...(info.durationSeconds > 0 ? { durationSeconds: info.durationSeconds } : {}) },
    });
    return 'READY';
  }
}
