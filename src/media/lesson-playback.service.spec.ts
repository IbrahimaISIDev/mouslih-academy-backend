import { describe, expect, it, vi } from 'vitest';
import type { CloudflareStreamService } from './cloudflare-stream.service.js';
import type { CloudinaryService } from './cloudinary.service.js';
import { LessonPlaybackService } from './lesson-playback.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

function makeService({
  cloudinaryConfigured = true,
  cloudinaryReady = true,
}: { cloudinaryConfigured?: boolean; cloudinaryReady?: boolean } = {}) {
  const prisma = { video: { update: vi.fn().mockResolvedValue({}) } };
  const cloudinary = {
    isConfigured: cloudinaryConfigured,
    signedPlayback: vi.fn((id: string) => ({ url: `https://signe/${id}.mp4`, posterUrl: `https://signe/${id}.jpg` })),
    getVideoInfo: vi.fn().mockResolvedValue({ durationSeconds: 612, ready: cloudinaryReady }),
  };
  const stream = { canSignPlaybackUrls: false, getSignedPlaybackUrl: vi.fn() };
  const service = new LessonPlaybackService(
    prisma as unknown as PrismaService,
    stream as unknown as CloudflareStreamService,
    cloudinary as unknown as CloudinaryService,
  );
  return { service, prisma, cloudinary };
}

describe('LessonPlaybackService', () => {
  it('renvoie l’identifiant YouTube', async () => {
    const { service } = makeService();
    await expect(
      service.resolve({ id: 'v', provider: 'YOUTUBE', externalId: 'abc', status: 'READY' }),
    ).resolves.toEqual({ provider: 'youtube', videoId: 'abc' });
  });

  it('signe une vidéo Cloudinary prête', async () => {
    const { service } = makeService();
    await expect(
      service.resolve({ id: 'v', provider: 'CLOUDINARY', externalId: 'dossier/x', status: 'READY' }),
    ).resolves.toEqual({ provider: 'file', url: 'https://signe/dossier/x.mp4', posterUrl: 'https://signe/dossier/x.jpg' });
  });

  it('ne sert rien si Cloudinary n’est pas configuré', async () => {
    const { service } = makeService({ cloudinaryConfigured: false });
    await expect(
      service.resolve({ id: 'v', provider: 'CLOUDINARY', externalId: 'x', status: 'READY' }),
    ).resolves.toEqual({ provider: null });
  });

  it('passe à READY (durée incluse) une vidéo Cloudinary dont le rendu est prêt', async () => {
    const { service, prisma } = makeService();
    const result = await service.resolve({ id: 'v1', provider: 'CLOUDINARY', externalId: 'x', status: 'PROCESSING' });
    expect(result.provider).toBe('file');
    expect(prisma.video.update).toHaveBeenCalledWith({
      where: { id: 'v1' },
      data: { status: 'READY', durationSeconds: 612 },
    });
  });

  it('garde « bientôt disponible » tant que le rendu n’est pas prêt', async () => {
    const { service, prisma } = makeService({ cloudinaryReady: false });
    await expect(
      service.resolve({ id: 'v1', provider: 'CLOUDINARY', externalId: 'x', status: 'PROCESSING' }),
    ).resolves.toEqual({ provider: null });
    expect(prisma.video.update).not.toHaveBeenCalled();
  });

  it('ne sert rien sans vidéo', async () => {
    await expect(makeService().service.resolve(null)).resolves.toEqual({ provider: null });
  });
});
