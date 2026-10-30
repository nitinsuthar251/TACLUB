import React, { useState } from 'react';
import { ChevronLeft, Bomb, Gem, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';

export const MinesGame: React.FC = () => {
  const { user, setActiveGame, showToast } = useApp();

  const [minesCount, setMinesCount] = useState(3);
  const [betAmount, setBetAmount] = useState(20);
  const [isPlaying, setIsPlaying] = useState(false);
  const [grid, setGrid] = useState<('hidden' | 'gem' | 'bomb')[]>(Array(25).fill('hidden'));
  const [bombIndices, setBombIndices] = useState<number[]>([]);
  const [gemsFound, setGemsFound] = useState(0);

  // Multiplier formula based on gems found and mines
  const calculateMultiplier = (gems: number) => {
    if (gems === 0) return 1.0;
    let mult = 1.0;
    for (let i = 0; i < gems; i++) {
      mult *= (25 - i) / (25 - minesCount - i);
    }
    return Math.round(mult * 0.97 * 100) / 100; // 3% house edge
  };

  const currentMultiplier = calculateMultiplier(gemsFound);

  const handleStartGame = () => {
    if (betAmount > user.balance) {
      showToast('Insufficient wallet balance!', 'error');
      return;
    }
    sound.playCoin();
    user.balance -= betAmount;

    // Pick random bomb locations
    const indices = new Set<number>();
    while (indices.size < minesCount) {
      indices.add(Math.floor(Math.random() * 25));
    }
    setBombIndices(Array.from(indices));
    setGrid(Array(25).fill('hidden'));
    setGemsFound(0);
    setIsPlaying(true);
    showToast('Game started! Pick safe tiles.', 'info');
  };

  const handleTileClick = (index: number) => {
    if (!isPlaying || grid[index] !== 'hidden') return;

    if (bombIndices.includes(index)) {
      // BOOM!
      sound.playCrash();
      const newGrid = [...grid];
      bombIndices.forEach((b) => (newGrid[b] = 'bomb'));
      setGrid(newGrid);
      setIsPlaying(false);
      showToast('Game Over! You hit a mine.', 'error');
    } else {
      // GEM!
      sound.playClick();
      const newGrid = [...grid];
      newGrid[index] = 'gem';
      setGrid(newGrid);
      const nextGems = gemsFound + 1;
      setGemsFound(nextGems);

      if (nextGems === 25 - minesCount) {
        // Cleared all!
        handleCashout();
      }
    }
  };

  const handleCashout = () => {
    if (!isPlaying || gemsFound === 0) return;
    sound.playWin();
    confetti({ particleCount: 80, spread: 70 });
    const winAmount = Math.round(betAmount * currentMultiplier * 100) / 100;
    user.balance += winAmount;
    setIsPlaying(false);

    // Reveal remaining
    const newGrid = [...grid];
    bombIndices.forEach((b) => {
      if (newGrid[b] === 'hidden') newGrid[b] = 'bomb';
    });
    setGrid(newGrid);

    showToast(`Cashed out ₹${winAmount.toFixed(2)} (${currentMultiplier}x)!`, 'success');
  };

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
          Mines
        </div>

        <div className="bg-white px-3 py-1 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900">
          ₹{user.balance.toFixed(2)}
        </div>
      </div>

      {/* 5x5 Mine Grid */}
      <div className="bg-slate-900 rounded-3xl p-4 shadow-xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400">
          <span>Gems Found: <strong className="text-emerald-400">{gemsFound}</strong></span>
          <span>Current: <strong className="text-amber-400 font-mono text-sm">{currentMultiplier}x</strong></span>
        </div>

        <div className="grid grid-cols-5 gap-2.5">
          {grid.map((tile, idx) => (
            <button
              key={idx}
              onClick={() => handleTileClick(idx)}
              disabled={!isPlaying || tile !== 'hidden'}
              className={`h-14 rounded-2xl flex items-center justify-center text-2xl font-black transition-all ${
                tile === 'gem'
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-md shadow-emerald-500/30 scale-95'
                  : tile === 'bomb'
                  ? 'bg-gradient-to-br from-red-600 to-rose-800 text-white shadow-md shadow-red-500/30 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700/60'
              }`}
            >
              {tile === 'gem' ? '💎' : tile === 'bomb' ? '💣' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        {/* Bet & Mines Selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Bet Amount</label>
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl px-2 py-1.5">
              <span className="text-xs text-rose-500 font-bold">₹</span>
              <input
                type="number"
                disabled={isPlaying}
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(10, Number(e.target.value)))}
                className="w-full bg-transparent text-xs font-mono font-bold outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Mines (1 - 24)</label>
            <select
              disabled={isPlaying}
              value={minesCount}
              onChange={(e) => setMinesCount(Number(e.target.value))}
              className="w-full bg-slate-100 rounded-xl px-3 py-2 text-xs font-bold outline-hidden"
            >
              {[1, 2, 3, 5, 8, 10, 15, 20].map((m) => (
                <option key={m} value={m}>{m} Mines</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Button */}
        {isPlaying ? (
          <button
            onClick={handleCashout}
            disabled={gemsFound === 0}
            className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-md ${
              gemsFound > 0
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Cash Out ₹{(betAmount * currentMultiplier).toFixed(2)}
          </button>
        ) : (
          <button
            onClick={handleStartGame}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-rose-500/25 active:scale-95 transition-all"
          >
            Start Bet ₹{betAmount}
          </button>
        )}
      </div>
    </div>
  );
};
