// Данные арабского алфавита (28 букв) по методике Му'аллим Сани
export const ALPHABET_DATA = [
  {
    id: 1,
    arabic: 'ا',
    name: 'Алиф',
    arabicName: 'أَلِف',
    transcription: 'а / -',
    makhraj: 'Пустота рта и гортани (джауф)',
    category: 'гласные / продление',
    soundType: 'мягкая',
    connectsLeft: false,
    forms: {
      isolated: 'ا',
      initial: 'ا',
      medial: 'ـا',
      final: 'ـا'
    },
    description: 'Служит подставкой для хамзы или для удлинения краткой гласной фатха (а). Не соединяется со следующей буквой влево.',
    examples: ['أَبٌ', 'أَمَرَ', 'بَابٌ']
  },
  {
    id: 2,
    arabic: 'ب',
    name: 'Ба',
    arabicName: 'بَاء',
    transcription: 'б',
    makhraj: 'Сомкнутые губы',
    category: 'губные',
    soundType: 'мягкая',
    connectsLeft: true,
    forms: {
      isolated: 'ب',
      initial: 'بـ',
      medial: 'ـبـ',
      final: 'ـب'
    },
    description: 'Произносится при плотном смыкании губ, как русский звук [б]. При сукуне имеет свойство калькаля (сотрясение).',
    examples: ['بَيْتٌ', 'كِتَابٌ', 'أَبْ']
  },
  {
    id: 3,
    arabic: 'ت',
    name: 'Та',
    arabicName: 'تَاء',
    transcription: 'т',
    makhraj: 'Кончик языка у основания верхних резцов',
    category: 'языковые',
    soundType: 'мягкая',
    connectsLeft: true,
    forms: {
      isolated: 'ت',
      initial: 'تـ',
      medial: 'ـتـ',
      final: 'ـت'
    },
    description: 'Мягкий глухой звук [т], произносится с легким выдохом (хамс). Имеет две точки сверху.',
    examples: ['تَمْرٌ', 'كَتَبَ', 'بِنْتٌ']
  },
  {
    id: 4,
    arabic: 'ث',
    name: 'Са',
    arabicName: 'ثَاء',
    transcription: 'с̱ (межзубный)',
    makhraj: 'Кончик языка между верхними и нижними резцами',
    category: 'межзубные',
    soundType: 'мягкая',
    connectsLeft: true,
    forms: {
      isolated: 'ث',
      initial: 'ثـ',
      medial: 'ـثـ',
      final: 'ـث'
    },
    description: 'Межзубный глухой звук, аналогичен английскому "th" в слове "think". Имеет три точки сверху.',
    examples: ['ثَوْبٌ', 'مَثَلٌ', 'بَحَثَ']
  },
  {
    id: 5,
    arabic: 'ج',
    name: 'Джим',
    arabicName: 'جِيم',
    transcription: 'дж',
    makhraj: 'Середина языка прижата к нёбу',
    category: 'языковые',
    soundType: 'мягкая',
    connectsLeft: true,
    forms: {
      isolated: 'ج',
      initial: 'جـ',
      medial: 'ـجـ',
      final: 'ـج'
    },
    description: 'Слитный мягкий звук [дж]. При сукуне обладает свойством калькаля.',
    examples: ['جَمَلٌ', 'مَسْجِدٌ', 'حَجَّ']
  },
  {
    id: 6,
    arabic: 'ح',
    name: 'Ха (гортанная)',
    arabicName: 'حَاء',
    transcription: 'х̣ (глубокая)',
    makhraj: 'Средняя часть гортани',
    category: 'гортанные',
    soundType: 'мягкая',
    connectsLeft: true,
    forms: {
      isolated: 'ح',
      initial: 'حـ',
      medial: 'ـحـ',
      final: 'ـح'
    },
    description: 'Мягкий гортанный выдыхательный звук [х], похожий на дыхание на холодное стекло чтобы согреть его.',
    examples: ['حَمْدٌ', 'سَحَرٌ', 'فَرِحَ']
  },
  {
    id: 7,
    arabic: 'خ',
    name: 'Ха (твёрдая)',
    arabicName: 'خَاء',
    transcription: 'х̮ (хриплая)',
    makhraj: 'Верхняя часть гортани',
    category: 'гортанные',
    soundType: 'твёрдая',
    connectsLeft: true,
    forms: {
      isolated: 'خ',
      initial: 'خـ',
      medial: 'ـخـ',
      final: 'ـخ'
    },
    description: 'Твёрдый хриплый звук [х], как в русском слове "хорошо", но глубже в горле.',
    examples: ['خَيْرٌ', 'مَخْرَجٌ', 'طَبَخَ']
  },
  {
    id: 8,
    arabic: 'د',
    name: 'Даль',
    arabicName: 'دَال',
    transcription: 'д',
    makhraj: 'Кончик языка у корней верхних резцов',
    category: 'языковые',
    soundType: 'мягкая',
    connectsLeft: false,
    forms: {
      isolated: 'د',
      initial: 'د',
      medial: 'ـد',
      final: 'ـد'
    },
    description: 'Звонкий мягкий звук [д]. Не соединяется влево. При сукуне — свойство калькаля.',
    examples: ['دَرْسٌ', 'مَدْرَسَةٌ', 'بَلَدٌ']
  },
  {
    id: 9,
    arabic: 'ذ',
    name: 'Заль',
    arabicName: 'ذَال',
    transcription: 'з̱ (межзубный)',
    makhraj: 'Кончик языка между передними зубами',
    category: 'межзубные',
    soundType: 'мягкая',
    connectsLeft: false,
    forms: {
      isolated: 'ذ',
      initial: 'ذ',
      medial: 'ـذ',
      final: 'ـذ'
    },
    description: 'Звонкий межзубный звук, похож на английское "th" в слове "this" или "father". Не соединяется влево.',
    examples: ['ذَهَبٌ', 'إِذَا', 'أَخَذَ']
  },
  {
    id: 10,
    arabic: 'ر',
    name: 'Ра',
    arabicName: 'رَاء',
    transcription: 'р',
    makhraj: 'Кончик языка и передняя часть нёба',
    category: 'языковые',
    soundType: 'твёрдая / мягкая',
    connectsLeft: false,
    forms: {
      isolated: 'ر',
      initial: 'ر',
      medial: 'ـر',
      final: 'ـر'
    },
    description: 'Звук [р]. Читается твёрдо с фатхой и даммой, и мягко с кясрой. Не соединяется влево.',
    examples: ['رَحْمَةٌ', 'مَرْيَمُ', 'نُورٌ']
  },
  {
    id: 11,
    arabic: 'ز',
    name: 'Зай',
    arabicName: 'زَاي',
    transcription: 'з',
    makhraj: 'Кончик языка чуть выше нижних резцов',
    category: 'зубные',
    soundType: 'мягкая',
    connectsLeft: false,
    forms: {
      isolated: 'ز',
      initial: 'ز',
      medial: 'ـز',
      final: 'ـز'
    },
    description: 'Звонкий свистящий мягкий звук [з], как в русском слове "зима". Не соединяется влево.',
    examples: ['زَيْتُونٌ', 'مِيزَانٌ', 'عَزِيزٌ']
  },
  {
    id: 12,
    arabic: 'س',
    name: 'Син',
    arabicName: 'سِين',
    transcription: 'с',
    makhraj: 'Кончик языка у нижних резцов',
    category: 'зубные',
    soundType: 'мягкая',
    connectsLeft: true,
    forms: {
      isolated: 'س',
      initial: 'سـ',
      medial: 'ـسـ',
      final: 'ـس'
    },
    description: 'Свистящий глухой мягкий звук [с], как в слове "свет". Имеет 3 зубчика.',
    examples: ['سَلَامٌ', 'مَسْجِدٌ', 'شَمْسٌ']
  },
  {
    id: 13,
    arabic: 'ش',
    name: 'Шин',
    arabicName: 'شِين',
    transcription: 'ш',
    makhraj: 'Середина языка напротив нёба',
    category: 'языковые',
    soundType: 'мягкая',
    connectsLeft: true,
    forms: {
      isolated: 'ش',
      initial: 'شـ',
      medial: 'ـشـ',
      final: 'ـش'
    },
    description: 'Мягкий шипящий звук [ш] (ближе к русскому [щ] или мягкому [ш]). Имеет 3 точки сверху.',
    examples: ['شَمْسٌ', 'مَشْرِقٌ', 'عَرْشٌ']
  },
  {
    id: 14,
    arabic: 'ص',
    name: 'Сад',
    arabicName: 'صَاد',
    transcription: 'с̣ (твёрдый)',
    makhraj: 'Кончик языка у нижних резцов с подъёмом задней части языка',
    category: 'эмфатические',
    soundType: 'твёрдая',
    connectsLeft: true,
    forms: {
      isolated: 'ص',
      initial: 'صـ',
      medial: 'ـصـ',
      final: 'ـص'
    },
    description: 'Эмфатический, глубокий и твёрдый звук [с]. При его произношении задняя спинка языка приподнимается к нёбу.',
    examples: ['صَبْرٌ', 'بَصَرٌ', 'قَفَصٌ']
  },
  {
    id: 15,
    arabic: 'ض',
    name: 'Дод',
    arabicName: 'ضَاد',
    transcription: 'д̣ (твёрдый)',
    makhraj: 'Боковой край языка прижимается к верхним коренным зубам',
    category: 'эмфатические',
    soundType: 'твёрдая',
    connectsLeft: true,
    forms: {
      isolated: 'ض',
      initial: 'ضـ',
      medial: 'ـضـ',
      final: 'ـض'
    },
    description: 'Уникальный арабский звук (язык называется "языком Дад"). Очень глубокий и твёрдый звук [д].',
    examples: ['ضَوْءٌ', 'رَمَضَانُ', 'أَرْضٌ']
  },
  {
    id: 16,
    arabic: 'ط',
    name: 'Та (твёрдая)',
    arabicName: 'طَاء',
    transcription: 'т̣ (твёрдый)',
    makhraj: 'Кончик языка у корней верхних резцов с подъёмом спинки',
    category: 'эмфатические',
    soundType: 'твёрдая',
    connectsLeft: true,
    forms: {
      isolated: 'ط',
      initial: 'طـ',
      medial: 'ـطـ',
      final: 'ـط'
    },
    description: 'Твёрдый глухой звук [т]. При сукуне обладает очень ярким свойством калькаля.',
    examples: ['طَلَبٌ', 'مَطَرٌ', 'صِرَاطٌ']
  },
  {
    id: 17,
    arabic: 'ظ',
    name: 'За (твёрдая)',
    arabicName: 'ظَاء',
    transcription: 'з̣ (твёрдый межзубный)',
    makhraj: 'Кончик языка между резцами с подъёмом задней части',
    category: 'эмфатические',
    soundType: 'твёрдая',
    connectsLeft: true,
    forms: {
      isolated: 'ظ',
      initial: 'ظـ',
      medial: 'ـظـ',
      final: 'ـظ'
    },
    description: 'Твёрдый звонкий межзубный звук. Твёрдый аналог буквы ذ (заль).',
    examples: ['ظُلْمٌ', 'مَظْلُومٌ', 'حِفْظٌ']
  },
  {
    id: 18,
    arabic: 'ع',
    name: '\'Айн',
    arabicName: 'عَيْن',
    transcription: '\' (гортанный)',
    makhraj: 'Средняя часть гортани со сжатием мышц',
    category: 'гортанные',
    soundType: 'мягкая',
    connectsLeft: true,
    forms: {
      isolated: 'ع',
      initial: 'عـ',
      medial: 'ـعـ',
      final: 'ـع'
    },
    description: 'Чисто гортанный сжатый звук, не имеющий аналога в европейских языках. Образуется мышечным сжатием глотки.',
    examples: ['عِلْمٌ', 'مَعْرُوفٌ', 'سَمِيعٌ']
  },
  {
    id: 19,
    arabic: 'غ',
    name: 'Гайн',
    arabicName: 'غَيْن',
    transcription: 'г (гортанный)',
    makhraj: 'Верхняя часть гортани',
    category: 'гортанные',
    soundType: 'твёрдая',
    connectsLeft: true,
    forms: {
      isolated: 'غ',
      initial: 'غـ',
      medial: 'ـغـ',
      final: 'ـغ'
    },
    description: 'Звонкий звук [г], похожий на французское картавое "r" или южнорусское [г].',
    examples: ['غَيْبٌ', 'مَغْرِبٌ', 'بَلَغَ']
  },
  {
    id: 20,
    arabic: 'ف',
    name: 'Фа',
    arabicName: 'فَاء',
    transcription: 'ф',
    makhraj: 'Кончики верхних резцов на внутренней части нижней губы',
    category: 'губные',
    soundType: 'мягкая',
    connectsLeft: true,
    forms: {
      isolated: 'ف',
      initial: 'فـ',
      medial: 'ـفـ',
      final: 'ـف'
    },
    description: 'Мягкий глухой звук [ф], произносится как русский звук [ф]. Имеет одну точку сверху.',
    examples: ['فَتْحٌ', 'مَفْتُوحٌ', 'كَهْفٌ']
  },
  {
    id: 21,
    arabic: 'ق',
    name: 'Каф (глубокая)',
    arabicName: 'قَاف',
    transcription: 'к̣ (глубокий)',
    makhraj: 'Самый корень языка у мягкого нёба (язычок)',
    category: 'языковые',
    soundType: 'твёрдая',
    connectsLeft: true,
    forms: {
      isolated: 'ق',
      initial: 'قـ',
      medial: 'ـقـ',
      final: 'ـق'
    },
    description: 'Глубокий твёрдый гортанный звук [к]. При сукуне дает четкое сотрясение (калькаля).',
    examples: ['قَلْبٌ', 'مَقَامٌ', 'فَلَقٌ']
  },
  {
    id: 22,
    arabic: 'ك',
    name: 'Кяф',
    arabicName: 'كَاف',
    transcription: 'к (мягкий)',
    makhraj: 'Задняя часть языка чуть ближе к передней части чем ق',
    category: 'языковые',
    soundType: 'мягкая',
    connectsLeft: true,
    forms: {
      isolated: 'ك',
      initial: 'كـ',
      medial: 'ـكـ',
      final: 'ـك'
    },
    description: 'Мягкий обычный звук [к], как в русском слове "кисть". Внутри изолированной формы пишется значок шакли.',
    examples: ['كِتَابٌ', 'مَكْتَبٌ', 'مَلِكٌ']
  },
  {
    id: 23,
    arabic: 'ل',
    name: 'Лям',
    arabicName: 'لَام',
    transcription: 'л',
    makhraj: 'Передний край языка у верхнего нёба',
    category: 'языковые',
    soundType: 'мягкая (кроме слова Аллах)',
    connectsLeft: true,
    forms: {
      isolated: 'ل',
      initial: 'لـ',
      medial: 'ـلـ',
      final: 'ـل'
    },
    description: 'Мягкий звук [л], как в слове "лето". Твердым бывает только в имени Аллаха (после фатхи/даммы).',
    examples: ['لَيْلٌ', 'عِلْمٌ', 'عَمَلٌ']
  },
  {
    id: 24,
    arabic: 'م',
    name: 'Мим',
    arabicName: 'مِيم',
    transcription: 'м',
    makhraj: 'Смыкание губ с выходом воздуха через нос (гунна)',
    category: 'губные',
    soundType: 'мягкая',
    connectsLeft: true,
    forms: {
      isolated: 'م',
      initial: 'مـ',
      medial: 'ـمـ',
      final: 'ـم'
    },
    description: 'Носовой мягкий звук [м]. При ташдиде или сукуне перед определенными буквами образует назализацию (гунну).',
    examples: ['مَاءٌ', 'شَمْسٌ', 'قَلَمٌ']
  },
  {
    id: 25,
    arabic: 'ن',
    name: 'Нун',
    arabicName: 'نُون',
    transcription: 'н',
    makhraj: 'Кончик языка у десен верхних резцов с выходом через нос',
    category: 'языковые',
    soundType: 'мягкая',
    connectsLeft: true,
    forms: {
      isolated: 'ن',
      initial: 'نـ',
      medial: 'ـنـ',
      final: 'ـن'
    },
    description: 'Носовой звук [н]. Центральная буква правил таджвида (правила нуна с сукуном и танвина).',
    examples: ['نُورٌ', 'جَنَّةٌ', 'مُؤْمِنٌ']
  },
  {
    id: 26,
    arabic: 'هـ',
    name: 'Ха (лёгкая)',
    arabicName: 'هَاء',
    transcription: 'һ (выдох)',
    makhraj: 'Нижняя часть гортани (связки)',
    category: 'гортанные',
    soundType: 'мягкая',
    connectsLeft: true,
    forms: {
      isolated: 'ه',
      initial: 'هـ',
      medial: 'ـهـ',
      final: 'ـه'
    },
    description: 'Лёгкий воздушный выдох, как английский звук "h" в слове "home" или татарский "һ".',
    examples: ['هُدًى', 'شَهْرٌ', 'وَجْهٌ']
  },
  {
    id: 27,
    arabic: 'و',
    name: 'Вав',
    arabicName: 'وَاو',
    transcription: 'в (губно-губной) / у',
    makhraj: 'Округление губ без соприкосновения с зубами',
    category: 'губные',
    soundType: 'мягкая',
    connectsLeft: false,
    forms: {
      isolated: 'و',
      initial: 'و',
      medial: 'ـو',
      final: 'ـو'
    },
    description: 'Губной звук, как английское [w]. Также служит для долгого гласного звука [у:]. Не соединяется влево.',
    examples: ['وَلَدٌ', 'نُورٌ', 'دَلْوٌ']
  },
  {
    id: 28,
    arabic: 'ي',
    name: 'Йа',
    arabicName: 'يَاء',
    transcription: 'й / и',
    makhraj: 'Середина языка у твердого нёба',
    category: 'языковые',
    soundType: 'мягкая',
    connectsLeft: true,
    forms: {
      isolated: 'ي',
      initial: 'يـ',
      medial: 'ـيـ',
      final: 'ـي'
    },
    description: 'Согласный звук [й] или долгий гласный [и:]. В начальной и срединной позиции имеет две точки снизу.',
    examples: ['يَوْمٌ', 'إِيمَانٌ', 'أَخِي']
  }
];

