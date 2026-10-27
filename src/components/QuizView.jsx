import React, { useState, useEffect } from 'react';
import { ALPHABET_DATA } from '../data/alphabet';
import { ALL_WORDS } from '../data/book';
import { storageService } from '../services/storage';
import { transcribeArabic } from '../services/transcribe';
import { soundFx } from '../services/soundFx';
import SpaceDefenderGame from './arcade/SpaceDefenderGame';
import ArabicNinjaGame from './arcade/ArabicNinjaGame';
import BossBattleGame from './arcade/BossBattleGame';
import DesertRunnerGame from './arcade/DesertRunnerGame';
import LevelProgressBar from './arcade/LevelProgressBar';
import {
  getUserKnowledgeProgress,
  getLettersForLevel,
  getWordsForLevel
} from '../data/gameLevels';
import confetti from 'canvas-confetti';
import {
  Gamepad2,
  RotateCcw,
  Sparkles,
  Timer,
  Grid,
  Heart,
  Zap,
  Trophy,
  CheckCircle2,
  Layers,
  Rocket,
  Sword,
  Swords,
  Compass,
  Brain
} from 'lucide-react';

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function QuizView() {
  // Выбранный уровень знаний (по умолчанию определяется по прогрессу пользователя)
  const [currentLevel, setCurrentLevel] = useState(() => getUserKnowledgeProgress().currentLevel);

  // Главный переключатель аркадных игр:
  // 'space' | 'ninja' | 'boss' | 'runner' | 'classic_hub'
  const [activeArcade, setActiveArcade] = useState('space');

  // Подрежимы для классических тренажёров: 'classic' | 'forms' | 'blitz' | 'pairs'
  const [gameMode, setGameMode] = useState('classic');

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [combo, setCombo] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [blitzActive, setBlitzActive] = useState(false);

  const [pairCards, setPairCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [matchedPairIds, setMatchedPairIds] = useState([]);
  const [wrongPairIds, setWrongPairIds] = useState([]);
  const [movesCount, setMovesCount] = useState(0);

  const levelLetters = getLettersForLevel(currentLevel);
  const levelWords = getWordsForLevel(currentLevel);

  const candidateWords = levelWords.length >= 6 ? levelWords : ALL_WORDS.filter(w => {
    const tr = transcribeArabic(w);
    return tr && tr.length >= 2 && w.length >= 3;
  });

  const generateFormsQuestions = () => {
    const list = [];
    const pool = levelLetters.length >= 3 ? levelLetters : ALPHABET_DATA;
    const connecting = pool.filter(l => l.connectsLeft);
    const nonConnecting = pool.filter(l => !l.connectsLeft);
    const connPool = connecting.length >= 2 ? connecting : ALPHABET_DATA.filter(l => l.connectsLeft);

    for (let i = 0; i < 4; i++) {
      const target = connecting[Math.floor(Math.random() * connecting.length)];
      const positions = [
        { key: 'initial', label: 'В НАЧАЛЕ слова' },
        { key: 'medial', label: 'В СЕРЕДИНЕ слова' },
        { key: 'final', label: 'В КОНЦЕ слова' }
      ];
      const pos = positions[Math.floor(Math.random() * positions.length)];
      const correctForm = target.forms[pos.key];
      const allFour = [
        target.forms.initial,
        target.forms.medial,
        target.forms.final,
        target.forms.isolated
      ];
      const options = shuffle(Array.from(new Set(allFour)));

      list.push({
        type: 'form-choice',
        prompt: `Как пишется буква «${target.name}» (${target.arabic}) ${pos.label}?`,
        displayLetter: target.arabic,
        correctAnswer: correctForm,
        options,
        isArabicOptions: true,
        explanation: `Буква «${target.name}» ${pos.label.toLowerCase()} пишется как «${correctForm}».`
      });
    }

    for (let i = 0; i < 3; i++) {
      const target = connecting[Math.floor(Math.random() * connecting.length)];
      const posMap = {
        initial: 'В начале слова',
        medial: 'В середине слова',
        final: 'В конце слова',
        isolated: 'Обособленно / отдельно'
      };
      const keys = ['initial', 'medial', 'final', 'isolated'];
      const chosenKey = keys[Math.floor(Math.random() * keys.length)];
      const displayForm = target.forms[chosenKey];

      list.push({
        type: 'form-identification',
        prompt: `В какой позиции в слове буква «${target.name}» (${target.arabic}) пишется так?`,
        displayLetter: displayForm,
        correctAnswer: posMap[chosenKey],
        options: shuffle(Object.values(posMap)),
        isArabicOptions: false,
        explanation: `Форма «${displayForm}» — это написание буквы «${target.name}» ${posMap[chosenKey].toLowerCase()}.`
      });
    }

    for (let i = 0; i < 3; i++) {
      const isNonConn = Math.random() > 0.5;
      const target = isNonConn
        ? nonConnecting[Math.floor(Math.random() * nonConnecting.length)]
        : connecting[Math.floor(Math.random() * connecting.length)];

      const correctAns = target.connectsLeft
        ? 'Соединяется в обе стороны ↔'
        : 'НЕ соединяется влево ❌ (пишется отдельно)';

      list.push({
        type: 'connection-rule',
        prompt: `Соединяется ли буква «${target.name}» (${target.arabic}) со следующей буквой влево?`,
        displayLetter: target.arabic,
        correctAnswer: correctAns,
        options: shuffle([
          'Соединяется в обе стороны ↔',
          'НЕ соединяется влево ❌ (пишется отдельно)'
        ]),
        isArabicOptions: false,
        explanation: target.connectsLeft
          ? `Буква «${target.name}» соединяется в обе стороны.`
          : `Буква «${target.name}» — одна из 6 букв (ا د ذ ر ز و), которые НЕ соединяются влево.`
      });
    }

    return shuffle(list);
  };

  const generateQuestions = (count = 10) => {
    const list = [];
    const pool = levelLetters.length >= 2 ? levelLetters : ALPHABET_DATA;

    for (let i = 0; i < 3; i++) {
      const target = pool[Math.floor(Math.random() * pool.length)];
      const distractors = shuffle(pool.filter(l => l.id !== target.id)).slice(0, 3);
      const options = shuffle([target, ...(distractors.length >= 1 ? distractors : ALPHABET_DATA.slice(0, 3))]);

      list.push({
        type: 'letter-name',
        prompt: 'Какая это буква арабского алфавита?',
        displayLetter: target.arabic,
        correctAnswer: `${target.name} [${target.transcription}]`,
        options: options.map(o => `${o.name} [${o.transcription}]`),
        isArabicOptions: false,
        explanation: `Буква ${target.name} (${target.arabic}) — читается как [${target.transcription}].`
      });
    }

    const connectingLetters = pool.filter(l => l.connectsLeft);
    const connPool = connectingLetters.length >= 2 ? connectingLetters : ALPHABET_DATA.filter(l => l.connectsLeft);
    for (let i = 0; i < 3; i++) {
      const target = connPool[Math.floor(Math.random() * connPool.length)];
      const formTypes = ['initial', 'medial', 'final'];
      const chosenForm = formTypes[Math.floor(Math.random() * formTypes.length)];
      const formLabels = {
        initial: 'в начале слова (соединяется влево ←)',
        medial: 'в середине слова (соединяется с двух сторон ↔)',
        final: 'в конце слова (соединяется справа →)'
      };

      const distractors = shuffle(connectingLetters.filter(l => l.id !== target.id)).slice(0, 3);
      const options = shuffle([target, ...distractors]);

      list.push({
        type: 'form',
        prompt: `Какая буква написана ${formLabels[chosenForm]}?`,
        displayLetter: target.forms[chosenForm],
        correctAnswer: `${target.name} (${target.arabic})`,
        options: options.map(o => `${o.name} (${o.arabic})`),
        isArabicOptions: false,
        explanation: `Это форма буквы ${target.name} (${target.arabic}) ${formLabels[chosenForm]}: ${target.forms[chosenForm]}.`
      });
    }

    const wordQuestionsCount = Math.max(4, count - 6);
    for (let i = 0; i < wordQuestionsCount; i++) {
      const targetWord = candidateWords[Math.floor(Math.random() * candidateWords.length)];
      const targetTr = transcribeArabic(targetWord);

      const distractors = [];
      let safety = 0;
      while (distractors.length < 3 && safety < 50) {
        safety++;
        const w = candidateWords[Math.floor(Math.random() * candidateWords.length)];
        const tr = transcribeArabic(w);
        if (tr !== targetTr && !distractors.includes(tr)) {
          distractors.push(tr);
        }
      }

      list.push({
        type: 'word-reading',
        prompt: 'Как правильно читается это арабское слово?',
        displayWord: targetWord,
        correctAnswer: targetTr,
        options: shuffle([targetTr, ...distractors]),
        isArabicOptions: false,
        explanation: `Слово ${targetWord} читается как [${targetTr}].`
      });
    }

    return shuffle(list);
  };

  const initPairsGame = () => {
    const chosenWords = [];
    const usedTr = new Set();
    let safety = 0;
    while (chosenWords.length < 6 && safety < 100) {
      safety++;
      const w = candidateWords[Math.floor(Math.random() * candidateWords.length)];
      const tr = transcribeArabic(w);
      if (tr && !usedTr.has(tr)) {
        usedTr.add(tr);
        chosenWords.push({ word: w, tr });
      }
    }

    const deck = [];
    chosenWords.forEach((item, idx) => {
      deck.push({ id: `ar-${idx}`, pairId: idx, text: item.word, isArabic: true });
      deck.push({ id: `tr-${idx}`, pairId: idx, text: `[${item.tr}]`, isArabic: false });
    });

    setPairCards(shuffle(deck));
    setSelectedCard(null);
    setMatchedPairIds([]);
    setWrongPairIds([]);
    setMovesCount(0);
  };

  const initGameSession = (mode) => {
    setScore(0);
    setHearts(3);
    setCombo(0);
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setQuizFinished(false);

    if (mode === 'classic') {
      setQuestions(generateQuestions(10));
      setBlitzActive(false);
    } else if (mode === 'forms') {
      setQuestions(generateFormsQuestions());
      setBlitzActive(false);
    } else if (mode === 'blitz') {
      setQuestions(generateQuestions(30));
      setTimeLeft(60);
      setBlitzActive(true);
    } else if (mode === 'pairs') {
      setBlitzActive(false);
      initPairsGame();
    }
  };

  useEffect(() => {
    if (activeArcade === 'classic_hub') {
      initGameSession(gameMode);
    }
  }, [gameMode, activeArcade, currentLevel]);

  useEffect(() => {
    if (activeArcade !== 'classic_hub' || gameMode !== 'blitz' || !blitzActive || quizFinished) return;
    if (timeLeft <= 0) {
      setQuizFinished(true);
      setBlitzActive(false);
      soundFx.playFanfare();
      storageService.addXp(score * 5);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameMode, blitzActive, quizFinished, activeArcade]);

  const currentQ = questions[currentQuestion];

  const handleSelectOption = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQ.correctAnswer;

    if (isCorrect) {
      soundFx.playSuccess();
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      const pts = nextCombo >= 3 ? 2 : 1;
      setScore(prev => prev + pts);
      storageService.addXp(5);
    } else {
      soundFx.playError();
      setCombo(0);
      if (gameMode === 'classic' || gameMode === 'forms') {
        const nextHearts = hearts - 1;
        setHearts(nextHearts);
        if (nextHearts <= 0) {
          setTimeout(() => setQuizFinished(true), 900);
        }
      }
    }

    if (gameMode === 'blitz') {
      setTimeout(() => {
        if (currentQuestion + 1 < questions.length) {
          setCurrentQuestion(prev => prev + 1);
          setSelectedOption(null);
          setIsAnswered(false);
        } else {
          setQuizFinished(true);
          setBlitzActive(false);
        }
      }, 450);
    }
  };

  const handleNext = () => {
    if (currentQuestion + 1 < questions.length && hearts > 0) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      soundFx.playTap();
    } else {
      setQuizFinished(true);
      storageService.addXp(30);
      soundFx.playFanfare();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleCardTap = (card) => {
    if (matchedPairIds.includes(card.pairId) || wrongPairIds.length > 0) return;

    if (!selectedCard) {
      soundFx.playTap();
      setSelectedCard(card);
      return;
    }

    if (selectedCard.id === card.id) {
      setSelectedCard(null);
      return;
    }

    setMovesCount(m => m + 1);

    if (selectedCard.pairId === card.pairId) {
      soundFx.playSuccess();
      const nextMatched = [...matchedPairIds, card.pairId];
      setMatchedPairIds(nextMatched);
      setSelectedCard(null);
      storageService.addXp(15);

      if (nextMatched.length === 6) {
        soundFx.playFanfare();
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      }
    } else {
      soundFx.playError();
      setWrongPairIds([selectedCard.id, card.id]);
      setTimeout(() => {
        setWrongPairIds([]);
        setSelectedCard(null);
      }, 650);
    }
  };

  const ARCADE_CARDS = [
    {
      id: 'space',
      title: 'Звёздный Защитник',
      genre: 'Космический шутер 60 FPS',
      icon: Rocket,
      badge: 'ХИТ 🚀',
      color: 'from-emerald-600 to-teal-700'
    },
    {
      id: 'ninja',
      title: 'Арабский Ниндзя',
      genre: 'Экшен-слайсер катаной',
      icon: Sword,
      badge: 'ЭКШЕН ⚔️',
      color: 'from-amber-500 to-rose-600'
    },
    {
      id: 'boss',
      title: 'Битва со Стражами',
      genre: 'RPG-Арена • 4 Босса',
      icon: Swords,
      badge: 'RPG 👑',
      color: 'from-purple-600 to-indigo-700'
    },
    {
      id: 'runner',
      title: 'Караван Пустыни',
      genre: 'Раннер в 3 полосы',
      icon: Compass,
      badge: 'СКОРОСТЬ 🏇',
      color: 'from-teal-500 to-cyan-700'
    },
    {
      id: 'classic_hub',
      title: 'Блиц и Мемори',
      genre: '4 викторины на память',
      icon: Brain,
      badge: 'КЛАССИКА 🧠',
      color: 'from-slate-700 to-slate-900'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-7 pb-28 md:pb-12 space-y-5">
      {/* 0. USER LEVEL & KNOWLEDGE PROGRESS (WHERE THE USER IS AT) */}
      <LevelProgressBar onLevelChanged={(lvl) => setCurrentLevel(lvl)} />

      {/* 1. ARCADE HEADER & GAME SELECTOR DECK */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-white p-5 sm:p-7 border border-emerald-800/40 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2">
              <Gamepad2 className="w-3.5 h-3.5" />
              Игровая Аркада • Метод «Му'аллим Сани»
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Выберите игру для тренировки
            </h1>
          </div>
          <p className="text-xs text-emerald-200/80 max-w-xs">
            Задания адаптируются под ваш текущий уровень ({currentLevel?.shortTitle || 'Алфавит'})!
          </p>
        </div>

        {/* 5 Game Selector Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {ARCADE_CARDS.map((card) => {
            const Icon = card.icon;
            const isSelected = activeArcade === card.id;
            return (
              <button
                key={card.id}
                onClick={() => {
                  soundFx.playTap();
                  setActiveArcade(card.id);
                }}
                className={`p-3.5 rounded-2xl text-left transition-all flex flex-col justify-between active:scale-95 border-2 ${
                  isSelected
                    ? `bg-gradient-to-br ${card.color} text-white border-amber-300 shadow-lg scale-[1.02]`
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-emerald-500/50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-emerald-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-amber-300 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {card.badge}
                  </span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black leading-tight">{card.title}</div>
                  <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                    {card.genre}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ACTIVE ARCADE GAME DISPLAY (ADAPTED TO USER KNOWLEDGE LEVEL) */}
      {activeArcade === 'space' && <SpaceDefenderGame level={currentLevel} />}
      {activeArcade === 'ninja' && <ArabicNinjaGame level={currentLevel} />}
      {activeArcade === 'boss' && <BossBattleGame level={currentLevel} />}
      {activeArcade === 'runner' && <DesertRunnerGame level={currentLevel} />}

      {/* 3. CLASSIC TRAINERS HUB */}
      {activeArcade === 'classic_hub' && (
        <div className="max-w-3xl mx-auto space-y-5">
          {/* 4 Classic Mode Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-slate-200/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setGameMode('classic')}
              className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                gameMode === 'classic'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="truncate">Выживание</span>
            </button>

            <button
              onClick={() => setGameMode('forms')}
              className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                gameMode === 'forms'
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Layers className="w-4 h-4 text-teal-500 shrink-0" />
              <span className="truncate">Формы букв</span>
            </button>

            <button
              onClick={() => setGameMode('blitz')}
              className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                gameMode === 'blitz'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Timer className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="truncate">Блиц 60с</span>
            </button>

            <button
              onClick={() => setGameMode('pairs')}
              className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                gameMode === 'pairs'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Grid className="w-4 h-4 text-purple-500 shrink-0" />
              <span className="truncate">Найди пары</span>
            </button>
          </div>

          {gameMode === 'pairs' ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-7 border border-slate-200 dark:border-slate-700 shadow-xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                    Соедините слово и его чтение
                  </h2>
                  <p className="text-xs text-slate-500">
                    Найдено пар: <strong>{matchedPairIds.length} / 6</strong> • Ходов: {movesCount}
                  </p>
                </div>
                <button
                  onClick={initPairsGame}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-100 active:scale-95"
                  title="Новые слова"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {matchedPairIds.length === 6 ? (
                <div className="py-8 text-center">
                  <Trophy className="w-14 h-14 text-amber-400 mx-auto mb-3 animate-bounce" />
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    Все 6 пар найдены за {movesCount} ходов!
                  </h3>
                  <p className="text-sm text-emerald-600 font-bold mt-1">+90 XP заработано!</p>
                  <button
                    onClick={initPairsGame}
                    className="mt-5 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm inline-flex items-center gap-2 shadow-lg active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Сыграть ещё партию</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {pairCards.map(card => {
                    const isMatched = matchedPairIds.includes(card.pairId);
                    const isSelected = selectedCard?.id === card.id;
                    const isWrong = wrongPairIds.includes(card.id);

                    return (
                      <button
                        key={card.id}
                        onClick={() => handleCardTap(card)}
                        disabled={isMatched}
                        className={`h-20 sm:h-24 rounded-2xl border-b-4 p-2 flex items-center justify-center text-center transition-all select-none active:scale-95 ${
                          isMatched
                            ? 'bg-emerald-100/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 opacity-50 scale-95'
                            : isWrong
                            ? 'bg-rose-500 text-white border-rose-700 animate-pulse'
                            : isSelected
                            ? 'bg-amber-400 text-slate-950 border-amber-600 scale-105 shadow-md'
                            : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-emerald-400'
                        }`}
                      >
                        {isMatched ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <span
                            className={
                              card.isArabic
                                ? 'font-arabic text-2xl sm:text-3xl font-bold leading-relaxed'
                                : 'font-mono text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-300'
                            }
                            dir={card.isArabic ? 'rtl' : 'ltr'}
                          >
                            {card.text}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : !quizFinished && currentQ ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-7 border border-slate-200 dark:border-slate-700 shadow-xl">
              <div className="flex items-center justify-between gap-2 mb-3">
                {gameMode === 'classic' || gameMode === 'forms' ? (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-800">
                    {[1, 2, 3].map(h => (
                      <Heart
                        key={h}
                        className={`w-4 h-4 ${
                          h <= hearts ? 'fill-rose-500 text-rose-500' : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-sm font-black ${
                    timeLeft <= 10 ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                  }`}>
                    <Timer className="w-4 h-4" />
                    <span>{timeLeft} сек</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {combo >= 2 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-black flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      Комбо x{combo}
                    </span>
                  )}
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    Счёт: {score}
                  </span>
                </div>
              </div>

              {(gameMode === 'classic' || gameMode === 'forms') && (
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-5">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>
              )}

              <p className="text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-base text-center mb-4">
                {currentQ.prompt}
              </p>

              <div className="flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 mb-5">
                {currentQ.displayLetter && (
                  <span className="font-arabic text-5xl sm:text-6xl font-bold text-emerald-600 dark:text-emerald-400" dir="rtl">
                    {currentQ.displayLetter}
                  </span>
                )}

                {currentQ.displayWord && (
                  <span className="font-arabic text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white leading-relaxed" dir="rtl">
                    {currentQ.displayWord}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  let btnClass = 'bg-white dark:bg-slate-800 border-b-4 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-emerald-500';

                  if (isAnswered) {
                    if (opt === currentQ.correctAnswer) {
                      btnClass = 'bg-emerald-100 border-b-4 border-emerald-500 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-bold';
                    } else if (isSelected && opt !== currentQ.correctAnswer) {
                      btnClass = 'bg-rose-100 border-b-4 border-rose-500 text-rose-900 dark:bg-rose-950 dark:text-rose-200';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(opt)}
                      disabled={isAnswered}
                      className={`p-3.5 sm:p-4 rounded-2xl border text-center transition-all active:scale-95 ${
                        currentQ.isArabicOptions
                          ? 'font-arabic text-3xl sm:text-4xl font-bold'
                          : 'font-mono text-xs sm:text-base font-extrabold'
                      } ${btnClass}`}
                      dir={currentQ.isArabicOptions ? 'rtl' : 'ltr'}
                    >
                      {currentQ.type === 'word-reading' ? `[${opt}]` : opt}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (gameMode === 'classic' || gameMode === 'forms') && (
                <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <strong>Пояснение:</strong> {currentQ.explanation}
                  </p>

                  <button
                    onClick={handleNext}
                    className="mt-3 w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md active:scale-95 transition-all"
                  >
                    {currentQuestion + 1 < questions.length ? 'Дальше →' : 'Показать итог'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 text-center shadow-xl">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
                <Sparkles className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {hearts <= 0 ? 'Игра окончена!' : 'Отличная партия!'}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Набрано очков: <strong className="text-emerald-600 text-2xl font-mono">{score}</strong>
              </p>

              <button
                onClick={() => initGameSession(gameMode)}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Играть ещё раз</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
