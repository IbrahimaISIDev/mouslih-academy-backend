/**
 * Reproduit les données de démo du frontend (src/mocks/* du dépôt mouslih-academy) pour que
 * l'API renvoie, une fois branchée, des données équivalentes à celles déjà vues côté frontend.
 * Mot de passe de tous les comptes de démo : "password123".
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { FATIHA_COURSE_ID, FATIHA_PRICE, syncFatihaCourse } from './fatiha-sync.js';

const LOCALES = ['fr', 'en', 'ar'] as const;
const toDbLocale = (locale: (typeof LOCALES)[number]) => locale.toUpperCase() as 'FR' | 'EN' | 'AR';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env['DATABASE_URL'] }),
});

const DEMO_PASSWORD_HASH = await bcrypt.hash('password123', 10);

async function main() {
  // ---------------------------------------------------------------------
  // Utilisateurs
  // ---------------------------------------------------------------------
  const users = [
    {
      id: 'u-aminata-diallo',
      email: 'aminata.diallo@exemple.sn',
      firstName: 'Aminata',
      lastName: 'Diallo',
      city: 'Dakar',
      phone: '+221771234567',
      createdAt: new Date('2026-08-14'),
    },
    {
      id: 'u-ibrahima-sarr',
      email: 'i.sarr@exemple.sn',
      firstName: 'Ibrahima',
      lastName: 'Sarr',
      city: 'Thiès',
      phone: '+221768842109',
      createdAt: new Date('2026-08-09'),
    },
    {
      id: 'u-khadija-fall',
      email: 'khadija.fall@exemple.it',
      firstName: 'Khadija',
      lastName: 'Fall',
      city: 'Milan',
      phone: '+221704451288',
      createdAt: new Date('2026-08-31'),
    },
    {
      id: 'u-moussa-ba',
      email: 'moussa.ba@exemple.sn',
      firstName: 'Moussa',
      lastName: 'Bâ',
      city: 'Kaolack',
      phone: '+221782209134',
      createdAt: new Date('2026-08-30'),
    },
    {
      id: 'u-fatou-ndiaye',
      email: 'f.ndiaye@exemple.sn',
      firstName: 'Fatou',
      lastName: 'Ndiaye',
      city: 'Saint-Louis',
      phone: '+221779036612',
      createdAt: new Date('2026-06-28'),
    },
    {
      id: 'u-seynabou-gueye',
      email: 's.gueye@exemple.sn',
      firstName: 'Seynabou',
      lastName: 'Gueye',
      city: 'Rufisque',
      phone: '+221761184027',
      createdAt: new Date('2026-08-31'),
    },
    {
      id: 'u-ousmane-diop',
      email: 'o.diop@exemple.sn',
      firstName: 'Ousmane',
      lastName: 'Diop',
      city: 'Dakar',
      phone: '+221785520376',
      createdAt: new Date('2026-05-12'),
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: { ...u, role: 'LEARNER', passwordHash: DEMO_PASSWORD_HASH },
    });
  }

  const teacher = await prisma.user.upsert({
    where: { id: 'u-oustaz-mouslih' },
    update: { firstName: 'Oustaz', lastName: 'Souleymane Diallo' },
    create: {
      id: 'u-oustaz-mouslih',
      email: 'oustaz.mouslih@mouslihacademy.sn',
      firstName: 'Oustaz',
      lastName: 'Souleymane Diallo',
      role: 'TEACHER',
      passwordHash: DEMO_PASSWORD_HASH,
    },
  });

  await prisma.user.upsert({
    where: { id: 'u-admin' },
    update: {},
    create: {
      id: 'u-admin',
      email: 'admin@mouslihacademy.sn',
      firstName: 'Admin',
      lastName: 'Mouslih Academy',
      role: 'ADMIN',
      passwordHash: DEMO_PASSWORD_HASH,
    },
  });

  // ---------------------------------------------------------------------
  // Catalogue — les 5 formations masquées (brouillons, sans modules, fidèle à
  // src/mocks/courses.ts). La formation publiée est gérée par syncFatihaCourse.
  // ---------------------------------------------------------------------
  const courses = [
    {
      id: 'c-initiation-nourania',
      slug: 'initiation-nourania',
      coverImageUrl: '/images/courses/initiation-nourania.jpg',
      price: 25000,
      compareAtPrice: null,
      level: 'BEGINNER' as const,
      lessonCount: 14,
      totalDurationSeconds: 22800,
      // Masquée : le site se concentre sur « Rectifiez votre Fâtiḥah » (2026-10-10).
      status: 'DRAFT' as const,
      isFeatured: false,
      hasCertificate: true,
      hasVoiceCorrection: true,
      translations: {
        fr: {
          title: 'Initiation à la lecture — Nourania',
          subtitle: 'Les bases de la lecture coranique',
          cardDescription: "De l'alphabet à la lecture fluide, sans passer par la translittération.",
          heroTagline: null,
          heroTaglineMobile: null,
          description:
            "La méthode Nourania pour apprendre à lire l'arabe coranique lettre par lettre, sans prérequis.",
        },
        en: {
          title: 'Reading Foundations — Nourania',
          subtitle: 'The foundations of Quranic reading',
          cardDescription: 'From the alphabet to fluent reading, without going through transliteration.',
          heroTagline: null,
          heroTaglineMobile: null,
          description:
            'The Nourania method to learn Quranic Arabic reading letter by letter, with no prerequisites.',
        },
        ar: {
          title: 'القاعدة النورانية',
          subtitle: 'أساسيات القراءة القرآنية',
          cardDescription: 'من الحروف الأبجدية إلى القراءة الطليقة، دون المرور بالنقحرة.',
          heroTagline: null,
          heroTaglineMobile: null,
          description: 'منهج نوراني لتعلم قراءة العربية القرآنية حرفًا حرفًا، دون شروط مسبقة.',
        },
      },
    },
    {
      id: 'c-regles-tajwid',
      slug: 'regles-tajwid',
      coverImageUrl: '/images/courses/regles-tajwid.jpg',
      price: 40000,
      compareAtPrice: null,
      level: 'INTERMEDIATE' as const,
      lessonCount: 22,
      totalDurationSeconds: 39900,
      // Masquée : le site se concentre sur « Rectifiez votre Fâtiḥah » (2026-10-10).
      status: 'DRAFT' as const,
      isFeatured: false,
      hasCertificate: true,
      hasVoiceCorrection: true,
      translations: {
        fr: {
          title: 'Les règles du Tajwid',
          subtitle: 'Réciter le Coran selon ses règles',
          cardDescription: 'Les vingt-deux règles de récitation, du souffle aux lettres emphatiques.',
          heroTagline: null,
          heroTaglineMobile: null,
          description:
            "Un parcours complet des règles de Tajwid, de la théorie à l'application pratique guidée.",
        },
        en: {
          title: 'The Rules of Tajwid',
          subtitle: 'Reciting the Quran by its rules',
          cardDescription: 'The twenty-two rules of recitation, from breath to emphatic letters.',
          heroTagline: null,
          heroTaglineMobile: null,
          description:
            'A complete path through the rules of Tajwid, from theory to guided practical application.',
        },
        ar: {
          title: 'أحكام التجويد',
          subtitle: 'تلاوة القرآن وفق أحكامه',
          cardDescription: 'أحكام التلاوة الاثنان والعشرون، من النفَس إلى الحروف المفخّمة.',
          heroTagline: null,
          heroTaglineMobile: null,
          description: 'مسار كامل في أحكام التجويد، من النظرية إلى التطبيق العملي الموجّه.',
        },
      },
    },
    {
      id: 'c-fiqh-priere',
      slug: 'fiqh-priere',
      coverImageUrl: '/images/courses/fiqh-priere.jpg',
      price: 20000,
      compareAtPrice: null,
      level: 'BEGINNER' as const,
      lessonCount: 12,
      totalDurationSeconds: 16200,
      // Masquée : le site se concentre sur « Rectifiez votre Fâtiḥah » (2026-10-10).
      status: 'DRAFT' as const,
      isFeatured: false,
      hasCertificate: true,
      hasVoiceCorrection: false,
      translations: {
        fr: {
          title: 'Fiqh de la prière',
          subtitle: 'Comprendre et accomplir la prière',
          cardDescription: 'Les piliers, les conditions et les oublis : prier avec certitude.',
          heroTagline: null,
          heroTaglineMobile: null,
          description: 'Les règles de la prière, ses conditions, ses piliers et ses cas particuliers.',
        },
        en: {
          title: 'Fiqh of Prayer',
          subtitle: 'Understanding and performing prayer',
          cardDescription: 'The pillars, conditions and omissions: praying with certainty.',
          heroTagline: null,
          heroTaglineMobile: null,
          description: 'The rules of prayer, its conditions, pillars, and special cases.',
        },
        ar: {
          title: 'فقه الصلاة',
          subtitle: 'فهم الصلاة وأداؤها',
          cardDescription: 'الأركان والشروط والسهو: الصلاة بيقين.',
          heroTagline: null,
          heroTaglineMobile: null,
          description: 'أحكام الصلاة وشروطها وأركانها وحالاتها الخاصة.',
        },
      },
    },
    {
      id: 'c-memorisation-cinq-lignes',
      slug: 'memorisation-cinq-lignes',
      coverImageUrl: '/images/courses/memorisation-cinq-lignes.jpg',
      price: 30000,
      compareAtPrice: null,
      level: 'INTERMEDIATE' as const,
      lessonCount: 16,
      totalDurationSeconds: 25800,
      // Masquée : le site se concentre sur « Rectifiez votre Fâtiḥah » (2026-10-10).
      status: 'DRAFT' as const,
      isFeatured: false,
      hasCertificate: true,
      hasVoiceCorrection: false,
      translations: {
        fr: {
          title: 'Mémorisation — cinq lignes par jour',
          subtitle: 'Une méthode progressive de mémorisation',
          cardDescription:
            'Une méthode de mémorisation tenable, cinq lignes par jour, révisions comprises.',
          heroTagline: null,
          heroTaglineMobile: null,
          description:
            'Mémoriser durablement le Coran à raison de cinq lignes par jour, avec révision guidée.',
        },
        en: {
          title: 'Memorization — five lines a day',
          subtitle: 'A progressive memorization method',
          cardDescription: 'A sustainable memorization method, five lines a day, revisions included.',
          heroTagline: null,
          heroTaglineMobile: null,
          description: 'Durably memorize the Quran at a pace of five lines a day, with guided revision.',
        },
        ar: {
          title: 'الحفظ : خمسة أسطر يوميًا',
          subtitle: 'منهج تدريجي للحفظ',
          cardDescription: 'منهج حفظ يمكن الاستمرار عليه، خمسة أسطر يوميًا، مع المراجعات.',
          heroTagline: null,
          heroTaglineMobile: null,
          description: 'حفظ القرآن حفظًا راسخًا بمعدل خمسة أسطر يوميًا، مع مراجعة موجّهة.',
        },
      },
    },
    {
      id: 'c-sciences-hadith',
      slug: 'sciences-hadith',
      coverImageUrl: '/images/courses/sciences-hadith.jpg',
      price: 45000,
      compareAtPrice: null,
      level: 'ADVANCED' as const,
      lessonCount: 18,
      totalDurationSeconds: 34800,
      // Masquée : le site se concentre sur « Rectifiez votre Fâtiḥah » (2026-10-10).
      status: 'DRAFT' as const,
      isFeatured: false,
      hasCertificate: true,
      hasVoiceCorrection: false,
      translations: {
        fr: {
          title: 'Sciences du hadith',
          subtitle: 'Introduction à la critique du hadith',
          cardDescription: 'Chaîne de transmission, authentification, terminologie des savants.',
          heroTagline: null,
          heroTaglineMobile: null,
          description:
            "Les fondements des sciences du hadith : authenticité, chaînes de transmission, classification.",
        },
        en: {
          title: 'Sciences of Hadith',
          subtitle: 'Introduction to hadith criticism',
          cardDescription: 'Chain of transmission, authentication, scholarly terminology.',
          heroTagline: null,
          heroTaglineMobile: null,
          description: 'The foundations of hadith sciences: authenticity, chains of transmission, classification.',
        },
        ar: {
          title: 'علوم الحديث',
          subtitle: 'مدخل إلى علوم نقد الحديث',
          cardDescription: 'سلسلة الإسناد، التوثيق، مصطلح العلماء.',
          heroTagline: null,
          heroTaglineMobile: null,
          description: 'أسس علوم الحديث : الصحة وسلاسل الإسناد والتصنيف.',
        },
      },
    },
  ];

  for (const c of courses) {
    const courseFields = {
      coverImageUrl: c.coverImageUrl,
      price: c.price,
      compareAtPrice: c.compareAtPrice,
      level: c.level,
      lessonCount: c.lessonCount,
      totalDurationSeconds: c.totalDurationSeconds,
      isFeatured: c.isFeatured,
      hasCertificate: c.hasCertificate,
      hasVoiceCorrection: c.hasVoiceCorrection,
      status: c.status,
    };
    // Mise à jour complète (et pas seulement à la création) : relancer le seed sur une base
    // existante doit suffire à la remettre en phase avec le contenu de référence.
    await prisma.course.upsert({
      where: { id: c.id },
      update: courseFields,
      create: { id: c.id, slug: c.slug, ...courseFields },
    });

    for (const locale of LOCALES) {
      const fields = {
        title: c.translations[locale].title,
        subtitle: c.translations[locale].subtitle,
        cardDescription: c.translations[locale].cardDescription,
        heroTagline: c.translations[locale].heroTagline,
        heroTaglineMobile: c.translations[locale].heroTaglineMobile,
        description: c.translations[locale].description,
      };
      await prisma.courseTranslation.upsert({
        where: { courseId_locale: { courseId: c.id, locale: toDbLocale(locale) } },
        update: fields,
        create: { courseId: c.id, locale: toDbLocale(locale), ...fields },
      });
    }
  }


  // ---------------------------------------------------------------------
  // « Rectifiez votre Fâtiḥah » : formation, programme, erreurs corrigées —
  // même code que la mise à jour de production (prisma/fatiha-sync.ts).
  // ---------------------------------------------------------------------
  await syncFatihaCourse(prisma);

  // ---------------------------------------------------------------------
  // Témoignages — FICTIFS, données de démonstration uniquement : à remplacer
  // par de vrais témoignages d'apprenants avant toute mise en ligne.
  // Tous rattachés à la seule formation visible.
  // ---------------------------------------------------------------------
  const testimonials = [
    {
      id: 't-aminata-diallo',
      authorName: 'Aminata Diallo',
      authorCity: 'Dakar',
      kind: 'TEXT' as const,
      quote: {
        fr: "Je récitais la Fâtiḥah depuis vingt ans avec des erreurs que personne ne m'avait signalées. Cinq vidéos ont suffi à les corriger.",
        en: 'I had been reciting Al-Fâtiḥah for twenty years with mistakes no one had ever pointed out. Five videos were enough to correct them.',
        ar: 'كنت أتلو الفاتحة منذ عشرين عامًا بأخطاء لم ينبهني إليها أحد. كفتني خمسة دروس مرئية لتصحيحها.',
      },
    },
    {
      id: 't-moussa-ba',
      authorName: 'Moussa Bâ',
      authorCity: 'Kaolack',
      kind: 'TEXT' as const,
      quote: {
        fr: 'Je confondais le ذ et le ز sans même m’en rendre compte. La quatrième vidéo m’a appris à placer ma langue.',
        en: 'I was confusing ذ and ز without even realising it. The fourth video taught me where to place my tongue.',
        ar: 'كنت أخلط بين الذال والزاي دون أن أنتبه، فعلّمني الدرس الرابع أين أضع لساني.',
      },
    },
    {
      id: 't-ibrahima-sarr',
      authorName: 'Ibrahima Sarr',
      authorCity: 'Thiès',
      kind: 'VIDEO' as const,
      videoUrl: 'https://placeholder.mouslihacademy.sn/testimonials/ibrahima-sarr.mp4',
      videoDuration: '1 min 05',
      quote: {
        fr: "Entendre l'erreur puis la bonne prononciation, l'une après l'autre : c'est ce qui m'a enfin fait comprendre le ض.",
        en: 'Hearing the mistake and then the correct pronunciation, one after the other, is what finally made me understand the ض.',
        ar: 'سماع الخطأ ثم النطق الصحيح، الواحد تلو الآخر، هو ما جعلني أفهم الضاد أخيرًا.',
      },
    },
    {
      id: 't-fatou-ndiaye',
      authorName: 'Fatou Ndiaye',
      authorCity: 'Saint-Louis',
      kind: 'TEXT' as const,
      quote: {
        fr: 'Payé avec Wave en trente secondes, la formation était débloquée avant que je range mon téléphone.',
        en: 'Paid with Wave in thirty seconds, the course was unlocked before I even put my phone away.',
        ar: 'دفعت عبر Wave خلال ثلاثين ثانية، وانفتحت الدورة قبل أن أضع هاتفي جانبًا.',
      },
    },
    {
      id: 't-khadija-fall',
      authorName: 'Khadija Fall',
      authorCity: 'Milan',
      kind: 'TEXT' as const,
      highlighted: true,
      quote: {
        fr: 'Je vis à Milan. Trouver un enseignement rigoureux de la récitation, en français, était impossible avant.',
        en: 'I live in Milan. Finding rigorous recitation teaching, in French, was impossible before.',
        ar: 'أعيش في ميلانو. كان إيجاد تعليم دقيق للتلاوة باللغة الفرنسية أمرًا مستحيلاً من قبل.',
      },
    },
    {
      id: 't-seynabou-gueye',
      authorName: 'Seynabou Gueye',
      authorCity: 'Rufisque',
      kind: 'VIDEO' as const,
      videoUrl: 'https://placeholder.mouslihacademy.sn/testimonials/seynabou-gueye.mp4',
      videoDuration: '2 min 20',
      quote: {
        fr: 'Mon fils de neuf ans regarde les vidéos avec moi le soir.',
        en: 'My nine-year-old son watches the videos with me in the evening.',
        ar: 'ابني البالغ من العمر تسع سنوات يشاهد الدروس معي في المساء.',
      },
    },
  ];

  for (const t of testimonials) {
    const fields = {
      authorName: t.authorName,
      authorCity: t.authorCity,
      courseId: FATIHA_COURSE_ID,
      kind: t.kind,
      videoUrl: 'videoUrl' in t ? t.videoUrl : null,
      videoDuration: 'videoDuration' in t ? t.videoDuration : null,
      highlighted: 'highlighted' in t ? t.highlighted : false,
    };
    await prisma.testimonial.upsert({
      where: { id: t.id },
      update: fields,
      create: { id: t.id, ...fields },
    });
    for (const locale of LOCALES) {
      await prisma.testimonialTranslation.upsert({
        where: { testimonialId_locale: { testimonialId: t.id, locale: toDbLocale(locale) } },
        update: { quote: t.quote[locale] },
        create: { testimonialId: t.id, locale: toDbLocale(locale), quote: t.quote[locale] },
      });
    }
  }

  // ---------------------------------------------------------------------
  // Commandes (fidèle à src/mocks/orders.ts) — toutes sur la seule formation
  // visible, au prix de 10 150 F.
  // ---------------------------------------------------------------------
  const orders = [
    { ref: 'TX-8842301', userId: 'u-aminata-diallo', status: 'PAID' as const, createdAt: '2026-08-30T18:22:00' },
    { ref: 'TX-8901276', userId: 'u-aminata-diallo', status: 'FAILED' as const, createdAt: '2026-08-30T18:09:00' },
    { ref: 'TX-8851107', userId: 'u-seynabou-gueye', status: 'PAID' as const, createdAt: '2026-08-31T09:12:00' },
    { ref: 'TX-8850442', userId: 'u-khadija-fall', status: 'PAID' as const, createdAt: '2026-08-31T06:40:00' },
    { ref: 'TX-8848019', userId: 'u-moussa-ba', status: 'PENDING' as const, createdAt: '2026-08-30T21:05:00' },
    { ref: 'TX-8846755', userId: 'u-ibrahima-sarr', status: 'FAILED' as const, createdAt: '2026-08-30T14:58:00' },
    { ref: 'TX-8839210', userId: 'u-ousmane-diop', status: 'PAID' as const, createdAt: '2026-08-29T11:30:00' },
    { ref: 'TX-8619042', userId: 'u-fatou-ndiaye', status: 'PAID' as const, createdAt: '2026-07-02T10:15:00' },
    { ref: 'TX-8590117', userId: 'u-fatou-ndiaye', status: 'REFUNDED' as const, createdAt: '2026-06-28T16:40:00' },
  ];

  const demoUserIds = users.map((u) => u.id);
  // Inscriptions de démo sur les formations désormais masquées : retirées pour que le jeu de
  // démo reflète le recentrage (les vraies inscriptions, hors comptes de démo, ne sont pas touchées).
  await prisma.enrollment.deleteMany({
    where: { userId: { in: demoUserIds }, courseId: { not: FATIHA_COURSE_ID } },
  });

  for (const o of orders) {
    const order = await prisma.order.upsert({
      where: { ref: o.ref },
      update: { userId: o.userId, status: o.status, totalAmount: FATIHA_PRICE, createdAt: new Date(o.createdAt) },
      create: {
        ref: o.ref,
        userId: o.userId,
        status: o.status,
        totalAmount: FATIHA_PRICE,
        createdAt: new Date(o.createdAt),
        items: { create: [{ courseId: FATIHA_COURSE_ID, unitPrice: FATIHA_PRICE }] },
      },
    });
    await prisma.orderItem.updateMany({
      where: { orderId: order.id },
      data: { courseId: FATIHA_COURSE_ID, unitPrice: FATIHA_PRICE },
    });

    await prisma.payment.deleteMany({ where: { orderId: order.id } });
    if (o.status === 'PAID' || o.status === 'REFUNDED') {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          transactionRef: `WAVE-${o.ref}`,
          amount: FATIHA_PRICE,
          status: o.status === 'PAID' ? 'SUCCESS' : 'REFUNDED',
          paidAt: new Date(o.createdAt),
        },
      });
    }

    if (o.status === 'PAID') {
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: o.userId, courseId: FATIHA_COURSE_ID } },
        update: { orderId: order.id, status: 'ACTIVE' },
        create: { userId: o.userId, courseId: FATIHA_COURSE_ID, orderId: order.id },
      });
    }
  }

  // ---------------------------------------------------------------------
  // Progression d'Aminata : vidéos 1 et 2 terminées, vidéo 3 en cours
  // (reprise à 252 s).
  // ---------------------------------------------------------------------
  await prisma.enrollment.update({
    where: { userId_courseId: { userId: 'u-aminata-diallo', courseId: FATIHA_COURSE_ID } },
    data: { completedAt: null },
  });
  const progress = [
    { lessonId: 'fatiha-v01', status: 'COMPLETED' as const, completedAt: new Date('2026-08-31T20:10:00') },
    { lessonId: 'fatiha-v02', status: 'COMPLETED' as const, completedAt: new Date('2026-09-02T21:05:00') },
    { lessonId: 'fatiha-v03', status: 'IN_PROGRESS' as const, lastPositionSeconds: 252 },
  ];
  for (const entry of progress) {
    const { lessonId, ...data } = entry;
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: 'u-aminata-diallo', lessonId } },
      update: data,
      create: { userId: 'u-aminata-diallo', lessonId, ...data },
    });
  }

  // ---------------------------------------------------------------------
  // Questions de leçon sur la vidéo 2 (fidèle à src/mocks/lesson-questions.ts)
  // ---------------------------------------------------------------------
  await prisma.lessonQuestion.deleteMany({
    where: { lessonId: 'fatiha-v02', userId: { in: ['u-ibrahima-sarr', 'u-fatou-ndiaye'] } },
  });
  await prisma.lessonQuestion.create({
    data: {
      lessonId: 'fatiha-v02',
      userId: 'u-ibrahima-sarr',
      question:
        "Quand je prononce le ع, j'ai l'impression de forcer et ma voix se casse au bout de trois répétitions. Est-ce normal au début ?",
      answer:
        'C’est le signe que vous serrez la gorge. Reprenez la démonstration lente : le son doit venir sans effort. Trois répétitions puis une pause suffisent les premiers jours.',
      answeredById: 'u-oustaz-mouslih',
      answeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.lessonQuestion.create({
    data: {
      lessonId: 'fatiha-v02',
      userId: 'u-fatou-ndiaye',
      question: 'À la fin du verset, sur الْعَالَمِينَ, faut-il toujours allonger six temps ?',
    },
  });

  console.log(`Seed terminé. Enseignant de référence : ${teacher.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