export const SPECIAL_LETTERS = [
  {
    id: 29,
    arabic: 'لا',
    name: 'Лям-Алиф',
    arabicName: 'لَام أَلِف',
    transcription: 'ля̄',
    description: 'Лигатура буквы Лям и Алифа (ل + ا). Применяется везде, где алиф следует за буквой лям.',
    forms: {
      isolated: 'لا',
      initial: 'لا',
      medial: 'ـلا',
      final: 'ـلا'
    }
  },
  {
    id: 30,
    arabic: 'ة',
    name: 'Та-Марбута',
    arabicName: 'تَاء مَرْبُوطَة',
    transcription: 'т / һ',
    description: 'Связанная буква Та. Указывает на женский род. При остановке произносится как легкая "һ", при связном чтении — как обычная "т".',
    forms: {
      isolated: 'ة',
      initial: '-',
      medial: '-',
      final: 'ـة'
    }
  },
  {
    id: 31,
    arabic: 'ء',
    name: 'Хамза',
    arabicName: 'هَمْزَة',
    transcription: 'ˀ (гортанная смычка)',
    description: 'Знак гортанной смычки. Может писаться самостоятельно (ء) или на подставках: أ، إ، ؤ، ئ.',
    forms: {
      isolated: 'ء',
      initial: 'أ / إ',
      medial: 'ـؤ / ـئـ',
      final: 'ـأ / ـئ'
    }
  }
];

