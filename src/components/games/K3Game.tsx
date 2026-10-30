import React, { useState, useEffect } from 'react';
import { ChevronLeft, RotateCcw, Volume2, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';

const dicePips: Record<number, string> = {
  1: '⚀',
  2: '⚁',
  3: '⚂',
  4: '⚃',
  5: '⚄',
  6: '⚅',
};

const totalOdds: { sum: number; multiplier: number }[] = [
  { sum: 3, multiplier: 207.36 },
  { sum: 4, multiplier: 69.12 },
  { sum: 5, multiplier: 34.56 },
  { sum: 6, multiplier: 20.73 },
  { sum: 7, multiplier: 13.82 },
  { sum: 8, multiplier: 9.88 },
  { sum: 9, multiplier: 8.30 },
  { sum: 10, multiplier: 7.68 },
  { sum: 11, multiplier: 7.68 },
  { sum: 12, multiplier: 8.30 },
  { sum: 13, multiplier: 9.88 },
  { sum: 14, multiplier: 13.82 },
  { sum: 15, multiplier: 20.73 },
  { sum: 16, multiplier: 34.56 },
  { sum: 17, multiplier: 69.12 },
  { sum: 18, multiplier: 207.36 },
];

export const K3Game: React.FC = () => {
  const { user, setActiveGame, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'total' | '2same' | '3same' | 'diff'>('total');
  const [dice, setDice] = useState<[number, number, number]>([3, 5, 2]);
  const [isRolling, setIsRolling] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25);
  const [period, setPeriod] = useState('2026102910011135');

  // Bets
  const [bets, setBets] = useState<{ label: string; amount: number; multiplier: number }[]>([]);
  const [chipAmount, setChipAmount] = useState(10);
  const [lastWin, setLastWin] = useState<number | null>(null);

  // Countdown loop
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          rollDiceRound();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [bets]);

  const rollDiceRound = () => {
    setIsRolling(true);
    sound.playClick();

    setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const d3 = Math.floor(Math.random() * 6) + 1;
      setDice([d1, d2, d3]);
      setIsRolling(false);

      const totalSum = d1 + d2 + d3;
      const isBig = totalSum >= 11;

      // Calculate bet winnings
      let totalWon = 0;
      bets.forEach((b) => {
        if (b.label === `Sum ${totalSum}` || b.label === String(totalSum)) {
          totalWon += b.amount * b.multiplier;
        } else if (b.label === 'Big' && isBig) {
          totalWon += b.amount * 1.96;
        } else if (b.label === 'Small' && !isBig) {
          totalWon += b.amount * 1.96;
        } else if (b.label === 'Odd' && totalSum % 2 !== 0) {
          totalWon += b.amount * 1.96;
        } else if (b.label === 'Even' && totalSum % 2 === 0) {
          totalWon += b.amount * 1.96;
        }
      });

      if (totalWon > 0) {
        sound.playWin();
        confetti({ particleCount: 70, spread: 60 });
        user.balance += totalWon;
        setLastWin(totalWon);
        showToast(`K3 Win! Dice: ${d1}, ${d2}, ${d3} (Sum ${totalSum}). Won ₹${totalWon.toFixed(2)}`, 'success');
      } else if (bets.length > 0) {
        showToast(`Round finished: Dice ${d1}, ${d2}, ${d3} (Sum ${totalSum})`, 'info');
      }

      setBets([]);
      setPeriod((p) => String(BigInt(p) + 1n));
    }, 1500);
  };

  const handlePlaceBet = (label: string, mult: number) => {
    if (chipAmount > user.balance) {
      showToast('Insufficient wallet balance!', 'error');
      return;
    }
    sound.playCoin();
    user.balance -= chipAmount;
    setBets((prev) => [...prev, { label, amount: chipAmount, multiplier: mult }]);
    showToast(`Bet ₹${chipAmount} placed on ${label}!`, 'success');
  };

  const totalDiceSum = dice[0] + dice[1] + dice[2];

  return (
    <div className="pb-24 max-w-md mx-auto px-3 space-y-3 pt-2">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { sound.playClick(); setActiveGame('lobby'); }}
          className="flex items-center gap-1 text-slate-700 font-bold text-xs bg-white px-2.5 py-1.5 rounded-xl border border-slate-200"
        >
          <ChevronLeft size={16} />
          <span>Lobby</span>
        </button>

        <div className="text-center font-extrabold text-sm text-slate-900">
          K3 Lottery
        </div>

        <div className="bg-white px-3 py-1 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900">
          ₹{user.balance.toFixed(2)}
        </div>
      </div>

      {/* Period & Timer Card */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-3.5 text-white shadow-md">
        <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-2">
          <div>
            <div className="text-[10px] text-white/80">Period</div>
            <div className="text-sm font-mono font-black text-yellow-300">{period}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-white/80">Time remaining</div>
            <div className="text-lg font-mono font-black text-yellow-300">
              00:{String(timeLeft).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* 3 3D Animated Red Dice */}
        <div className="py-3 bg-emerald-800/80 rounded-xl border border-emerald-600/50 flex flex-col items-center justify-center">
          <div className="flex items-center gap-4">
            {dice.map((d, i) => (
              <div
                key={i}
                className={`w-14 h-14 bg-gradient-to-br from-red-500 to-rose-700 rounded-2xl flex items-center justify-center text-4xl text-white shadow-lg border-2 border-white/60 transform transition-transform ${
                  isRolling ? 'animate-spin scale-110' : 'hover:scale-105'
                }`}
              >
                {dicePips[d]}
              </div>
            ))}
          </div>

          <div className="mt-2 text-xs font-bold text-emerald-200 flex items-center gap-2">
            <span>Result: {dice[0]} + {dice[1]} + {dice[2]} =</span>
            <span className="text-sm font-black text-yellow-300 px-2 py-0.5 rounded-full bg-black/40">
              {totalDiceSum} ({totalDiceSum >= 11 ? 'Big' : 'Small'}, {totalDiceSum % 2 === 0 ? 'Even' : 'Odd'})
            </span>
          </div>
        </div>
      </div>

      {/* Chip selector */}
      <div className="flex items-center justify-between gap-1.5 bg-white p-2 rounded-xl border border-slate-200">
        <span className="text-xs font-bold text-slate-500">Chip:</span>
        {[10, 50, 100, 500, 1000].map((c) => (
          <button
            key={c}
            onClick={() => { sound.playClick(); setChipAmount(c); }}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
              chipAmount === c ? 'bg-rose-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
            }`}
          >
            ₹{c}
          </button>
        ))}
      </div>

      {/* Big / Small / Odd / Even Quick Bets */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Big', sub: '11-18 (1.96x)', mult: 1.96, color: 'bg-amber-500' },
          { label: 'Small', sub: '3-10 (1.96x)', mult: 1.96, color: 'bg-blue-500' },
          { label: 'Odd', sub: '(1.96x)', mult: 1.96, color: 'bg-purple-500' },
          { label: 'Even', sub: '(1.96x)', mult: 1.96, color: 'bg-teal-500' },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => handlePlaceBet(item.label, item.mult)}
            className={`${item.color} text-white font-bold py-2 rounded-xl shadow-xs text-center active:scale-95 transition-transform flex flex-col items-center justify-center`}
          >
            <span className="text-xs font-black">{item.label}</span>
            <span className="text-[9px] opacity-90">{item.sub}</span>
          </button>
        ))}
      </div>

      {/* Sum Number Grid matching 00:23 */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-700 pb-1 border-b border-slate-100">
          <span>Total Sum Numbers</span>
          <span className="text-[10px] text-slate-400">Click to bet ₹{chipAmount}</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {totalOdds.map((o) => (
            <button
              key={o.sum}
              onClick={() => handlePlaceBet(`Sum ${o.sum}`, o.multiplier)}
              className="p-2 rounded-xl border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 flex flex-col items-center justify-center active:scale-90 transition-transform"
            >
              <div className="w-8 h-8 rounded-full bg-rose-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                {o.sum}
              </div>
              <span className="text-[10px] font-bold text-slate-500 mt-1">{o.multiplier}X</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Bets for this round */}
      {bets.length > 0 && (
        <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs space-y-1">
          <div className="font-bold text-amber-900">Your Active Bets ({bets.length}):</div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {bets.map((b, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-bold text-[11px]">
                {b.label}: ₹{b.amount}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
