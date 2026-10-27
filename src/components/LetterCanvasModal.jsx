import React, { useRef, useState, useEffect } from 'react';
import { X, RotateCcw, Check, Sparkles, Palette, Edit3 } from 'lucide-react';
import { storageService } from '../services/storage';
import { soundFx } from '../services/soundFx';
import confetti from 'canvas-confetti';

export default function LetterCanvasModal({ letter, onClose }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#059669'); // emerald
  const [strokeWidth, setStrokeWidth] = useState(14);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [selectedFormIndex, setSelectedFormIndex] = useState(0);

  if (!letter) return null;

  const formsList = [
    { label: 'Отдельно', text: letter.forms?.isolated || letter.arabic },
    { label: 'В начале', text: letter.forms?.initial || letter.arabic },
    { label: 'В середине', text: letter.forms?.medial || letter.arabic },
    { label: 'В конце', text: letter.forms?.final || letter.arabic }
  ].filter(f => f.text && f.text !== '-');

  const currentForm = formsList[selectedFormIndex] || formsList[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // Set actual canvas resolution matching CSS size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    clearCanvas();
  }, [selectedFormIndex]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    soundFx.playTap();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
  };

  const handleFinish = () => {
    soundFx.playSuccess();
    storageService.addXp(10);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Пропись: {letter.name}</span>
                <span className="font-arabic text-emerald-600 text-lg">({letter.arabic})</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Обведите пальцем или пером по контуру
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Position tabs: Isolated, Initial, Medial, Final */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 text-center" dir="rtl">
          {formsList.map((form, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedFormIndex(idx);
                soundFx.playTap();
              }}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                selectedFormIndex === idx
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/20'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <span className="font-arabic text-xl block leading-tight">{form.text}</span>
              <span className="text-[10px] opacity-75 font-sans" dir="ltr">{form.label}</span>
            </button>
          ))}
        </div>

        {/* Canvas Workspace with guide background */}
        <div className="relative flex-1 min-h-[280px] sm:min-h-[320px] bg-[#FAF7F0] dark:bg-slate-950 flex items-center justify-center select-none overflow-hidden touch-none">
          {/* Guide Watermark Letter */}
          {showGuide && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none font-arabic font-bold text-[180px] sm:text-[220px] text-slate-300/40 dark:text-slate-700/40 transition-all leading-none"
              dir="rtl"
            >
              {currentForm.text}
            </div>
          )}

          {/* Calibrated writing lines */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 opacity-30 dark:opacity-20">
            <div className="border-b border-dashed border-emerald-400 w-full" />
            <div className="border-b-2 border-emerald-600 w-full" />
            <div className="border-b border-dashed border-emerald-400 w-full" />
          </div>

          {/* Interactive Drawing Canvas */}
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
          />

          {!hasDrawn && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-[11px] font-bold text-slate-500 pointer-events-none border border-slate-200 dark:border-slate-700">
              ✍️ Проведите пальцем, чтобы написать
            </div>
          )}
        </div>

        {/* Toolbar & Controls */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          {/* Colors */}
          <div className="flex items-center gap-1.5">
            {['#059669', '#d97706', '#2563eb', '#dc2626', '#1e293b'].map(c => (
              <button
                key={c}
                onClick={() => {
                  setStrokeColor(c);
                  soundFx.playTap();
                }}
                className={`w-7 h-7 rounded-full border-2 transition-transform active:scale-90 ${
                  strokeColor === c ? 'scale-110 border-white shadow-md ring-2 ring-emerald-500' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* Toggle Guide & Clear */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                showGuide
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
              }`}
            >
              {showGuide ? 'Контур: Вкл' : 'Контур: Выкл'}
            </button>

            <button
              onClick={() => {
                clearCanvas();
                soundFx.playTap();
              }}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 active:scale-95 transition-all"
              title="Очистить холст"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleFinish}
              disabled={!hasDrawn}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 ${
                hasDrawn
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Готово (+10 XP)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
