import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

/** Rendu MP4 servi aux apprenants (≤ 1280 px de large, qualité auto) et image d'aperçu. Préparés
 *  à l'envoi (« eager », en tâche de fond) : Cloudinary refuse de transcoder à la volée une vidéo
 *  volumineuse, et ce sont exactement ces transformations que les URLs signées demandent. */
const PLAYBACK_TRANSFORMATION = {
  crop: 'limit',
  width: 1280,
  quality: 'auto:good',
};
const POSTER_TRANSFORMATION = { crop: 'limit', width: 1280, start_offset: '2' };
const EAGER: {
  transformation: Record<string, string | number>;
  format: string;
}[] = [
  { transformation: PLAYBACK_TRANSFORMATION, format: 'mp4' },
  { transformation: POSTER_TRANSFORMATION, format: 'jpg' },
];

/** Chaîne « eager » attendue par l'API d'envoi : « c_limit,q_auto:good,w_1280/mp4|… ». */
function eagerString(): string {
  return EAGER.map(
    ({ transformation, format }) =>
      `${cloudinary.utils.generate_transformation_string({ ...transformation })}/${format}`,
  ).join('|');
}

export interface CloudinaryUploadParams {
  uploadUrl: string;
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  /** Champs à renvoyer tels quels avec le fichier (ils font partie de la signature). */
  fields: Record<string, string>;
  publicId: string;
}

export interface CloudinaryVideoInfo {
  durationSeconds: number;
  /** Rendu MP4 de lecture déjà prêt chez Cloudinary. */
  ready: boolean;
}

/**
 * Vidéos de leçon hébergées sur Cloudinary, en type « authenticated » : aucune URL publique,
 * seule une URL signée par le backend (après vérification d'accès) permet la lecture.
 *
 * Limite : sur les offres standard, une URL signée n'expire pas — un inscrit qui la copie peut la
 * partager. L'expiration demande l'option « token-based authentication » (offres avancées).
 */
@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  private readonly cloudName = process.env['CLOUDINARY_CLOUD_NAME'];
  private readonly apiKey = process.env['CLOUDINARY_API_KEY'];
  private readonly apiSecret = process.env['CLOUDINARY_API_SECRET'];
  private readonly folder =
    process.env['CLOUDINARY_FOLDER'] || 'mouslih-academy';

  constructor() {
    if (this.isConfigured) {
      cloudinary.config({
        cloud_name: this.cloudName,
        api_key: this.apiKey,
        api_secret: this.apiSecret,
        secure: true,
        urlAnalytics: false,
      });
    }
  }

  get isConfigured(): boolean {
    return !!this.cloudName && !!this.apiKey && !!this.apiSecret;
  }

  private assertConfigured(): void {
    if (!this.isConfigured) {
      throw new ServiceUnavailableException(
        "Cloudinary n'est pas configuré (CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET).",
      );
    }
  }

  /** Préfixe des public_id d'une leçon : sert aussi à vérifier qu'un envoi annoncé lui appartient. */
  lessonPublicIdPrefix(lessonId: string): string {
    return `${this.folder}/lessons/${lessonId}-`;
  }

  /**
   * Paramètres signés pour un envoi direct navigateur → Cloudinary (le fichier ne transite pas
   * par l'API). La signature fige le public_id, le type et les rendus : impossible de les
   * détourner côté client. Valable environ une heure (contrôle Cloudinary sur le timestamp).
   */
  signLessonUpload(lessonId: string): CloudinaryUploadParams {
    this.assertConfigured();
    const timestamp = Math.round(Date.now() / 1000);
    const publicId = `${this.lessonPublicIdPrefix(lessonId)}${timestamp}`;
    const fields = {
      public_id: publicId,
      type: 'authenticated',
      eager: eagerString(),
      eager_async: 'true',
    };
    const signature = cloudinary.utils.api_sign_request(
      { ...fields, timestamp },
      this.apiSecret!,
    );

    return {
      uploadUrl: `https://api.cloudinary.com/v1_1/${this.cloudName}/video/upload`,
      cloudName: this.cloudName!,
      apiKey: this.apiKey!,
      timestamp,
      signature,
      fields,
      publicId,
    };
  }

  /** Durée et état de préparation, lus directement chez Cloudinary (jamais fournis par le client). */
  async getVideoInfo(publicId: string): Promise<CloudinaryVideoInfo | null> {
    this.assertConfigured();
    try {
      const resource = (await cloudinary.api.resource(publicId, {
        resource_type: 'video',
        type: 'authenticated',
        // Sans cette option, l'API d'administration ne renvoie pas la durée de la vidéo.
        media_metadata: true,
      })) as { duration?: number; derived?: { transformation?: string }[] };
      const playback = cloudinary.utils.generate_transformation_string({
        ...PLAYBACK_TRANSFORMATION,
      });
      return {
        durationSeconds: Math.round(resource.duration ?? 0),
        ready: (resource.derived ?? []).some((d) =>
          d.transformation?.startsWith(playback),
        ),
      };
    } catch (error) {
      this.logger.warn(
        `Ressource Cloudinary introuvable ou inaccessible : ${publicId} (${String(error)})`,
      );
      return null;
    }
  }

  /** URLs signées de lecture (MP4) et d'aperçu (JPG). À n'émettre qu'après vérification d'accès. */
  signedPlayback(publicId: string): { url: string; posterUrl: string } {
    this.assertConfigured();
    const base = {
      resource_type: 'video',
      type: 'authenticated',
      sign_url: true,
    } as const;
    return {
      url: cloudinary.url(publicId, {
        ...base,
        format: 'mp4',
        transformation: [PLAYBACK_TRANSFORMATION],
      }),
      posterUrl: cloudinary.url(publicId, {
        ...base,
        format: 'jpg',
        transformation: [POSTER_TRANSFORMATION],
      }),
    };
  }

  /** Supprime une vidéo remplacée (et ses rendus) pour ne pas payer son stockage. Sans échec bloquant. */
  async deleteVideo(publicId: string): Promise<void> {
    if (!this.isConfigured) return;
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: 'video',
        type: 'authenticated',
        invalidate: true,
      });
    } catch (error) {
      this.logger.warn(
        `Suppression Cloudinary échouée pour ${publicId} : ${String(error)}`,
      );
    }
  }
}
