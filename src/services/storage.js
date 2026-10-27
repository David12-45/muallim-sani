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
  return new Date().toISOString().slice(0, 10);
}

export const storageService = {
  getProgress() {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        completedLessons: parsed.completedLessons || {},
        completedQuizzes: parsed.completedQuizzes || {},
        lessonStars: parsed.lessonStars || {}, // { [lessonId]: 1 | 2 | 3 }
        xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
        streak: typeof parsed.streak === 'number' ? parsed.streak : 1,
        lastActiveDate: parsed.lastActiveDate || getTodayStr(),
        wordsListened: typeof parsed.wordsListened === 'number' ? parsed.wordsListened : 0
      };
    } catch {
      return {
        completedLessons: {},
        completedQuizzes: {},
        lessonStars: {},
        xp: 0,
        streak: 1,
        lastActiveDate: getTodayStr(),
        wordsListened: 0
      };
    }
  },

  saveProgress(progress) {
    try {
      const today = getTodayStr();
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
    progress.wordsListened = (progress.wordsListened || 0) + 1;
    progress.xp = (progress.xp || 0) + 2;
    this.saveProgress(progress);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('muallim-xp-updated', { detail: { xp: progress.xp, added: 2 } }));
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
