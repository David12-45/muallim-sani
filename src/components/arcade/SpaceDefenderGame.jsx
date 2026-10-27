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
  Rocket,
  Heart,
  Zap,
  Volume2,
  RotateCcw,
  Play,
  Pause,
  Shield,
  Sparkles,
  Trophy,
  Crosshair,
  Award
} from 'lucide-react';

export default function SpaceDefenderGame({ level: propLevel }) {
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

  // Режимы сложности/контента: 'letters' (по уровню алфавита) | 'words' (слова уровня)
  const [contentMode, setContentMode] = useState(() => (levelInfo?.category === 'words' ? 'words' : 'letters'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('muallim_space_hi') || 0));
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [wave, setWave] = useState(1);
  const [targetInfo, setTargetInfo] = useState(null);

  // Мутабельное состояние игрового цикла на Canvas для 60 FPS без ре-рендеров React
  const gameRef = useRef({
    shipX: 300,
    shipTargetX: 300,
    bullets: [],
    meteors: [],
    particles: [],
    floatingTexts: [],
    stars: [],
    lastSpawnTime: 0,
    lastShotTime: 0,
    spawnInterval: 1700,
    slowMoUntil: 0,
    score: 0,
    lives: 3,
    combo: 0,
    wave: 1,
    hitsInWave: 0,
    target: null,
    keys: { left: false, right: false }
  });

  const levelLetters = getLettersForLevel(levelInfo);
  const levelWords = getWordsForLevel(levelInfo);

  // Выбрать новую цель для текущей волны с учётом уровня знаний
  const pickNewTarget = useCallback((mode = contentMode, currentWave = 1) => {
    if (mode === 'letters') {
      const pool = levelLetters.length > 0 ? levelLetters : ALPHABET_DATA;
      const letter = pool[Math.floor(Math.random() * pool.length)];
      const validForms = letter.forms
        ? Array.from(new Set([
            letter.arabic,
            letter.forms.isolated,
            letter.forms.initial,
            letter.forms.medial,
            letter.forms.final
          ]))
        : [letter.arabic];

      const newTarget = {
        mode: 'letters',
        letterObj: letter,
        title: `Буква «${letter.name}» [${letter.transcription}]`,
        subtitle: `Сбивайте форму этой буквы (${levelInfo?.shortTitle || 'Алфавит'})`,
        arabicPreview: letter.arabic,
        validTexts: validForms
      };

      gameRef.current.target = newTarget;
      setTargetInfo(newTarget);
      audioService.playLetter(letter.arabic);
    } else {
      const pool = levelWords.length > 0 ? levelWords : ['كَتَبَ', 'دَرَسَ', 'وَجَدَ'];
      const word = pool[Math.floor(Math.random() * pool.length)] || 'كَتَبَ';
      const tr = transcribeArabic(word);
      const newTarget = {
        mode: 'words',
        title: `Слово: [${tr}]`,
        subtitle: `Найдите и сбейте метеорит [${tr}] (${levelInfo?.shortTitle || 'Слова'})`,
        arabicPreview: word,
        validTexts: [word]
      };
      gameRef.current.target = newTarget;
      setTargetInfo(newTarget);
    }
  }, [contentMode, levelInfo, levelLetters, levelWords]);

  // Старт новой игры
  const startGame = (chosenMode = contentMode) => {
    soundFx.playTap();
    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 700;

    // Генерируем фоновые звёзды
    const stars = Array.from({ length: 65 }, () => ({
      x: Math.random() * width,
      y: Math.random() * 520,
      size: Math.random() * 2.2 + 0.6,
      speed: Math.random() * 0.8 + 0.2,
      alpha: Math.random() * 0.7 + 0.3
    }));

    gameRef.current = {
      shipX: width / 2,
      shipTargetX: width / 2,
      bullets: [],
      meteors: [],
      particles: [],
      floatingTexts: [],
      stars,
      lastSpawnTime: performance.now(),
      lastShotTime: performance.now(),
      spawnInterval: 1650,
      slowMoUntil: 0,
      score: 0,
      lives: 3,
      combo: 0,
      wave: 1,
      hitsInWave: 0,
      target: null,
      keys: { left: false, right: false }
    };

    setScore(0);
    setLives(3);
    setCombo(0);
    setWave(1);
    setGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);

    pickNewTarget(chosenMode, 1);
  };

  // Взрыв всех правильных целей на экране (Супер-бонус)
  const triggerSuperNova = () => {
    const g = gameRef.current;
    if (!g.target) return;
    soundFx.playBossHit();

    g.meteors.forEach(m => {
      if (m.isCorrect) {
        m.hp = 0;
        createExplosion(m.x, m.y, '#10b981', 18);
        g.score += 30;
        g.floatingTexts.push({
          x: m.x,
          y: m.y,
          text: '+30 💥',
          color: '#34d399',
          life: 1.0
        });
      }
    });
    g.meteors = g.meteors.filter(m => m.hp > 0);
    setScore(g.score);
  };

  const createExplosion = (x, y, color, count = 16) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 4 + 1.5;
      gameRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3.5 + 1.5,
        color,
        life: 1.0
      });
    }
  };

  // Обработка клика/тапа по холсту (Прицельный выстрел + перемещение корабля)
  const handleCanvasPointerDown = (e) => {
    if (!isPlaying || isPaused || gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const g = gameRef.current;
    g.shipTargetX = Math.max(40, Math.min(canvas.width - 40, clickX));

    // Выпускаем прицельный лазер к точке клика
    const shipY = canvas.height - 48;
    const dx = clickX - g.shipX;
    const dy = clickY - shipY;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = 13;

    soundFx.playLaser();
    g.bullets.push({
      x: g.shipX,
      y: shipY - 18,
      vx: (dx / dist) * speed,
      vy: Math.min(-4, (dy / dist) * speed),
      radius: 5
    });
  };

  const handleCanvasPointerMove = (e) => {
    if (!isPlaying || isPaused || gameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const moveX = (e.clientX - rect.left) * scaleX;
    gameRef.current.shipTargetX = Math.max(40, Math.min(canvas.width - 40, moveX));
  };

  // Клавиатурное управление (стрелки A/D и Пробел)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        gameRef.current.keys.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        gameRef.current.keys.right = true;
      }
      if (e.key === ' ' && isPlaying && !isPaused && !gameOver) {
        e.preventDefault();
        const g = gameRef.current;
        soundFx.playLaser();
        g.bullets.push({
          x: g.shipX,
          y: 460,
          vx: 0,
          vy: -12,
          radius: 5
        });
      }
    };

    const onKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        gameRef.current.keys.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        gameRef.current.keys.right = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isPlaying, isPaused, gameOver]);

  // Основной игровой цикл 60 FPS
  useEffect(() => {
    if (!isPlaying || isPaused || gameOver) return;

    let animId;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const spawnMeteor = (now) => {
      const g = gameRef.current;
      if (!g.target) return;

      // 45% шанс спавна правильной цели, 45% ложной, 10% бонуса
      const roll = Math.random();
      let isCorrect = false;
      let bonusType = null;
      let text = '';

      if (roll < 0.10) {
        bonusType = Math.random() < 0.5 ? 'shield' : 'slow';
        text = bonusType === 'shield' ? '🛡️' : '❄️';
      } else if (roll < 0.56) {
        isCorrect = true;
        const valid = g.target.validTexts;
        text = valid[Math.floor(Math.random() * valid.length)];
      } else {
        isCorrect = false;
        if (g.target.mode === 'letters') {
          const pool = levelLetters.length > 1 ? levelLetters : ALPHABET_DATA;
          const otherLetters = pool.filter(l => l.id !== g.target.letterObj?.id);
          const randomOther = (otherLetters.length > 0 ? otherLetters : pool)[Math.floor(Math.random() * (otherLetters.length || pool.length))];
          const forms = randomOther.forms
            ? [randomOther.arabic, randomOther.forms.initial, randomOther.forms.medial, randomOther.forms.final]
            : [randomOther.arabic];
          text = forms[Math.floor(Math.random() * forms.length)];
        } else {
          const pool = levelWords.length > 1 ? levelWords : ['كَتَبَ', 'دَرَسَ', 'وَجَدَ'];
          const otherWords = pool.filter(w => !g.target.validTexts.includes(w));
          text = (otherWords.length > 0 ? otherWords : pool)[Math.floor(Math.random() * (otherWords.length || pool.length))] || 'ذَهَبَ';
        }
      }

      const radius = g.target.mode === 'words' ? 38 : 32;
      const x = Math.random() * (canvas.width - radius * 2 - 40) + radius + 20;
      const baseSpeed = 1.15 + Math.min(1.6, g.wave * 0.16);

      g.meteors.push({
        x,
        y: -radius,
        vx: (Math.random() - 0.5) * 0.5,
        vy: baseSpeed + Math.random() * 0.45,
        radius,
        text,
        isCorrect,
        bonusType,
        hp: 1,
        pulse: Math.random() * Math.PI * 2
      });
    };

    const renderLoop = (now) => {
      const g = gameRef.current;
      const W = canvas.width;
      const H = canvas.height;
      const isSlowMo = now < g.slowMoUntil;
      const speedMult = isSlowMo ? 0.45 : 1;

      // 1. Очистка и космический фон
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#04091a');
      grad.addColorStop(0.6, '#0b1736');
      grad.addColorStop(1, '#062c30');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // 2. Звёздное небо
      g.stars.forEach(s => {
        s.y += s.speed * speedMult;
        if (s.y > H) {
          s.y = 0;
          s.x = Math.random() * W;
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Движение корабля
      if (g.keys.left) g.shipTargetX = Math.max(40, g.shipX - 8);
      if (g.keys.right) g.shipTargetX = Math.min(W - 40, g.shipX + 8);
      g.shipX += (g.shipTargetX - g.shipX) * 0.22;

      // Авто-выстрел каждые 480мс
      if (now - g.lastShotTime > 480) {
        g.lastShotTime = now;
        g.bullets.push({
          x: g.shipX,
          y: H - 64,
          vx: 0,
          vy: -10.5,
          radius: 4.5
        });
      }

      // 4. Спавн метеоритов
      const currentInterval = Math.max(750, g.spawnInterval - g.wave * 70);
      if (now - g.lastSpawnTime > currentInterval / speedMult) {
        g.lastSpawnTime = now;
        spawnMeteor(now);
      }

      // 5. Обновление и отрисовка пуль
      for (let i = g.bullets.length - 1; i >= 0; i--) {
        const b = g.bullets[i];
        b.x += b.vx;
        b.y += b.vy;

        if (b.y < -20 || b.x < -20 || b.x > W + 20) {
          g.bullets.splice(i, 1);
          continue;
        }

        // Светящийся лазер
        ctx.save();
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#6ee7b7';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 6. Обновление метеоритов и проверка столкновений
      const shipY = H - 46;

      for (let i = g.meteors.length - 1; i >= 0; i--) {
        const m = g.meteors[i];
        m.x += m.vx * speedMult;
        m.y += m.vy * speedMult;
        m.pulse += 0.06;

        // Отскок от боковых стенок
        if (m.x < m.radius + 10 || m.x > W - m.radius - 10) {
          m.vx *= -1;
        }

        // Проверка попадания лазеров
        let destroyed = false;
        for (let j = g.bullets.length - 1; j >= 0; j--) {
          const b = g.bullets[j];
          const dist = Math.hypot(m.x - b.x, m.y - b.y);
          if (dist < m.radius + b.radius + 4) {
            g.bullets.splice(j, 1);
            destroyed = true;
            break;
          }
        }

        if (destroyed) {
          g.meteors.splice(i, 1);

          if (m.bonusType === 'shield') {
            soundFx.playCoin();
            g.lives = Math.min(5, g.lives + 1);
            setLives(g.lives);
            createExplosion(m.x, m.y, '#38bdf8', 18);
            g.floatingTexts.push({ x: m.x, y: m.y, text: '+1 ЖИЗНЬ 🛡️', color: '#38bdf8', life: 1.0 });
          } else if (m.bonusType === 'slow') {
            soundFx.playCoin();
            g.slowMoUntil = now + 5000;
            createExplosion(m.x, m.y, '#818cf8', 18);
            g.floatingTexts.push({ x: m.x, y: m.y, text: 'ЗАМЕДЛЕНИЕ ❄️', color: '#a5b4fc', life: 1.0 });
          } else if (m.isCorrect) {
            soundFx.playSuccess();
            g.combo += 1;
            const pts = 20 + Math.min(30, g.combo * 5);
            g.score += pts;
            g.hitsInWave += 1;

            setScore(g.score);
            setCombo(g.combo);
            createExplosion(m.x, m.y, '#10b981', 20);
            g.floatingTexts.push({
              x: m.x,
              y: m.y,
              text: `+${pts} ${g.combo >= 3 ? `🔥x${g.combo}` : '✓'}`,
              color: '#34d399',
              life: 1.0
            });

            // Каждые 5 точных сбитий — новая волна и новая буква/слово!
            if (g.hitsInWave >= 5) {
              g.hitsInWave = 0;
              g.wave += 1;
              setWave(g.wave);
              storageService.addXp(15);
              pickNewTarget(contentMode, g.wave);
              g.floatingTexts.push({
                x: W / 2,
                y: H / 2,
                text: `ВОЛНА ${g.wave}! НОВАЯ ЦЕЛЬ!`,
                color: '#fbbf24',
                life: 1.3
              });
            }
          } else {
            // Сбили не ту букву!
            soundFx.playError();
            g.combo = 0;
            g.lives -= 1;
            setCombo(0);
            setLives(g.lives);
            createExplosion(m.x, m.y, '#f43f5e', 16);
            g.floatingTexts.push({
              x: m.x,
              y: m.y,
              text: 'ОШИБКА! -1 ❤️',
              color: '#fb7185',
              life: 1.0
            });

            if (g.lives <= 0) {
              finishGame(g.score);
              return;
            }
          }
          continue;
        }

        // Проверка улёта за нижний край
        if (m.y > H + m.radius) {
          g.meteors.splice(i, 1);
          // Если пропустили правильную букву — сбрасывается комбо
          if (m.isCorrect) {
            g.combo = 0;
            setCombo(0);
            g.floatingTexts.push({
              x: m.x,
              y: H - 30,
              text: 'Упущена цель!',
              color: '#fbbf24',
              life: 0.9
            });
          }
          continue;
        }

        // Отрисовка метеорита / сферы
        ctx.save();
        const glowRadius = m.radius + Math.sin(m.pulse) * 2;

        // Градиент сферы
        const orbGrad = ctx.createRadialGradient(m.x - 8, m.y - 8, 4, m.x, m.y, glowRadius);
        if (m.bonusType) {
          orbGrad.addColorStop(0, '#38bdf8');
          orbGrad.addColorStop(1, '#0284c7');
          ctx.strokeStyle = '#bae6fd';
        } else {
          orbGrad.addColorStop(0, '#1e293b');
          orbGrad.addColorStop(1, '#0f172a');
          ctx.strokeStyle = '#38bdf8';
        }

        ctx.fillStyle = orbGrad;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(m.x, m.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Арабский текст внутри метеорита
        ctx.fillStyle = '#ffffff';
        ctx.font = m.bonusType
          ? '26px sans-serif'
          : g.target?.mode === 'words'
          ? 'bold 26px "Scheherazade New", "Amiri", serif'
          : 'bold 34px "Scheherazade New", "Amiri", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(m.text, m.x, m.y + 3);
        ctx.restore();
      }

      // 7. Отрисовка космического корабля игрока внизу
      ctx.save();
      ctx.translate(g.shipX, shipY);

      // Пламя двигателя
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(-8, 18);
      ctx.lineTo(8, 18);
      ctx.lineTo(0, 28 + Math.random() * 8);
      ctx.closePath();
      ctx.fill();

      // Корпус корабля (изумрудно-золотой истребитель)
      ctx.fillStyle = '#10b981';
      ctx.strokeStyle = '#a7f3d0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(24, 18);
      ctx.lineTo(8, 12);
      ctx.lineTo(-8, 12);
      ctx.lineTo(-24, 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Кабина
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.arc(0, -2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 8. Отрисовка частиц взрыва
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const p = g.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
        if (p.life <= 0) {
          g.particles.splice(i, 1);
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

      // 9. Отрисовка всплывающих надписей (+25, КОМБО)
      for (let i = g.floatingTexts.length - 1; i >= 0; i--) {
        const ft = g.floatingTexts[i];
        ft.y -= 1.2;
        ft.life -= 0.022;
        if (ft.life <= 0) {
          g.floatingTexts.splice(i, 1);
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

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isPaused, gameOver, contentMode, pickNewTarget]);

  const finishGame = (finalScore) => {
    setGameOver(true);
    setIsPlaying(false);
    soundFx.playFanfare();
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('muallim_space_hi', String(finalScore));
    }
    if (finalScore >= 60) {
      storageService.addXp(Math.min(100, Math.round(finalScore / 3)));
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden text-white">
      {/* Top Arcade HUD Bar */}
      <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-2">
              <span>Звёздный Защитник Букв</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                {levelInfo?.shortTitle || `Ур. ${levelInfo?.id}`}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                Волна {wave}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Нажимайте прямо на падающие сферы или двигайте корабль стрелками / мышкой
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => {
                setContentMode('letters');
                if (isPlaying) startGame('letters');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                contentMode === 'letters'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              29 Букв и Формы
            </button>
            <button
              onClick={() => {
                setContentMode('words');
                if (isPlaying) startGame('words');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                contentMode === 'words'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Слова из книги
            </button>
          </div>
        </div>
      </div>

      {/* Mission Target Banner (What to shoot right now) */}
      {isPlaying && targetInfo && (
        <div className="px-4 py-3 bg-gradient-to-r from-emerald-950/90 via-teal-950/90 to-slate-900 border-b border-emerald-800/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Crosshair className="w-4 h-4" />
              <span>ЦЕЛЬ:</span>
            </div>
            <div>
              <div className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>{targetInfo.title}</span>
                {targetInfo.letterObj && (
                  <button
                    onClick={() => audioService.playLetter(targetInfo.letterObj.arabic)}
                    className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
                    title="Послушать студийное произношение"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="text-[11px] text-emerald-300">{targetInfo.subtitle}</div>
            </div>
          </div>

          {/* Stats: Lives, Combo, Score */}
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
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black">
                🔥 x{combo}
              </span>
            )}

            <div className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-black text-emerald-400">
              Счёт: {score}
            </div>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              title={isPaused ? 'Продолжить' : 'Пауза'}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Canvas Arena */}
      <div className="relative flex justify-center bg-[#04091a]">
        <canvas
          ref={canvasRef}
          width={760}
          height={500}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          className="w-full max-w-[760px] h-[420px] sm:h-[500px] cursor-crosshair touch-none select-none block"
        />

        {/* Start / Game Over Overlay */}
        {(!isPlaying || gameOver) && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            {gameOver ? (
              <>
                <Trophy className="w-16 h-16 text-amber-400 mb-3 animate-bounce" />
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Полет завершён!
                </h2>
                <p className="text-emerald-400 font-mono text-lg font-extrabold mt-1">
                  Набрано очков: {score} • Рекорд: {highScore}
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  Вы дошли до Волны {wave}. Каждая сбитая буква укрепляет зрительную память!
                </p>
                <button
                  onClick={() => startGame(contentMode)}
                  className="mt-6 px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-emerald-500/25 flex items-center gap-2.5 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Играть снова 🚀</span>
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-2xl shadow-emerald-500/30 mb-4">
                  <Rocket className="w-10 h-10" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Звёздный Защитник Букв
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md leading-relaxed">
                  Сверху летят метеориты с арабскими буквами и словами. Сбивайте только те, что соответствуют заданию сверху! Ловите бонусы щита 🛡️ и замедления времени ❄️.
                </p>
                <button
                  onClick={() => startGame(contentMode)}
                  className="mt-6 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 flex items-center gap-2.5 active:scale-95 transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Запустить корабль 🚀</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
