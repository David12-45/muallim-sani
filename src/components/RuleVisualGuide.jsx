import React from 'react';
import { Volume2, Lightbulb, ArrowLeftRight } from 'lucide-react';
import { audioService } from '../services/audio';
import { transcribeArabic } from '../services/transcribe';

function ClickableExample({ arabic, label, sub, highlight = false }) {
  const clean = String(arabic || '').replace(/[()=ـ]/g, '').trim();
  const tr = transcribeArabic(clean);

  return (
    <button
      type="button"
      onClick={() => audioService.speakArabic(clean)}
      className={`px-3.5 py-2.5 rounded-2xl border text-center transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center min-w-[92px] group ${
        highlight
          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-700 shadow-sm'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-emerald-400 shadow-xs'
      }`}
      title="Нажмите, чтобы послушать"
    >
      <div className="flex items-center gap-1.5">
        <span className="font-arabic text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-normal" dir="rtl">
          {arabic}
        </span>
        <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 opacity-75 group-hover:opacity-100 shrink-0" />
      </div>
      {label && (
        <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">
          {label}
        </span>
      )}
      {sub && (
        <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
          {sub}
        </span>
      )}
      {!label && tr && (
        <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400" dir="ltr">
          [{tr}]
        </span>
      )}
    </button>
  );
}

