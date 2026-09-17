import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import jwt from 'jsonwebtoken';

interface DirectUploadResponse {
  success: boolean;
  result: { uploadURL: string; uid: string };
}

/**
 * Écrit sur la forme documentée de l'API Cloudflare Stream (upload direct + lecture signée) —
 * jamais testée contre un compte réel faute d'identifiants. Deux jeux d'identifiants distincts
 * sont nécessaires : le jeton API (upload, gestion) et la paire de clé de signature Stream
 * (lecture signée, créée séparément via POST /accounts/{id}/stream/keys — voir .env.example).
 * CLOUDFLARE_STREAM_CUSTOMER_CODE est le code de sous-domaine de lecture affiché dans l'onglet
 * Stream du dashboard Cloudflare : à confirmer, ce n'est PAS le compte account_id.
 */
@Injectable()
export class CloudflareStreamService {
  private readonly logger = new Logger(CloudflareStreamService.name);

  private readonly accountId = process.env['CLOUDFLARE_ACCOUNT_ID'];
  private readonly apiToken = process.env['CLOUDFLARE_STREAM_API_TOKEN'];
  private readonly customerCode = process.env['CLOUDFLARE_STREAM_CUSTOMER_CODE'];
  private readonly signingKeyId = process.env['CLOUDFLARE_STREAM_SIGNING_KEY_ID'];
  private readonly signingKey = process.env['CLOUDFLARE_STREAM_SIGNING_KEY'];

  get isConfigured(): boolean {
    return !!this.accountId && !!this.apiToken;
  }

  get canSignPlaybackUrls(): boolean {
    return !!this.customerCode && !!this.signingKeyId && !!this.signingKey;
  }

  /** L'admin envoie le fichier vidéo directement à Cloudflare depuis son navigateur avec cette
   *  URL (fichiers volumineux, pas de transit par notre serveur). requireSignedURLs: true —
   *  aucune leçon payante ne doit être lisible via une URL Cloudflare directe non signée. */
  async getDirectUploadUrl(maxDurationSeconds = 3600): Promise<{ uploadUrl: string; videoUid: string }> {
    if (!this.isConfigured) {
      throw new ServiceUnavailableException(
        "Cloudflare Stream n'est pas configuré (CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_STREAM_API_TOKEN).",
      );
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/direct_upload`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxDurationSeconds, requireSignedURLs: true }),
      },
    );

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.error(`Cloudflare Stream a refusé la demande d'upload direct (${response.status}): ${body}`);
      throw new ServiceUnavailableException("Impossible de préparer l'envoi vidéo pour le moment.");
    }

    const data = (await response.json()) as DirectUploadResponse;
    return { uploadUrl: data.result.uploadURL, videoUid: data.result.uid };
  }

  /**
   * Jeton de lecture signé (JWT RS256), seule façon d'obtenir une URL jouable pour une vidéo
   * requireSignedURLs — donc pour toute leçon payante. À appeler seulement après avoir vérifié
   * que l'utilisateur est inscrit à la formation (voir EnrollmentsService) : ce service ne fait
   * lui-même aucune vérification d'accès.
   */
  getSignedPlaybackUrl(videoUid: string, expiresInSeconds = 3600): string {
    if (!this.canSignPlaybackUrls) {
      throw new ServiceUnavailableException(
        "La lecture signée Stream n'est pas configurée (CLOUDFLARE_STREAM_CUSTOMER_CODE / CLOUDFLARE_STREAM_SIGNING_KEY*).",
      );
    }

    const token = jwt.sign({}, this.signingKey!.replace(/\\n/g, '\n'), {
      algorithm: 'RS256',
      keyid: this.signingKeyId,
      subject: videoUid,
      expiresIn: expiresInSeconds,
    });

    return `https://customer-${this.customerCode}.cloudflarestream.com/${token}/manifest/video.m3u8`;
  }
}
