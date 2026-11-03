// Сервис голосового распознавания арабской речи (Web Speech API)
// для проверки произношения букв и слов ученика

function normalizeArabic(text) {
  return String(text || '')
    .normalize('NFC')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640()=ـ\s]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ؤئء]/g, 'ء')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .trim();
}

function levenshteinDistance(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // удаление
          dp[i][j - 1] + 1,     // вставка
          dp[i - 1][j - 1] + 1  // замена
        );
      }
    }
  }
  return dp[m][n];
}

function similarityRatio(s1, s2) {
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(s1, s2);
  return Math.max(0, 1 - dist / maxLen);
}

class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
  }

  isSupported() {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  comparePronunciation(spokenText, targetText) {
    const normSpoken = normalizeArabic(spokenText);
    const normTarget = normalizeArabic(targetText);

    if (!normSpoken || !normTarget) {
      return { isMatch: false, ratio: 0, spoken: normSpoken, target: normTarget };
    }

    // 1. Точное совпадение
    if (normSpoken === normTarget) {
      return { isMatch: true, ratio: 1.0, spoken: normSpoken, target: normTarget };
    }

    // 2. Вхождение (например, распознаватель добавил артикль 'ال' или вспомогательное слово)
    if (normSpoken.includes(normTarget) || normTarget.includes(normSpoken)) {
      return { isMatch: true, ratio: 0.9, spoken: normSpoken, target: normTarget };
    }

    // 3. Нечёткое сравнение по расстоянию Левенштейна (допуск 1 опечатки для слов > 3 букв)
    const ratio = similarityRatio(normSpoken, normTarget);
    const isMatch = ratio >= 0.75;

    return {
      isMatch,
      ratio: Math.round(ratio * 100) / 100,
      spoken: normSpoken,
      target: normTarget
    };
  }

  startListening({ targetText, onStart, onResult, onError, onEnd, lang = 'ar-SA' }) {
    if (!this.isSupported()) {
      if (onError) onError({ code: 'not-supported', message: 'Распознавание речи не поддерживается в этом браузере.' });
      return false;
    }

    this.stopListening();

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRec();
    this.recognition = recognition;

    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      this.isListening = true;
      if (onStart) onStart();
    };

    recognition.onresult = (event) => {
      if (!event.results || event.results.length === 0) return;
      const result = event.results[0][0];
      const spokenTranscript = result.transcript || '';
      const confidence = result.confidence || 0.8;

      const comparison = this.comparePronunciation(spokenTranscript, targetText);

      if (onResult) {
        onResult({
          transcript: spokenTranscript,
          confidence,
          ...comparison
        });
      }
    };

    recognition.onerror = (event) => {
      this.isListening = false;
      const errorMsg = this.getErrorMessage(event.error);
      if (onError) {
        onError({
          code: event.error,
          message: errorMsg
        });
      }
    };

    recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      recognition.start();
      return true;
    } catch (e) {
      this.isListening = false;
      if (onError) onError({ code: 'start-failed', message: e.message });
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.abort();
      } catch {}
    }
    this.isListening = false;
    this.recognition = null;
  }

  getErrorMessage(errCode) {
    switch (errCode) {
      case 'not-allowed':
      case 'permission-denied':
        return 'Доступ к микрофону заблокирован. Разрешите микрофон в настройках браузера.';
      case 'no-speech':
        return 'Голос не обнаружен. Попробуйте сказать ближе к микрофону.';
      case 'network':
        return 'Сетевая ошибка голосового модуля. Проверьте интернет-соединение.';
      case 'audio-capture':
        return 'Микрофон не найден или отключён в системе.';
      default:
        return 'Не удалось распознать речь. Попробуйте ещё раз.';
    }
  }
}

export const speechService = new SpeechService();