// Семейства (группы) букв по схожести начертания остова (основы)
export const LETTER_FAMILIES = [
  {
    id: 'alif',
    name: 'Одиночный Алиф',
    arabicShape: 'ا',
    badge: 'Вертикаль',
    colorClass: 'emerald',
    description: 'Прямая вертикальная палочка без точек. Не соединяется влево.',
    letterSymbols: ['ا']
  },
  {
    id: 'ba-ta-tha',
    name: 'Семейство «Лодочки» (Ба, Та, Са)',
    arabicShape: 'بـ تـ ثـ',
    badge: 'Лодочка',
    colorClass: 'teal',
    description: 'Одинаковая основа-лодочка на строке. Различаются только количеством и положением точек: Ба (1 снизу), Та (2 сверху), Са (3 сверху).',
    letterSymbols: ['ب', 'ت', 'ث']
  },
  {
    id: 'jim-ha-kha',
    name: 'Семейство «Клювики» (Джим, Ха, Ха)',
    arabicShape: 'جـ حـ خـ',
    badge: 'Клювик / Петля',
    colorClass: 'cyan',
    description: 'Волнообразная горизонтальная головка. Джим (точка снизу), Ха гортанная (без точек), Ха хриплая (точка сверху).',
    letterSymbols: ['ج', 'ح', 'خ']
  },
  {
    id: 'dal-dhal',
    name: 'Семейство «Уголки» (Даль, Заль)',
    arabicShape: 'د ذ',
    badge: 'Не соед. влево',
    colorClass: 'amber',
    description: 'Компактный уголок на строке. Не соединяются со следующей буквой влево. Даль (без точек), Заль (1 точка сверху).',
    letterSymbols: ['د', 'ذ']
  },
  {
    id: 'ra-zay',
    name: 'Семейство «Серпики» (Ра, Зай)',
    arabicShape: 'ر ز',
    badge: 'Не соед. влево',
    colorClass: 'orange',
    description: 'Плавный серповидный изгиб, уходящий под строку. Не соединяются влево. Ра (без точек), Зай (1 точка сверху).',
    letterSymbols: ['ر', 'ز']
  },
  {
    id: 'sin-shin',
    name: 'Семейство «Зубчики» (Син, Шин)',
    arabicShape: 'سـ شـ',
    badge: '3 зубчика',
    colorClass: 'indigo',
    description: 'Три небольших зубчика на строке. Син (без точек, свистящий [с]), Шин (3 точки сверху треугольником, шипящий [ш]).',
    letterSymbols: ['س', 'ش']
  },
  {
    id: 'sad-dad',
    name: 'Семейство «Петля с зубом» (Сад, Дод)',
    arabicShape: 'صـ ضـ',
    badge: 'Твёрдые (эмфат.)',
    colorClass: 'purple',
    description: 'Овальная лежащая петля с обязательным маленьким зубчиком после неё. Твёрдые звуки. Сад (без точек), Дод (1 точка сверху).',
    letterSymbols: ['ص', 'ض']
  },
  {
    id: 'ta-za',
    name: 'Семейство «Петля с мачтой» (Та, За твёрдые)',
    arabicShape: 'طـ ظـ',
    badge: 'С мачтой',
    colorClass: 'rose',
    description: 'Овальная петля с высокой вертикальной палочкой (мачтой). Не имеют зубчика! Та (без точек), За (1 точка сверху).',
    letterSymbols: ['ط', 'ظ']
  },
  {
    id: 'ayn-ghayn',
    name: 'Семейство «Полукруги» (Айн, Гайн)',
    arabicShape: 'عـ غـ',
    badge: 'Гортанные',
    colorClass: 'emerald',
    description: 'В начале — открытый полукруг, в середине и конце — закрытый треугольничек. Айн (без точек), Гайн (1 точка сверху).',
    letterSymbols: ['ع', 'غ']
  },
  {
    id: 'fa-qaf',
    name: 'Семейство «Круглая голова» (Фа, Каф)',
    arabicShape: 'فـ قـ',
    badge: 'Круглая петля',
    colorClass: 'sky',
    description: 'Круглая головка с шейкой. Фа (на строке, 1 точка), Каф (глубокая чаша под строку, 2 точки сверху).',
    letterSymbols: ['ف', 'ق']
  },
  {
    id: 'singles',
    name: 'Одиночные буквы со своей формой',
    arabicShape: 'ك ل م ن هـ و ي',
    badge: 'Индивидуальные',
    colorClass: 'slate',
    description: 'Каждая из этих букв имеет уникальный узнаваемый остов: Кяф (наклонная), Лям (высокая мачта), Мим (петелька вниз), Нун (чаша с точкой), Ха (бантик), Вав (головка с хвостом), Йа (уточка).',
    letterSymbols: ['ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي']
  },
  {
    id: 'special',
    name: 'Особые знаки и лигатуры',
    arabicShape: 'لا ة ء',
    badge: 'Особые знаки',
    colorClass: 'amber',
    description: 'Лям-Алиф (слияние букв ل и ا), Та-марбута (знак женского рода) и Хамза (знак гортанной смычки).',
    letterSymbols: ['لا', 'ة', 'ء'],
    isSpecial: true
  }
];

