/**
 * Reproduit les données de démo du frontend (src/mocks/* du dépôt mouslih-academy) pour que
 * l'API renvoie, une fois branchée, des données équivalentes à celles déjà vues côté frontend.
 * Mot de passe de tous les comptes de démo : "password123".
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

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
      phone: '+221 77 123 45 67',
      createdAt: new Date('2026-08-14'),
    },
    {
      id: 'u-ibrahima-sarr',
      email: 'i.sarr@exemple.sn',
      firstName: 'Ibrahima',
      lastName: 'Sarr',
      city: 'Thiès',
      phone: '+221 76 884 21 09',
      createdAt: new Date('2026-08-09'),
    },
    {
      id: 'u-khadija-fall',
      email: 'khadija.fall@exemple.it',
      firstName: 'Khadija',
      lastName: 'Fall',
      city: 'Milan',
      phone: '+221 70 445 12 88',
      createdAt: new Date('2026-08-31'),
    },
    {
      id: 'u-moussa-ba',
      email: 'moussa.ba@exemple.sn',
      firstName: 'Moussa',
      lastName: 'Bâ',
      city: 'Kaolack',
      phone: '+221 78 220 91 34',
      createdAt: new Date('2026-08-30'),
    },
    {
      id: 'u-fatou-ndiaye',
      email: 'f.ndiaye@exemple.sn',
      firstName: 'Fatou',
      lastName: 'Ndiaye',
      city: 'Saint-Louis',
      phone: '+221 77 903 66 12',
      createdAt: new Date('2026-06-28'),
    },
    {
      id: 'u-seynabou-gueye',
      email: 's.gueye@exemple.sn',
      firstName: 'Seynabou',
      lastName: 'Gueye',
      city: 'Rufisque',
      phone: '+221 76 118 40 27',
      createdAt: new Date('2026-08-31'),
    },
    {
      id: 'u-ousmane-diop',
      email: 'o.diop@exemple.sn',
      firstName: 'Ousmane',
      lastName: 'Diop',
      city: 'Dakar',
      phone: '+221 78 552 03 76',
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
    update: {},
    create: {
      id: 'u-oustaz-mouslih',
      email: 'oustaz.mouslih@mouslihacademy.sn',
      firstName: 'Oustaz',
      lastName: 'Mouslih',
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
  // Catalogue — 6 formations. Seule « Rectification de la Fatiha » a un
  // programme détaillé côté frontend ; les 5 autres restent sans modules
  // (fidèle à src/mocks/courses.ts, qui les laisse à `modules: []`).
  // ---------------------------------------------------------------------
  const courses = [
    {
      id: 'c-rectification-fatiha',
      slug: 'rectification-fatiha',
      price: 15000,
      level: 'BEGINNER' as const,
      totalDurationSeconds: 10800,
      isFeatured: true,
      hasCertificate: true,
      hasVoiceCorrection: true,
      translations: {
        fr: {
          title: 'Rectification de la Fatiha',
          shortDescription: 'Onze leçons pour réciter juste',
          description:
            "La Fatiha est la seule sourate obligatoire à chaque unité de prière. Une lettre mal prononcée peut changer le sens du verset — et pourtant, la plupart des fidèles n'ont jamais eu de correction individuelle depuis l'enfance.\n\nCette formation reprend la sourate verset par verset. Vous enregistrez votre récitation à la fin de chaque module, et recevez une correction vocale sous 48 heures.",
        },
        en: {
          title: 'Perfecting Al-Fatiha',
          shortDescription: 'Eleven lessons to recite it right',
          description:
            'Al-Fatiha is the only surah obligatory in every unit of prayer. A mispronounced letter can change the meaning of a verse — yet most worshippers have never had individual correction since childhood.',
        },
        ar: {
          title: 'تصحيح سورة الفاتحة',
          shortDescription: 'أحد عشر درسًا للتلاوة الصحيحة',
          description:
            'سورة الفاتحة هي السورة الوحيدة الواجبة في كل ركعة. قد يغيّر حرف يُنطق خطأً معنى الآية.',
        },
      },
    },
    {
      id: 'c-initiation-nourania',
      slug: 'initiation-nourania',
      price: 25000,
      level: 'BEGINNER' as const,
      totalDurationSeconds: 22800,
      isFeatured: true,
      hasCertificate: true,
      hasVoiceCorrection: true,
      translations: {
        fr: {
          title: 'Initiation à la lecture — Nourania',
          shortDescription: 'Les bases de la lecture coranique',
          description:
            "La méthode Nourania pour apprendre à lire l'arabe coranique lettre par lettre, sans prérequis.",
        },
        en: {
          title: 'Reading Foundations — Nourania',
          shortDescription: 'The foundations of Quranic reading',
          description:
            'The Nourania method to learn Quranic Arabic reading letter by letter, with no prerequisites.',
        },
        ar: {
          title: 'القاعدة النورانية',
          shortDescription: 'أساسيات القراءة القرآنية',
          description: 'منهج نوراني لتعلم قراءة العربية القرآنية حرفًا حرفًا، دون شروط مسبقة.',
        },
      },
    },
    {
      id: 'c-regles-tajwid',
      slug: 'regles-tajwid',
      price: 40000,
      level: 'INTERMEDIATE' as const,
      totalDurationSeconds: 39900,
      isFeatured: true,
      hasCertificate: true,
      hasVoiceCorrection: true,
      translations: {
        fr: {
          title: 'Les règles du Tajwid',
          shortDescription: 'Réciter le Coran selon ses règles',
          description:
            "Un parcours complet des règles de Tajwid, de la théorie à l'application pratique guidée.",
        },
        en: {
          title: 'The Rules of Tajwid',
          shortDescription: 'Reciting the Quran by its rules',
          description:
            'A complete path through the rules of Tajwid, from theory to guided practical application.',
        },
        ar: {
          title: 'أحكام التجويد',
          shortDescription: 'تلاوة القرآن وفق أحكامه',
          description: 'مسار كامل في أحكام التجويد، من النظرية إلى التطبيق العملي الموجّه.',
        },
      },
    },
    {
      id: 'c-fiqh-priere',
      slug: 'fiqh-priere',
      price: 20000,
      level: 'BEGINNER' as const,
      totalDurationSeconds: 16200,
      isFeatured: false,
      hasCertificate: true,
      hasVoiceCorrection: false,
      translations: {
        fr: {
          title: 'Fiqh de la prière',
          shortDescription: 'Comprendre et accomplir la prière',
          description: 'Les règles de la prière, ses conditions, ses piliers et ses cas particuliers.',
        },
        en: {
          title: 'Fiqh of Prayer',
          shortDescription: 'Understanding and performing prayer',
          description: 'The rules of prayer, its conditions, pillars, and special cases.',
        },
        ar: {
          title: 'فقه الصلاة',
          shortDescription: 'فهم الصلاة وأداؤها',
          description: 'أحكام الصلاة وشروطها وأركانها وحالاتها الخاصة.',
        },
      },
    },
    {
      id: 'c-memorisation-cinq-lignes',
      slug: 'memorisation-cinq-lignes',
      price: 30000,
      level: 'INTERMEDIATE' as const,
      totalDurationSeconds: 25800,
      isFeatured: false,
      hasCertificate: true,
      hasVoiceCorrection: false,
      translations: {
        fr: {
          title: 'Mémorisation — cinq lignes par jour',
          shortDescription: 'Une méthode progressive de mémorisation',
          description:
            'Mémoriser durablement le Coran à raison de cinq lignes par jour, avec révision guidée.',
        },
        en: {
          title: 'Memorization — five lines a day',
          shortDescription: 'A progressive memorization method',
          description: 'Durably memorize the Quran at a pace of five lines a day, with guided revision.',
        },
        ar: {
          title: 'الحفظ : خمسة أسطر يوميًا',
          shortDescription: 'منهج تدريجي للحفظ',
          description: 'حفظ القرآن حفظًا راسخًا بمعدل خمسة أسطر يوميًا، مع مراجعة موجّهة.',
        },
      },
    },
    {
      id: 'c-sciences-hadith',
      slug: 'sciences-hadith',
      price: 45000,
      level: 'ADVANCED' as const,
      totalDurationSeconds: 34800,
      isFeatured: false,
      hasCertificate: true,
      hasVoiceCorrection: false,
      translations: {
        fr: {
          title: 'Sciences du hadith',
          shortDescription: 'Introduction à la critique du hadith',
          description:
            "Les fondements des sciences du hadith : authenticité, chaînes de transmission, classification.",
        },
        en: {
          title: 'Sciences of Hadith',
          shortDescription: 'Introduction to hadith criticism',
          description: 'The foundations of hadith sciences: authenticity, chains of transmission, classification.',
        },
        ar: {
          title: 'علوم الحديث',
          shortDescription: 'مدخل إلى علوم نقد الحديث',
          description: 'أسس علوم الحديث : الصحة وسلاسل الإسناد والتصنيف.',
        },
      },
    },
  ];

  for (const c of courses) {
    await prisma.course.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        slug: c.slug,
        price: c.price,
        level: c.level,
        totalDurationSeconds: c.totalDurationSeconds,
        isFeatured: c.isFeatured,
        hasCertificate: c.hasCertificate,
        hasVoiceCorrection: c.hasVoiceCorrection,
        status: 'PUBLISHED',
        translations: {
          create: (['fr', 'en', 'ar'] as const).map((locale) => ({
            locale: locale.toUpperCase() as 'FR' | 'EN' | 'AR',
            title: c.translations[locale].title,
            shortDescription: c.translations[locale].shortDescription,
            description: c.translations[locale].description,
          })),
        },
      },
    });
  }

  // ---------------------------------------------------------------------
  // Programme complet de « Rectification de la Fatiha » — jeu de données
  // de référence (fidèle à src/mocks/curriculum-fatiha.ts).
  // ---------------------------------------------------------------------
  const fatihaModules = [
    {
      id: 'm1-avant-de-reciter',
      position: 1,
      title: { fr: 'Avant de réciter', en: 'Before reciting', ar: 'قبل التلاوة' },
      submodules: [
        {
          id: 'm1-sm1',
          position: 1,
          title: null,
          lessons: [
            {
              id: 'l1',
              position: 1,
              isFreePreview: true,
              durationSeconds: 492,
              title: {
                fr: 'Pourquoi la Fatiha doit être rectifiée',
                en: 'Why Al-Fatiha must be corrected',
                ar: 'لماذا يجب تصحيح الفاتحة',
              },
            },
            {
              id: 'l2',
              position: 2,
              isFreePreview: true,
              durationSeconds: 700,
              title: {
                fr: 'Poser sa respiration et son souffle',
                en: 'Settling your breath',
                ar: 'ضبط النفَس والتنفّس',
              },
            },
            {
              id: 'l3',
              position: 3,
              isFreePreview: false,
              durationSeconds: 545,
              title: {
                fr: "L'intention, la posture, la concentration",
                en: 'Intention, posture, concentration',
                ar: 'النية والجلسة والتركيز',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'm2-les-lettres-qui-trahissent',
      position: 2,
      title: {
        fr: 'Les lettres qui trahissent',
        en: 'The letters that betray the reciter',
        ar: 'الحروف التي تخون القارئ',
      },
      submodules: [
        {
          id: 'm2-sm-emphatiques',
          position: 1,
          title: { fr: 'Les emphatiques', en: 'The emphatics', ar: 'الحروف المفخّمة' },
          lessons: [
            {
              id: 'l4',
              position: 1,
              isFreePreview: false,
              durationSeconds: 980,
              title: {
                fr: 'Le ص, le ض et la mâchoire',
                en: 'Ṣād, Ḍād and the jaw',
                ar: 'الصاد والضاد والفك',
              },
            },
            {
              id: 'l5',
              position: 2,
              isFreePreview: false,
              durationSeconds: 895,
              title: {
                fr: 'Le ط et le ظ : distinguer sans forcer',
                en: 'Ṭāʾ and Ẓāʾ: distinguishing without straining',
                ar: 'الطاء والظاء : التمييز دون إجهاد',
              },
            },
          ],
        },
        {
          id: 'm2-sm-gutturales',
          position: 2,
          title: { fr: 'Les gutturales', en: 'The gutturals', ar: 'الحروف الحلقية' },
          lessons: [
            {
              id: 'l6',
              position: 1,
              isFreePreview: false,
              durationSeconds: 1090,
              title: {
                fr: 'Le ع et le ح : ouvrir la gorge',
                en: 'ʿAyn and Ḥāʾ: opening the throat',
                ar: 'العين والحاء : فتح الحلق',
              },
              resources: [
                { label: "Carte des points d'articulation", fileUrl: 'https://placeholder.mouslihacademy.sn/resources/carte-articulation.pdf' },
                { label: 'Tableau des lettres gutturales', fileUrl: 'https://placeholder.mouslihacademy.sn/resources/tableau-gutturales.pdf' },
                { label: 'Exercices de répétition — module 2', fileUrl: 'https://placeholder.mouslihacademy.sn/resources/exercices-module-2.pdf' },
              ],
            },
            {
              id: 'l7',
              position: 2,
              isFreePreview: false,
              durationSeconds: 1115,
              title: {
                fr: "Le ق et le ك : le point d'appui",
                en: "Le ق et le ك : le point d'appui",
                ar: 'القاف والكاف : نقطة الارتكاز',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'm3-les-prolongations-et-les-arrets',
      position: 3,
      title: {
        fr: 'Les prolongations et les arrêts',
        en: 'Les prolongations et les arrêts',
        ar: 'المدود والوقوف',
      },
      submodules: [
        {
          id: 'm3-sm1',
          position: 1,
          title: null,
          lessons: [
            {
              id: 'l8',
              position: 1,
              isFreePreview: false,
              durationSeconds: 1185,
              title: {
                fr: 'Compter les temps de prolongation',
                en: 'Compter les temps de prolongation',
                ar: 'عدّ حركات المد',
              },
            },
            {
              id: 'l9',
              position: 2,
              isFreePreview: false,
              durationSeconds: 1110,
              title: {
                fr: "Où s'arrêter sans briser le sens",
                en: "Où s'arrêter sans briser le sens",
                ar: 'أين نقف دون كسر المعنى',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'm4-reciter-la-sourate-en-entier',
      position: 4,
      title: {
        fr: 'Réciter la sourate en entier',
        en: 'Réciter la sourate en entier',
        ar: 'تلاوة السورة كاملة',
      },
      submodules: [
        {
          id: 'm4-sm1',
          position: 1,
          title: null,
          lessons: [
            {
              id: 'l10',
              position: 1,
              isFreePreview: false,
              durationSeconds: 1450,
              title: {
                fr: 'Récitation guidée, verset par verset',
                en: 'Récitation guidée, verset par verset',
                ar: 'تلاوة موجّهة، آية بآية',
              },
            },
            {
              id: 'l11',
              position: 2,
              isFreePreview: false,
              durationSeconds: 1070,
              title: {
                fr: 'Enregistrer et envoyer votre récitation',
                en: 'Enregistrer et envoyer votre récitation',
                ar: 'تسجيل تلاوتك وإرسالها',
              },
            },
          ],
        },
      ],
    },
  ];

  for (const mod of fatihaModules) {
    await prisma.module.upsert({
      where: { id: mod.id },
      update: {},
      create: {
        id: mod.id,
        courseId: 'c-rectification-fatiha',
        position: mod.position,
        status: 'PUBLISHED',
        translations: {
          create: (['fr', 'en', 'ar'] as const).map((locale) => ({
            locale: locale.toUpperCase() as 'FR' | 'EN' | 'AR',
            title: mod.title[locale],
          })),
        },
      },
    });

    for (const sm of mod.submodules) {
      await prisma.submodule.upsert({
        where: { id: sm.id },
        update: {},
        create: {
          id: sm.id,
          moduleId: mod.id,
          position: sm.position,
          status: 'PUBLISHED',
          translations: sm.title
            ? {
                create: (['fr', 'en', 'ar'] as const).map((locale) => ({
                  locale: locale.toUpperCase() as 'FR' | 'EN' | 'AR',
                  title: sm.title![locale],
                })),
              }
            : undefined,
        },
      });

      for (const lesson of sm.lessons) {
        await prisma.lesson.upsert({
          where: { id: lesson.id },
          update: {},
          create: {
            id: lesson.id,
            submoduleId: sm.id,
            position: lesson.position,
            status: 'PUBLISHED',
            isFreePreview: lesson.isFreePreview,
            translations: {
              create: (['fr', 'en', 'ar'] as const).map((locale) => ({
                locale: locale.toUpperCase() as 'FR' | 'EN' | 'AR',
                title: lesson.title[locale],
              })),
            },
            video: {
              create: {
                provider: lesson.isFreePreview ? 'YOUTUBE' : 'CLOUDFLARE_STREAM',
                externalId: lesson.isFreePreview ? `demo-${lesson.id}` : `stream-demo-${lesson.id}`,
                durationSeconds: lesson.durationSeconds,
                status: 'READY',
              },
            },
            resources: lesson.resources
              ? { create: lesson.resources.map((r) => ({ label: r.label, fileUrl: r.fileUrl })) }
              : undefined,
          },
        });
      }
    }
  }

  // ---------------------------------------------------------------------
  // Témoignages
  // ---------------------------------------------------------------------
  const testimonials = [
    {
      id: 't-aminata-diallo',
      authorName: 'Aminata Diallo',
      authorCity: 'Dakar',
      courseId: 'c-rectification-fatiha',
      kind: 'TEXT' as const,
      quote: {
        fr: "Je récitais la Fatiha depuis vingt ans avec trois erreurs que personne ne m'avait signalées. Onze leçons ont suffi.",
        en: 'I had been reciting Al-Fatiha for twenty years with three mistakes no one had ever pointed out. Eleven lessons were enough.',
        ar: 'كنت أتلو الفاتحة منذ عشرين عامًا بثلاثة أخطاء لم ينبهني إليها أحد. كفتني أحد عشر درسًا.',
      },
    },
    {
      id: 't-moussa-ba',
      authorName: 'Moussa Bâ',
      authorCity: 'Kaolack',
      courseId: 'c-memorisation-cinq-lignes',
      kind: 'TEXT' as const,
      quote: {
        fr: "La méthode des cinq lignes m'a fait tenir six mois là où j'abandonnais après deux semaines. Le secret, c'est la révision imposée.",
        en: 'The five-lines method kept me going for six months, when I used to give up after two weeks.',
        ar: 'منهج الأسطر الخمسة جعلني أستمر ستة أشهر بينما كنت أتوقف بعد أسبوعين.',
      },
    },
    {
      id: 't-ibrahima-sarr',
      authorName: 'Ibrahima Sarr',
      authorCity: 'Thiès',
      courseId: 'c-regles-tajwid',
      kind: 'VIDEO' as const,
      videoUrl: 'https://placeholder.mouslihacademy.sn/testimonials/ibrahima-sarr.mp4',
      quote: {
        fr: "Les corrections vocales par WhatsApp changent tout — on entend son erreur, on ne la lit pas.",
        en: "Voice corrections over WhatsApp change everything — you hear your mistake, you don't just read it.",
        ar: 'التصحيحات الصوتية عبر واتساب تغيّر كل شيء — تسمع خطأك، لا تكتفي بقراءته.',
      },
    },
    {
      id: 't-fatou-ndiaye',
      authorName: 'Fatou Ndiaye',
      authorCity: 'Saint-Louis',
      courseId: 'c-initiation-nourania',
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
      courseId: 'c-fiqh-priere',
      kind: 'TEXT' as const,
      quote: {
        fr: 'Je vis à Milan. Trouver un enseignant sénégalais rigoureux qui corrige vraiment, c’était impossible avant.',
        en: 'I live in Milan. Finding a rigorous Senegalese teacher who truly corrects you was impossible before.',
        ar: 'أعيش في ميلانو. كان إيجاد أستاذ سنغالي صارم يصحّح فعليًا أمرًا مستحيلاً من قبل.',
      },
    },
    {
      id: 't-seynabou-gueye',
      authorName: 'Seynabou Gueye',
      authorCity: 'Rufisque',
      courseId: 'c-initiation-nourania',
      kind: 'VIDEO' as const,
      videoUrl: 'https://placeholder.mouslihacademy.sn/testimonials/seynabou-gueye.mp4',
      quote: {
        fr: 'Mon fils de neuf ans suit la Nourania avec moi le soir.',
        en: 'My nine-year-old son follows the Nourania course with me in the evening.',
        ar: 'ابني البالغ من العمر تسع سنوات يتابع معي درس النورانية في المساء.',
      },
    },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.upsert({
      where: { id: t.id },
      update: {},
      create: {
        id: t.id,
        authorName: t.authorName,
        authorCity: t.authorCity,
        courseId: t.courseId,
        kind: t.kind,
        videoUrl: 'videoUrl' in t ? t.videoUrl : null,
        translations: {
          create: (['fr', 'en', 'ar'] as const).map((locale) => ({
            locale: locale.toUpperCase() as 'FR' | 'EN' | 'AR',
            quote: t.quote[locale],
          })),
        },
      },
    });
  }

  // ---------------------------------------------------------------------
  // Commandes (fidèle à src/mocks/orders.ts)
  // ---------------------------------------------------------------------
  const orders = [
    { ref: 'TX-8842301', userId: 'u-aminata-diallo', courseId: 'c-rectification-fatiha', amount: 15000, status: 'PAID' as const, createdAt: '2026-08-30T18:22:00' },
    { ref: 'TX-8619042', userId: 'u-aminata-diallo', courseId: 'c-fiqh-priere', amount: 20000, status: 'PAID' as const, createdAt: '2026-07-02' },
    { ref: 'TX-8901276', userId: 'u-aminata-diallo', courseId: 'c-initiation-nourania', amount: 25000, status: 'FAILED' as const, createdAt: '2026-06-28' },
    { ref: 'TX-8851107', userId: 'u-seynabou-gueye', courseId: 'c-initiation-nourania', amount: 25000, status: 'PAID' as const, createdAt: '2026-08-31T09:12:00' },
    { ref: 'TX-8850442', userId: 'u-khadija-fall', courseId: 'c-fiqh-priere', amount: 20000, status: 'PAID' as const, createdAt: '2026-08-31T06:40:00' },
    { ref: 'TX-8848019', userId: 'u-moussa-ba', courseId: 'c-memorisation-cinq-lignes', amount: 30000, status: 'PENDING' as const, createdAt: '2026-08-30T21:05:00' },
    { ref: 'TX-8846755', userId: 'u-ibrahima-sarr', courseId: 'c-regles-tajwid', amount: 40000, status: 'FAILED' as const, createdAt: '2026-08-30T14:58:00' },
    { ref: 'TX-8839210', userId: 'u-ousmane-diop', courseId: 'c-rectification-fatiha', amount: 15000, status: 'PAID' as const, createdAt: '2026-08-29T11:30:00' },
    { ref: 'TX-8590117', userId: 'u-fatou-ndiaye', courseId: 'c-initiation-nourania', amount: 25000, status: 'REFUNDED' as const, createdAt: '2026-06-28' },
  ];

  for (const o of orders) {
    const order = await prisma.order.upsert({
      where: { ref: o.ref },
      update: {},
      create: {
        ref: o.ref,
        userId: o.userId,
        status: o.status,
        totalAmount: o.amount,
        createdAt: new Date(o.createdAt),
        items: { create: [{ courseId: o.courseId, unitPrice: o.amount }] },
        payments:
          o.status === 'PAID'
            ? {
                create: [
                  {
                    transactionRef: `WAVE-${o.ref}`,
                    amount: o.amount,
                    status: 'SUCCESS',
                    paidAt: new Date(o.createdAt),
                  },
                ],
              }
            : undefined,
      },
    });

    if (o.status === 'PAID') {
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: o.userId, courseId: o.courseId } },
        update: {},
        create: { userId: o.userId, courseId: o.courseId, orderId: order.id },
      });
    }
  }

  // ---------------------------------------------------------------------
  // Progression d'Aminata sur Rectification de la Fatiha :
  // l1-l5 terminées, l6 en cours (reprise à 252 s).
  // ---------------------------------------------------------------------
  const completedFatihaLessons = ['l1', 'l2', 'l3', 'l4', 'l5'];
  for (const lessonId of completedFatihaLessons) {
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: 'u-aminata-diallo', lessonId } },
      update: {},
      create: { userId: 'u-aminata-diallo', lessonId, status: 'COMPLETED', completedAt: new Date() },
    });
  }
  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: 'u-aminata-diallo', lessonId: 'l6' } },
    update: {},
    create: { userId: 'u-aminata-diallo', lessonId: 'l6', status: 'IN_PROGRESS', lastPositionSeconds: 252 },
  });

  // Récitation d'Aminata en attente de correction (module 1).
  await prisma.recitation.create({
    data: {
      userId: 'u-aminata-diallo',
      lessonId: 'l3',
      audioUrl: 'https://placeholder.mouslihacademy.sn/recitations/aminata-module-1.m4a',
      status: 'PENDING',
      submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  });

  // ---------------------------------------------------------------------
  // Questions de leçon sur l6 (fidèle à src/mocks/lesson-questions.ts)
  // ---------------------------------------------------------------------
  await prisma.lessonQuestion.create({
    data: {
      lessonId: 'l6',
      userId: 'u-ibrahima-sarr',
      question:
        "Quand je prononce le ع, j'ai l'impression de forcer et ma voix se casse au bout de trois répétitions. Est-ce normal au début ?",
      answer:
        'C’est le signe que vous serrez la gorge. Reprenez à 06:40 : le son doit venir sans effort, comme un souffle retenu. Trois répétitions puis une pause suffisent la première semaine.',
      answeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.lessonQuestion.create({
    data: {
      lessonId: 'l6',
      userId: 'u-fatou-ndiaye',
      question:
        'Le PDF du tableau des gutturales ne s’ouvre pas sur mon téléphone. Une autre version est-elle possible ?',
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
