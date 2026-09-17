import { randomUUID } from 'node:crypto';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * R2 est compatible S3 — cette implémentation est donc un client S3 standard pointé sur
 * l'endpoint R2, sans logique spécifique à Cloudflare à deviner. La partie la moins certaine
 * est CLOUDFLARE_R2_PUBLIC_URL (domaine public du bucket, si activé) : à confirmer dans le
 * dashboard R2 au moment du branchement réel.
 */
@Injectable()
export class CloudflareR2Service {
  private readonly bucket = process.env['CLOUDFLARE_R2_BUCKET'];
  private readonly publicBaseUrl = process.env['CLOUDFLARE_R2_PUBLIC_URL'];
  private readonly client: S3Client | null;

  constructor() {
    const accountId = process.env['CLOUDFLARE_ACCOUNT_ID'];
    const accessKeyId = process.env['CLOUDFLARE_R2_ACCESS_KEY_ID'];
    const secretAccessKey = process.env['CLOUDFLARE_R2_SECRET_ACCESS_KEY'];
    const endpoint = process.env['CLOUDFLARE_R2_ENDPOINT'] || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

    this.client =
      accessKeyId && secretAccessKey && endpoint
        ? new S3Client({ region: 'auto', endpoint, credentials: { accessKeyId, secretAccessKey } })
        : null;
  }

  get isConfigured(): boolean {
    return this.client !== null && !!this.bucket;
  }

  /** URL présignée à usage unique : l'admin envoie le fichier directement à R2 depuis son
   *  navigateur, sans faire transiter le PDF/la ressource par notre serveur. */
  async getUploadUrl(fileName: string, contentType: string): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    const client = this.requireClient();
    const key = `resources/${randomUUID()}-${fileName}`;

    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType }),
      { expiresIn: 300 },
    );

    return { uploadUrl, key, publicUrl: this.resolvePublicUrl(key) };
  }

  /** URL de téléchargement temporaire pour une ressource privée (bucket sans accès public direct). */
  async getDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const client = this.requireClient();
    return getSignedUrl(client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
      expiresIn: expiresInSeconds,
    });
  }

  async delete(key: string): Promise<void> {
    const client = this.requireClient();
    await client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  private resolvePublicUrl(key: string): string {
    return this.publicBaseUrl ? `${this.publicBaseUrl.replace(/\/$/, '')}/${key}` : key;
  }

  private requireClient(): S3Client {
    if (!this.client || !this.bucket) {
      throw new ServiceUnavailableException(
        "Le stockage R2 n'est pas configuré (CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_R2_*).",
      );
    }
    return this.client;
  }
}
