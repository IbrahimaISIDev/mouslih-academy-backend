/**
 * Vérifie les identifiants Cloudinary (lus dans .env en local, ou dans l'environnement) :
 *
 *   pnpm cloudinary:check
 *
 * Teste la connexion, affiche l'offre, l'espace utilisé et la taille maximale d'une vidéo —
 * sans jamais afficher le secret. N'envoie et ne modifie rien.
 */
import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env['CLOUDINARY_CLOUD_NAME'];
const apiKey = process.env['CLOUDINARY_API_KEY'];
const apiSecret = process.env['CLOUDINARY_API_SECRET'];

const missing = [
  ['CLOUDINARY_CLOUD_NAME', cloudName],
  ['CLOUDINARY_API_KEY', apiKey],
  ['CLOUDINARY_API_SECRET', apiSecret],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missing.length > 0) {
  console.error(`✘ Identifiants manquants : ${missing.join(', ')} (fichier .env ou variables d'environnement).`);
  process.exit(1);
}

cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });

const megabytes = (bytes?: number) => (bytes ? `${Math.round(bytes / 1024 / 1024)} Mo` : 'n.c.');

try {
  await cloudinary.api.ping();
  console.log(`✔ Connexion à Cloudinary réussie (cloud « ${cloudName} », clé …${apiKey!.slice(-4)}).`);

  const usage = (await cloudinary.api.usage()) as {
    plan?: string;
    storage?: { usage?: number };
    credits?: { usage?: number; limit?: number };
    media_limits?: { video_max_size?: number };
  };
  console.log(`  Offre : ${usage.plan ?? 'n.c.'}`);
  console.log(`  Stockage utilisé : ${megabytes(usage.storage?.usage)}`);
  if (usage.credits?.limit) {
    console.log(`  Crédits utilisés : ${usage.credits.usage ?? 0} / ${usage.credits.limit}`);
  }
  console.log(`  Taille maximale d’une vidéo : ${megabytes(usage.media_limits?.video_max_size)}`);
  console.log('\nTout est prêt : le bouton « Envoyer une vidéo » apparaîtra dans l’éditeur de formation.');
} catch (error) {
  const message = (error as { error?: { message?: string } }).error?.message ?? String(error);
  console.error(`✘ Connexion refusée par Cloudinary : ${message}`);
  console.error('  Vérifiez le cloud name, la clé et le secret (Settings → API Keys).');
  process.exit(1);
}
