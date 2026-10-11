/**
 * Sécurisation de la PRODUCTION avant ouverture au public.
 *
 *   DATABASE_URL="<chaîne Neon directe>" pnpm prisma:secure-production                 # aperçu
 *   DATABASE_URL="<chaîne Neon directe>" pnpm prisma:secure-production --apply         # écrit
 *
 * Options (avec --apply) :
 *   --purge-demo               supprime les comptes, commandes et témoignages de démo du seed
 *   --admin-email=<adresse>    remplace aussi l'adresse de connexion du compte admin de démo
 *
 * Fait toujours (avec --apply) : nouveau mot de passe pour admin@mouslihacademy.sn (saisi au
 * clavier, masqué — ou variable NEW_ADMIN_PASSWORD), puis déconnexion de toutes ses sessions.
 * Ne touche jamais : formations, programme, ni aucun compte qui n'est pas un compte de démo
 * (identifiant ET adresse du seed doivent correspondre).
 * Ne lit volontairement PAS le .env : la base visée doit être donnée dans la commande.
 */
import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const DEMO_ADMIN_EMAIL = 'admin@mouslihacademy.sn';
const PASSWORD_SALT_ROUNDS = 10; // identique à AuthService
const MIN_PASSWORD_LENGTH = 12;

/** Comptes créés par prisma/seed.ts (mot de passe connu : password123). */
const DEMO_USERS: Record<string, string> = {
  'u-aminata-diallo': 'aminata.diallo@exemple.sn',
  'u-ibrahima-sarr': 'i.sarr@exemple.sn',
  'u-khadija-fall': 'khadija.fall@exemple.it',
  'u-moussa-ba': 'moussa.ba@exemple.sn',
  'u-fatou-ndiaye': 'f.ndiaye@exemple.sn',
  'u-seynabou-gueye': 's.gueye@exemple.sn',
  'u-ousmane-diop': 'o.diop@exemple.sn',
  'u-oustaz-mouslih': 'oustaz.mouslih@mouslihacademy.sn',
};
const DEMO_TESTIMONIAL_IDS = [
  't-aminata-diallo',
  't-moussa-ba',
  't-ibrahima-sarr',
  't-fatou-ndiaye',
  't-khadija-fall',
  't-seynabou-gueye',
];

const apply = process.argv.includes('--apply');
const purgeDemo = process.argv.includes('--purge-demo');
const newAdminEmail = process.argv.find((a) => a.startsWith('--admin-email='))?.split('=')[1]?.trim();

const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) {
  console.error(
    'DATABASE_URL manquant. Le .env n’est pas lu : donnez la base dans la même ligne, ex.\n' +
      '  DATABASE_URL="postgresql://…neon.tech/…?sslmode=require" pnpm prisma:secure-production',
  );
  process.exit(1);
}
if (newAdminEmail !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdminEmail)) {
  console.error(`Adresse --admin-email invalide : « ${newAdminEmail} ».`);
  process.exit(1);
}

const target = new URL(databaseUrl);
const isLocal = ['127.0.0.1', 'localhost', '::1'].includes(target.hostname);
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

/** Saisie masquée au clavier (rien ne s'affiche, rien dans l'historique du shell). */
function promptHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    if (!stdin.isTTY) {
      reject(new Error('Pas de terminal interactif : fournissez NEW_ADMIN_PASSWORD.'));
      return;
    }
    process.stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    let value = '';
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === '\r' || char === '\n') {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off('data', onData);
          process.stdout.write('\n');
          resolve(value);
          return;
        }
        if (char === '\u0003') {
          // Ctrl+C
          stdin.setRawMode(false);
          process.stdout.write('\n');
          process.exit(130);
        }
        if (char === '\u007f' || char === '\b') {
          value = value.slice(0, -1);
        } else {
          value += char;
        }
      }
    };
    stdin.on('data', onData);
  });
}