const GUIDE_CONFIGS = {
  alif: {
    badge: 'Основа чтения',
    title: '3 краткие гласные (Харакаты)',
    summary: 'В арабском нет отдельных букв для коротких «а, и, у» — вместо них ставят чёрточки над буквой или под ней.',
    tip: 'Фатха сверху — откройте рот [а]; кясра снизу — улыбнитесь [и]; дамма-запятая сверху — вытяните губы трубочкой [у].',
    items: [
      { arabic: 'اَ', label: 'Фатха = [а]', sub: 'Чёрточка сверху', highlight: true },
      { arabic: 'اِ', label: 'Кясра = [и]', sub: 'Чёрточка снизу', highlight: true },
      { arabic: 'اُ', label: 'Дамма = [у]', sub: 'Запятая сверху', highlight: true }
    ]
  },
  ra: {
    badge: 'Знак остановки',
    title: 'Сукун ( ْ ) — чистый согласный звук',
    summary: 'Маленький кружок над буквой означает, что после неё НЕТ гласной: звук резко останавливается на этой букве.',
    tip: 'Не добавляйте лишнее «ы» или «э» после сукуна! Слог «اَرْ» звучит кратко и чётко: [ар].',
    pairs: [
      { left: { arabic: 'رَ', label: '[ра]', sub: 'с гласной' }, right: { arabic: 'اَرْ', label: '[ар]', sub: 'с сукуном (стоп)', highlight: true } }
    ]
  },
  madd: {
    badge: 'Правило Мадд',
    title: 'Долгие гласные: тянем звук в 2 раза дольше',
    summary: 'Если после гласной идёт пустая буква продления (ا после «а», ي после «и», و после «у»), слог тянется на 2 счёта.',
    tip: 'Представьте два удара сердца или два шага: коротко «ба» (1 шаг) vs протяжно «ба-а» (2 шага). Нажмите на карточки, чтобы услышать разницу!',
    pairs: [
      {
        left: { arabic: 'بَ', label: '[ба] (1 счёт)', sub: 'коротко' },
        right: { arabic: 'بَا', label: '[ба̄] (2 счёта)', sub: 'Фатха + Алиф', highlight: true }
      },
      {
        left: { arabic: 'بِ', label: '[би] (1 счёт)', sub: 'коротко' },
        right: { arabic: 'بِى', label: '[бӣ] (2 счёта)', sub: 'Кясра + Йа', highlight: true }
      },
      {
        left: { arabic: 'بُ', label: '[бу] (1 счёт)', sub: 'коротко' },
        right: { arabic: 'بُو', label: '[бӯ] (2 счёта)', sub: 'Дамма + Вав', highlight: true }
      }
    ]
  },
  tashdid: {
    badge: 'Правило Ташдид (Шадда)',
    title: 'Удвоение согласной буквы ( ّ )',
    summary: 'Значок « ّ » (похож на маленькую «w») удваивает букву: первая часть читается с остановкой (сукуном), а вторая — с гласной.',
    tip: 'Частая ошибка новичков: когда под самим значком « ّ » (над буквой!) стоит чёрточка (ـِّ) — это КЯСРА [и], а не фатха! Фатха всегда НАД « ّ » (ـَّ).',
    pairs: [
      {
        left: { arabic: 'رَبَ', label: '[раба]', sub: 'одиночная «б»' },
        right: { arabic: 'رَبَّ', label: '[раб-ба]', sub: 'удвоенная «бб» (رَبْبَ)', highlight: true }
      }
    ],
    items: [
      { arabic: 'بَّ', label: 'Фатха НАД ّ = [бба]', sub: 'رَبَّ [раб-ба]' },
      { arabic: 'بِّ', label: 'Кясра ПОД ّ = [бби]', sub: 'رَبِّ [раб-би]', highlight: true },
      { arabic: 'بُّ', label: 'Дамма НАД ّ = [ббу]', sub: 'رَبُّ [раб-бу]' }
    ]
  },
  tanwin: {
    badge: 'Правило Танвин',
    title: 'Двойная огласовка добавляет «-Н» на конце',
    summary: 'Увидели две одинаковые чёрточки или две запятые в конце слова? Читайте обычную гласную и добавляйте на конце звук [н]!',
    tip: 'Секрет лишнего Алифа: в «بًا» последний Алиф — немой. Он не тянет звук, а служит просто «подпоркой» для двойной фатхи.',
    items: [
      { arabic: 'بًا', label: '[бан] = «-ан»', sub: 'Две фатхи (+ немой алиф)', highlight: true },
      { arabic: 'بٍ', label: '[бин] = «-ин»', sub: 'Две кясры снизу', highlight: true },
      { arabic: 'بٌ', label: '[бун] = «-ун»', sub: 'Две даммы сверху', highlight: true }
    ]
  },
  'tanwin-tashdid': {
    badge: '2 правила вместе',
    title: 'Удвоение (Ташдид) + «-Н» (Танвин)',
    summary: 'Сначала сделайте акцент и удвойте букву из-за ташдида, а на выходе сразу добавьте окончание танвина (-ан / -ин / -ун).',
    tip: 'Разбивайте слово мысленно на две части: رَبٌّ → «раб» + «бун» = [раб-бун].',
    items: [
      { arabic: 'رَبًّا', label: '[раб-бан]', sub: 'удвоение + -ан', highlight: true },
      { arabic: 'رَبٍّ', label: '[раб-бин]', sub: 'удвоение + -ин', highlight: true },
      { arabic: 'رَبٌّ', label: '[раб-бун]', sub: 'удвоение + -ун', highlight: true }
    ]
  },
  hamza: {
    badge: 'Орфография',
    title: 'Алиф тянет, а Хамза (ء) даёт звук',
    summary: 'Пустой Алиф без огласовок просто удлиняет «а». Но если над ним (أ) или под ним (إ) есть значок Хамзы (или любая огласовка) — это согласная смычка.',
    tip: 'Алиф, Вав (ؤ) и Йа без точек (ئ) здесь работают просто «стульчиками» для Хамзы — саму букву-подставку читать не нужно!',
    items: [
      { arabic: 'أَ', label: '[а] — отрывисто', sub: 'Хамза на Алифе', highlight: true },
      { arabic: 'ؤُ', label: '[у] — отрывисто', sub: 'Вав только подставка' },
      { arabic: 'ئِ', label: '[и] — отрывисто', sub: 'Йа только подставка' }
    ]
  },
  'ta-marbuta': {
    badge: 'Особая буква',
    title: 'Та-марбута (ة / ـة): «Т» или выдох «Һ»',
    summary: 'Это буква «Та», завязанная в узелок на конце слов. Когда есть огласовка — читается как [т], а при остановке — как лёгкий выдох [һ].',
    tip: 'Смотрите на две точки сверху: они напоминают, что внутри спрятана буква «ت».',
    pairs: [
      {
        left: { arabic: 'عَزِيزَةٌ', label: '[‘азизатун]', sub: 'в потоке речи [т]', highlight: true },
        right: { arabic: 'عَزِيزَهْ', label: '[‘азизаһ]', sub: 'при остановке [һ]' }
      }
    ]
  },
  muqaddara: {
    badge: 'Маленькие знаки мадда',
    title: 'Скрытое продление (вертикальный штрих)',
    summary: 'Вертикальная палочка сверху ( ٰ ), вертикальная палочка снизу ( ٖ ) или перевёрнутая запятая заменяют целую букву мадд — тяните гласную на 2 счёта!',
    tip: 'Часто встречается в словах Корана: رَحْمٰنُ (Рахма̄ну), هٰذَا (һа̄за̄), بِهٖ (биһӣ), لَهُ (ляһӯ).',
    pairs: [
      { left: { arabic: 'اِلٰهٌ', label: '[иля̄һун]' }, right: { arabic: 'اِلَاهٌ', label: 'читается так же', highlight: true } },
      { left: { arabic: 'بِهٖ', label: '[биһӣ]' }, right: { arabic: 'بِهِى', label: 'читается так же', highlight: true } }
    ]
  },
  alifiyya: {
    badge: 'Кораническое письмо',
    title: 'Буква пишется иначе, но читается как долгий «А̄»',
    summary: 'Иногда вместо Алифа в слове стоит Йа без точек (ى) или Вав (و) с вертикальной фатхой сверху — они всё равно читаются как долгий звук [а̄].',
    tip: 'Увидели вертикальную чёрточку над ى или و (صَلٰوةْ، عَلَى) — смело тяните звук [а̄]!',
    pairs: [
      { left: { arabic: 'عَلَى', label: '[‘аля̄]', sub: 'ى без точек = а̄' }, right: { arabic: 'صَلٰوةْ', label: '[саля̄т]', sub: 'و с палочкой = а̄', highlight: true } }
    ]
  },
  silent: {
    badge: 'Немые буквы',
    title: 'Пишется, но НЕ читается',
    summary: 'Некоторые буквы пишутся только для грамматики (например, конечный Алиф в глаголах قَالُوا) — их нужно просто пропустить при чтении.',
    tip: 'В слове قَالُوا (ка̄лю̄) последний Алиф не читается вообще — заканчивайте на долгом звуке [ӯ].',
    items: [
      { arabic: 'قَالُوا', label: '[ка̄лю̄]', sub: 'Алиф на конце немой', highlight: true },
      { arabic: 'اُولُو', label: '[улю̄]', sub: 'Первый Вав немой' }
    ]
  },
  qamariyya: {
    badge: 'Лунные буквы',
    title: '🌙 В артикле «Аль-» буква «Л» ЧИТАЕТСЯ чётко',
    summary: 'Как ночью на небе ясно видна Луна, так и здесь отчётливо слышна буква Лям (لْ) перед лунными буквами.',
    tip: 'Простая проверка глазами: над буквой Лям стоит сукун (اَلْ), а на следующей букве НЕТ ташдида.',
    items: [
      { arabic: 'اَلْقَمَرُ', label: '[аль-камару]', sub: '«Л» читаем чётко', highlight: true },
      { arabic: 'وَالْعَصْرِ', label: '[валь-‘асри]', sub: 'Переходим прямо на «Ль»' }
    ]
  },
  shamsiyya: {
    badge: 'Солнечные буквы',
    title: '☀️ В артикле «Аль-» буква «Л» НЕ ЧИТАЕТСЯ',
    summary: 'Днём Солнце затмевает звёзды — так и здесь солнечная буква «поглощает» букву Лям (ل) и сама удваивается.',
    tip: 'Безошибочная подсказка: если на следующей букве после «Аль» стоит ташдид ( ّ ) — пропускайте «Л» и удваивайте следующую букву!',
    items: [
      { arabic: 'اَلشَّمْسُ', label: '[аш-шамсу]', sub: 'Не «ал-шамс», а «аш-шамс»!', highlight: true },
      { arabic: 'اَلنَّاسِ', label: '[ан-на̄си]', sub: '«Л» пропустили, «Н» удвоили', highlight: true }
    ]
  },
  wasl: {
    badge: 'Слитное чтение',
    title: 'Васл — соединяем слова без паузы',
    summary: 'Когда слова читаются подряд, соединительный Алиф между ними пропускается, а голос плавно переходит к следующей согласной.',
    tip: 'Пример: هٰذَا الْبَلَدِ читается слитно как «һа̄заль-баляди», без остановки перед «Ль».',
    items: [
      { arabic: 'اِهْدِنَا الصِّرَاطَ', label: '[иһдинас-сира̄т]', sub: 'Слитный переход на «С»', highlight: true }
    ]
  },
  waqf: {
    badge: 'Правило остановки',
    title: 'Вакф — как красиво закончить чтение в конце аята',
    summary: 'При остановке на последнем слове: 1) обычная гласная отбрасывается (становится сукуном); 2) танвин «-ан» тянется как «-а̄»; 3) та-марбута превращается в выдох «һ».',
    tip: 'Просто запомните 3 коротких превращения — нажмите и сравните звучание!',
    pairs: [
      { left: { arabic: 'نَسْتَعِينُ', label: 'в потоке [у]' }, right: { arabic: 'نَسْتَعِينْ', label: 'пауза: [н] (сукун)', highlight: true } },
      { left: { arabic: 'يُسْرًا', label: 'в потоке [-ан]' }, right: { arabic: 'يُسْرَا', label: 'пауза: [-а̄] (тянем)', highlight: true } },
      { left: { arabic: 'حَامِيَةٌ', label: 'в потоке [-тун]' }, right: { arabic: 'حَامِيَهْ', label: 'пауза: [-аһ] (выдох)', highlight: true } }
    ]
  },
  'madd-rule': {
    badge: 'Усиленный Мадд',
    title: 'Знак волны ( ٓ ) — тянем на 4–5 счётов',
    summary: 'Если над буквой мадд нарисована волнистая линия ( ٓ ), а следом идёт Хамза (ء), звук нужно тянуть примерно 2 секунды (4–5 счётов).',
    tip: 'Чем длиннее волна — тем дольше тянем гласную перед твёрдой хамзой.',
    items: [
      { arabic: 'جَآءَ', label: '[джа̄-а̄-а]', sub: 'Тянем «а» на 4–5 счётов', highlight: true },
      { arabic: 'سِيٓءَ', label: '[сӣ-ӣ-а]', sub: 'Тянем «и» на 4–5 счётов', highlight: true }
    ]
  },
  idgham: {
    badge: 'Слияние звуков',
    title: 'Идгам: буква «Н» растворяется в следующей букве',
    summary: 'Когда после «н» с сукуном (نْ) или танвина идёт одна из 6 букв (ي ر م ل و ن — слово «Йармалюн»), «н» сливается со следующей буквой и удваивает её.',
    tip: 'Мысленно замените «Н» на следующую букву: مِنْ مَسَدٍ становится «мим-масад».',
    pairs: [
      { left: { arabic: 'مِنْ مَسَدٍ', label: 'написано' }, right: { arabic: 'مِمْ مَسَدٍ', label: '[мим-масадин]', highlight: true } },
      { left: { arabic: 'مِنْ رَبِّهِمْ', label: 'написано' }, right: { arabic: 'مِرْ رَبِّهِمْ', label: '[мир-раббиһим]', highlight: true } }
    ]
  },
  iqlab: {
    badge: 'Замена звука',
    title: 'Иклаб: «Н» перед «Б» превращается в «М»',
    summary: 'Чтобы произнести «Н» перед губной буквой Ба (ب), губы автоматически смыкаются в лёгкий звук [м] с призвуком в нос.',
    tip: 'Очень легко запомнить: в Коране над такой «н» часто ставят подсказку — крошечную букву Мим (م).',
    pairs: [
      { left: { arabic: 'مِنْ بَعْدِ', label: 'написано' }, right: { arabic: 'مِمْ بَعْدِ', label: '[мим-ба‘ди]', highlight: true } }
    ]
  },
  allah: {
    badge: 'Особое правило',
    title: 'Когда слово اللّٰه читается твёрдо, а когда мягко',
    summary: 'Если перед словом «Аллах» стоит гласная «а» или «у» — произносим твёрдо [Алла̄һ]. Если «и» — произносим мягко [Лля̄һ].',
    tip: 'Сравните два самых частых примера на слух:',
    items: [
      { arabic: 'عَبْدُ اللّٰهِ', label: '[‘Абду-Лла̄һ]', sub: 'После «у/а» — твёрдо', highlight: true },
      { arabic: 'بِسْمِ اللّٰهِ', label: '[Бисми-Лля̄һ]', sub: 'После «и» — мягко', highlight: true }
    ]
  }
};

