import { createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CloudinaryService } from './cloudinary.service.js';

const ENV_KEYS = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'CLOUDINARY_FOLDER'];

describe('CloudinaryService', () => {
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of ENV_KEYS) saved[key] = process.env[key];
    process.env['CLOUDINARY_CLOUD_NAME'] = 'nuage-test';
    process.env['CLOUDINARY_API_KEY'] = '123456';
    process.env['CLOUDINARY_API_SECRET'] = 'secret-de-test';
    delete process.env['CLOUDINARY_FOLDER'];
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });

  it('n’est pas configuré sans les trois identifiants', () => {
    delete process.env['CLOUDINARY_API_SECRET'];
    const service = new CloudinaryService();
    expect(service.isConfigured).toBe(false);
    expect(() => service.signLessonUpload('fatiha-v01')).toThrow(/pas configuré/);
  });

  it('signe un envoi propre à la leçon, en type authenticated, avec les rendus préparés', () => {
    const service = new CloudinaryService();
    const params = service.signLessonUpload('fatiha-v01');

    expect(params.uploadUrl).toBe('https://api.cloudinary.com/v1_1/nuage-test/video/upload');
    expect(params.apiKey).toBe('123456');
    expect(params.publicId.startsWith('mouslih-academy/lessons/fatiha-v01-')).toBe(true);
    expect(params.fields).toMatchObject({
      public_id: params.publicId,
      type: 'authenticated',
      eager_async: 'true',
    });
    expect(params.fields['eager']).toBe('c_limit,q_auto:good,w_1280/mp4|c_limit,so_2,w_1280/jpg');

    // Algorithme documenté par Cloudinary : SHA-1 des paramètres triés « k=v&… » + secret.
    const toSign = Object.entries({ ...params.fields, timestamp: String(params.timestamp) })
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    expect(params.signature).toBe(createHash('sha1').update(`${toSign}secret-de-test`).digest('hex'));
    // Le secret ne fait jamais partie de ce qui est renvoyé au navigateur.
    expect(JSON.stringify(params)).not.toContain('secret-de-test');
  });

  it('produit des URLs de lecture signées, jamais publiques', () => {
    const { url, posterUrl } = new CloudinaryService().signedPlayback('mouslih-academy/lessons/fatiha-v01-1');
    expect(url).toMatch(
      /^https:\/\/res\.cloudinary\.com\/nuage-test\/video\/authenticated\/s--[\w-]{8}--\/c_limit,q_auto:good,w_1280\/.*fatiha-v01-1\.mp4$/,
    );
    expect(posterUrl).toMatch(/\/video\/authenticated\/s--[\w-]{8}--\/c_limit,so_2,w_1280\/.*\.jpg$/);
  });

  it('range les vidéos dans le dossier configuré', () => {
    process.env['CLOUDINARY_FOLDER'] = 'autre-dossier';
    expect(new CloudinaryService().lessonPublicIdPrefix('x')).toBe('autre-dossier/lessons/x-');
  });
});
