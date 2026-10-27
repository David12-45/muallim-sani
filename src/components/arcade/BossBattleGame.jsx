import React, { useState, useEffect, useCallback } from 'react';
import { ALPHABET_DATA } from '../../data/alphabet';
import { ALL_WORDS } from '../../data/book';
import { transcribeArabic } from '../../services/transcribe';
import { audioService } from '../../services/audio';
import { soundFx } from '../../services/soundFx';
import { storageService } from '../../services/storage';
import confetti from 'canvas-confetti';
import {
  Swords,
  Shield,
  Heart,
  Zap,
  Flame,
  Trophy,
  Sparkles,
  RotateCcw,
  Volume2,
  Timer,
  CheckCircle2
} from 'lucide-react';

const BOSSES = [
  {
    id: 'boss_1',
    name: 'Страж Оазиса Алифбы',
    moduleTitle: 'Модуль 1 • Алфавит и 4 формы',
    avatar: '🧞‍♂️',
    maxHp: 150,
    attackDmg: 25,
    xpReward: 80,
    bgGradient: 'from-amber-900 via-teal-950 to-slate-950',
    accent: 'text-amber-400',
    description: 'Проверяет знание 29 букв, их звучания и 4 форм соединения в слове.'
  },
  {
    id: 'boss_2',
    name: 'Хранитель Долины Огласовок',
    moduleTitle: 'Модуль 2 • Фатха, Кясра, Дамма, Сукун',
    avatar: '🧙‍♂️',
    maxHp: 210,
    attackDmg: 28,
    xpReward: 110,
    bgGradient: 'from-emerald-900 via-slate-900 to-slate-950',
    accent: 'text-emerald-400',
    description: 'Испытывает скорость чтения арабских слов с краткими гласными и сукуном.'
  },
  {
    id: 'boss_3',
    name: 'Владыка Крепости Ташдида',
    moduleTitle: 'Модуль 3 • Шадда, Танвин и Мадд',
    avatar: '⚔️',
    maxHp: 260,
    attackDmg: 30,
    xpReward: 140,
    bgGradient: 'from-purple-900 via-indigo-950 to-slate-950',
    accent: 'text-purple-400',
    description: 'Мастер удвоенных букв (шадда), танвина (-ан, -ин, -ун) и долгого чтения.'
  },
  {
    id: 'boss_4',
    name: 'Магистр Дворца Таджвида',
    moduleTitle: 'Модуль 4 • Правила чтения Корана',
    avatar: '👑',
    maxHp: 320,
    attackDmg: 34,
    xpReward: 200,
    bgGradient: 'from-rose-950 via-amber-950 to-slate-950',
    accent: 'text-rose-400',
    description: 'Финальный босс курса! Проверяет калькаля, твёрдость букв и беглое чтение.'
  }
];

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const VALID_WORDS = ALL_WORDS.filter(w => {
  const tr = transcribeArabic(w);
  return tr && tr.length >= 2 && w.length >= 3;
});

