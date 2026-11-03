// Игровое хранилище прогресса, XP, звёзд и ударного режима (Streak)
const PROGRESS_KEY = 'muallim_sani_progress_v1';
const THEME_KEY = 'muallim_sani_theme_v1';

export const PLAYER_RANKS = [
  { level: 1, minXp: 0, title: 'Новичок (Мубтади)', icon: '🌱' },
  { level: 2, minXp: 150, title: 'Ученик Алифбы', icon: '📖' },
  { level: 3, minXp: 400, title: 'Читающий огласовки', icon: '✨' },
  { level: 4, minXp: 800, title: 'Мастер Мадда', icon: '🌊' },
  { level: 5, minXp: 1300, title: 'Знаток Ташдида и Танвина', icon: '🔥' },
  { level: 6, minXp: 2000, title: 'Мастер Таджвида', icon: '👑' },
  { level: 7, minXp: 3000, title: 'Хранитель «Му\'аллим Сани»', icon: '🕌' }
];

function getTodayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const storageService = {
  getProgress() {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const today = getTodayStr();
      return {
        completedLessons: parsed.completedLessons || {},
        completedQuizzes: parsed.completedQuizzes || {},
        lessonStars: parsed.lessonStars || {}, // { [lessonId]: 1 | 2 | 3 }
        xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
        streak: typeof parsed.streak === 'number' ? parsed.streak : 1,
        lastActiveDate: parsed.lastActiveDate || today,
        streakHistory: Array.isArray(parsed.streakHistory) ? parsed.streakHistory : [today],
        dailyWorkouts: parsed.dailyWorkouts || {}, // { [YYYY-MM-DD]: { completedAt, score, total } }
        wordsListened: typeof parsed.wordsListened === 'number' ? parsed.wordsListened : 0,
        wordsListenedToday: parsed.wordsListenedToday && parsed.wordsListenedToday.date === today
          ? parsed.wordsListenedToday.count
          : 0
      };
    } catch {
      const today = getTodayStr();
      return {
        completedLessons: {},
        completedQuizzes: {},
        lessonStars: {},
        xp: 0,
        streak: 1,
        lastActiveDate: today,
        streakHistory: [today],
        dailyWorkouts: {},
        wordsListened: 0,
        wordsListenedToday: 0
      };
    }
  },

  saveProgress(progress) {
    try {
      const today = getTodayStr();
      if (!progress.streakHistory) progress.streakHistory = [];
      if (!progress.streakHistory.includes(today)) {
        progress.streakHistory.push(today);
      }
      if (progress.lastActiveDate !== today) {
        const last = new Date(progress.lastActiveDate);
        const now = new Date(today);
        const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          progress.streak = (progress.streak || 1) + 1;
        } else if (diffDays > 1) {
          progress.streak = 1;
        }
        progress.lastActiveDate = today;
      }
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error(e);
    }
    return progress;
  },

  addXp(amount) {
    const progress = this.getProgress();
    progress.xp = (progress.xp || 0) + amount;
    this.saveProgress(progress);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('muallim-xp-updated', { detail: { xp: progress.xp, added: amount } }));
    }
    return progress;
  },

  incrementWordsListened() {
    const progress = this.getProgress();
    const today = getTodayStr();
    progress.wordsListened = (progress.wordsListened || 0) + 1;
    progress.wordsListenedToday = (progress.wordsListenedToday || 0) + 1;
    progress.xp = (progress.xp || 0) + 2;
    progress.wordsListenedTodayData = { date: today, count: progress.wordsListenedToday };
    this.saveProgress(progress);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('muallim-xp-updated', { detail: { xp: progress.xp, added: 2 } }));
      window.dispatchEvent(new CustomEvent('muallim-daily-quest-updated', { detail: { progress } }));
    }
    return progress;
  },

  getDailyQuestStatus() {
    const progress = this.getProgress();
    const today = getTodayStr();
    const isWorkoutCompleted = !!(progress.dailyWorkouts && progress.dailyWorkouts[today]);
    const wordsListenedToday = progress.wordsListenedToday || 0;
    const wordsTarget = 5;
    const isWordsGoalDone = wordsListenedToday >= wordsTarget;

    // Дни текущей недели с понедельника по воскресенье
    const now = new Date();
    const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (currentDayOfWeek - 1));

    const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const weekDays = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const isToday = dateStr === today;
      const isDone = (progress.dailyWorkouts && progress.dailyWorkouts[dateStr]) ||
                     (progress.streakHistory && progress.streakHistory.includes(dateStr));

      weekDays.push({
        dayName: dayLabels[i],
        dayNum: d.getDate(),
        dateStr,
        isToday,
        isDone: !!isDone
      });
    }

    return {
      todayStr: today,
      streak: progress.streak || 1,
      isWorkoutCompleted,
      workoutDetails: progress.dailyWorkouts ? progress.dailyWorkouts[today] : null,
      wordsListenedToday,
      wordsTarget,
      isWordsGoalDone,
      allDone: isWorkoutCompleted && isWordsGoalDone,
      weekDays
    };
  },

  completeDailyWorkout(score = 5, total = 5) {
    const progress = this.getProgress();
    const today = getTodayStr();
    if (!progress.dailyWorkouts) progress.dailyWorkouts = {};
    const alreadyDone = !!progress.dailyWorkouts[today];

    progress.dailyWorkouts[today] = {
      completedAt: new Date().toISOString(),
      score,
      total
    };

    if (!progress.streakHistory) progress.streakHistory = [];
    if (!progress.streakHistory.includes(today)) {
      progress.streakHistory.push(today);
    }

    const bonusXp = alreadyDone ? 10 : 50;
    progress.xp = (progress.xp || 0) + bonusXp;
    this.saveProgress(progress);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('muallim-xp-updated', { detail: { xp: progress.xp, added: bonusXp } }));
      window.dispatchEvent(new CustomEvent('muallim-daily-quest-completed', { detail: { today, bonusXp } }));
    }
    return progress;
  },

  setLessonStars(lessonId, stars) {
    const progress = this.getProgress();
    const prevStars = progress.lessonStars[lessonId] || 0;
    if (stars > prevStars) {
      progress.lessonStars[lessonId] = stars;
      progress.xp = (progress.xp || 0) + (stars - prevStars) * 20;
    }
    progress.completedLessons[lessonId] = {
      completedAt: new Date().toISOString()
    };
    return this.saveProgress(progress);
  },

  getLessonStars(lessonId) {
    const progress = this.getProgress();
    if (progress.lessonStars[lessonId]) return progress.lessonStars[lessonId];
    return progress.completedLessons[lessonId] ? 1 : 0;
  },

  markLessonComplete(lessonId, stars = 2) {
    const progress = this.getProgress();
    const isNew = !progress.completedLessons[lessonId];
    progress.completedLessons[lessonId] = {
      completedAt: new Date().toISOString()
    };
    const prevStars = progress.lessonStars[lessonId] || 0;
    if (stars > prevStars) {
      progress.lessonStars[lessonId] = stars;
    }
    if (isNew) {
      progress.xp = (progress.xp || 0) + 30;
    }
    this.saveProgress(progress);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('muallim-xp-updated', { detail: { xp: progress.xp, added: isNew ? 30 : 5 } }));
    }
    return progress;
  },

  isLessonComplete(lessonId) {
    const progress = this.getProgress();
    return !!progress.completedLessons[lessonId];
  },

  saveQuizScore(lessonId, score, total) {
    const progress = this.getProgress();
    progress.completedQuizzes[lessonId] = {
      score,
      total,
      date: new Date().toISOString()
    };
    progress.xp = (progress.xp || 0) + score * 10;
    return this.saveProgress(progress);
  },

  getPlayerRankInfo() {
    const progress = this.getProgress();
    const xp = progress.xp || 0;
    let currentRank = PLAYER_RANKS[0];
    let nextRank = PLAYER_RANKS[1] || null;

    for (let i = 0; i < PLAYER_RANKS.length; i++) {
      if (xp >= PLAYER_RANKS[i].minXp) {
        currentRank = PLAYER_RANKS[i];
        nextRank = PLAYER_RANKS[i + 1] || null;
      }
    }

    const levelProgress = nextRank
      ? Math.min(100, Math.round(((xp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp)) * 100))
      : 100;

    const totalStars = Object.values(progress.lessonStars || {}).reduce((a, b) => a + b, 0);

    return {
      xp,
      streak: progress.streak || 1,
      totalStars,
      currentRank,
      nextRank,
      levelProgress
    };
  },

  getTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
  },

  setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
  },

  getArabicScale() {
    return localStorage.getItem('muallim_arabic_scale') || '100';
  },

  setArabicScale(scale) {
    localStorage.setItem('muallim_arabic_scale', scale);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('muallim-scale-updated', { detail: { scale } }));
    }
  },

  exportProgress() {
    const data = {
      progress: this.getProgress(),
      theme: this.getTheme(),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(data, null, 2);
  },

  importProgress(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (data && data.progress) {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(data.progress));
        if (data.theme) {
          this.setTheme(data.theme);
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('muallim-xp-updated', { detail: { xp: data.progress.xp || 0 } }));
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
};

export const stats = storageService;