// Английская транслитерация названий букв (согласно международным стандартам)
export const LETTER_ENGLISH_NAMES = {
  'ا': 'Alif',
  'ب': 'Ba',
  'ت': 'Ta',
  'ث': 'Tha',
  'ج': 'Jeem',
  'ح': 'Ha (guttural)',
  'خ': 'Kha',
  'د': 'Dal',
  'ذ': 'Dhal',
  'ر': 'Ra',
  'ز': 'Zay',
  'س': 'Seen',
  'ش': 'Sheen',
  'ص': 'Saad',
  'ض': 'Daad',
  'ط': 'Taa (heavy)',
  'ظ': 'Dha (heavy)',
  'ع': 'Ain',
  'غ': 'Ghain',
  'ف': 'Fa',
  'ق': 'Qaaf',
  'ك': 'Kaaf',
  'ل': 'Laam',
  'م': 'Meem',
  'ن': 'Noon',
  'هـ': 'Haa (soft)',
  'ه': 'Haa (soft)',
  'و': 'Waw',
  'ي': 'Yaa',
  'ء': 'Hamza',
  'لا': 'Lam-Alif',
  'ة': 'Ta-Marbuta'
};

// 10 групп букв арабского алфавита (по эталону islam-learn.com/en/qaida/arabic-letters)
export const ALPHABET_GROUPS_10 = [
  {
    id: 1,
    number: 'Group 1',
    title: 'Группа 1',
    subtitle: 'Алиф и семейство «Лодочки» (ا، ب، ت، ث)',
    description: 'Одиночный Алиф и три буквы с одинаковым остовом-лодочкой, различающиеся только точками: Ба (1 снизу), Та (2 сверху), Са (3 сверху).',
    letterSymbols: ['ا', 'ب', 'ت', 'ث'],
    accentColor: 'purple'
  },
  {
    id: 2,
    number: 'Group 2',
    title: 'Группа 2',
    subtitle: 'Семейство «Клювики» (ج، ح، خ)',
    description: 'Три буквы с одинаковым волнообразным остовом. Джим (точка снизу), Ха гортанная (без точек), Ха хриплая (точка сверху).',
    letterSymbols: ['ج', 'ح', 'خ'],
    accentColor: 'amber'
  },
  {
    id: 3,
    number: 'Group 3',
    title: 'Группа 3',
    subtitle: 'Несоединяемые пары: Уголки и Серпики (د، ذ، ر، ز)',
    description: 'Четыре буквы, которые никогда не соединяются влево! Даль и Заль сидят на строке; Ра и Зай уходят серпом под строку.',
    letterSymbols: ['د', 'ذ', 'ر', 'ز'],
    accentColor: 'amber'
  },
  {
    id: 4,
    number: 'Group 4',
    title: 'Группа 4',
    subtitle: 'Семейство «Зубчики» (س، ش)',
    description: 'Буквы с тремя характерными зубчиками на строке. Син (чистый свистящий звук [с]) и Шин (3 точки сверху, мягкий звук [ш]).',
    letterSymbols: ['س', 'ش'],
    accentColor: 'emerald'
  },
  {
    id: 5,
    number: 'Group 5',
    title: 'Группа 5',
    subtitle: 'Семейство «Петля с зубом» (ص، ض)',
    description: 'Твёрдые эмфатические буквы с овальной лежащей петлёй и обязательным зубчиком. Сад (без точек) и Дод (1 точка сверху).',
    letterSymbols: ['ص', 'ض'],
    accentColor: 'rose'
  },
  {
    id: 6,
    number: 'Group 6',
    title: 'Группа 6',
    subtitle: 'Семейство «Петля с мачтой» (ط، ظ)',
    description: 'Твёрдые буквы с овальной петлей и высокой вертикальной палочкой (мачтой). Не имеют зубчика! Та (без точек) и За (1 точка сверху).',
    letterSymbols: ['ط', 'ظ'],
    accentColor: 'rose'
  },
  {
    id: 7,
    number: 'Group 7',
    title: 'Группа 7',
    subtitle: 'Семейство «Полукруги» (ع، غ)',
    description: 'Гортанные буквы. В начале пишутся как открытый полукруг, в середине и конце — закрытый залитый треугольник. Айн (без точек) и Гайн (1 точка сверху).',
    letterSymbols: ['ع', 'غ'],
    accentColor: 'sky'
  },
  {
    id: 8,
    number: 'Group 8',
    title: 'Группа 8',
    subtitle: 'Семейство «Круглая голова» (ف، ق)',
    description: 'Буквы с круглой головкой. Фа сидит плоско на строке с 1 точкой, а глубокий твёрдый Каф опускается чашей под строку с 2 точками.',
    letterSymbols: ['ف', 'ق'],
    accentColor: 'emerald'
  },
  {
    id: 9,
    number: 'Group 9',
    title: 'Группа 9',
    subtitle: 'Индивидуальные остовы (ك، ل، م، ن)',
    description: 'Буквы со своей уникальной формой: Кяф (наклонная палочка), Лям (высокая мачта), Мим (петелька вниз) и Нун (чаша с точкой внутри).',
    letterSymbols: ['ك', 'ل', 'م', 'н'],
    accentColor: 'teal'
  },
  {
    id: 10,
    number: 'Group 10',
    title: 'Группа 10',
    subtitle: 'Заключительные буквы и Хамза (هـ، و، ي، ء، لا)',
    description: 'Завершение алфавита: лёгкая выдыхательная Ха, губной Вав (не соед. влево), согласный/гласный Йа, гортанная Хамза и лигатура Лям-Алиф.',
    letterSymbols: ['هـ', 'و', 'ي', 'ء', 'لا'],
    accentColor: 'sky'
  }
];

