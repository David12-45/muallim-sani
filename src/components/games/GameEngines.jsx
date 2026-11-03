// Универсальные «движки» обучающих игр: раунды с вариантами ответа и сбор последовательности
import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Volume2, RotateCcw, Trophy, ArrowLeft, Lightbulb, Star, CheckCircle2 } from 'lucide-react';
import { audioService } from '../../services/audio';
import { soundFx } from '../../services/soundFx';
import { storageService } from '../../services/storage';
import { recordAnswer, uniq, iso } from './gameData';

function GameHeader({ title, skill, onExit, hearts, maxHearts, idx, total, score }) {
  return (
    <div className="space-y-3 mb-4">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> К играм
        </button>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-800">
          {Array.from({ length: maxHearts }).map((_, h) => (
            <Heart
              key={h}
              className={`w-4 h-4 ${h < hearts ? 'fill-rose-500 text-rose-500' : 'text-slate-300 dark:text-slate-600'}`}
            />
          ))}
        </div>
        <span className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
          ✓ {score}
        </span>
      </div>
      <div>
        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{title}</h2>
        {skill && <p className="text-xs text-slate-500 dark:text-slate-400">{skill}</p>}
      </div>
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${(idx / total) * 100}%` }} />
      </div>
    </div>
  );
}

function FinishScreen({ score, total, mistakes, onRestart, onExit }) {
  const acc = total ? score / total : 0;
  const stars = acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : acc > 0 ? 1 : 0;
  const review = uniq(mistakes.filter(Boolean).map(iso)).slice(0, 8);

  return (
    <div className="text-center py-4">
      <Trophy className="w-14 h-14 text-amber-400 mx-auto mb-3" />
      <h2 className="text-2xl font-black text-slate-900 dark:text-white">
        {acc >= 0.9 ? 'Машаллах, отлично!' : acc >= 0.6 ? 'Хороший результат!' : 'Продолжайте тренироваться!'}
      </h2>
      <div className="flex justify-center gap-1 my-3">
        {[1, 2, 3].map((s) => (
          <Star key={s} className={`w-8 h-8 ${s <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
        ))}
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Правильных ответов: <strong className="text-emerald-600">{score}</strong> из {total}
      </p>

      {review.length > 0 && (
        <div className="mt-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-left">
          <p className="text-xs font-extrabold text-amber-800 dark:text-amber-300 mb-2">
            📌 Повторите эти буквы — они будут чаще встречаться в следующих играх:
          </p>
          <div className="flex flex-wrap gap-2 justify-center" dir="rtl">
            {review.map((ch) => (
              <button
                key={ch}
                onClick={() => audioService.playLetter(ch)}
                className="w-14 h-14 rounded-xl bg-white dark:bg-slate-900 border-2 border-amber-300 dark:border-amber-700 font-arabic text-3xl font-bold text-slate-900 dark:text-white active:scale-95"
                title="Прослушать"
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
        <button
          onClick={onRestart}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg active:scale-95"
        >
          <RotateCcw className="w-4 h-4" /> Ещё раз
        </button>
        <button
          onClick={onExit}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Другие игры
        </button>
      </div>
    </div>
  );
}

function finishEffects(score, total) {
  storageService.addXp(score * 3);
  soundFx.playFanfare();
  if (total && score / total >= 0.8) {
    confetti({ particleCount: 110, spread: 75, origin: { y: 0.6 } });
  }
}

/**
 * Игра из раундов с вариантами ответа.
 * makeRound(prevRound) → { prompt, display, options:[{key,label,arabic}], correct, explanation, letter, audio, tips }
 */
export function RoundGame({ title, skill, makeRound, totalRounds = 10, maxHearts = 3, onExit }) {
  const [round, setRound] = useState(null);
  const [idx, setIdx] = useState(0);
  const [hearts, setHearts] = useState(maxHearts);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [mistakes, setMistakes] = useState([]);
  const [finished, setFinished] = useState(false);
  const answeredCount = useRef(0);

  const restart = () => {
    setIdx(0);
    setHearts(maxHearts);
    setScore(0);
    setSelected(null);
    setMistakes([]);
    setFinished(false);
    answeredCount.current = 0;
    setRound(makeRound(null));
  };

  useEffect(() => { restart(); }, []);

  useEffect(() => {
    if (!round?.audio) return undefined;
    const t = setTimeout(() => audioService.playLetter(round.audio), 300);
    return () => clearTimeout(t);
  }, [round]);

  if (!round) return null;

  const answer = (opt) => {
    if (selected !== null) return;
    setSelected(opt.key);
    answeredCount.current += 1;
    const correct = opt.key === round.correct;
    recordAnswer(round.letter, correct);
    if (round.revealAudio) {
      setTimeout(() => audioService.speakArabic(round.revealAudio), 350);
    }
    if (correct) {
      soundFx.playSuccess();
      setScore((s) => s + 1);
      storageService.addXp(5);
    } else {
      soundFx.playError();
      setHearts((h) => h - 1);
      setMistakes((m) => [...m, round.letter]);
    }
  };

  const next = () => {
    if (hearts <= 0 || idx + 1 >= totalRounds) {
      setFinished(true);
      finishEffects(score, answeredCount.current);
      return;
    }
    soundFx.playTap();
    setIdx((i) => i + 1);
    setSelected(null);
    setRound(makeRound(round));
  };

  if (finished) {
    return (
      <FinishScreen score={score} total={answeredCount.current} mistakes={mistakes} onRestart={restart} onExit={onExit} />
    );
  }

  const isCorrect = selected === round.correct;
  const wrongTip = selected !== null && !isCorrect ? round.tips?.[selected] : null;
  const longLabels = round.options.some((o) => !o.arabic && o.label.length > 14);

  return (
    <div>
      <GameHeader
        title={title}
        skill={skill}
        onExit={onExit}
        hearts={hearts}
        maxHearts={maxHearts}
        idx={idx + (selected !== null ? 1 : 0)}
        total={totalRounds}
        score={score}
      />

      <p className="text-slate-700 dark:text-slate-200 font-bold text-sm sm:text-base text-center mb-3">{round.prompt}</p>

      <div className="relative flex flex-col items-center justify-center min-h-[140px] p-5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 mb-4">
        {round.display}
        {round.audio && (
          <button
            onClick={() => audioService.playLetter(round.audio)}
            className="absolute top-2 right-2 p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 active:scale-95"
            title="Прослушать ещё раз"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className={`grid ${longLabels ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2'} gap-2.5`}>
        {round.options.map((opt) => {
          let cls = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-emerald-500';
          if (selected !== null) {
            if (opt.key === round.correct) cls = 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200';
            else if (opt.key === selected) cls = 'bg-rose-100 dark:bg-rose-950 border-rose-500 text-rose-900 dark:text-rose-200';
            else cls += ' opacity-60';
          }
          return (
            <button
              key={opt.key}
              onClick={() => answer(opt)}
              disabled={selected !== null}
              dir={opt.arabic ? 'rtl' : 'ltr'}
              className={`p-3 sm:p-4 rounded-2xl border-2 border-b-4 text-center transition-all active:scale-95 ${
                opt.arabic ? 'font-arabic text-4xl sm:text-5xl font-bold leading-normal' : 'text-sm sm:text-base font-extrabold'
              } ${cls}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className={`mt-4 p-4 rounded-2xl border ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'}`}>
          <p className="text-sm font-black mb-1 text-slate-900 dark:text-white">
            {isCorrect ? '✅ Верно!' : '❌ Не совсем'}
          </p>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">{round.explanation}</p>
          {round.revealAudio && audioService.hasAudio(round.revealAudio) && (
            <button
              onClick={() => audioService.speakArabic(round.revealAudio)}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold active:scale-95"
            >
              <Volume2 className="w-4 h-4" /> Послушать ещё раз
            </button>
          )}
          {wrongTip && (
            <p className="mt-2 text-xs sm:text-sm text-amber-800 dark:text-amber-300 flex gap-1.5">
              <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" /> <span>{wrongTip}</span>
            </p>
          )}
          <button
            onClick={next}
            className="mt-3 w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md active:scale-95"
          >
            {hearts <= 0 || idx + 1 >= totalRounds ? 'Показать итог' : 'Дальше →'}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Игра «собери последовательность»: нажимать плитки в правильном порядке.
 * makeRound(prevRound) → { prompt, display, target:[char], pool:[{id,char}], explanation, dir, slotHint }
 */
export function SequenceGame({ title, skill, makeRound, totalRounds = 8, maxHearts = 5, onExit }) {
  const [round, setRound] = useState(null);
  const [idx, setIdx] = useState(0);
  const [pos, setPos] = useState(0);
  const [used, setUsed] = useState([]);
  const [wrongId, setWrongId] = useState(null);
  const [roundErrors, setRoundErrors] = useState(0);
  const [hearts, setHearts] = useState(maxHearts);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState([]);
  const [finished, setFinished] = useState(false);
  const played = useRef(0);

  const newRound = (prev) => {
    setRound(makeRound(prev));
    setPos(0);
    setUsed([]);
    setWrongId(null);
    setRoundErrors(0);
  };

  const restart = () => {
    setIdx(0);
    setHearts(maxHearts);
    setScore(0);
    setMistakes([]);
    setFinished(false);
    played.current = 0;
    newRound(null);
  };

  useEffect(() => { restart(); }, []);

  if (!round) return null;
  const done = pos >= round.target.length;

  const tap = (item) => {
    if (done || used.includes(item.id) || hearts <= 0) return;
    const expected = round.target[pos];
    if (item.char === expected) {
      const nextPos = pos + 1;
      setUsed((u) => [...u, item.id]);
      setPos(nextPos);
      audioService.playLetter(item.char);
      if (nextPos >= round.target.length) {
        played.current += 1;
        soundFx.playSuccess();
        if (round.doneAudio) setTimeout(() => audioService.speakArabic(round.doneAudio), 700);
        storageService.addXp(10);
        if (roundErrors === 0) setScore((s) => s + 1);
        round.target.forEach((c) => recordAnswer(round.letterOf?.(c), roundErrors === 0));
      }
    } else {
      soundFx.playError();
      setWrongId(item.id);
      setTimeout(() => setWrongId(null), 500);
      setRoundErrors((e) => e + 1);
      setMistakes((m) => [...m, round.letterOf?.(expected)]);
      recordAnswer(round.letterOf?.(expected), false);
      const h = hearts - 1;
      setHearts(h);
      if (h <= 0) {
        played.current += 1;
        setTimeout(() => {
          setFinished(true);
          finishEffects(score, played.current);
        }, 700);
      }
    }
  };

  const next = () => {
    if (idx + 1 >= totalRounds) {
      setFinished(true);
      finishEffects(score, played.current);
      return;
    }
    soundFx.playTap();
    setIdx((i) => i + 1);
    newRound(round);
  };

  if (finished) {
    return (
      <FinishScreen score={score} total={played.current} mistakes={mistakes} onRestart={restart} onExit={onExit} />
    );
  }

  return (
    <div>
      <GameHeader
        title={title}
        skill={skill}
        onExit={onExit}
        hearts={hearts}
        maxHearts={maxHearts}
        idx={idx + (done ? 1 : 0)}
        total={totalRounds}
        score={score}
      />

      <p className="text-slate-700 dark:text-slate-200 font-bold text-sm sm:text-base text-center mb-3">{round.prompt}</p>

      <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 mb-4 gap-3">
        {round.display}
        <div className="flex flex-wrap justify-center gap-2" dir={round.dir || 'rtl'}>
          {round.target.map((c, i) => (
            <div
              key={i}
              className={`w-12 h-14 sm:w-14 sm:h-16 rounded-xl border-2 flex items-center justify-center font-arabic text-3xl font-bold transition-all ${
                i < pos
                  ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                  : i === pos && !done
                  ? 'border-amber-400 border-dashed text-amber-500 animate-pulse'
                  : 'border-slate-300 dark:border-slate-600 text-slate-300'
              }`}
            >
              {i < pos ? c : <span className="text-sm font-sans">{round.slotHint ? i + 1 : '?'}</span>}
            </div>
          ))}
        </div>
      </div>

      {!done ? (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2" dir="rtl">
          {round.pool.map((item) => {
            const isUsed = used.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => tap(item)}
                disabled={isUsed}
                className={`h-16 sm:h-20 rounded-2xl border-2 border-b-4 font-arabic text-4xl font-bold transition-all active:scale-95 ${
                  isUsed
                    ? 'opacity-20 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    : wrongId === item.id
                    ? 'bg-rose-500 text-white border-rose-700 animate-pulse'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-emerald-500'
                }`}
              >
                {item.char}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-4 rounded-2xl border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
          <p className="text-sm font-black mb-1 text-slate-900 dark:text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {roundErrors === 0 ? 'Без единой ошибки!' : `Собрано (ошибок: ${roundErrors})`}
          </p>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">{round.explanation}</p>
          {round.doneAudio && audioService.hasAudio(round.doneAudio) && (
            <button
              onClick={() => audioService.speakArabic(round.doneAudio)}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold active:scale-95"
            >
              <Volume2 className="w-4 h-4" /> Послушать слово
            </button>
          )}
          <button
            onClick={next}
            className="mt-3 w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md active:scale-95"
          >
            {idx + 1 >= totalRounds ? 'Показать итог' : 'Дальше →'}
          </button>
        </div>
      )}
    </div>
  );
}
