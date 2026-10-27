// Сервис воспроизведения реальных студийных MP3-записей 29 арабских букв и суры Аль-Фатиха
// (без синтезатора речи браузера)

const LETTER_TO_MP3 = {
  'ا': '/audio/letters/01.mp3',
  'أ': '/audio/letters/01.mp3',
  'إ': '/audio/letters/01.mp3',
  'آ': '/audio/letters/01.mp3',
  'ٱ': '/audio/letters/01.mp3',
  'ب': '/audio/letters/02.mp3',
  'ت': '/audio/letters/03.mp3',
  'ة': '/audio/letters/03.mp3',
  'ث': '/audio/letters/04.mp3',
  'ج': '/audio/letters/05.mp3',
  'ح': '/audio/letters/06.mp3',
  'خ': '/audio/letters/07.mp3',
  'د': '/audio/letters/08.mp3',
  'ذ': '/audio/letters/09.mp3',
  'ر': '/audio/letters/10.mp3',
  'ز': '/audio/letters/11.mp3',
  'س': '/audio/letters/12.mp3',
  'ش': '/audio/letters/13.mp3',
  'ص': '/audio/letters/14.mp3',
  'ض': '/audio/letters/15.mp3',
  'ط': '/audio/letters/16.mp3',
  'ظ': '/audio/letters/17.mp3',
  'ع': '/audio/letters/18.mp3',
  'غ': '/audio/letters/19.mp3',
  'ف': '/audio/letters/20.mp3',
  'ق': '/audio/letters/21.mp3',
  'ك': '/audio/letters/22.mp3',
  'ل': '/audio/letters/23.mp3',
  'م': '/audio/letters/24.mp3',
  'ن': '/audio/letters/25.mp3',
  'ه': '/audio/letters/26.mp3',
  'هـ': '/audio/letters/26.mp3',
  'و': '/audio/letters/27.mp3',
  'ؤ': '/audio/letters/28.mp3',
  'ء': '/audio/letters/28.mp3',
  'ئ': '/audio/letters/28.mp3',
  'لا': '/audio/letters/29.mp3',
  'ي': '/audio/letters/30.mp3',
  'ى': '/audio/letters/30.mp3'
};

class AudioService {
  constructor() {
    this.currentAudio = null;
  }

  // Воспроизведение реальной студийной MP3-записи буквы
  playLetter(letterCharOrStr) {
    if (!letterCharOrStr) return false;
    const clean = String(letterCharOrStr)
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED()=ـ\s]/g, '')
      .trim();

    const url = LETTER_TO_MP3[clean] || LETTER_TO_MP3[clean[0]];
    if (!url) return false;

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    const audio = new Audio(url);
    this.currentAudio = audio;
    audio.play().catch(e => {
      console.log('Audio play error:', e);
    });
    return true;
  }

  // Озвучка буквы через студийный MP3
  speakLetter(letterObj, mode = 'sound') {
    if (!letterObj) return false;
    const arabic = typeof letterObj === 'string' ? letterObj : (letterObj.arabic || letterObj.arabicName);
    return this.playLetter(arabic);
  }

  hasLetterAudio(letterCharOrStr) {
    if (!letterCharOrStr) return false;
    const clean = String(letterCharOrStr)
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED()=ـ\s]/g, '')
      .trim();
    return !!LETTER_TO_MP3[clean];
  }

  // Синтезатор для слов отключён; если передана одиночная буква — играет студийный MP3
  speakArabic(text) {
    const clean = String(text || '')
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED()=ـ\s]/g, '')
      .trim();
    if (LETTER_TO_MP3[clean]) {
      this.playLetter(clean);
    }
  }

  // Воспроизведение официального аудио чтения аята суры Аль-Фатиха (Мишари Рашид аль-Афаси)
  playAyah(surahNumber, ayahNumber, onEndCallback) {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    const sNum = String(surahNumber).padStart(3, '0');
    const aNum = String(ayahNumber).padStart(3, '0');
    const url = `https://everyayah.com/data/Alafasy_128kbps/${sNum}${aNum}.mp3`;

    const audio = new Audio(url);
    this.currentAudio = audio;

    audio.onended = () => {
      this.currentAudio = null;
      if (onEndCallback) onEndCallback();
    };

    audio.onerror = () => {
      if (onEndCallback) onEndCallback();
    };

    audio.play().catch(() => {
      if (onEndCallback) onEndCallback();
    });
  }

  stopAll() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }
}

export const audioService = new AudioService();
