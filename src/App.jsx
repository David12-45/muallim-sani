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

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      storageService.setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      storageService.setTheme('light');
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
    <div className="relative min-h-screen flex flex-col bg-[#F5F7F6] dark:bg-[#0B1110] transition-colors pb-24 md:pb-0 overflow-x-hidden">
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

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-8 text-slate-500 dark:text-slate-400">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 md:pb-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-arabic text-base leading-none">
              م
            </div>
            <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">Му'аллим Сани</span>
          </div>
          <p className="text-xs leading-relaxed max-w-md sm:text-right">
            Классическая методика Ахмадхади Максуди в интерактивном формате: 41 урок, студийное аудио, цветовой таджвид и тренажёры.
          </p>
        </div>
      </footer>
    </div>
  );
}
