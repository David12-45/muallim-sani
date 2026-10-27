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
  Compass,
  Heart,
  Volume2,
  RotateCcw,
  Play,
  Trophy,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

const RUNNER_WORDS = ALL_WORDS.filter(w => {
  const tr = transcribeArabic(w);
  return tr && tr.length >= 2 && w.length >= 3 && w.length <= 7;
});

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function DesertRunnerGame({ level: propLevel }) {
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

  const [mode, setMode] = useState(() => (levelInfo?.category === 'words' ? 'words' : 'letters'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('muallim_runner_hi') || 0));
  const [lives, setLives] = useState(3);
  const [gatesPassed, setGatesPassed] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState(null);

  const runnerRef = useRef({
    lane: 1, // 0 = left, 1 = center, 2 = right
    visualX: 380,
    roadOffset: 0,
    speed: 3.4,
    gateRow: null,
    coins: [],
    particles: [],
    floatingTexts: [],
    score: 0,
    lives: 3,
    gatesPassed: 0
  });

  // Создаём новый ряд из 3 ворот с учётом уровня знаний
  const spawnGateRow = useCallback((currentMode = mode, currentSpeed = 3.4) => {
    if (currentMode === 'letters') {
      const pool = levelLetters.length > 0 ? levelLetters : ALPHABET_DATA;
      const target = pool[Math.floor(Math.random() * pool.length)];
      const otherPool = pool.filter(l => l.id !== target.id);
      const others = shuffle(otherPool.length >= 2 ? otherPool : ALPHABET_DATA).slice(0, 2);

      const laneItems = shuffle([
        { text: target.arabic, isCorrect: true },
        { text: others[0]?.arabic || 'ب', isCorrect: false },
        { text: others[1]?.arabic || 'ت', isCorrect: false }
      ]);

      const promptInfo = {
        title: `Буква «${target.name}» [${target.transcription}] (${levelInfo?.shortTitle})`,
        letterToPlay: target.arabic
      };
      setCurrentPrompt(promptInfo);
      audioService.playLetter(target.arabic);

      runnerRef.current.gateRow = {
        y: -70,
        resolved: false,
        gates: laneItems
      };
    } else {
      const pool = levelWords.length > 0 ? levelWords : ['كَتَبَ', 'دَرَسَ', 'وَجَدَ'];
      const targetWord = pool[Math.floor(Math.random() * pool.length)] || 'كَتَبَ';
      const tr = transcribeArabic(targetWord);
      const otherPool = pool.filter(w => w !== targetWord);
      const others = shuffle(otherPool.length >= 2 ? otherPool : RUNNER_WORDS).slice(0, 2);

      const laneItems = shuffle([
        { text: targetWord, isCorrect: true },
        { text: others[0] || 'ذَهَبَ', isCorrect: false },
        { text: others[1] || 'خَرَجَ', isCorrect: false }
      ]);

      setCurrentPrompt({
        title: `Направляйтесь в ворота: [${tr}] (${levelInfo?.shortTitle})`,
        letterToPlay: null
      });

      runnerRef.current.gateRow = {
        y: -70,
        resolved: false,
        gates: laneItems
      };
    }

    // Спавним монетки перед воротами
    const coinLane = Math.floor(Math.random() * 3);
    runnerRef.current.coins.push(
      { lane: coinLane, y: -210, collected: false },
      { lane: coinLane, y: -265, collected: false }
    );
  }, [mode]);

  const startGame = (chosenMode = mode) => {
    soundFx.playTap();
    runnerRef.current = {
      lane: 1,
      visualX: 380,
      roadOffset: 0,
      speed: 3.3,
      gateRow: null,
      coins: [],
      particles: [],
      floatingTexts: [],
      score: 0,
      lives: 3,
      gatesPassed: 0
    };

    setScore(0);
    setLives(3);
    setGatesPassed(0);
    setGameOver(false);
    setIsPlaying(true);
    spawnGateRow(chosenMode, 3.3);
  };

  const moveLane = (delta) => {
    const r = runnerRef.current;
    const next = Math.max(0, Math.min(2, r.lane + delta));
    if (next !== r.lane) {
      soundFx.playTap();
      r.lane = next;
    }
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!isPlaying || gameOver) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        moveLane(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        moveLane(1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPlaying, gameOver]);

  const handleCanvasClick = (e) => {
    if (!isPlaying || gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);

    if (clickX < canvas.width / 3) {
      runnerRef.current.lane = 0;
    } else if (clickX < (canvas.width * 2) / 3) {
      runnerRef.current.lane = 1;
    } else {
      runnerRef.current.lane = 2;
    }
    soundFx.playTap();
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    let animId;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const LANE_CENTERS = [190, 380, 570];

    const loop = () => {
      const r = runnerRef.current;
      const W = canvas.width;
      const H = canvas.height;
      const playerY = H - 72;

      // 1. Фон золотой пустыни по бокам и трассы по центру
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, 0, W, H);

      // Дорожное полотно (3 полосы от X=95 до X=665)
      const roadGrad = ctx.createLinearGradient(95, 0, 665, 0);
      roadGrad.addColorStop(0, '#0f172a');
      roadGrad.addColorStop(0.5, '#1e293b');
      roadGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = roadGrad;
      ctx.fillRect(95, 0, 570, H);

      // Бордюры трассы
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(95, 0);
      ctx.lineTo(95, H);
      ctx.moveTo(665, 0);
      ctx.lineTo(665, H);
      ctx.stroke();

      // Движущаяся разметка полос
      r.roadOffset = (r.roadOffset + r.speed) % 60;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 3;
      ctx.setLineDash([28, 32]);
      ctx.lineDashOffset = -r.roadOffset;
      [285, 475].forEach(lx => {
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, H);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // 2. Плавное смещение бегуна между 3 полосами
      const targetX = LANE_CENTERS[r.lane];
      r.visualX += (targetX - r.visualX) * 0.24;

      // 3. Монетки на трассе
      for (let i = r.coins.length - 1; i >= 0; i--) {
        const c = r.coins[i];
        c.y += r.speed;
        const cx = LANE_CENTERS[c.lane];

        if (!c.collected && Math.abs(c.y - playerY) < 34 && Math.abs(cx - r.visualX) < 42) {
          c.collected = true;
          soundFx.playCoin();
          r.score += 10;
          setScore(r.score);
          r.floatingTexts.push({ x: cx, y: c.y, text: '+10 🪙', color: '#fbbf24', life: 0.9 });
        }

        if (c.y > H + 40 || c.collected) {
          r.coins.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, c.y, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // 4. Ряд из 3 Ворот с арабскими словами/буквами
      if (r.gateRow) {
        const gr = r.gateRow;
        gr.y += r.speed;

        // Отрисовка каждых ворот в своей полосе
        gr.gates.forEach((gate, laneIdx) => {
          const gx = LANE_CENTERS[laneIdx];
          const gw = 166;
          const gh = 68;

          ctx.save();
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(gx - gw / 2, gr.y - gh / 2, gw, gh, 16);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 32px "Scheherazade New", "Amiri", serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(gate.text, gx, gr.y + 4);
          ctx.restore();
        });

        // Проверка прохождения сквозь ворота
        if (!gr.resolved && gr.y >= playerY - 26 && gr.y <= playerY + 26) {
          gr.resolved = true;
          const chosenGate = gr.gates[r.lane];
          const gx = LANE_CENTERS[r.lane];

          if (chosenGate.isCorrect) {
            soundFx.playSuccess();
            r.score += 40;
            r.gatesPassed += 1;
            r.speed = Math.min(6.2, r.speed + 0.14);

            setScore(r.score);
            setGatesPassed(r.gatesPassed);
            if (r.gatesPassed % 4 === 0) {
              storageService.addXp(15);
            }

            for (let k = 0; k < 18; k++) {
              const a = Math.random() * Math.PI * 2;
              const s = Math.random() * 4 + 1.5;
              r.particles.push({
                x: gx,
                y: playerY,
                vx: Math.cos(a) * s,
                vy: Math.sin(a) * s,
                color: '#34d399',
                life: 1.0
              });
            }
            r.floatingTexts.push({
              x: gx,
              y: playerY - 30,
              text: '+40 ВЕРНО! ⚡',
              color: '#34d399',
              life: 1.0
            });
          } else {
            soundFx.playError();
            r.lives -= 1;
            setLives(r.lives);

            for (let k = 0; k < 16; k++) {
              const a = Math.random() * Math.PI * 2;
              const s = Math.random() * 4 + 1.5;
              r.particles.push({
                x: gx,
                y: playerY,
                vx: Math.cos(a) * s,
                vy: Math.sin(a) * s,
                color: '#f43f5e',
                life: 1.0
              });
            }
            r.floatingTexts.push({
              x: gx,
              y: playerY - 30,
              text: 'НЕ ТЕ ВОРОТА! -1 ❤️',
              color: '#fb7185',
              life: 1.0
            });

            if (r.lives <= 0) {
              finishGame(r.score);
              return;
            }
          }
        }

        if (gr.y > H + 70) {
          spawnGateRow(mode, r.speed);
        }
      }

      // 5. Отрисовка персонажа / всадника
      ctx.save();
      ctx.translate(r.visualX, playerY);

      // Светящийся круг под персонажем
      ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏇', 0, 2);
      ctx.restore();

      // 6. Частицы
      for (let i = r.particles.length - 1; i >= 0; i--) {
        const p = r.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.035;
        if (p.life <= 0) {
          r.particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 7. Всплывающие очки
      for (let i = r.floatingTexts.length - 1; i >= 0; i--) {
        const ft = r.floatingTexts[i];
        ft.y -= 1.2;
        ft.life -= 0.025;
        if (ft.life <= 0) {
          r.floatingTexts.splice(i, 1);
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
  }, [isPlaying, gameOver, mode, spawnGateRow]);

  const finishGame = (finalScore) => {
    setGameOver(true);
    setIsPlaying(false);
    soundFx.playFanfare();
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('muallim_runner_hi', String(finalScore));
    }
    if (finalScore >= 60) {
      storageService.addXp(Math.min(100, Math.round(finalScore / 3)));
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden text-white">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black flex items-center gap-2">
              <span>Караван Пустыни (3 полосы)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                {levelInfo?.shortTitle || `Ур. ${levelInfo?.id}`}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold">
                Пройдено: {gatesPassed}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Перестраивайтесь между 3 дорожками (← → или нажатием на полосу) в правильные ворота!
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => {
              setMode('words');
              if (isPlaying) startGame('words');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mode === 'words' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Чтение слов
          </button>
          <button
            onClick={() => {
              setMode('letters');
              if (isPlaying) startGame('letters');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mode === 'letters' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            29 Букв
          </button>
        </div>
      </div>

      {/* Target Gate Prompt */}
      {isPlaying && currentPrompt && (
        <div className="px-4 py-3 bg-gradient-to-r from-amber-950/90 via-slate-900 to-slate-900 border-b border-amber-800/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-sm sm:text-base font-black text-amber-300">
              🏇 {currentPrompt.title}
            </span>
            {currentPrompt.letterToPlay && (
              <button
                onClick={() => audioService.playLetter(currentPrompt.letterToPlay)}
                className="p-1.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

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
            <div className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-black text-emerald-400">
              Счёт: {score}
            </div>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="relative flex justify-center bg-[#78350f]">
        <canvas
          ref={canvasRef}
          width={760}
          height={460}
          onClick={handleCanvasClick}
          className="w-full max-w-[760px] h-[390px] sm:h-[460px] cursor-pointer touch-none select-none block"
        />

        {/* Mobile Left/Right Controls Overlay at Bottom */}
        {isPlaying && !gameOver && (
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
            <button
              onClick={() => moveLane(-1)}
              className="pointer-events-auto px-5 py-3 rounded-2xl bg-slate-900/85 hover:bg-slate-800 border border-white/20 text-white font-black text-xs flex items-center gap-1.5 shadow-lg active:scale-90"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Влево</span>
            </button>
            <button
              onClick={() => moveLane(1)}
              className="pointer-events-auto px-5 py-3 rounded-2xl bg-slate-900/85 hover:bg-slate-800 border border-white/20 text-white font-black text-xs flex items-center gap-1.5 shadow-lg active:scale-90"
            >
              <span>Вправо</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {(!isPlaying || gameOver) && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            {gameOver ? (
              <>
                <Trophy className="w-16 h-16 text-amber-400 mb-3 animate-bounce" />
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Забег завершён!
                </h2>
                <p className="text-emerald-400 font-mono text-lg font-extrabold mt-1">
                  Очки: {score} • Рекорд: {highScore}
                </p>
                <button
                  onClick={() => startGame(mode)}
                  className="mt-6 px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm sm:text-base shadow-xl flex items-center gap-2 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>В путь ещё раз 🏇</span>
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-400 to-emerald-600 flex items-center justify-center text-4xl shadow-2xl mb-4">
                  🏇
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Караван Пустыни
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md leading-relaxed">
                  Мчитесь по 3 полосам пустынного тракта! Сверху задаётся чтение слова или буквы — перестраивайтесь в нужную полосу, чтобы проскочить сквозь правильные ворота и собрать золотые монеты 🪙.
                </p>
                <button
                  onClick={() => startGame(mode)}
                  className="mt-6 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-sm sm:text-base shadow-xl flex items-center gap-2.5 active:scale-95 transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Начать забег 🏇</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
