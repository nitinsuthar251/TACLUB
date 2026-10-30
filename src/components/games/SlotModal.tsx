import React, { useState } from 'react';
import { Coins, Sparkles, Trophy } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';

const slotSymbols = ['👑', '💎', '7️⃣', '🍒', '🔔', '⭐'];

export const SlotModal: React.FC = () => {
  const { user, slotModalGame, setSlotModalGame, showToast } = useApp();

  const [reels, setReels] = useState<[string, string, string]>(['👑', '👑', '👑']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(20);
  const [lastWin, setLastWin] = useState<number | null>(null);

  if (!slotModalGame) return null;

  const handleSpin = () => {
    if (betAmount > user.balance) {
      showToast('Insufficient balance to spin!', 'error');
      return;
    }

    sound.playClick();
    user.balance -= betAmount;
    setIsSpinning(true);
    setLastWin(null);

    // Reel spin interval simulation
    let counter = 0;
    const interval = setInterval(() => {
      setReels([
        slotSymbols[Math.floor(Math.random() * slotSymbols.length)],
        slotSymbols[Math.floor(Math.random() * slotSymbols.length)],
        slotSymbols[Math.floor(Math.random() * slotSymbols.length)],
      ]);
      counter++;
      if (counter > 15) {
        clearInterval(interval);
        // Final outcome
        const r1 = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
        const r2 = Math.random() < 0.4 ? r1 : slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
        const r3 = Math.random() < 0.3 ? r1 : slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
        setReels([r1, r2, r3]);
        setIsSpinning(false);

        // Win check
        if (r1 === r2 && r2 === r3) {
          // 3 match! Jackpot
          const multiplier = r1 === '👑' ? 50 : r1 === '7️⃣' ? 30 : 15;
          const won = betAmount * multiplier;
          sound.playWin();
          confetti({ particleCount: 90, spread: 70 });
          user.balance += won;
          setLastWin(won);
          showToast(`JACKPOT 3x ${r1}! Won ₹${won.toFixed(2)}`, 'success');
        } else if (r1 === r2 || r2 === r3) {
          // 2 match! Minor win
          const won = betAmount * 2.5;
          sound.playCoin();
          user.balance += won;
          setLastWin(won);
          showToast(`2x Match! Won ₹${won.toFixed(2)}`, 'success');
        }
      }
    }, 80);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="w-full max-w-sm bg-gradient-to-b from-amber-950 via-slate-900 to-black rounded-3xl p-5 border-2 border-amber-500/80 shadow-2xl space-y-4 text-white text-center">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-amber-500/30 pb-2">
          <div className="flex items-center gap-1.5">
            <Coins size={18} className="text-yellow-400" />
            <h4 className="font-black text-sm text-yellow-300">{slotModalGame}</h4>
          </div>
          <button onClick={() => setSlotModalGame(null)} className="text-slate-400 hover:text-white font-bold p-1">
            ✕
          </button>
        </div>

        {/* 3 Slot Reels */}
        <div className="bg-black/60 rounded-2xl p-4 border-2 border-yellow-500/50 shadow-inner flex justify-center items-center gap-3">
          {reels.map((symbol, idx) => (
            <div
              key={idx}
              className={`w-20 h-24 rounded-xl bg-gradient-to-b from-slate-800 to-slate-950 border border-amber-400/40 flex items-center justify-center text-4xl shadow-md ${
                isSpinning ? 'animate-bounce' : ''
              }`}
            >
              {symbol}
            </div>
          ))}
        </div>

        {/* Win Notification */}
        {lastWin && (
          <div className="text-sm font-black text-yellow-300 animate-pulse">
            🎉 WINNER: +₹{lastWin.toFixed(2)}!
          </div>
        )}

        {/* Bet Chips */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-slate-400 font-bold">Bet:</span>
          {[10, 20, 50, 100, 500].map((b) => (
            <button
              key={b}
              onClick={() => { sound.playClick(); setBetAmount(b); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono transition-colors ${
                betAmount === b ? 'bg-amber-400 text-slate-950 shadow-xs' : 'bg-slate-800 text-slate-300'
              }`}
            >
              ₹{b}
            </button>
          ))}
        </div>

        {/* Spin Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm uppercase tracking-widest shadow-xl shadow-amber-500/30 active:scale-95 transition-all"
        >
          {isSpinning ? 'SPINNING...' : `SPIN ₹${betAmount}`}
        </button>
      </div>
    </div>
  );
};
