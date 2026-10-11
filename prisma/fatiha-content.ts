/**
 * Contenu « Rectifiez votre Fâtiḥah » pour le seed.
 * Généré depuis la source éditoriale unique CONTENU-FATIHA.md — ne pas modifier à la main sans
 * reporter la modification dans le dépôt jumeau (mock frontend ↔ seed backend).
 */
/** Ancienne vidéo provisoire unique : remplacée par la vidéo de chaque leçon quand elle est encore en place. */
export const FATIHA_PLACEHOLDER_YOUTUBE_ID = 'ku1romHwGCM';

export const FATIHA_TOTAL_DURATION_SECONDS = 2275;

export const fatihaCourseText = {
  title: {
    fr: 'Rectifiez votre Fâtiḥah',
    en: 'Perfect Your Al-Fâtiḥah',
    ar: 'صحِّح قراءتك للفاتحة',
  },
  subtitle: {
    fr: '10 erreurs fréquentes corrigées en 5 vidéos',
    en: '10 common mistakes corrected in 5 videos',
    ar: 'عشرة أخطاء شائعة تُصحَّح في خمسة دروس مرئية',
  },
  cardDescription: {
    fr: 'Reconnaissez les erreurs de prononciation les plus fréquentes et récitez Al-Fâtiḥah avec davantage de précision.',
    en: 'Recognise the most common pronunciation mistakes and recite Al-Fâtiḥah with greater precision.',
    ar: 'تعرّف على أكثر أخطاء النطق شيوعًا، واتلُ سورة الفاتحة بدقّة أكبر.',
  },
  heroTagline: {
    fr: 'Apprenez à reconnaître les erreurs de prononciation, à maîtriser les lettres difficiles et à réciter Al-Fâtiḥah avec davantage de précision.',
    en: 'Learn to recognise pronunciation mistakes, master the difficult letters and recite Al-Fâtiḥah with greater precision.',
    ar: 'تعلَّم كيف تتعرّف على أخطاء النطق، وتُتقن الحروف الصعبة، وتتلو سورة الفاتحة بدقّة أكبر.',
  },
  heroTaglineMobile: {
    fr: '10 erreurs fréquentes corrigées en 5 vidéos, pour réciter Al-Fâtiḥah avec davantage de précision.',
    en: '10 common mistakes corrected in 5 videos, to recite Al-Fâtiḥah with greater precision.',
    ar: 'عشرة أخطاء شائعة في خمسة دروس مرئية، لتتلو الفاتحة بدقّة أكبر.',
  },
  description: {
    fr: "Al-Fâtiḥah est récitée à chaque unité de prière. Pourtant, certaines erreurs de prononciation y reviennent très souvent :\n- une lettre remplacée par une autre ;\n- une shadda oubliée ;\n- un allongement écourté ;\n- une voyelle ajoutée entre deux mots.\n\nCette formation les reprend une à une, dans l'ordre de la sourate. Chaque vidéo se concentre sur un passage précis et corrige deux erreurs. Vous apprenez à :\n- les entendre ;\n- placer correctement la langue et la gorge ;\n- répéter le mot juste.",
    en: 'Al-Fâtiḥah is recited in every unit of prayer. Yet some pronunciation mistakes come up again and again:\n- one letter replaced by another;\n- a forgotten shadda;\n- a shortened prolongation;\n- a vowel added between two words.\n\nThis course takes them one by one, in the order of the surah. Each video focuses on a specific passage and corrects two mistakes. You learn to:\n- hear them;\n- position your tongue and throat correctly;\n- repeat the correct word.',
    ar: 'تُتلى سورة الفاتحة في كل ركعة، ومع ذلك تتكرّر فيها أخطاء نطق كثيرة:\n- حرف يُبدَل بغيره؛\n- شدّة تُترك؛\n- مدّ يُقصَر؛\n- حركة تُزاد بين كلمتين.\n\nتتناول هذه الدورة هذه الأخطاء واحدًا تلو الآخر، بترتيب السورة. يركّز كل درس مرئي على موضع محدّد ويصحّح خطأين. ستتعلّم:\n- كيف تسمعهما؛\n- كيف تضبط موضع اللسان والحلق؛\n- كيف تكرّر الكلمة على الوجه الصحيح.',
  },
} as const;

