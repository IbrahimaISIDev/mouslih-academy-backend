const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

/**
 * Extrait l'identifiant (11 caractères) d'une vidéo YouTube à partir de ce que l'admin colle :
 * identifiant brut, lien de partage youtu.be, lien watch?v=, /embed/, /shorts/, /live/.
 * Renvoie null pour toute autre entrée — on ne stocke jamais une URL arbitraire.
 */
export function parseYouTubeVideoId(input: string): string | null {
  const value = input.trim();
  if (VIDEO_ID_PATTERN.test(value)) return value;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  let candidate: string | null = null;

  if (host === 'youtu.be') {
    candidate = url.pathname.split('/')[1] ?? null;
  } else if (YOUTUBE_HOSTS.has(host)) {
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments[0] === 'watch') {
      candidate = url.searchParams.get('v');
    } else if (['embed', 'shorts', 'live', 'v'].includes(segments[0] ?? '')) {
      candidate = segments[1] ?? null;
    }
  }

  return candidate && VIDEO_ID_PATTERN.test(candidate) ? candidate : null;
}