// Звуковые аналогии из родного языка (Sounds you already know)
export const SOUNDS_YOU_KNOW = [
  {
    arabic: 'ب',
    name: 'Ба',
    englishName: 'Ba',
    soundsLike: 'б',
    soundWord: '«берег»',
    soundWordEn: 'boy',
    tip: 'Звонкий губной звук, как в слове «берег»'
  },
  {
    arabic: 'ت',
    name: 'Та',
    englishName: 'Ta',
    soundsLike: 'т',
    soundWord: '«торт»',
    soundWordEn: 'top',
    tip: 'Мягкий глухой звук с легким выдохом'
  },
  {
    arabic: 'ث',
    name: 'Са',
    englishName: 'Tha',
    soundsLike: 'с̱',
    soundWord: 'англ. «think»',
    soundWordEn: 'think',
    tip: 'Межзубный звук: кончик языка между резцами'
  },
  {
    arabic: 'ج',
    name: 'Джим',
    englishName: 'Jeem',
    soundsLike: 'дж',
    soundWord: '«джем»',
    soundWordEn: 'jam',
    tip: 'Мягкий слитный звук [дж]'
  },
  {
    arabic: 'د',
    name: 'Даль',
    englishName: 'Dal',
    soundsLike: 'д',
    soundWord: '«день»',
    soundWordEn: 'door',
    tip: 'Мягкий зубной звук [д]'
  },
  {
    arabic: 'ر',
    name: 'Ра',
    englishName: 'Ra',
    soundsLike: 'р',
    soundWord: '«ручей»',
    soundWordEn: 'run',
    tip: 'Раскатистый звук [р] кончиком языка'
  },
  {
    arabic: 'ز',
    name: 'Зай',
    englishName: 'Zay',
    soundsLike: 'з',
    soundWord: '«зима»',
    soundWordEn: 'zoo',
    tip: 'Звонкий свистящий звук [з]'
  },
  {
    arabic: 'س',
    name: 'Син',
    englishName: 'Seen',
    soundsLike: 'с',
    soundWord: '«солнце»',
    soundWordEn: 'sun',
    tip: 'Чистый мягкий свистящий звук [с]'
  },
  {
    arabic: 'ش',
    name: 'Шин',
    englishName: 'Sheen',
    soundsLike: 'ш',
    soundWord: '«шёлк»',
    soundWordEn: 'ship',
    tip: 'Мягкий шипящий звук'
  },
  {
    arabic: 'ك',
    name: 'Кяф',
    englishName: 'Kaaf',
    soundsLike: 'к',
    soundWord: '«кит»',
    soundWordEn: 'king',
    tip: 'Мягкий звук [к] с лёгким придыханием'
  },
  {
    arabic: 'ل',
    name: 'Лям',
    englishName: 'Laam',
    soundsLike: 'л',
    soundWord: '«лето»',
    soundWordEn: 'love',
    tip: 'Мягкий звук [л], кончик языка у дёсен'
  },
  {
    arabic: 'م',
    name: 'Мим',
    englishName: 'Meem',
    soundsLike: 'м',
    soundWord: '«мама»',
    soundWordEn: 'mom',
    tip: 'Сомкнутые губы с носовым призвуком'
  },
  {
    arabic: 'ن',
    name: 'Нун',
    englishName: 'Noon',
    soundsLike: 'н',
    soundWord: '«нос»',
    soundWordEn: 'no',
    tip: 'Носовой звук [н]'
  },
  {
    arabic: 'و',
    name: 'Вав',
    englishName: 'Waw',
    soundsLike: 'w / у',
    soundWord: 'англ. «water»',
    soundWordEn: 'water',
    tip: 'Губы вытягиваются вперед трубочкой'
  },
  {
    arabic: 'ي',
    name: 'Йа',
    englishName: 'Yaa',
    soundsLike: 'й',
    soundWord: '«йогурт»',
    soundWordEn: 'yes',
    tip: 'Мягкий сонорный звук [й]'
  }
];

