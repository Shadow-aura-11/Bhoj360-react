import React, { useState, useEffect } from 'react';
import { Delete, XCircle } from 'lucide-react';

export default function PinPad({ onSubmit, length = 4, label = 'Enter PIN' }) {
  const [pin, setPin] = useState([]);

  const handleKeyPress = (digit) => {
    if (pin.length < length) {
      const newPin = [...pin, digit];
      setPin(newPin);
      if (newPin.length === length) {
        // Auto submit with small delay for visual feedback of last key
        setTimeout(() => {
          onSubmit(newPin.join(''));
        }, 150);
      }
    }
  };

  const handleClear = () => {
    setPin([]);
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (/^[0-9]$/.test(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  return (
    <div className="flex flex-col items-center max-w-xs mx-auto p-4 bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-lg animate-slide-up">
      <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
        {label}
      </span>

      {/* Pin Dots */}
      <div className="flex justify-center gap-4 py-4 mb-4">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
              i < pin.length
                ? 'bg-indigo-600 border-indigo-600 scale-110 shadow-lg shadow-indigo-600/20'
                : 'border-slate-200 bg-transparent'
            }`}
          />
        ))}
      </div>

      {/* 3x4 Grid */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleKeyPress(num.toString())}
            className="flex items-center justify-center h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-800 text-xl font-medium transition-all border border-slate-200/60 hover:border-slate-300"
          >
            {num}
          </button>
        ))}

        {/* Column 4: * for Clear, 0, # for Backspace */}
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center justify-center h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-500 hover:text-slate-700 font-medium transition-all"
          title="Clear All"
        >
          <XCircle className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => handleKeyPress('0')}
          className="flex items-center justify-center h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-800 text-xl font-medium transition-all border border-slate-200/60 hover:border-slate-300"
        >
          0
        </button>

        <button
          type="button"
          onClick={handleBackspace}
          className="flex items-center justify-center h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-500 hover:text-slate-700 font-medium transition-all"
          title="Backspace"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