export default function BossBattleGame() {
  const [selectedBoss, setSelectedBoss] = useState(BOSSES[0]);
  const [inBattle, setInBattle] = useState(false);
  const [battleResult, setBattleResult] = useState(null); // 'victory' | 'defeat' | null
  const [defeatedBossIds, setDefeatedBossIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('muallim_defeated_bosses') || '[]');
    } catch {
      return [];
    }
  });

  const [playerHp, setPlayerHp] = useState(100);
  const [bossHp, setBossHp] = useState(150);
  const [mana, setMana] = useState(0); // 0..3 для Супер-удара
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);

  const [question, setQuestion] = useState(null);
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [potions, setPotions] = useState({ fifty: 1, heal: 1 });

  const [bossShake, setBossShake] = useState(false);
  const [playerShake, setPlayerShake] = useState(false);
  const [combatLog, setCombatLog] = useState('Битва началась! Отвечайте быстро, чтобы атаковать!');
  const [dmgPopup, setDmgPopup] = useState(null);

  // Генератор вопроса под конкретного Босса
  const generateBossQuestion = useCallback((bossId) => {
    setHiddenOptions([]);
    setTimeLeft(10);

    if (bossId === 'boss_1') {
      // Вопросы по буквам и их 4 формам
      const isFormQ = Math.random() < 0.55;
      const connecting = ALPHABET_DATA.filter(l => l.connectsLeft);
      const target = isFormQ
        ? connecting[Math.floor(Math.random() * connecting.length)]
        : ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];

      if (isFormQ && target.forms) {
        const positions = [
          { key: 'initial', label: 'в НАЧАЛЕ слова' },
          { key: 'medial', label: 'в СЕРЕДИНЕ слова' },
          { key: 'final', label: 'в КОНЦЕ слова' }
        ];
        const pos = positions[Math.floor(Math.random() * positions.length)];
        const correct = target.forms[pos.key];
        const distractors = shuffle(connecting.filter(l => l.id !== target.id))
          .slice(0, 3)
          .map(l => l.forms[pos.key]);

        setQuestion({
          prompt: `Выберите форму буквы «${target.name}» ${pos.label}:`,
          arabicDisplay: target.arabic,
          letterToPlay: target.arabic,
          correctAnswer: correct,
          options: shuffle([correct, ...distractors]),
          isArabicOptions: true
        });
      } else {
        const correct = `${target.name} [${target.transcription}]`;
        const distractors = shuffle(ALPHABET_DATA.filter(l => l.id !== target.id))
          .slice(0, 3)
          .map(l => `${l.name} [${l.transcription}]`);

        setQuestion({
          prompt: 'Какая это буква и как она звучит?',
          arabicDisplay: target.arabic,
          letterToPlay: target.arabic,
          correctAnswer: correct,
          options: shuffle([correct, ...distractors]),
          isArabicOptions: false
        });
      }
      return;
    }

    // Для боссов 2, 3, 4 — слова соответствующей сложности + правила
    let wordPool = VALID_WORDS;
    if (bossId === 'boss_3') {
      const shaddaOrMadd = VALID_WORDS.filter(w => /[\u0651\u064B\u064C\u064D]/.test(w) || w.length >= 5);
      if (shaddaOrMadd.length >= 10) wordPool = shaddaOrMadd;
    } else if (bossId === 'boss_4') {
      const complex = VALID_WORDS.filter(w => w.length >= 5);
      if (complex.length >= 10) wordPool = complex;
    }

    const word = wordPool[Math.floor(Math.random() * wordPool.length)] || 'كَتَبَ';
    const correctTr = `[${transcribeArabic(word)}]`;
    const distractors = [];
    let guard = 0;
    while (distractors.length < 3 && guard < 40) {
      guard++;
      const w2 = VALID_WORDS[Math.floor(Math.random() * VALID_WORDS.length)];
      const tr2 = `[${transcribeArabic(w2)}]`;
      if (tr2 !== correctTr && !distractors.includes(tr2)) {
        distractors.push(tr2);
      }
    }

    // Иногда спрашиваем обратное: дана транскрипция, выбрать арабское слово
    if (Math.random() < 0.35) {
      const wordDistractors = [];
      let g2 = 0;
      while (wordDistractors.length < 3 && g2 < 40) {
        g2++;
        const w2 = wordPool[Math.floor(Math.random() * wordPool.length)];
        if (w2 !== word && !wordDistractors.includes(w2)) {
          wordDistractors.push(w2);
        }
      }
      setQuestion({
        prompt: `Найдите арабское слово, которое читается как ${correctTr}:`,
        arabicDisplay: correctTr,
        correctAnswer: word,
        options: shuffle([word, ...wordDistractors]),
        isArabicOptions: true
      });
    } else {
      setQuestion({
        prompt: 'Прочитайте слово и выберите правильную транскрипцию:',
        arabicDisplay: word,
        correctAnswer: correctTr,
        options: shuffle([correctTr, ...distractors]),
        isArabicOptions: false
      });
    }
  }, []);

  // Запуск боя
  const startBattle = (boss = selectedBoss) => {
    soundFx.playTap();
    setSelectedBoss(boss);
    setPlayerHp(100);
    setBossHp(boss.maxHp);
    setMana(0);
    setCombo(0);
    setPotions({ fifty: 1, heal: 1 });
    setBattleResult(null);
    setCombatLog(`⚔️ Вы вступили в бой с боссом «${boss.name}»!`);
    setInBattle(true);
    generateBossQuestion(boss.id);
  };

  // Таймер атаки босса
  useEffect(() => {
    if (!inBattle || battleResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Босс наносит удар по таймеру!
          handleBossCounterAttack('Время вышло! Страж нанёс удар!');
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [inBattle, battleResult, selectedBoss, playerHp]);

  const handleBossCounterAttack = (reasonText) => {
    soundFx.playError();
    setPlayerShake(true);
    setTimeout(() => setPlayerShake(false), 450);

    const dmg = selectedBoss.attackDmg;
    setCombo(0);
    setMana(0);
    setCombatLog(`💥 ${reasonText} (-${dmg} HP)`);

    setPlayerHp((prev) => {
      const next = Math.max(0, prev - dmg);
      if (next <= 0) {
        setBattleResult('defeat');
      } else {
        generateBossQuestion(selectedBoss.id);
      }
      return next;
    });
  };

  const handleSelectAnswer = (option) => {
    if (!inBattle || battleResult || !question) return;

    if (option === question.correctAnswer) {
      // Игрок атакует Босса!
      const nextCombo = combo + 1;
      const isCrit = mana >= 2;
      const baseDmg = 35 + Math.min(20, nextCombo * 4);
      const totalDmg = isCrit ? Math.round(baseDmg * 1.75) : baseDmg;

      soundFx.playBossHit();
      setBossShake(true);
      setTimeout(() => setBossShake(false), 450);

      setCombo(nextCombo);
      setMana(isCrit ? 0 : Math.min(3, mana + 1));

      setDmgPopup({
        text: isCrit ? `🔥 СУПЕР-УДАР -${totalDmg} HP!` : `⚔️ -${totalDmg} HP`,
        isCrit
      });
      setTimeout(() => setDmgPopup(null), 900);

      setCombatLog(
        isCrit
          ? `🔥 Вы применили Супер-удар Чтеца и нанесли ${totalDmg} урона!`
          : `✅ Верно! Точный удар нанёс ${totalDmg} урона боссу!`
      );

      const nextBossHp = Math.max(0, bossHp - totalDmg);
      setBossHp(nextBossHp);

      if (nextBossHp <= 0) {
        // Победа над Боссом!
        soundFx.playFanfare();
        setBattleResult('victory');
        storageService.addXp(selectedBoss.xpReward);
        if (!defeatedBossIds.includes(selectedBoss.id)) {
          const updated = [...defeatedBossIds, selectedBoss.id];
          setDefeatedBossIds(updated);
          localStorage.setItem('muallim_defeated_bosses', JSON.stringify(updated));
        }
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } else {
        generateBossQuestion(selectedBoss.id);
      }
    } else {
      handleBossCounterAttack('Неверный ответ! Страж контратаковал!');
    }
  };

  // Использование зелья 50/50
  const useFiftyPotion = () => {
    if (potions.fifty <= 0 || !question || hiddenOptions.length > 0) return;
    soundFx.playCoin();
    const wrongOpts = question.options.filter(o => o !== question.correctAnswer);
    const toHide = shuffle(wrongOpts).slice(0, 2);
    setHiddenOptions(toHide);
    setPotions(prev => ({ ...prev, fifty: prev.fifty - 1 }));
    setCombatLog('🧪 Зелье Мудрости убрало 2 ложных варианта!');
  };

  // Использование щита лечения
  const useHealPotion = () => {
    if (potions.heal <= 0 || playerHp >= 100) return;
    soundFx.playCoin();
    setPlayerHp(prev => Math.min(100, prev + 35));
    setPotions(prev => ({ ...prev, heal: prev.heal - 1 }));
    setCombatLog('🛡️ Щит Чтеца восстановил +35 здоровья!');
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden text-white">
      {/* Top Boss Selector Bar */}
      <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black">
              Битва со Стражами Знаний (RPG)
            </h3>
            <p className="text-[11px] text-slate-400">
              Побеждайте боссов 4 модулей курса с помощью быстрого чтения и знаний правил
            </p>
          </div>
        </div>

        {/* Boss Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {BOSSES.map((b, idx) => {
            const isDefeated = defeatedBossIds.includes(b.id);
            const isCurrent = selectedBoss.id === b.id;
            return (
              <button
                key={b.id}
                onClick={() => {
                  soundFx.playTap();
                  setSelectedBoss(b);
                  setInBattle(false);
                  setBattleResult(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all ${
                  isCurrent
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{b.avatar}</span>
                <span>Босс {idx + 1}</span>
                {isDefeated && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Arena */}
      <div className={`p-5 sm:p-7 bg-gradient-to-b ${selectedBoss.bgGradient} min-h-[480px] flex flex-col justify-between`}>
        {!inBattle ? (
          /* Pre-Battle Boss Showcase Card */
          <div className="my-auto max-w-lg mx-auto text-center space-y-4 py-6">
            <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-6xl mx-auto shadow-2xl">
              {selectedBoss.avatar}
            </div>

            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-amber-300">
                {selectedBoss.moduleTitle}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-2">
                {selectedBoss.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                {selectedBoss.description}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-300 pt-1">
              <span className="px-3 py-1.5 rounded-xl bg-black/30 border border-white/10">
                ❤️ Здоровье: {selectedBoss.maxHp} HP
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-black/30 border border-white/10">
                ⚔️ Урон: {selectedBoss.attackDmg}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-black/30 border border-white/10 text-amber-300">
                ⚡ Награда: +{selectedBoss.xpReward} XP
              </span>
            </div>

            <button
              onClick={() => startBattle(selectedBoss)}
              className="mt-4 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 inline-flex items-center gap-2.5 active:scale-95 transition-all"
            >
              <Swords className="w-5 h-5" />
              <span>Вызвать Стража на бой! ⚔️</span>
            </button>
          </div>
        ) : battleResult ? (
          /* Victory or Defeat Screen */
          <div className="my-auto max-w-md mx-auto text-center space-y-4 py-6">
            {battleResult === 'victory' ? (
              <>
                <Trophy className="w-20 h-20 text-amber-400 mx-auto animate-bounce" />
                <h2 className="text-3xl font-black text-white">
                  Страж повержен! 🎉
                </h2>
                <p className="text-sm text-emerald-300 font-bold">
                  Вы одержали победу над «{selectedBoss.name}» и получили +{selectedBoss.xpReward} XP!
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-2">🛡️</div>
                <h2 className="text-2xl font-black text-rose-400">
                  Страж оказался сильнее!
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  У босса осталось {bossHp} HP. Попробуйте ещё раз и используйте зелья!
                </p>
              </>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                onClick={() => startBattle(selectedBoss)}
                className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm inline-flex items-center gap-2 active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Реванш ⚔️</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active RPG Combat Screen */
          <div className="space-y-5">
            {/* Fighters Status Row (Player vs Boss) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Player Card */}
              <div className={`p-4 rounded-2xl bg-black/40 border border-white/15 backdrop-blur-md transition-transform ${
                playerShake ? 'translate-x-2 bg-rose-950/60 border-rose-500' : ''
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🧕</span>
                    <div>
                      <div className="text-xs font-black text-emerald-300">Ученик Му'аллима</div>
                      <div className="text-[11px] text-slate-400">Комбо: x{combo}</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-emerald-400">
                    {playerHp} / 100 HP
                  </span>
                </div>

                {/* Player HP Bar */}
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                    style={{ width: `${playerHp}%` }}
                  />
                </div>

                {/* Super Charge & Potions */}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>Супер-заряд: {mana}/2</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={useFiftyPotion}
                      disabled={potions.fifty <= 0}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                        potions.fifty > 0
                          ? 'bg-indigo-600/80 hover:bg-indigo-500 border-indigo-400 text-white'
                          : 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                      title="Убрать 2 неверных ответа"
                    >
                      🧪 50/50 ({potions.fifty})
                    </button>
                    <button
                      onClick={useHealPotion}
                      disabled={potions.heal <= 0 || playerHp >= 100}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                        potions.heal > 0 && playerHp < 100
                          ? 'bg-emerald-600/80 hover:bg-emerald-500 border-emerald-400 text-white'
                          : 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                      title="Восстановить +35 HP"
                    >
                      🛡️ +35 HP ({potions.heal})
                    </button>
                  </div>
                </div>
              </div>

              {/* Boss Card */}
              <div className={`relative p-4 rounded-2xl bg-black/40 border border-white/15 backdrop-blur-md transition-transform ${
                bossShake ? '-translate-x-2 bg-amber-500/20 border-amber-400 scale-95' : ''
              }`}>
                {dmgPopup && (
                  <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-lg animate-bounce">
                    {dmgPopup.text}
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl">{selectedBoss.avatar}</span>
                    <div>
                      <div className="text-xs font-black text-amber-300">{selectedBoss.name}</div>
                      <div className="text-[11px] text-slate-400">{selectedBoss.moduleTitle}</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-rose-400">
                    {bossHp} / {selectedBoss.maxHp} HP
                  </span>
                </div>

                {/* Boss HP Bar */}
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-rose-600 to-amber-500 transition-all duration-300"
                    style={{ width: `${(bossHp / selectedBoss.maxHp) * 100}%` }}
                  />
                </div>

                {/* Boss Attack Timer */}
                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-amber-400" />
                    До удара босса:
                  </span>
                  <span className={`font-mono font-black ${timeLeft <= 3 ? 'text-rose-400 animate-pulse' : 'text-amber-300'}`}>
                    {timeLeft} сек
                  </span>
                </div>
              </div>
            </div>

            {/* Combat Log Banner */}
            <div className="text-center text-xs font-bold text-amber-200/90 bg-black/30 py-2 px-4 rounded-xl border border-white/10">
              {combatLog}
            </div>

            {/* Question & Spell Casting Box */}
            {question && (
              <div className="bg-slate-950/80 rounded-3xl p-5 border border-white/15 backdrop-blur-md space-y-4">
                <p className="text-xs sm:text-sm font-bold text-center text-slate-300">
                  {question.prompt}
                </p>

                <div className="flex items-center justify-center gap-3 py-3 px-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <span
                    className={
                      question.isArabicOptions && question.arabicDisplay.startsWith('[')
                        ? 'font-mono text-2xl sm:text-3xl font-black text-amber-400'
                        : 'font-arabic text-5xl sm:text-6xl font-bold text-white leading-relaxed'
                    }
                    dir="rtl"
                  >
                    {question.arabicDisplay}
                  </span>

                  {question.letterToPlay && (
                    <button
                      onClick={() => audioService.playLetter(question.letterToPlay)}
                      className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white"
                      title="Прослушать букву"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {question.options.map((opt, idx) => {
                    const isHidden = hiddenOptions.includes(opt);
                    if (isHidden) {
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl border border-slate-800 bg-slate-900/30 text-center text-slate-600 flex items-center justify-center text-xs"
                        >
                          Скрыто зельем
                        </div>
                      );
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectAnswer(opt)}
                        className={`p-3.5 sm:p-4 rounded-2xl border-b-4 bg-slate-800 hover:bg-emerald-600 border-slate-700 hover:border-emerald-400 text-white transition-all active:scale-95 ${
                          question.isArabicOptions
                            ? 'font-arabic text-3xl sm:text-4xl font-bold'
                            : 'font-mono text-xs sm:text-base font-extrabold'
                        }`}
                        dir={question.isArabicOptions ? 'rtl' : 'ltr'}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
