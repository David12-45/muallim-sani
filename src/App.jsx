import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LessonsView from './components/LessonsView';
import LessonDetail from './components/LessonDetail';
import AlphabetView from './components/AlphabetView';
import FatihaView from './components/FatihaView';
import QuizView from './components/QuizView';
import DailyWorkoutModal from './components/DailyWorkoutModal';
import { ALL_LESSONS } from './data/book';
import { storageService } from './services/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' | 'alphabet' | 'trainer' | 'fatiha'
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [darkMode, setDarkMode] = useState(() => storageService.getTheme() === 'dark');
  const [progressPercent, setProgressPercent] = useState(0);
  const [isDailyWorkoutOpen, setIsDailyWorkoutOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsDailyWorkoutOpen(true);
    window.addEventListener('muallim-open-daily-workout', handleOpen);
    return () => window.removeEventListener('muallim-open-daily-workout', handleOpen);
  }, []);

  // Sync dark mode class, color-scheme meta & mobile browser theme-color
  useEffect(() => {
    const schemeMeta = document.querySelector('meta[name="color-scheme"]');
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (darkMode) {
      document.documentElement.classList.add('dark');
      storageService.setTheme('dark');
      if (schemeMeta) schemeMeta.setAttribute('content', 'dark');
      if (themeMeta) themeMeta.setAttribute('content', '#070D14');
    } else {
      document.documentElement.classList.remove('dark');
      storageService.setTheme('light');
      if (schemeMeta) schemeMeta.setAttribute('content', 'light');
      if (themeMeta) themeMeta.setAttribute('content', '#FAF8F3');
    }
  }, [darkMode]);

  // Sync Arabic font scale
  useEffect(() => {
    const applyScale = (scale) => {
      document.documentElement.classList.remove('scale-arabic-115', 'scale-arabic-130', 'scale-arabic-150');
      if (scale === '115') document.documentElement.classList.add('scale-arabic-115');
      if (scale === '130') document.documentElement.classList.add('scale-arabic-130');
      if (scale === '150') document.documentElement.classList.add('scale-arabic-150');
    };
    applyScale(storageService.getArabicScale());

    const onScaleUpdate = (e) => {
      applyScale(e.detail.scale);
    };
    window.addEventListener('muallim-scale-updated', onScaleUpdate);
    return () => window.removeEventListener('muallim-scale-updated', onScaleUpdate);
  }, []);

  // Update progress calculation
  const updateProgress = () => {
    const progress = storageService.getProgress();
    const total = ALL_LESSONS.length;
    let done = 0;
    ALL_LESSONS.forEach(l => {
      if (progress.completedLessons[l.id]) done++;
    });
    setProgressPercent(total ? Math.round((done / total) * 100) : 0);
  };

  useEffect(() => {
    updateProgress();
  }, [selectedLesson, activeTab]);

  const handleSelectLesson = (lesson) => {
    setSelectedLesson(lesson);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLessons = () => {
    setSelectedLesson(null);
    updateProgress();
  };

  // Find prev / next lesson
  const currentLessonIndex = selectedLesson
    ? ALL_LESSONS.findIndex(l => l.id === selectedLesson.id)
    : -1;
  const hasPrev = currentLessonIndex > 0;
  const hasNext = currentLessonIndex !== -1 && currentLessonIndex + 1 < ALL_LESSONS.length;

  const handlePrevLesson = () => {
    if (hasPrev) {
      setSelectedLesson(ALL_LESSONS[currentLessonIndex - 1]);
      updateProgress();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextLesson = () => {
    if (hasNext) {
      setSelectedLesson(ALL_LESSONS[currentLessonIndex + 1]);
      updateProgress();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#FAF8F3] dark:bg-[#070D14] transition-colors pb-24 md:pb-0 overflow-x-hidden">
      {/* Subtle Ambient Architectural Light */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-48 left-1/4 w-[560px] h-[560px] rounded-full bg-emerald-500/[0.08] dark:bg-emerald-500/[0.07] blur-3xl" />
        <div className="absolute top-1/3 -right-44 w-[480px] h-[480px] rounded-full bg-amber-400/[0.09] dark:bg-amber-400/[0.05] blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full bg-teal-500/[0.06] dark:bg-teal-500/[0.05] blur-3xl" />
      </div>

      {/* Top & Mobile Bottom Navigation */}
      <Navbar
        activeTab={selectedLesson ? 'lessons' : activeTab}
        setActiveTab={(tab) => {
          setSelectedLesson(null);
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        progressPercent={progressPercent}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenDailyWorkout={() => setIsDailyWorkoutOpen(true)}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1">
        {selectedLesson ? (
          <LessonDetail
            lesson={selectedLesson}
            onBack={handleBackToLessons}
            onPrevLesson={handlePrevLesson}
            onNextLesson={handleNextLesson}
            hasPrev={hasPrev}
            hasNext={hasNext}
          />
        ) : (
          <>
            {activeTab === 'lessons' && (
              <LessonsView
                onSelectLesson={handleSelectLesson}
                onOpenArcade={() => {
                  setActiveTab('trainer');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenDailyWorkout={() => setIsDailyWorkoutOpen(true)}
              />
            )}
            {activeTab === 'alphabet' && <AlphabetView />}
            {activeTab === 'trainer' && <QuizView />}
            {activeTab === 'fatiha' && <FatihaView />}
          </>
        )}
      </main>

      {/* Daily Workout & Streak Modal */}
      <DailyWorkoutModal
        isOpen={isDailyWorkoutOpen}
        onClose={() => setIsDailyWorkoutOpen(false)}
      />

      {/* Modern Editorial Footer */}
      <footer className="relative z-10 mt-auto border-t border-stone-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0B1320]/80 backdrop-blur-md py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-4xl mx-auto px-4 space-y-2.5">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-7 h-7 rounded-xl squircle bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-500 flex items-center justify-center text-white font-arabic text-base font-bold shadow-sm ring-1 ring-amber-300/40">
              م
            </div>
            <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 tracking-tight">
              Му'аллим Сани • Платформа арабского чтения
            </span>
          </div>
          <p className="leading-relaxed max-w-xl mx-auto pretty-copy text-slate-600 dark:text-slate-400">
            Классическая методика «Му'аллим Сани» Ахмадхади Максуди в современном интерактивном формате.
          </p>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            58 уроков • 1596 озвученных слов и слогов • Студийные MP3 • Цветовой таджвид
          </p>
        </div>
      </footer>
    </div>
  );
}
