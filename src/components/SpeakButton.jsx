import React from 'react';
import { Volume2 } from 'lucide-react';
import { soundFx } from '../services/soundFx';

export default function SpeakButton({ onSpeak, label, className = '' }) {
  const run = (e) => {
    e.stopPropagation();
    soundFx.playTap();
    if (onSpeak) onSpeak();
  };
  const base = 'inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl text-xs sm:text-sm font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 active:scale-95 transition border border-emerald-200 dark:border-emerald-800';
  return (
    <button type="button" onClick={run} className={`${base} ${className}`} title="Прослушать студийное произношение">
      <Volume2 className="w-4 h-4" />
      {label && <span>{label}</span>}
    </button>
  );
}
