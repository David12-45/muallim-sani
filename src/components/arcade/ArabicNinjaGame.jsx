import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ALPHABET_DATA } from '../../data/alphabet';
import { ALL_WORDS } from '../../data/book';
import { transcribeArabic } from '../../services/transcribe';
import { audioService } from '../../services/audio';
import { soundFx } from '../../services/soundFx';
import { storageService } from '../../services/storage';
import {
  getUserKnowledgeProgress,
  getLettersForLevel,
  getWordsForLevel
} from '../../data/gameLevels';
import confetti from 'canvas-confetti';
import {
  Sword,
  Heart,
  Volume2,
  RotateCcw,
  Play,
  Trophy,
  Flame,
  Sparkles
} from 'lucide-react';

const HEAVY_LETTERS = ['خ', 'ص', 'ض', 'ط', 'ظ', 'غ', 'ق'];
const NON_CONNECTING = ['ا', 'د', 'ذ', 'ر', 'ز', 'و'];
const ONE_DOT_LETTERS = ['ب', 'ج', 'خ', 'ذ', 'ز', 'ض', 'ظ', 'غ', 'ف', 'ن'];

const NINJA_WORDS = ALL_WORDS.filter(w => {
  const tr = transcribeArabic(w);
  return tr && tr.length >= 2 && w.length >= 3 && w.length <= 7;
});