async function readNewPassword(): Promise<string> {
  const fromEnv = process.env['NEW_ADMIN_PASSWORD'];
  const password = fromEnv ?? (await promptHidden('Nouveau mot de passe admin : '));
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Mot de passe trop court : ${MIN_PASSWORD_LENGTH} caractères minimum.`);
  }
  if (password === 'password123' || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new Error('Mot de passe trop faible : mélangez lettres et chiffres (et évitez password123).');
  }
  if (!fromEnv) {
    const confirmation = await promptHidden('Confirmez le mot de passe : ');
    if (confirmation !== password) throw new Error('Les deux saisies ne correspondent pas.');
  }
  return password;
}

async function main() {
  console.log(`Base visée : ${target.hostname}${target.port ? `:${target.port}` : ''}${target.pathname}`);
  console.log(isLocal ? '→ base LOCALE (ce n’est PAS la production)\n' : '→ base DISTANTE\n');

  const admin = await prisma.user.findUnique({
    where: { email: DEMO_ADMIN_EMAIL },
    select: { id: true, role: true },
  });
  const candidates = await prisma.user.findMany({
    where: { id: { in: Object.keys(DEMO_USERS) } },
    select: { id: true, email: true },
  });
  // Double garde : identifiant ET adresse du seed, pour ne jamais toucher un vrai compte.
  const demoUsers = candidates.filter((u) => DEMO_USERS[u.id] === u.email);
  const demoUserIds = demoUsers.map((u) => u.id);
  const [demoOrders, demoTestimonials] = await Promise.all([
    prisma.order.count({ where: { userId: { in: demoUserIds } } }),
    prisma.testimonial.count({ where: { id: { in: DEMO_TESTIMONIAL_IDS } } }),
  ]);
  if (newAdminEmail) {
    const taken = await prisma.user.findUnique({ where: { email: newAdminEmail }, select: { id: true } });
    if (taken && taken.id !== admin?.id) {
      throw new Error(`L’adresse ${newAdminEmail} est déjà utilisée par un autre compte.`);
    }
  }

  console.log(
    admin
      ? `Compte admin ${DEMO_ADMIN_EMAIL} : présent (${admin.role}) → nouveau mot de passe${newAdminEmail ? `, adresse → ${newAdminEmail}` : ''}, sessions fermées`
      : `Compte admin ${DEMO_ADMIN_EMAIL} : absent (rien à changer)`,
  );
  console.log(
    `Données de démo : ${demoUsers.length} compte(s) (mot de passe password123), ${demoOrders} commande(s), ${demoTestimonials} témoignage(s) fictif(s)` +
      (purgeDemo ? ' → supprimés' : ' → conservés (ajoutez --purge-demo pour les supprimer)'),
  );

  if (!apply) {
    console.log('\nAperçu seulement : rien n’a été écrit. Relancez avec --apply pour appliquer.');
    return;
  }

  if (admin) {
    const password = await readNewPassword();
    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: admin.id },
        data: { passwordHash, ...(newAdminEmail ? { email: newAdminEmail } : {}) },
      }),
      prisma.authToken.updateMany({
        where: { userId: admin.id, type: 'REFRESH', revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    console.log(`✔ Mot de passe admin changé${newAdminEmail ? ` (connexion : ${newAdminEmail})` : ''}.`);
  }

  if (purgeDemo) {
    // Les commandes bloquent la suppression d'un compte (onDelete: Restrict) : d'abord elles
    // (lignes et paiements suivent en cascade), puis les comptes (inscriptions, progression,
    // questions et récitations suivent en cascade), puis les témoignages fictifs.
    const [orders, users, testimonials] = await prisma.$transaction([
      prisma.order.deleteMany({ where: { userId: { in: demoUserIds } } }),
      prisma.user.deleteMany({ where: { id: { in: demoUserIds } } }),
      prisma.testimonial.deleteMany({ where: { id: { in: DEMO_TESTIMONIAL_IDS } } }),
    ]);
    console.log(
      `✔ Démo supprimée : ${users.count} compte(s), ${orders.count} commande(s), ${testimonials.count} témoignage(s).`,
    );
  }
}

main()
  .catch((e) => {
    console.error(`\n✘ ${e instanceof Error ? e.message : String(e)}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
