import React, { useState, useEffect } from 'react';
import { splitIntoClusters, analyzeArabicWord } from '../services/wordAnalyzer';
import { transcribeArabic } from '../services/transcribe';
import { storageService } from '../services/storage';
import { soundFx } from '../services/soundFx';
import confetti from 'canvas-confetti';
import {
  Puzzle,
  Heart,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Zap,
  Star
} from 'lucide-react';

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const EXTRA_DECOY_FORMS = [
  { text: 'بَـ', posLabel: 'в нач.' },
  { text: 'ـتِـ', posLabel: 'в сер.' },
  { text: 'ـنُ', posLabel: 'в конце' },
  { text: 'مَـ', posLabel: 'в нач.' },
  { text: 'ـرْ', posLabel: 'в конце' },
  { text: 'زَ', posLabel: 'в нач.' },
  { text: 'كَـ', posLabel: 'в нач.' },
  { text: 'ـلِـ', posLabel: 'в сер.' },
  { text: 'فَـ', posLabel: 'в нач.' },
  { text: 'ـقُ', posLabel: 'в конце' },
  { text: 'سَـ', posLabel: 'в нач.' },
  { text: 'ـشِـ', posLabel: 'в сер.' },
  { text: 'يَـ', posLabel: 'в нач.' },
  { text: 'ـعَـ', posLabel: 'в сер.' }
];

