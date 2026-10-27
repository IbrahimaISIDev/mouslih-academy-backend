import { Module } from '@nestjs/common';
import { CloudflareR2Service } from './cloudflare-r2.service.js';
import { CloudflareStreamService } from './cloudflare-stream.service.js';
import { CloudinaryService } from './cloudinary.service.js';
import { LessonPlaybackService } from './lesson-playback.service.js';

/**
 * Aucun contrôleur ici volontairement : ce module fournit les services R2/Stream, prêts à être
 * injectés le jour où l'éditeur admin gère réellement l'upload vidéo/ressources (curriculum
 * editor actuel : structure + titres seulement, pas de contenu média — cf. session du
 * 2026-09-17). isConfigured / canSignPlaybackUrls permettent de vérifier la disponibilité avant
 * d'exposer un bouton d'upload côté frontend.
 */
@Module({
  providers: [CloudflareR2Service, CloudflareStreamService, CloudinaryService, LessonPlaybackService],
  exports: [CloudflareR2Service, CloudflareStreamService, CloudinaryService, LessonPlaybackService],
})
export class MediaModule {}