function resolveGuideKey(lessonId) {
  if (!lessonId) return null;
  if (GUIDE_CONFIGS[lessonId]) return lessonId;
  if (lessonId.startsWith('madd-') && lessonId !== 'madd-rule') return 'madd';
  if (lessonId.startsWith('tashdid')) return 'tashdid';
  if (lessonId === 'tanwin-words') return 'tanwin';
  if (lessonId.endsWith('-muqaddara')) return 'muqaddara';
  if (lessonId.endsWith('-alifiyya')) return 'alifiyya';
  if (lessonId === 'phrases') return 'wasl';
  return null;
}

export default function RuleVisualGuide({ lessonId }) {
  const key = resolveGuideKey(lessonId);
  if (!key) return null;
  const guide = GUIDE_CONFIGS[key];

  return (
    <div className="rounded-3xl bg-gradient-to-br from-amber-50/90 via-white to-emerald-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/30 border-2 border-amber-300/70 dark:border-amber-700/50 p-4 sm:p-6 shadow-md space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/40 flex items-center justify-center shrink-0">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/25 text-amber-800 dark:text-amber-200 mb-1">
            {guide.badge} • Понятно за 10 секунд
          </span>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
            {guide.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed pretty-copy">
            {guide.summary}
          </p>
        </div>
      </div>

      {/* Pairs (Before -> After comparisons) */}
      {guide.pairs && guide.pairs.length > 0 && (
        <div className="space-y-2.5">
          {guide.pairs.map((pair, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-white/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-center gap-3 sm:gap-5"
            >
              <ClickableExample {...pair.left} />
              <div className="flex flex-col items-center text-amber-600 dark:text-amber-400 shrink-0">
                <ArrowLeftRight className="w-4 h-4" />
                <span className="text-[10px] font-extrabold uppercase tracking-wide mt-0.5">Сравни</span>
              </div>
              <ClickableExample {...pair.right} />
            </div>
          ))}
        </div>
      )}

      {/* Standalone clickable cards */}
      {guide.items && guide.items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {guide.items.map((item, idx) => (
            <ClickableExample key={idx} {...item} />
          ))}
        </div>
      )}

      {/* Memory lifehack footer */}
      {guide.tip && (
        <div className="p-3 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 leading-relaxed">
          <strong className="font-black text-emerald-700 dark:text-emerald-300">💡 Запомнить легко: </strong>
          {guide.tip}
        </div>
      )}
    </div>
  );
}
