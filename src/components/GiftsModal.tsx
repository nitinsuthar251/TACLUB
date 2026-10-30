import React, { useState } from 'react';
import { Gift, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';

export const GiftsModal: React.FC = () => {
  const { isGiftsOpen, setIsGiftsOpen, claimGiftCode } = useApp();
  const [code, setCode] = useState('');

  if (!isGiftsOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    const success = claimGiftCode(code);
    if (success) {
      setCode('');
      setIsGiftsOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <Gift size={20} className="text-rose-500" />
            <h4 className="font-black text-sm text-slate-900">Redeem Gift Code</h4>
          </div>
          <button onClick={() => setIsGiftsOpen(false)} className="text-slate-400 font-bold p-1">✕</button>
        </div>

        <div className="text-center space-y-1">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 flex items-center justify-center text-3xl">
            🎁
          </div>
          <p className="text-xs text-slate-500">
            Enter your gift voucher code below to receive free wallet bonus cash!
          </p>
          <div className="text-[10px] text-rose-500 font-bold">
            Try codes: <span className="underline cursor-pointer" onClick={() => setCode('BONUS500')}>BONUS500</span> or <span className="underline cursor-pointer" onClick={() => setCode('91CLUB2026')}>91CLUB2026</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter gift code..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-center tracking-wider uppercase outline-hidden focus:border-rose-500"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-rose-500/25 active:scale-95 transition-all"
          >
            Claim Gift Reward
          </button>
        </form>
      </div>
    </div>
  );
};
