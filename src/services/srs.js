// Интервальное повторение букв (система Лейтнера): коробки 0–5
const KEY = 'muallim_sani_srs_v1';
const DAYS = [0, 1, 2, 4, 8, 16];
const DAY_MS = 86400000;

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

export const srs = {
  all: load,
  // ответ на вопрос: верно — коробка вверх, ошибка — сброс на 0
  answer(letterId, correct) {
    const state = load();
    const cur = state[letterId] || { box: 0, due: 0, seen: 0 };
    const box = correct ? Math.min(5, cur.box + 1) : 0;
    state[letterId] = { box, seen: cur.seen + 1, due: Date.now() + DAYS[box] * DAY_MS };
    save(state);
  },
  box(letterId) { return (load()[letterId] || { box: -1 }).box; },
  isLearned(letterId) { return this.box(letterId) >= 2; },
  dueIds(ids) {
    const state = load();
    const now = Date.now();
    return ids.filter(id => state[id] && state[id].due <= now);
  },
  reset() { save({}); }
};
