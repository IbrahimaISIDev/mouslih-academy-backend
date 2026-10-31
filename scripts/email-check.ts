/**
 * Vérifie la configuration SMTP (lue dans .env en local, ou dans l'environnement) :
 *
 *   pnpm email:check                        # teste la connexion et l'authentification
 *   pnpm email:check --to=vous@exemple.com  # envoie en plus le vrai e-mail d'accès, en essai
 *
 * N'affiche jamais le mot de passe.
 */
import 'dotenv/config';
import nodemailer from 'nodemailer';
import { renderCourseAccessEmail } from '../src/email/email.service.js';

const host = process.env['SMTP_HOST'];
const port = Number(process.env['SMTP_PORT'] || 587);
const user = process.env['SMTP_USER'];
const pass = process.env['SMTP_PASSWORD'];
const from = process.env['SMTP_FROM'] || 'Mouslih Academy <no-reply@mouslihacademy.sn>';
const to = process.argv.find((a) => a.startsWith('--to='))?.slice('--to='.length).trim();

const missing = [
  ['SMTP_HOST', host],
  ['SMTP_USER', user],
  ['SMTP_PASSWORD', pass],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);
if (missing.length > 0) {
  console.error(`✘ Paramètres manquants : ${missing.join(', ')} (fichier .env ou variables d'environnement).`);
  process.exit(1);
}

console.log(`Serveur : ${host}:${port} (${port === 465 ? 'SSL' : 'STARTTLS'}) · compte : ${user} · expéditeur : ${from}`);
console.log(`Liens des e-mails vers : ${process.env['FRONTEND_URL'] ?? 'http://localhost:3000 (FRONTEND_URL non défini)'}`);

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
  connectionTimeout: 15_000,
});

/** Conseils selon l'erreur la plus courante, plutôt qu'un message technique brut. */
function hint(error: { code?: string; responseCode?: number; message?: string }): string {
  if (error.code === 'EAUTH' || error.responseCode === 535) {
    return 'Identifiant ou mot de passe refusé. Avec Gmail, utilisez un « mot de passe d’application » (compte Google → Sécurité), pas votre mot de passe habituel.';
  }
  if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION' || error.code === 'ESOCKET') {
    return 'Serveur injoignable : vérifiez SMTP_HOST et SMTP_PORT (587 ou 465), et que votre réseau ne bloque pas ce port.';
  }
  if (error.code === 'EENVELOPE' || error.responseCode === 550 || error.responseCode === 553) {
    return 'Adresse refusée : SMTP_FROM doit être une adresse (ou un domaine) validée chez votre fournisseur.';
  }
  return 'Vérifiez les paramètres SMTP fournis par votre fournisseur.';
}

try {
  await transporter.verify();
  console.log('✔ Connexion et authentification SMTP réussies.');

  if (to) {
    const email = renderCourseAccessEmail({
      to,
      firstName: 'Test',
      courseName: 'Rectifiez votre Fâtiḥah',
      locale: 'FR',
    });
    const info = await transporter.sendMail({ from, to, subject: `[Essai] ${email.subject}`, html: email.html, text: email.text });
    console.log(`✔ E-mail d’essai envoyé à ${to} (identifiant : ${info.messageId}). Pensez à vérifier les indésirables.`);
  } else {
    console.log('Pour recevoir un e-mail d’essai : pnpm email:check --to=votre@adresse.com');
  }
} catch (error) {
  const e = error as { code?: string; responseCode?: number; message?: string };
  console.error(`✘ Échec : ${e.message ?? String(error)}`);
  console.error(`  ${hint(e)}`);
  process.exit(1);
}