export const fatihaModule = {
  id: 'm-fatiha-videos',
  subModuleId: 'sm-fatiha-videos',
  title: {
    fr: 'Les 10 erreurs, vidéo par vidéo',
    en: 'The 10 mistakes, video by video',
    ar: 'الأخطاء العشرة، درسًا بعد درس',
  },
} as const;

export const fatihaLessons = [
  {
    id: 'fatiha-v01',
    slug: 'corriger-al-hamdu',
    durationSeconds: 385,
    youtubeId: '7023DoO7TL4',
    isFreePreview: true,
    passage: 'الْحَمْدُ',
    title: {
      fr: 'Corriger les deux erreurs dans « Al-ḥamdu »',
      en: 'Correcting the two mistakes in “Al-ḥamdu”',
      ar: 'تصحيح الخطأين في «الْحَمْدُ»',
    },
    description: {
      fr: 'Dans cette première vidéo, nous allons corriger deux erreurs fréquentes dès le début de la sourate Al-Fâtiḥah. Nous apprendrons à prononcer correctement la lettre ح, sans la supprimer ni la remplacer, puis à articuler الْحَمْدُ sans ajouter de son nasal avant la lettre د.',
      en: 'In this first video, we correct two common mistakes at the very start of Al-Fâtiḥah. We learn to pronounce the letter ح correctly, without dropping or replacing it, then to articulate الْحَمْدُ without adding a nasal sound before the letter د.',
      ar: 'في هذا الدرس الأول نصحّح خطأين شائعين في بداية سورة الفاتحة: نتعلّم نطق حرف الحاء نطقًا صحيحًا دون حذفه أو إبداله، ثم نطق «الْحَمْدُ» دون إضافة صوت أنفيّ قبل حرف الدال.',
    },
    objective: {
      fr: 'Maîtriser la prononciation du premier mot de la sourate.',
      en: 'Master the pronunciation of the first word of the surah.',
      ar: 'إتقان نطق الكلمة الأولى من السورة.',
    },
    keyPoints: [
      {
        fr: 'Prononcer correctement la lettre ح, sans la supprimer ni la remplacer',
        en: 'Pronounce the letter ح correctly, without dropping or replacing it',
        ar: 'نطق حرف الحاء نطقًا صحيحًا دون حذفه أو إبداله',
      },
      {
        fr: 'Articuler الْحَمْدُ sans ajouter de son nasal avant le د',
        en: 'Articulate الْحَمْدُ without adding a nasal sound before the د',
        ar: 'نطق «الْحَمْدُ» دون زيادة صوت أنفيّ قبل الدال',
      },
    ],
    mistakes: [
      {
        passage: 'الْحَمْدُ',
        title: {
          fr: 'Le ح supprimé ou remplacé',
          en: 'The ح dropped or replaced',
          ar: 'حذف الحاء أو إبدالها',
        },
        mistake: {
          fr: 'Le ح est supprimé (« al-amdu ») ou remplacé par ه ou خ.',
          en: 'The ح is dropped (“al-amdu”) or replaced by ه or خ.',
          ar: 'تُحذف الحاء («الَمْدُ») أو تُبدَل هاءً أو خاءً.',
        },
        correction: {
          fr: 'Prononcer le ح depuis le milieu de la gorge, souffle continu, sans raclement.',
          en: 'Pronounce the ح from the middle of the throat, with a continuous breath and no rasp.',
          ar: 'انطق الحاء من وسط الحلق بنفَس متّصل ودون بحّة.',
        },
        rule: {
          fr: 'Makhraj : milieu de la gorge (wasaṭ al-ḥalq) ; lettre chuchotée (hams) et fine.',
          en: 'Makhraj: middle of the throat (wasaṭ al-ḥalq); a whispered (hams) and light letter.',
          ar: 'المخرج: وسط الحلق؛ وهي حرف مهموس مرقَّق.',
        },
      },
      {
        passage: 'الْحَمْدُ',
        title: {
          fr: 'Son nasal ajouté avant le د',
          en: 'Nasal sound added before the د',
          ar: 'زيادة غنّة قبل الدال',
        },
        mistake: {
          fr: 'Son nasal parasite avant le د (« al-ḥamndu »), ou ghunna prolongée sur le م.',
          en: 'A stray nasal sound before the د (“al-ḥamndu”), or a prolonged ghunna on the م.',
          ar: 'زيادة صوت أنفيّ قبل الدال («الحَمْنْدُ»)، أو إطالة الغنّة على الميم.',
        },
        correction: {
          fr: 'Fermer les lèvres sur le م sākin puis passer directement au د.',
          en: 'Close the lips on the sākin م, then move straight on to the د.',
          ar: 'أطبِق الشفتين على الميم الساكنة ثم انتقل مباشرة إلى الدال.',
        },
        rule: {
          fr: "Mīm sākin suivi d'une autre lettre que م ou ب : iẓhār shafawī, sans ghunna prolongée.",
          en: 'A sākin mīm followed by any letter other than م or ب: iẓhār shafawī, with no prolonged ghunna.',
          ar: 'الميم الساكنة قبل غير الميم والباء: إظهار شفوي دون إطالة الغنّة.',
        },
      },
    ],
  },
  {
    id: 'fatiha-v02',
    slug: 'al-alamin-et-iyyaka',
    durationSeconds: 264,
    youtubeId: 'GSCyCtWtj1c',
    isFreePreview: true,
    passage: 'الْعَالَمِينَ — إِيَّاكَ',
    title: {
      fr: 'Maîtriser « Al-ʿālamīn » et « Iyyāka »',
      en: 'Mastering “Al-ʿālamīn” and “Iyyāka”',
      ar: 'إتقان «الْعَالَمِينَ» و«إِيَّاكَ»',
    },
    description: {
      fr: "Cette deuxième vidéo est consacrée à deux difficultés de prononciation : l'articulation correcte de الْعَالَمِينَ, notamment la lettre ع et les allongements, et la prononciation de إِيَّاكَ en respectant la shadda sur le يّ.",
      en: 'This second video addresses two pronunciation difficulties: the correct articulation of الْعَالَمِينَ, especially the letter ع and the prolongations, and the pronunciation of إِيَّاكَ respecting the shadda on the يّ.',
      ar: 'يتناول هذا الدرس الثاني صعوبتين في النطق: النطق الصحيح لـ«الْعَالَمِينَ»، ولا سيّما حرف العين والمدود، ونطق «إِيَّاكَ» مع مراعاة الشدّة على الياء.',
    },
    objective: {
      fr: 'Améliorer la précision des lettres, des allongements et de la consonne redoublée.',
      en: 'Improve precision in letters, prolongations and the doubled consonant.',
      ar: 'تحسين الدقّة في الحروف والمدود والحرف المشدَّد.',
    },
    keyPoints: [
      {
        fr: 'Articuler correctement la lettre ع dans الْعَالَمِينَ',
        en: 'Articulate the letter ع correctly in الْعَالَمِينَ',
        ar: 'نطق حرف العين نطقًا صحيحًا في «الْعَالَمِينَ»',
      },
      {
        fr: 'Respecter les allongements de الْعَالَمِينَ',
        en: 'Respect the prolongations of الْعَالَمِينَ',
        ar: 'مراعاة المدود في «الْعَالَمِينَ»',
      },
      {
        fr: 'Prononcer إِيَّاكَ en respectant la shadda sur le يّ',
        en: 'Pronounce إِيَّاكَ respecting the shadda on the يّ',
        ar: 'نطق «إِيَّاكَ» مع مراعاة الشدّة على الياء',
      },
    ],
    mistakes: [
      {
        passage: 'الْعَالَمِينَ',
        title: {
          fr: 'Le ع et les allongements',
          en: 'The ع and the prolongations',
          ar: 'العين والمدود',
        },
        mistake: {
          fr: 'Le ع remplacé par une hamza (« al-ālamīn ») ; allongements de عَا et مِي raccourcis ou irréguliers.',
          en: 'The ع replaced by a hamza (“al-ālamīn”); the prolongations of عَا and مِي shortened or uneven.',
          ar: 'إبدال العين همزةً («الَالَمِين»)، وقصر مدّ «عَا» و«مِي» أو عدم انتظامه.',
        },
        correction: {
          fr: "Articuler le ع depuis le milieu de la gorge, voisé ; tenir deux temps sur chaque allongement naturel, et à l'arrêt 2, 4 ou 6 temps de façon constante.",
          en: 'Articulate the ع from the middle of the throat, voiced; hold two counts on each natural prolongation, and 2, 4 or 6 counts consistently when stopping.',
          ar: 'انطق العين من وسط الحلق مجهورةً، وامدد كل مدّ طبيعي حركتين، وعند الوقف حركتين أو أربعًا أو ستًّا بانتظام.',
        },
        rule: {
          fr: "ع : milieu de la gorge, à distinguer de la hamza (fond de la gorge). Madd ṭabīʿī (2 ḥarakāt) ; madd ʿāriḍ li-s-sukūn à l'arrêt.",
          en: 'ع: middle of the throat, distinct from the hamza (deepest part of the throat). Madd ṭabīʿī (2 ḥarakāt); madd ʿāriḍ li-s-sukūn when stopping.',
          ar: 'العين من وسط الحلق، والهمزة من أقصاه. المدّ الطبيعي حركتان، والمدّ العارض للسكون عند الوقف.',
        },
      },
      {
        passage: 'إِيَّاكَ',
        title: {
          fr: 'La shadda du يّ oubliée',
          en: 'Missing shadda on the يّ',
          ar: 'ترك تشديد الياء',
        },
        mistake: {
          fr: 'Shadda oubliée sur le يّ (« iyāka »).',
          en: 'Shadda omitted on the يّ (“iyāka”).',
          ar: 'ترك الشدّة على الياء («إِيَاكَ»).',
        },
        correction: {
          fr: 'Appuyer le يّ : il compte comme deux lettres.',
          en: 'Stress the يّ: it counts as two letters.',
          ar: 'شدِّد الياء، فهي بمنزلة حرفين.',
        },
        rule: {
          fr: "La shadda indique une lettre redoublée ; l'omettre altère le mot.",
          en: 'The shadda marks a doubled letter; omitting it alters the word.',
          ar: 'الشدّة تدلّ على حرف مضعَّف، وتركها يُخلّ بالكلمة.',
        },
      },
    ],
  },
  {
    id: 'fatiha-v03',
    slug: 'ihdina-s-sirat',
    durationSeconds: 462,
    youtubeId: 'dDdqkQ3TAYk',
    isFreePreview: true,
    passage: 'اهْدِنَا الصِّرَاطَ',
    title: {
      fr: 'Bien prononcer « Ihdinā ṣ-ṣirāṭ »',
      en: 'Pronouncing “Ihdinā ṣ-ṣirāṭ” correctly',
      ar: 'النطق الصحيح لـ«اهْدِنَا الصِّرَاطَ»',
    },
    description: {
      fr: 'Dans cette troisième vidéo, nous allons apprendre à réaliser correctement la liaison entre اهْدِنَا et الصِّرَاطَ, sans ajouter de voyelle inutile. Nous corrigerons également la prononciation de la lettre ط, qui doit conserver son caractère emphatique.',
      en: 'In this third video, we learn to link اهْدِنَا and الصِّرَاطَ correctly, without adding an unnecessary vowel. We also correct the pronunciation of the letter ط, which must keep its emphatic quality.',
      ar: 'في هذا الدرس الثالث نتعلّم الوصل الصحيح بين «اهْدِنَا» و«الصِّرَاطَ» دون زيادة حركة لا أصل لها، ونصحّح كذلك نطق حرف الطاء الذي يجب أن يحتفظ بتفخيمه.',
    },
    objective: {
      fr: 'Maîtriser la liaison entre les mots et distinguer correctement ت et ط.',
      en: 'Master the link between words and correctly distinguish ت from ط.',
      ar: 'إتقان الوصل بين الكلمات، والتمييز الصحيح بين التاء والطاء.',
    },
    keyPoints: [
      {
        fr: 'Lier اهْدِنَا et الصِّرَاطَ sans ajouter de voyelle inutile',
        en: 'Link اهْدِنَا and الصِّرَاطَ without adding an unnecessary vowel',
        ar: 'الوصل بين «اهْدِنَا» و«الصِّرَاطَ» دون زيادة حركة',
      },
      {
        fr: 'Garder au ط son caractère emphatique',
        en: 'Keep the emphatic quality of the ط',
        ar: 'المحافظة على تفخيم الطاء',
      },
      {
        fr: 'Distinguer clairement ت et ط',
        en: 'Clearly distinguish ت from ط',
        ar: 'التمييز الواضح بين التاء والطاء',
      },
    ],
    mistakes: [
      {
        passage: 'اهْدِنَا الصِّرَاطَ',
        title: {
          fr: 'Voyelle ajoutée dans la liaison',
          en: 'Vowel added in the link',
          ar: 'زيادة حركة عند الوصل',
        },
        mistake: {
          fr: 'Voyelle ou hamza ajoutée entre les deux mots (« ihdinā ʾaṣ-ṣirāṭ »), ou ā de نَا maintenu long.',
          en: 'A vowel or hamza added between the two words (“ihdinā ʾaṣ-ṣirāṭ”), or the ā of نَا kept long.',
          ar: 'زيادة حركة أو همزة بين الكلمتين، أو إبقاء مدّ «نَا» عند الوصل.',
        },
        correction: {
          fr: "Enchaîner « ihdina ṣ-ṣirāṭa » : la hamza de liaison tombe et le ā s'abrège devant la lettre redoublée.",
          en: 'Link them as “ihdina ṣ-ṣirāṭa”: the connecting hamza drops and the ā shortens before the doubled letter.',
          ar: 'صِل «اهْدِنَا» بـ«الصِّرَاطَ» فتسقط همزة الوصل ويسقط المدّ قبل الحرف المشدَّد.',
        },
        rule: {
          fr: 'Hamzat al-waṣl non prononcée en liaison ; lām shamsiyya assimilé au ص ; le madd tombe devant un sukūn.',
          en: 'Hamzat al-waṣl is not pronounced when linking; the lām shamsiyya merges into the ص; the madd drops before a sukūn.',
          ar: 'همزة الوصل تسقط في الدَّرْج، واللام الشمسية تُدغَم في الصاد، وحرف المدّ يسقط لفظًا إذا تلاه ساكن.',
        },
      },
      {
        passage: 'الصِّرَاطَ',
        title: {
          fr: 'Le ط prononcé comme un ت',
          en: 'The ط pronounced like a ت',
          ar: 'نطق الطاء تاءً',
        },
        mistake: {
          fr: 'Le ط prononcé comme un ت, fin et sans appui.',
          en: 'The ط pronounced like a ت, thin and without weight.',
          ar: 'نطق الطاء تاءً مرقّقة بلا اعتماد.',
        },
        correction: {
          fr: "Garder l'emphase : langue appuyée, fond de la langue relevé, son plein.",
          en: 'Keep the emphasis: tongue pressed, back of the tongue raised, full sound.',
          ar: 'حافظ على التفخيم: اعتماد اللسان مع استعلاء أقصاه وامتلاء الصوت.',
        },
        rule: {
          fr: 'ط : iṭbāq, istiʿlāʾ, tafkhīm ; ت : lettre fine et chuchotée.',
          en: 'ط: iṭbāq, istiʿlāʾ, tafkhīm; ت: a light, whispered letter.',
          ar: 'الطاء: إطباق واستعلاء وتفخيم؛ والتاء حرف مرقَّق مهموس.',
        },
      },
    ],
  },
  {
    id: 'fatiha-v04',
    slug: 'alladhina-et-maghdubi',
    durationSeconds: 547,
    youtubeId: 'lquZH_0Fsnk',
    isFreePreview: true,
    passage: 'الَّذِينَ — الْمَغْضُوبِ',
    title: {
      fr: 'Corriger « Alladhīna » et « Al-maghḍūbi »',
      en: 'Correcting “Alladhīna” and “Al-maghḍūbi”',
      ar: 'تصحيح «الَّذِينَ» و«الْمَغْضُوبِ»',
    },
    description: {
      fr: 'Cette quatrième vidéo permettra de corriger deux difficultés importantes : la prononciation du ذ en positionnant correctement la langue, et celle du mot الْمَغْضُوبِ, en respectant notamment les lettres غ et ض.',
      en: 'This fourth video corrects two important difficulties: pronouncing ذ with the tongue correctly positioned, and pronouncing الْمَغْضُوبِ, paying particular attention to the letters غ and ض.',
      ar: 'يصحّح هذا الدرس الرابع صعوبتين مهمّتين: نطق حرف الذال مع وضع اللسان في موضعه الصحيح، ونطق «الْمَغْضُوبِ» مع مراعاة حرفي الغين والضاد خاصّة.',
    },
    objective: {
      fr: 'Apprendre à articuler correctement des lettres souvent confondues.',
      en: 'Learn to articulate correctly letters that are often confused.',
      ar: 'تعلّم النطق الصحيح لحروف يكثر الخلط بينها.',
    },
    keyPoints: [
      {
        fr: 'Prononcer le ذ de الَّذِينَ en plaçant correctement la langue',
        en: 'Pronounce the ذ of الَّذِينَ with the tongue correctly placed',
        ar: 'نطق الذال في «الَّذِينَ» مع وضع اللسان في موضعه الصحيح',
      },
      {
        fr: 'Respecter les lettres غ et ض dans الْمَغْضُوبِ',
        en: 'Respect the letters غ and ض in الْمَغْضُوبِ',
        ar: 'مراعاة حرفي الغين والضاد في «الْمَغْضُوبِ»',
      },
    ],
    mistakes: [
      {
        passage: 'الَّذِينَ',
        title: {
          fr: 'Le ذ confondu avec ز ou د',
          en: 'The ذ confused with ز or د',
          ar: 'إبدال الذال زايًا أو دالًا',
        },
        mistake: {
          fr: 'Le ذ prononcé comme un ز ou un د.',
          en: 'The ذ pronounced like a ز or a د.',
          ar: 'نطق الذال زايًا أو دالًا.',
        },
        correction: {
          fr: 'Placer la pointe de la langue contre le bord des incisives supérieures, légèrement visible.',
          en: 'Place the tip of the tongue against the edge of the upper incisors, slightly visible.',
          ar: 'ضع طرف اللسان على أطراف الثنايا العليا مع ظهوره قليلًا.',
        },
        rule: {
          fr: 'Makhraj : bout de la langue et bord des incisives supérieures (lettre interdentale), voisée.',
          en: 'Makhraj: tip of the tongue and edge of the upper incisors (interdental letter), voiced.',
          ar: 'المخرج: طرف اللسان مع أطراف الثنايا العليا، وهو حرف مجهور.',
        },
      },
      {
        passage: 'الْمَغْضُوبِ',
        title: {
          fr: 'Le غ et le ض de الْمَغْضُوبِ',
          en: 'The غ and ض of الْمَغْضُوبِ',
          ar: 'الغين والضاد في «الْمَغْضُوبِ»',
        },
        mistake: {
          fr: 'Le غ affaibli ou confondu avec ق ou ر ; le ض prononcé comme un د emphatique, ou comme ظ ou ز.',
          en: 'The غ weakened or confused with ق or ر; the ض pronounced like an emphatic د, or like ظ or ز.',
          ar: 'إضعاف الغين أو إبدالها قافًا أو راءً، ونطق الضاد دالًا مفخّمة أو ظاءً أو زايًا.',
        },
        correction: {
          fr: 'غ : haut de la gorge, voisé et plein. ض : bord de la langue contre les molaires supérieures, avec emphase et extension.',
          en: 'غ: upper throat, voiced and full. ض: side of the tongue against the upper molars, with emphasis and extension.',
          ar: 'الغين: من أدنى الحلق مجهورة ممتلئة. الضاد: من حافة اللسان مع الأضراس العليا، بتفخيم واستطالة.',
        },
        rule: {
          fr: 'غ : adnā al-ḥalq, istiʿlāʾ. ض : makhraj latéral, iṭbāq, istiṭāla.',
          en: 'غ: adnā al-ḥalq, istiʿlāʾ. ض: lateral makhraj, iṭbāq, istiṭāla.',
          ar: 'الغين: أدنى الحلق مع الاستعلاء. الضاد: مخرج حافة اللسان، مع الإطباق والاستطالة.',
        },
      },
    ],
  },
  {
    id: 'fatiha-v05',
    slug: 'wa-la-d-dallin',
    durationSeconds: 617,
    youtubeId: 'zTHNmEi30Ys',
    isFreePreview: true,
    passage: 'وَلَا الضَّالِّينَ',
    title: {
      fr: "Maîtriser la fin d'Al-Fâtiḥah",
      en: 'Mastering the end of Al-Fâtiḥah',
      ar: 'إتقان خاتمة سورة الفاتحة',
    },
    description: {
      fr: "Dans cette dernière vidéo, nous allons corriger deux erreurs fréquentes dans la prononciation de الضَّالِّينَ. Nous travaillerons l'articulation de la lettre ض, son redoublement, l'allongement nécessaire et la shadda sur la lettre لّ.",
      en: 'In this final video, we correct two common mistakes in the pronunciation of الضَّالِّينَ. We work on the articulation of the letter ض, its doubling, the required prolongation and the shadda on the letter لّ.',
      ar: 'في هذا الدرس الأخير نصحّح خطأين شائعين في نطق «الضَّالِّينَ»: نتدرّب على مخرج الضاد وتشديدها، والمدّ اللازم، والشدّة على اللام.',
    },
    objective: {
      fr: "Terminer la récitation d'Al-Fâtiḥah en respectant les lettres et les règles de prononciation.",
      en: 'Complete the recitation of Al-Fâtiḥah while respecting its letters and pronunciation rules.',
      ar: 'إتمام تلاوة سورة الفاتحة مع مراعاة الحروف وأحكام النطق.',
    },
    keyPoints: [
      {
        fr: 'Articuler la lettre ض et respecter son redoublement',
        en: 'Articulate the letter ض and respect its doubling',
        ar: 'نطق حرف الضاد ومراعاة تشديده',
      },
      {
        fr: "Tenir l'allongement nécessaire dans الضَّالِّينَ",
        en: 'Hold the required prolongation in الضَّالِّينَ',
        ar: 'إعطاء المدّ حقّه في «الضَّالِّينَ»',
      },
      {
        fr: 'Respecter la shadda sur le لّ',
        en: 'Respect the shadda on the لّ',
        ar: 'مراعاة الشدّة على اللام',
      },
    ],
    mistakes: [
      {
        passage: 'الضَّالِّينَ',
        title: {
          fr: 'Le ض : redoublement et allongement',
          en: 'The ض: doubling and prolongation',
          ar: 'الضاد: التشديد والمدّ',
        },
        mistake: {
          fr: 'Le ض mal articulé (comme un د emphatique ou un ظ), non redoublé, allongement trop court.',
          en: 'The ض poorly articulated (like an emphatic د or a ظ), not doubled, prolongation too short.',
          ar: 'نطق الضاد دالًا مفخّمة أو ظاءً، وترك تشديدها، وقصر المدّ.',
        },
        correction: {
          fr: "Redoubler le ض, garder l'emphase et tenir l'allongement six temps.",
          en: 'Double the ض, keep the emphasis and hold the prolongation for six counts.',
          ar: 'شدِّد الضاد مع التفخيم، وامدد ستّ حركات.',
        },
        rule: {
          fr: 'Lām shamsiyya assimilé au ض ; madd lāzim kalimī muthaqqal (6 ḥarakāt).',
          en: 'The lām shamsiyya merges into the ض; madd lāzim kalimī muthaqqal (6 ḥarakāt).',
          ar: 'اللام الشمسية تُدغَم في الضاد، والمدّ لازم كلميّ مثقَّل (ستّ حركات).',
        },
      },
      {
        passage: 'الضَّالِّينَ',
        title: {
          fr: 'La shadda du لّ oubliée',
          en: 'Missing shadda on the لّ',
          ar: 'ترك تشديد اللام',
        },
        mistake: {
          fr: 'Shadda oubliée sur le لّ (« aḍ-ḍālīn »).',
          en: 'Shadda omitted on the لّ (“aḍ-ḍālīn”).',
          ar: 'ترك الشدّة على اللام («الضَّالِين»).',
        },
        correction: {
          fr: "Appuyer le لّ avant l'allongement final.",
          en: 'Stress the لّ before the final prolongation.',
          ar: 'شدِّد اللام قبل المدّ الأخير.',
        },
        rule: {
          fr: "La shadda indique une lettre redoublée ; à l'arrêt, madd ʿāriḍ li-s-sukūn sur لِي.",
          en: 'The shadda marks a doubled letter; when stopping, madd ʿāriḍ li-s-sukūn on لِي.',
          ar: 'الشدّة تدلّ على حرف مضعَّف، وعند الوقف مدّ عارض للسكون على «لِي».',
        },
      },
    ],
  },
];
