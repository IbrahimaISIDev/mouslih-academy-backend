/**
 * Mise à jour de PRODUCTION du contenu « Rectifiez votre Fâtiḥah », sans aucune donnée de démo.
 *
 *   DATABASE_URL="<chaîne Neon directe>" pnpm prisma:sync-fatiha            # aperçu
 *   DATABASE_URL="<chaîne Neon directe>" pnpm prisma:sync-fatiha --apply    # écrit
 *
 * Fait : formation (prix, textes FR/EN/AR, statut publié), programme des 5 vidéos et des
 * 10 erreurs, masquage des autres formations (brouillon — rien n'est supprimé).
 * Ne fait PAS : comptes, commandes, inscriptions, témoignages, questions de démo.
 * Préserve : image de couverture et liens vidéo déjà saisis depuis l'admin.
 * Ne lit volontairement PAS le fichier .env (qui pointe vers la base locale) : la base visée
 * doit toujours être donnée explicitement dans la commande.
 * Supprime : l'ancien programme de la formation (modules/leçons hors des 5 vidéos), avec la
 * progression qui y était rattachée.
 */
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import {
  FATIHA_PLACEHOLDER_YOUTUBE_ID,
  fatihaLessons,
  fatihaModule,
} from './fatiha-content.js';
import {
  FATIHA_COURSE_ID,
  hideOtherCourses,
  syncFatihaCourse,
} from './fatiha-sync.js';

const apply = process.argv.includes('--apply');
const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) {
  console.error(
    'DATABASE_URL manquant. Le .env n’est pas lu : donnez la base dans la même ligne, ex.\n' +
      '  DATABASE_URL="postgresql://…neon.tech/…?sslmode=require" pnpm prisma:sync-fatiha',
  );
  process.exit(1);
}

const target = new URL(databaseUrl);
const isLocal = ['127.0.0.1', 'localhost', '::1'].includes(target.hostname);
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function main() {
  console.log(
    `Base visée : ${target.hostname}${target.port ? `:${target.port}` : ''}${target.pathname}`,
  );
  console.log(
    isLocal
      ? '→ base LOCALE (ce n’est PAS la production)\n'
      : '→ base DISTANTE\n',
  );

  const [course, otherPublished, oldModules, oldLessons, demoAdmin] =
    await Promise.all([
      prisma.course.findUnique({
        where: { id: FATIHA_COURSE_ID },
        select: { price: true, status: true },
      }),
      prisma.course.count({
        where: { id: { not: FATIHA_COURSE_ID }, status: 'PUBLISHED' },
      }),
      prisma.module.count({
        where: { courseId: FATIHA_COURSE_ID, id: { not: fatihaModule.id } },
      }),
      prisma.lesson.count({
        where: {
          submodule: { module: { courseId: FATIHA_COURSE_ID } },
          id: { notIn: fatihaLessons.map((l) => l.id) },
        },
      }),
      prisma.user.findUnique({
        where: { email: 'admin@mouslihacademy.sn' },
        select: { id: true },
      }),
    ]);
  const existingVideos = await prisma.video.findMany({
    where: { lessonId: { in: fatihaLessons.map((l) => l.id) } },
    select: { externalId: true },
  });
  const videosToSet =
    fatihaLessons.length -
    existingVideos.filter((v) => v.externalId !== FATIHA_PLACEHOLDER_YOUTUBE_ID)
      .length;

  console.log(
    course
      ? `Formation : existante (${course.price} F, ${course.status}) → 10 150 F, PUBLISHED`
      : 'Formation : absente → créée (10 150 F, PUBLISHED)',
  );
  console.log(`Autres formations publiées à masquer : ${otherPublished}`);
  console.log(
    `Ancien programme à retirer : ${oldModules} module(s), ${oldLessons} leçon(s)`,
  );
  console.log(
    `Programme cible : 1 module, ${fatihaLessons.length} vidéos, 10 erreurs`,
  );
  console.log(
    `Vidéos YouTube d’exemple à poser : ${videosToSet} (les liens saisis depuis l’admin sont conservés)`,
  );
  console.log(
    `Vidéos en accès libre : ${fatihaLessons.filter((l) => l.isFreePreview).length} / ${fatihaLessons.length}`,
  );

  if (demoAdmin) {
    console.warn(
      '\n⚠ Compte de démo admin@mouslihacademy.sn présent : changez son mot de passe (ou supprimez-le) avant l’ouverture au public.',
    );
  }

  if (!apply) {
    console.log(
      '\nAperçu seulement : rien n’a été écrit. Relancez avec --apply pour appliquer.',
    );
    return;
  }

  await syncFatihaCourse(prisma);
  const hidden = await hideOtherCourses(prisma);
  console.log(
    `\n✔ Contenu appliqué. Formations masquées (brouillon) : ${hidden}.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
