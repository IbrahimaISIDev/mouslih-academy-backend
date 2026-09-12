import type { VideoProvider } from '../../generated/prisma/enums.js';

interface VideoRow {
  provider: VideoProvider;
  externalId: string;
}

/**
 * Résolution "safe" pour les endpoints publics du catalogue : seuls les aperçus gratuits
 * reçoivent une URL de lecture directe (YouTube, pas de contrôle d'accès nécessaire). Une leçon
 * payante ne reçoit PAS d'URL ici — l'URL signée Cloudflare Stream est émise séparément, côté
 * lecteur de leçon, après vérification que l'utilisateur est bien inscrit (voir MediaModule).
 */
export function publicVideoUrl(video: VideoRow | null, isFreePreview: boolean): string | undefined {
  if (!video || !isFreePreview) return undefined;
  if (video.provider === 'YOUTUBE') {
    return `https://www.youtube.com/embed/${video.externalId}`;
  }
  return undefined;
}