// Цветовые категории и правила таджвида/фонетики (Color Legend)
export const BADGE_DEFINITIONS = [
  {
    id: 'qalqala',
    label: 'Калькаля',
    enLabel: 'Qalqala letter',
    colorClass: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    letters: ['ق', 'ط', 'ب', 'ج', 'د'],
    desc: 'Сотрясение / отскок звука при сукуне (قُطْبُ جَدٍّ)'
  },
  {
    id: 'madd',
    label: 'Мадд',
    enLabel: 'Madd letter',
    colorClass: 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700',
    letters: ['ا', 'و', 'ي', 'ى'],
    desc: 'Буквы долготы для удлинения гласных звуков (وای)'
  },
  {
    id: 'heavy',
    label: 'Твёрдая (эмфат.)',
    enLabel: 'Heavy (emphatic)',
    colorClass: 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700',
    letters: ['خ', 'ص', 'ض', 'غ', 'ط', 'ق', 'ظ'],
    desc: 'Подъём задней спинки языка к нёбу (خُصَّ ضَغْطٍ قِظْ)'
  },
  {
    id: 'throat',
    label: 'Гортанная',
    enLabel: 'Throat letter',
    colorClass: 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    letters: ['ء', 'ه', 'هـ', 'ع', 'ح', 'غ', 'خ'],
    desc: 'Звуки, рождающиеся в разных отделах гортани'
  },
  {
    id: 'sun',
    label: '☀ Солнечная',
    enLabel: '☀ Sun letter',
    colorClass: 'bg-orange-100 dark:bg-orange-950/70 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700',
    letters: ['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن'],
    desc: 'Ассимилирует звук «Лям» определенного артикля «Аль»'
  },
  {
    id: 'moon',
    label: '☾ Лунная',
    enLabel: '☾ Moon letter',
    colorClass: 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
    letters: ['ا', 'ب', 'ج', 'ح', 'خ', 'ع', 'غ', 'ف', 'ق', 'ك', 'م', 'و', 'ه', 'هـ', 'ي', 'ء'],
    desc: 'Артикль «Аль» перед этой буквой читается чётко и раздельно'
  },
  {
    id: 'non_connecting',
    label: '⚠️ Не соед. влево',
    enLabel: 'Non-connecting',
    colorClass: 'bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700',
    letters: ['ا', 'د', 'ذ', 'ر', 'ز', 'و'],
    desc: '6 букв, которые соединяются только справа и не соединяются влево'
  }
];

// Функция определения бейджей для конкретной буквы
export const getLetterBadges = (arabicChar) => {
  const clean = String(arabicChar || '').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED()=ـ\s]/g, '').trim();
  return BADGE_DEFINITIONS.filter(b => {
    return b.letters.includes(clean) || (clean === 'هـ' && b.letters.includes('ه'));
  });
};