export default function ArabicNinjaGame({ level: propLevel }) {
  const canvasRef = useRef(null);

  const [levelInfo, setLevelInfo] = useState(() => propLevel || getUserKnowledgeProgress().currentLevel);

  useEffect(() => {
    if (propLevel) {
      setLevelInfo(propLevel);
    } else {
      const onLvl = () => setLevelInfo(getUserKnowledgeProgress().currentLevel);
      window.addEventListener('muallim-level-changed', onLvl);
      return () => window.removeEventListener('muallim-level-changed', onLvl);
    }
  }, [propLevel]);

  const levelLetters = getLettersForLevel(levelInfo);
  const levelWords = getWordsForLevel(levelInfo);

  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('muallim_ninja_hi') || 0));
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [round, setRound] = useState(1);
  const [mission, setMission] = useState(null);

  const stateRef = useRef({
    orbs: [],
    halves: [],
    particles: [],
    bladeTrail: [],
    floatingTexts: [],
    isSwiping: false,
    lastSpawn: 0,
    score: 0,
    lives: 3,
    combo: 0,
    round: 1,
    slicedInRound: 0,
    mission: null
  });

  // Создаём задание раунда с учётом уровня знаний
  const pickMission = useCallback((roundNum = 1) => {
    // Если уровень начальный (1-2), фокусируемся на изученных буквах
    const isEarlyAlphabet = levelInfo?.category === 'alphabet' && (levelInfo?.letterIds?.length || 28) <= 11;
    const types = isEarlyAlphabet
      ? ['letter_forms', 'letter_forms', 'non_connecting']
      : ['letter_forms', 'non_connecting', 'heavy', 'one_dot', 'word'];

    const chosenType = types[(roundNum - 1) % types.length];
    const letterPool = levelLetters.length > 0 ? levelLetters : ALPHABET_DATA;

    let newMission;
    if (chosenType === 'letter_forms') {
      const letter = letterPool[Math.floor(Math.random() * letterPool.length)];
      const valid = letter.forms
        ? Array.from(new Set([
            letter.arabic,
            letter.forms.isolated,
            letter.forms.initial,
            letter.forms.medial,
            letter.forms.final
          ]))
        : [letter.arabic];

      newMission = {
        type: 'letter_forms',
        title: `Разруби все формы буквы «${letter.name}» (${letter.arabic})`,
        subtitle: `Начальная, срединная, конечная и отдельная формы [${letter.transcription}] (${levelInfo?.shortTitle})`,
        letterObj: letter,
        check: (txt) => valid.includes(txt),
        getCorrectSample: () => valid[Math.floor(Math.random() * valid.length)],
        getWrongSample: () => {
          const others = letterPool.filter(l => l.id !== letter.id);
          const o = (others.length > 0 ? others : ALPHABET_DATA)[Math.floor(Math.random() * (others.length || ALPHABET_DATA.length))];
          return o.forms ? o.forms.medial : o.arabic;
        }
      };
      audioService.playLetter(letter.arabic);
    } else if (chosenType === 'non_connecting') {
      const levelNonConnecting = NON_CONNECTING.filter(c => letterPool.some(l => l.arabic === c));
      const targetNonConn = levelNonConnecting.length > 0 ? levelNonConnecting : NON_CONNECTING;

      newMission = {
        type: 'non_connecting',
        title: 'Разруби только НЕСОЕДИНЯЕМЫХ буквы!',
        subtitle: `Буквы, которые не соединяются влево (${targetNonConn.join(' ')})`,
        check: (txt) => targetNonConn.includes(txt),
        getCorrectSample: () => targetNonConn[Math.floor(Math.random() * targetNonConn.length)],
        getWrongSample: () => {
          const conn = letterPool.filter(l => l.connectsLeft);
          return (conn.length > 0 ? conn : ALPHABET_DATA)[Math.floor(Math.random() * (conn.length || ALPHABET_DATA.length))].arabic;
        }
      };
    } else if (chosenType === 'heavy') {
      newMission = {
        type: 'heavy',
        title: 'Разруби только ТВЁРДЫЕ буквы (Исти’ля)!',
        subtitle: '7 твёрдых букв: خ ص ض ط ظ غ ق',
        check: (txt) => HEAVY_LETTERS.includes(txt),
        getCorrectSample: () => HEAVY_LETTERS[Math.floor(Math.random() * HEAVY_LETTERS.length)],
        getWrongSample: () => {
          const soft = letterPool.filter(l => !HEAVY_LETTERS.includes(l.arabic));
          return (soft.length > 0 ? soft : ALPHABET_DATA)[Math.floor(Math.random() * (soft.length || ALPHABET_DATA.length))].arabic;
        }
      };
    } else if (chosenType === 'one_dot') {
      newMission = {
        type: 'one_dot',
        title: 'Разруби буквы с ОДНОЙ ТОЧКОЙ!',
        subtitle: 'Буквы, имеющие ровно 1 точку сверху или снизу (ب ج خ ذ ز ض ظ غ ف ن)',
        check: (txt) => ONE_DOT_LETTERS.includes(txt),
        getCorrectSample: () => ONE_DOT_LETTERS[Math.floor(Math.random() * ONE_DOT_LETTERS.length)],
        getWrongSample: () => {
          const multi = ['ت', 'ث', 'ق', 'ي', 'ش', 'س', 'ص', 'ط', 'ع', 'ل', 'م', 'هـ'];
          return multi[Math.floor(Math.random() * multi.length)];
        }
      };
    } else {
      const wordPool = levelWords.length > 0 ? levelWords : ['كَتَبَ', 'دَرَسَ', 'وَجَدَ'];
      const word = wordPool[Math.floor(Math.random() * wordPool.length)] || 'كَتَبَ';
      const tr = transcribeArabic(word);
      newMission = {
        type: 'word',
        title: `Разруби слово: [${tr}]`,
        subtitle: `Прочитайте арабское слово на лету и разрубите правильное! (${levelInfo?.shortTitle})`,
        check: (txt) => txt === word,
        getCorrectSample: () => word,
        getWrongSample: () => {
          const others = wordPool.filter(w => w !== word);
          return (others.length > 0 ? others : wordPool)[Math.floor(Math.random() * (others.length || wordPool.length))] || 'ذَهَبَ';
        }
      };
    }

    stateRef.current.mission = newMission;
    setMission(newMission);
  }, [levelInfo, levelLetters, levelWords]);

  const startGame = () => {
    soundFx.playTap();
    stateRef.current = {
      orbs: [],
      halves: [],
      particles: [],
      bladeTrail: [],
      floatingTexts: [],
      isSwiping: false,
      lastSpawn: performance.now(),
      score: 0,
      lives: 3,
      combo: 0,
      round: 1,
      slicedInRound: 0,
      mission: null
    };

    setScore(0);
    setLives(3);
    setCombo(0);
    setRound(1);
    setGameOver(false);
    setIsPlaying(true);
    pickMission(1);
  };

  // Разрубание сферы по координатам меча
  const checkSliceAt = (px, py) => {
    const s = stateRef.current;
    if (!s.mission) return;

    for (let i = s.orbs.length - 1; i >= 0; i--) {
      const orb = s.orbs[i];
      const dist = Math.hypot(orb.x - px, orb.y - py);
      if (dist <= orb.radius + 14) {
        // Сфера разрублена!
        s.orbs.splice(i, 1);
        soundFx.playSlice();

        // Создаём 2 разлетающиеся половинки
        s.halves.push(
          {
            x: orb.x - 10,
            y: orb.y,
            vx: orb.vx - 2.5,
            vy: orb.vy - 1.5,
            radius: orb.radius,
            text: orb.text,
            color: orb.isCorrect ? '#10b981' : '#f43f5e',
            side: 'left',
            life: 1.0
          },
          {
            x: orb.x + 10,
            y: orb.y,
            vx: orb.vx + 2.5,
            vy: orb.vy - 1.5,
            radius: orb.radius,
            text: orb.text,
            color: orb.isCorrect ? '#10b981' : '#f43f5e',
            side: 'right',
            life: 1.0
          }
        );

        // Искры
        for (let k = 0; k < 15; k++) {
          const ang = Math.random() * Math.PI * 2;
          const spd = Math.random() * 4.5 + 1.5;
          s.particles.push({
            x: orb.x,
            y: orb.y,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            color: orb.isBomb ? '#ef4444' : orb.isCorrect ? '#34d399' : '#fbbf24',
            radius: Math.random() * 3.5 + 1.5,
            life: 1.0
          });
        }

        if (orb.isBomb || !orb.isCorrect) {
          soundFx.playError();
          s.combo = 0;
          s.lives -= 1;
          setCombo(0);
          setLives(s.lives);
          s.floatingTexts.push({
            x: orb.x,
            y: orb.y,
            text: orb.isBomb ? 'БОМБА! -1 ❤️' : 'НЕ ТА БУКВА! -1 ❤️',
            color: '#fb7185',
            life: 1.1
          });

          if (s.lives <= 0) {
            finishGame(s.score);
            return;
          }
        } else {
          soundFx.playSuccess();
          s.combo += 1;
          const pts = 25 + Math.min(35, s.combo * 5);
          s.score += pts;
          s.slicedInRound += 1;

          setScore(s.score);
          setCombo(s.combo);

          s.floatingTexts.push({
            x: orb.x,
            y: orb.y,
            text: `+${pts} ⚔️ ${s.combo >= 3 ? `x${s.combo}` : ''}`,
            color: '#34d399',
            life: 1.0
          });

          if (s.slicedInRound >= 5) {
            s.slicedInRound = 0;
            s.round += 1;
            setRound(s.round);
            storageService.addXp(20);
            pickMission(s.round);
            s.floatingTexts.push({
              x: 380,
              y: 220,
              text: `РАУНД ${s.round}! НОВОЕ ЗАДАНИЕ!`,
              color: '#fbbf24',
              life: 1.4
            });
          }
        }
      }
    }
  };

  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const handlePointerDown = (e) => {
    if (!isPlaying || gameOver) return;
    stateRef.current.isSwiping = true;
    const pt = getCanvasPoint(e);
    stateRef.current.bladeTrail.push({ ...pt, life: 1.0 });
    checkSliceAt(pt.x, pt.y);
  };

  const handlePointerMove = (e) => {
    if (!isPlaying || gameOver) return;
    const pt = getCanvasPoint(e);
    stateRef.current.bladeTrail.push({ ...pt, life: 1.0 });
    if (stateRef.current.bladeTrail.length > 18) {
      stateRef.current.bladeTrail.shift();
    }
    checkSliceAt(pt.x, pt.y);
  };

  const handlePointerUp = () => {
    stateRef.current.isSwiping = false;
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    let animId;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const spawnWaveBatch = () => {
      const s = stateRef.current;
      if (!s.mission) return;
      const W = canvas.width;
      const H = canvas.height;

      // Подбрасываем 2 или 3 сферы снизу вверх по параболе
      const count = Math.random() < 0.55 ? 2 : 3;
      for (let i = 0; i < count; i++) {
        const roll = Math.random();
        let isBomb = false;
        let isCorrect = false;
        let text = '';

        if (roll < 0.14) {
          isBomb = true;
          text = '💣';
        } else if (roll < 0.62) {
          isCorrect = true;
          text = s.mission.getCorrectSample();
        } else {
          isCorrect = false;
          text = s.mission.getWrongSample();
        }

        const x = 100 + Math.random() * (W - 200);
        const targetPeakY = 75 + Math.random() * 130;
        const gravity = 0.21;
        const vy = -Math.sqrt(2 * gravity * (H - targetPeakY));
        const vx = ((W / 2 - x) / 95) + (Math.random() - 0.5) * 2.2;

        s.orbs.push({
          x,
          y: H + 35,
          vx,
          vy,
          gravity,
          radius: 38,
          text,
          isCorrect,
          isBomb,
          angle: 0,
          spin: (Math.random() - 0.5) * 0.04
        });
      }
    };

    const loop = (now) => {
      const s = stateRef.current;
      const W = canvas.width;
      const H = canvas.height;

      // 1. Фон восточного додзё
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#13071e');
      bg.addColorStop(0.5, '#1e1035');
      bg.addColorStop(1, '#0f172a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Декоративные линии додзё
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 2;
      for (let x = 80; x < W; x += 120) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      // 2. Спавн партий сфер
      if (now - s.lastSpawn > 1850) {
        s.lastSpawn = now;
        spawnWaveBatch();
      }

      // 3. Обновление и отрисовка подброшенных сфер
      for (let i = s.orbs.length - 1; i >= 0; i--) {
        const orb = s.orbs[i];
        orb.x += orb.vx;
        orb.y += orb.vy;
        orb.vy += orb.gravity;
        orb.angle += orb.spin;

        if (orb.y > H + 75 && orb.vy > 0) {
          s.orbs.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(orb.x, orb.y);

        const grad = ctx.createRadialGradient(-8, -8, 5, 0, 0, orb.radius);
        if (orb.isBomb) {
          grad.addColorStop(0, '#7f1d1d');
          grad.addColorStop(1, '#450a0a');
          ctx.strokeStyle = '#ef4444';
        } else {
          grad.addColorStop(0, '#1e293b');
          grad.addColorStop(1, '#090d16');
          ctx.strokeStyle = '#f59e0b';
        }

        ctx.fillStyle = grad;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, orb.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = orb.isBomb
          ? '30px sans-serif'
          : 'bold 34px "Scheherazade New", "Amiri", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(orb.text, 0, 3);
        ctx.restore();
      }

      // 4. Отрисовка разрубленных половинок
      for (let i = s.halves.length - 1; i >= 0; i--) {
        const h = s.halves[i];
        h.x += h.vx;
        h.y += h.vy;
        h.vy += 0.28;
        h.life -= 0.028;
        if (h.life <= 0) {
          s.halves.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, h.life);
        ctx.translate(h.x, h.y);
        ctx.strokeStyle = h.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(
          0,
          0,
          h.radius * 0.75,
          h.side === 'left' ? Math.PI * 0.5 : -Math.PI * 0.5,
          h.side === 'left' ? Math.PI * 1.5 : Math.PI * 0.5
        );
        ctx.stroke();
        ctx.restore();
      }

      // 5. Частицы
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.032;
        if (p.life <= 0) {
          s.particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 6. След катаны (Blade Trail)
      if (s.bladeTrail.length > 1) {
        ctx.save();
        for (let i = 1; i < s.bladeTrail.length; i++) {
          const p1 = s.bladeTrail[i - 1];
          const p2 = s.bladeTrail[i];
          ctx.strokeStyle = `rgba(52, 211, 153, ${p2.life})`;
          ctx.lineWidth = p2.life * 7;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        ctx.restore();
      }
      for (let i = s.bladeTrail.length - 1; i >= 0; i--) {
        s.bladeTrail[i].life -= 0.08;
        if (s.bladeTrail[i].life <= 0) s.bladeTrail.splice(i, 1);
      }

      // 7. Всплывающий текст
      for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
        const ft = s.floatingTexts[i];
        ft.y -= 1.2;
        ft.life -= 0.022;
        if (ft.life <= 0) {
          s.floatingTexts.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.life);
        ctx.font = 'extrabold 16px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, gameOver, pickMission]);

  const finishGame = (finalScore) => {
    setGameOver(true);
    setIsPlaying(false);
    soundFx.playFanfare();
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('muallim_ninja_hi', String(finalScore));
    }
    if (finalScore >= 50) {
      storageService.addXp(Math.min(100, Math.round(finalScore / 3)));
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden text-white">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Sword className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black flex items-center gap-2">
              <span>Арабский Ниндзя</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                {levelInfo?.shortTitle || `Ур. ${levelInfo?.id}`}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                Раунд {round}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Проводите мышкой или пальцем по подлетающим сферам, чтобы разрубить правильные буквы!
            </p>
          </div>
        </div>

        {/* Stats */}
        {isPlaying && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-950/70 border border-rose-800/60">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Heart
                  key={idx}
                  className={`w-4 h-4 ${
                    idx < lives ? 'fill-rose-500 text-rose-500' : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
            {combo >= 2 && (
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-black">
                🔥 x{combo}
              </span>
            )}
            <div className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-black text-emerald-400">
              Счёт: {score}
            </div>
          </div>
        )}
      </div>

      {/* Active Mission Banner */}
      {isPlaying && mission && (
        <div className="px-4 py-3 bg-gradient-to-r from-purple-950/90 via-indigo-950/90 to-slate-900 border-b border-purple-800/40 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-2">
              <span>⚔️ {mission.title}</span>
              {mission.letterObj && (
                <button
                  onClick={() => audioService.playLetter(mission.letterObj.arabic)}
                  className="p-1.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-xs text-purple-200/80">{mission.subtitle}</p>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="relative flex justify-center bg-[#13071e]">
        <canvas
          ref={canvasRef}
          width={760}
          height={480}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full max-w-[760px] h-[400px] sm:h-[480px] cursor-crosshair touch-none select-none block"
        />

        {(!isPlaying || gameOver) && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            {gameOver ? (
              <>
                <Trophy className="w-16 h-16 text-amber-400 mb-3 animate-bounce" />
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Тренировка Ниндзя окончена!
                </h2>
                <p className="text-emerald-400 font-mono text-lg font-extrabold mt-1">
                  Очки: {score} • Рекорд: {highScore}
                </p>
                <button
                  onClick={startGame}
                  className="mt-6 px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-sm sm:text-base shadow-xl flex items-center gap-2 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Сыграть ещё раз ⚔️</span>
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-slate-950 shadow-2xl mb-4">
                  <Sword className="w-10 h-10" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Арабский Ниндзя
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md leading-relaxed">
                  Снизу вылетают арабские буквы, формы и слова. Разрубайте взмахом меча только те сферы, которые подходят под правило раунда, и не задевайте бомбы 💣!
                </p>
                <button
                  onClick={startGame}
                  className="mt-6 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-sm sm:text-base shadow-xl flex items-center gap-2.5 active:scale-95 transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Обнажить клинок ⚔️</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