export default function WordBuilderGame({ lesson, onCompleteGame }) {
  const [rounds, setRounds] = useState([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [placedClusters, setPlacedClusters] = useState([]);
  const [availableTiles, setAvailableTiles] = useState([]);
  const [hearts, setHearts] = useState(3);
  const [combo, setCombo] = useState(0);
  const [wrongTileId, setWrongTileId] = useState(null);
  const [roundWon, setRoundWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  const initGame = () => {
    const rawWords = [];
    if (lesson?.rows) {
      lesson.rows.forEach(r => {
        r.trim().split(/\s+/).forEach(w => {
          const clean = w.replace(/[()=]/g, '').trim();
          if (clean) rawWords.push(clean);
        });
      });
    }
    if (lesson?.pairs) {
      lesson.pairs.forEach(([a, b]) => {
        if (a && !a.includes(' ')) rawWords.push(a.trim());
        if (b && !b.includes(' ')) rawWords.push(b.trim());
      });
    }

    const unique = Array.from(new Set(rawWords));
    const multiLetter = unique.filter(w => splitIntoClusters(w).length >= 2);
    const pool = multiLetter.length >= 3 ? multiLetter : unique;

    const selected = shuffle(pool).slice(0, Math.min(5, pool.length));
    setRounds(selected);
    setRoundIdx(0);
    setHearts(3);
    setCombo(0);
    setGameOver(false);
    setGameFinished(false);

    if (selected.length > 0) {
      setupRound(selected[0]);
    }
  };

  const setupRound = (targetWord) => {
    const analyzedLetters = analyzeArabicWord(targetWord).letters;
    const requiredForms = analyzedLetters.map(l => l.displayForm);

    const decoys = shuffle(
      EXTRA_DECOY_FORMS.filter(d => !requiredForms.includes(d.text))
    ).slice(0, Math.min(3, Math.max(2, 6 - analyzedLetters.length)));

    const tiles = shuffle([
      ...analyzedLetters.map((l, i) => ({
        id: `req-${i}-${l.displayForm}`,
        text: l.displayForm,
        rawCluster: l.rawCluster,
        posLabel: l.shortPositionLabel,
        requiredIndex: i
      })),
      ...decoys.map((d, i) => ({
        id: `decoy-${i}-${d.text}`,
        text: d.text,
        rawCluster: d.text,
        posLabel: d.posLabel,
        requiredIndex: -1
      }))
    ]);

    setPlacedClusters([]);
    setAvailableTiles(tiles);
    setWrongTileId(null);
    setRoundWon(false);
  };

  useEffect(() => {
    initGame();
  }, [lesson?.id]);

  if (rounds.length === 0) return null;

  const currentWord = rounds[roundIdx];
  const targetLetters = analyzeArabicWord(currentWord).letters;
  const targetTranscription = transcribeArabic(currentWord);

  const handleTapTile = (tile) => {
    if (roundWon || gameOver) return;

    const nextNeededIdx = placedClusters.length;
    const expectedLetter = targetLetters[nextNeededIdx];

    if (expectedLetter && tile.text === expectedLetter.displayForm) {
      soundFx.playSuccess();
      const nextPlaced = [...placedClusters, tile];
      setPlacedClusters(nextPlaced);
      setAvailableTiles(prev => prev.filter(t => t.id !== tile.id));
      setCombo(c => c + 1);
      storageService.addXp(5);

      if (nextPlaced.length === targetLetters.length) {
        setRoundWon(true);
      }
    } else {
      soundFx.playError();
      setWrongTileId(tile.id);
      setCombo(0);
      const nextHearts = hearts - 1;
      setHearts(nextHearts);
      setTimeout(() => setWrongTileId(null), 500);

      if (nextHearts <= 0) {
        setGameOver(true);
      }
    }
  };

  const handleNextRound = () => {
    if (roundIdx + 1 < rounds.length) {
      soundFx.playTap();
      const nextIdx = roundIdx + 1;
      setRoundIdx(nextIdx);
      setupRound(rounds[nextIdx]);
    } else {
      setGameFinished(true);
      storageService.addXp(35);
      soundFx.playFanfare();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      if (onCompleteGame) onCompleteGame();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-7 border-2 border-emerald-500/30 dark:border-emerald-500/20 shadow-lg mb-6">
      {/* Top Game Status Bar */}
      <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Puzzle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              Собери слово по буквам
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Слово {roundIdx + 1} из {rounds.length} • Справа налево ← (с учётом формы буквы в слове)
            </p>
          </div>
        </div>

        {/* Hearts & Combo */}
        <div className="flex items-center gap-2">
          {combo >= 2 && (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-black flex items-center gap-1 animate-bounce">
              <Zap className="w-3.5 h-3.5 fill-current" />
              x{combo}
            </span>
          )}
          <div className="flex items-center gap-0.5 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-800/50">
            {[1, 2, 3].map(h => (
              <Heart
                key={h}
                className={`w-4 h-4 transition-all ${
                  h <= hearts
                    ? 'fill-rose-500 text-rose-500 scale-100'
                    : 'text-slate-300 dark:text-slate-600 scale-90'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Game Over State */}
      {gameOver ? (
        <div className="py-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Закончились жизни!
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Правильное слово было: <strong className="font-arabic text-2xl text-emerald-600 mx-1">{currentWord}</strong> [{targetTranscription}]
          </p>
          <button
            onClick={initGame}
            className="mt-5 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Попробовать снова</span>
          </button>
        </div>
      ) : gameFinished ? (
        <div className="py-8 text-center">
          <div className="flex justify-center gap-1.5 mb-3">
            {[1, 2, 3].map(s => (
              <Star key={s} className="w-9 h-9 fill-amber-400 text-amber-500 animate-bounce" />
            ))}
          </div>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white">
            МашаАллах! Все слова собраны!
          </h4>
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            +35 XP бонус за прохождение мини-игры!
          </p>
          <button
            onClick={initGame}
            className="mt-5 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm inline-flex items-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Сыграть ещё раз с новыми словами</span>
          </button>
        </div>
      ) : (
        <>
          {/* Target Prompt Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 dark:from-slate-900/70 dark:to-emerald-950/20 border border-slate-200/80 dark:border-slate-700 text-center mb-5">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
              Соберите по буквам слово с чтением (справа налево ←):
            </p>
            <span className="inline-block text-2xl sm:text-3xl font-mono font-black text-emerald-800 dark:text-emerald-300 bg-white dark:bg-slate-800 px-5 py-2.5 rounded-2xl border border-emerald-200 dark:border-slate-700 shadow-sm">
              [{targetTranscription}]
            </span>
          </div>

          {/* Answer Slots (Right-to-Left) */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center justify-center gap-2.5 min-h-[76px] p-3 rounded-2xl bg-[#FAF7F0] dark:bg-slate-900/80 border-2 border-dashed border-emerald-300 dark:border-slate-700" dir="rtl">
              {targetLetters.map((_, idx) => {
                const placed = placedClusters[idx];
                const isNextSlot = idx === placedClusters.length;
                return (
                  <div
                    key={idx}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center transition-all ${
                      placed
                        ? 'bg-emerald-600 text-white shadow-md scale-100 border-2 border-emerald-500'
                        : isNextSlot
                        ? 'bg-emerald-50 dark:bg-slate-800 border-2 border-emerald-400 animate-pulse'
                        : 'bg-white/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {placed ? (
                      <span className="font-arabic text-3xl sm:text-4xl font-bold leading-relaxed">
                        {placed.text}
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Round Won Celebration or Letter Tiles to Tap */}
          {roundWon ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-extrabold text-emerald-950 dark:text-emerald-200">
                    Правильно! Слово целиком:
                  </p>
                  <p className="font-arabic text-3xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5" dir="rtl">
                    {currentWord} <span className="text-sm font-mono text-slate-600 dark:text-slate-300" dir="ltr">[{targetTranscription}]</span>
                  </p>
                </div>
              </div>

              <button
                onClick={handleNextRound}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
              >
                <span>{roundIdx + 1 < rounds.length ? 'Следующее слово' : 'Забрать награду'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-2.5">
                Нажимайте на буквы по порядку справа налево (буква №{placedClusters.length + 1}):
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5" dir="rtl">
                {availableTiles.map((tile) => {
                  const isWrong = wrongTileId === tile.id;
                  return (
                    <button
                      key={tile.id}
                      onClick={() => handleTapTile(tile)}
                      className={`h-16 sm:h-20 rounded-2xl border-b-4 font-arabic text-3xl sm:text-4xl font-bold flex items-center justify-center transition-all active:translate-y-0.5 select-none ${
                        isWrong
                          ? 'bg-rose-500 text-white border-rose-700 scale-95'
                          : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-200 dark:border-slate-900 hover:border-emerald-500 hover:bg-emerald-50/50 shadow-sm'
                      }`}
                    >
                      {tile.text}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
