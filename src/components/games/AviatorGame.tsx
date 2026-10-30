import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ShieldCheck, Flame, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface PlayerBet {
  player: string;
  amount: number;
  cashedMultiplier?: number;
  wonAmount?: number;
}

export const AviatorGame: React.FC = () => {
  const { 
    user, 
    setActiveGame, 
    showToast, 
    adminSettings, 
    currentBalance 
  } = useApp();

  // Multiplier history ribbon matching official Aviator
  const [history, setHistory] = useState<number[]>([
    1.42, 2.15, 1.10, 5.84, 1.95, 14.20, 3.40, 1.25, 7.80, 2.05, 1.05, 4.12
  ]);

  // Game state: 'waiting' | 'flying' | 'crashed'
  const [gameState, setGameState] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [crashPoint, setCrashPoint] = useState<number>(2.50);
  const [countdown, setCountdown] = useState<number>(5);

  // User Bet state
  const [betAmount, setBetAmount] = useState<number>(20);
  const [hasBet, setHasBet] = useState<boolean>(false);
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  const [cashedWinAmount, setCashedWinAmount] = useState<number>(0);

  // Simulated live players
  const [simulatedBets, setSimulatedBets] = useState<PlayerBet[]>([
    { player: '98***41', amount: 500 },
    { player: '88***12', amount: 1000 },
    { player: '70***90', amount: 250 },
    { player: '91***05', amount: 2000 },
    { player: '96***33', amount: 150 },
  ]);

  // Plane animation coordinates
  const [planePos, setPlanePos] = useState<{ x: number; y: number; angle: number }>({ x: 30, y: 180, angle: -10 });

  // References for reliable animation loop
  const animFrameRef = useRef<number | null>(null);
  const flightStartTimeRef = useRef<number>(0);

  // Generate crash point (respects Admin Panel override if set!)
  const getNextCrashPoint = (): number => {
    if (adminSettings?.forcedAviatorCrash && adminSettings.forcedAviatorCrash >= 1.01) {
      return adminSettings.forcedAviatorCrash;
    }
    const rand = Math.random();
    if (rand < 0.12) return 1.02 + Math.random() * 0.18; // Instant crash 1.02 - 1.20
    if (rand < 0.55) return 1.25 + Math.random() * 1.50; // 1.25 - 2.75
    if (rand < 0.82) return 2.80 + Math.random() * 3.50; // 2.80 - 6.30
    if (rand < 0.95) return 6.50 + Math.random() * 9.00; // 6.50 - 15.5
    return 16.0 + Math.random() * 40.0; // 16x - 56x mega
  };

  // State Machine: Main Loop
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (gameState === 'waiting') {
      // Countdown phase: 5 -> 4 -> 3 -> 2 -> 1 -> Takeoff
      if (countdown > 0) {
        timer = setTimeout(() => {
          setCountdown((c) => c - 1);
        }, 1000);
      } else {
        // Takeoff time!
        const nextCrash = getNextCrashPoint();
        setCrashPoint(nextCrash);
        setMultiplier(1.00);
        setHasCashedOut(false);
        setCashedWinAmount(0);
        setPlanePos({ x: 30, y: 180, angle: -15 });
        setGameState('flying');
        flightStartTimeRef.current = performance.now();
      }
    } else if (gameState === 'crashed') {
      // After crash, wait 2.5 seconds then start new round countdown
      timer = setTimeout(() => {
        setGameState('waiting');
        setCountdown(5);
        setMultiplier(1.00);
        setHasBet(false);
        setHasCashedOut(false);
      }, 2500);
    }

    return () => clearTimeout(timer);
  }, [gameState, countdown]);

  // Flight Animation loop: Runs when gameState === 'flying'
  useEffect(() => {
    if (gameState !== 'flying') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const cp = crashPoint;

    const animateFlight = (now: number) => {
      const elapsedSeconds = (now - flightStartTimeRef.current) / 1000;
      
      // Multiplier growth formula: smooth exponential curve
      const currentMult = 1.00 + elapsedSeconds * 0.12 + Math.pow(elapsedSeconds * 0.42, 1.85);

      if (currentMult >= cp) {
        // CRASH EVENT
        sound.playCrash();
        setMultiplier(cp);
        setGameState('crashed');
        setHistory((prev) => [parseFloat(cp.toFixed(2)), ...prev.slice(0, 14)]);
        
        // Plane blasts off screen
        setPlanePos((p) => ({
          x: p.x + 80,
          y: p.y - 60,
          angle: -40,
        }));
      } else {
        // Continue flying
        const formattedMult = parseFloat(currentMult.toFixed(2));
        setMultiplier(formattedMult);

        // Calculate smooth trajectory for plane coordinates
        // Width: 320, Height: 210
        const progress = Math.min(1, (currentMult - 1) / Math.max(1.2, cp - 0.5));
        
        // Bezier flight curve from (30, 180) to (240, 45)
        const newX = 30 + progress * 210;
        const newY = 180 - Math.pow(progress, 0.75) * 135;
        const angle = -12 - progress * 18;

        setPlanePos({ x: newX, y: newY, angle });

        // Random simulated cashouts for other players
        if (Math.random() < 0.08) {
          setSimulatedBets((prev) =>
            prev.map((b) => {
              if (!b.cashedMultiplier && Math.random() < 0.25) {
                return {
                  ...b,
                  cashedMultiplier: formattedMult,
                  wonAmount: Math.round(b.amount * formattedMult),
                };
              }
              return b;
            })
          );
        }

        animFrameRef.current = requestAnimationFrame(animateFlight);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateFlight);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, crashPoint]);

  // Handle User Bet
  const handlePlaceBet = () => {
    if (betAmount > currentBalance) {
      showToast('Insufficient wallet balance to place bet!', 'error');
      return;
    }

    if (hasBet) {
      // Cancel bet if still in waiting phase
      if (gameState === 'waiting') {
        user.balance += betAmount;
        setHasBet(false);
        showToast('Bet cancelled and refunded.', 'info');
      } else {
        showToast('Cannot cancel bet while flight is in progress!', 'error');
      }
      return;
    }

    sound.playCoin();
    user.balance -= betAmount;
    setHasBet(true);
    showToast(`Bet of ₹${betAmount.toFixed(2)} confirmed! Ready for flight.`, 'success');
  };

  // Handle User Cashout
  const handleCashout = () => {
    if (!hasBet || hasCashedOut || gameState !== 'flying') return;

    sound.playWin();
    confetti({ particleCount: 80, spread: 70 });
    const win = Math.round(betAmount * multiplier * 100) / 100;
    user.balance += win;
    setCashedWinAmount(win);
    setHasCashedOut(true);
    setHasBet(false);
    showToast(`🎉 Cashed out ₹${win.toFixed(2)} at ${multiplier.toFixed(2)}x!`, 'success');
  };

  return (
    <div className="pb-24 max-w-md mx-auto px-2 space-y-2.5 pt-2 bg-[#0b0e14] text-white min-h-screen">
      {/* Top Header */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-800/80">
        <button
          onClick={() => { sound.playClick(); setActiveGame('lobby'); }}
          className="flex items-center gap-1 text-slate-400 hover:text-white text-xs font-bold bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800"
        >
          <ChevronLeft size={16} />
          <span>Exit to Lobby</span>
        </button>

        {/* Aviator Official Branding */}
        <div className="flex items-center gap-1.5">
          <span className="text-red-500 font-black tracking-widest text-lg italic uppercase">
            Aviator
          </span>
          <span className="text-sm">✈️</span>
        </div>

        {/* Real Balance Display */}
        <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800 shadow-inner">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Wallet</span>
          <span className="text-xs font-mono font-black text-emerald-400">
            ₹{currentBalance.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Multiplier History Ribbon */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1">
        {history.map((m, idx) => {
          let badgeClass = 'bg-blue-950/80 text-blue-300 border-blue-800/60';
          if (m >= 10.0) badgeClass = 'bg-amber-950/90 text-amber-300 border-amber-600/70 font-black';
          else if (m >= 2.0) badgeClass = 'bg-purple-950/80 text-purple-300 border-purple-800/60';

          return (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border shrink-0 ${badgeClass}`}
            >
              {m.toFixed(2)}x
            </span>
          );
        })}
      </div>

      {/* Aviator Flight Arena Box */}
      <div className="relative h-64 bg-gradient-to-b from-[#0f1420] via-[#0b0e14] to-[#080a0f] rounded-3xl border border-slate-800/90 overflow-hidden flex flex-col items-center justify-center shadow-2xl">
        {/* Radar Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b20_1px,transparent_1px),linear-gradient(to_bottom,#1e293b20_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-3 right-3 flex justify-between items-center z-20 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-full border border-slate-800">
            <ShieldCheck size={11} className="text-emerald-400" />
            <span>Spribe Provably Fair</span>
          </div>
          <span className="text-rose-500/80 font-mono">DMD CLUB LIVE</span>
        </div>

        {/* Center Live Multiplier Counter */}
        {gameState === 'flying' && (
          <div className="z-10 text-center select-none pointer-events-none">
            <div className="text-6xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.45)]">
              {multiplier.toFixed(2)}x
            </div>
            <div className="text-[10px] text-rose-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1 mt-1">
              <Flame size={12} className="animate-pulse" />
              <span>FLYING HIGH</span>
            </div>
          </div>
        )}

        {/* Crashed Screen */}
        {gameState === 'crashed' && (
          <div className="z-10 text-center space-y-1 select-none animate-in zoom-in duration-150">
            <div className="text-xs font-black tracking-widest text-red-500 uppercase drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              FLEW AWAY!
            </div>
            <div className="text-6xl font-black font-mono tracking-tight text-red-500 drop-shadow-[0_0_35px_rgba(239,68,68,0.8)]">
              {multiplier.toFixed(2)}x
            </div>
            <div className="text-[10px] text-slate-400">Next round starting soon...</div>
          </div>
        )}

        {/* Waiting / Betting Countdown Screen */}
        {gameState === 'waiting' && (
          <div className="z-10 text-center space-y-2.5 select-none">
            <div className="w-14 h-14 mx-auto rounded-full border-3 border-red-500/30 border-t-red-500 animate-spin flex items-center justify-center shadow-lg shadow-red-500/20">
              <span className="text-base font-black font-mono text-red-500">{countdown}s</span>
            </div>
            <div className="text-xs font-bold text-slate-300 tracking-wider uppercase">
              Waiting for next flight...
            </div>
            <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${((5 - countdown) / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Interactive SVG Flight Arena: Trajectory & Airplane */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 220">
          <defs>
            <linearGradient id="flightGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.05" />
              <stop offset="60%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.6" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render Curve and Plane when Flying or Crashed */}
          {(gameState === 'flying' || gameState === 'crashed') && (
            <>
              {/* Shaded Area under flight path */}
              <path
                d={`M 25 195 Q ${planePos.x * 0.55} 195 ${planePos.x} ${planePos.y} L ${planePos.x} 195 Z`}
                fill="url(#flightGradient)"
              />

              {/* Glowing Red Curve Line */}
              <path
                d={`M 25 195 Q ${planePos.x * 0.55} 195 ${planePos.x} ${planePos.y}`}
                fill="none"
                stroke="#ef4444"
                strokeWidth="4"
                filter="url(#glow)"
              />

              {/* Animated Red Propeller Jet Airplane */}
              <g
                transform={`translate(${planePos.x}, ${planePos.y}) rotate(${planePos.angle})`}
                className="transition-transform duration-75"
              >
                {/* Jet Thruster Flame */}
                {gameState === 'flying' && (
                  <g transform="translate(-16, 2)">
                    <ellipse cx="-2" cy="0" rx="9" ry="3.5" fill="#f59e0b" className="animate-pulse" />
                    <ellipse cx="2" cy="0" rx="5" ry="2" fill="#ffffff" />
                  </g>
                )}

                {/* Airplane Body SVG */}
                <path
                  d="M -12 -3 L 14 -1 C 18 0 20 2 20 4 C 20 6 18 8 14 9 L -12 11 L -8 4 Z"
                  fill="#dc2626"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />
                {/* Airplane Wings */}
                <path d="M 0 4 L -6 -12 L 2 -12 L 8 4 Z" fill="#b91c1c" />
                <path d="M 0 4 L -6 20 L 2 20 L 8 4 Z" fill="#b91c1c" />
                {/* Tail Wing */}
                <path d="M -10 4 L -16 -6 L -12 -6 L -7 4 Z" fill="#991b1b" />
                {/* Cockpit Window */}
                <ellipse cx="8" cy="4" rx="4" ry="2" fill="#e0f2fe" />
                {/* Propeller */}
                <line x1="20" y1="-2" x2="20" y2="10" stroke="#fef08a" strokeWidth="2" className="animate-spin" />
              </g>
            </>
          )}
        </svg>
      </div>

      {/* Main Betting Dashboard Panel */}
      <div className="bg-[#121824] rounded-3xl p-4 border border-slate-800 space-y-3.5 shadow-xl">
        {/* Quick Amount Options */}
        <div className="grid grid-cols-4 gap-2">
          {[20, 50, 100, 500].map((amt) => (
            <button
              key={amt}
              disabled={gameState === 'flying' && hasBet}
              onClick={() => { sound.playClick(); setBetAmount(amt); }}
              className={`py-1.5 rounded-xl text-xs font-black transition-all border ${
                betAmount === amt
                  ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              ₹{amt}
            </button>
          ))}
        </div>

        {/* Dual Control Area: Amount Picker & Action Button */}
        <div className="grid grid-cols-2 gap-3 items-center">
          {/* Bet Amount Control Box */}
          <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase block text-center">
              Bet Amount (₹)
            </span>
            <div className="flex items-center justify-between">
              <button
                disabled={gameState === 'flying' && hasBet}
                onClick={() => setBetAmount((b) => Math.max(10, b - 10))}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-sm active:scale-95 transition-all"
              >
                -
              </button>
              <span className="text-lg font-black font-mono text-white">
                ₹{betAmount}
              </span>
              <button
                disabled={gameState === 'flying' && hasBet}
                onClick={() => setBetAmount((b) => b + 10)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-sm active:scale-95 transition-all"
              >
                +
              </button>
            </div>
          </div>

          {/* Primary Action Button (BET vs CASHOUT) */}
          {gameState === 'flying' && hasBet && !hasCashedOut ? (
            /* HUGE GLOWING CASHOUT BUTTON */
            <button
              onClick={handleCashout}
              className="w-full h-16 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:opacity-95 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 flex flex-col items-center justify-center active:scale-95 transition-all animate-pulse"
            >
              <div className="flex items-center gap-1 text-xs">
                <Zap size={14} className="fill-slate-950" />
                <span>CASH OUT</span>
              </div>
              <div className="text-base font-mono font-black">
                ₹{(betAmount * multiplier).toFixed(2)}
              </div>
            </button>
          ) : hasCashedOut ? (
            /* Already Cashed Out in this round */
            <div className="w-full h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 font-black text-xs flex flex-col items-center justify-center">
              <span>WON AT {multiplier.toFixed(2)}x!</span>
              <span className="text-base font-mono font-black text-white">+₹{cashedWinAmount.toFixed(2)}</span>
            </div>
          ) : (
            /* BET BUTTON (WAITING OR READY) */
            <button
              onClick={handlePlaceBet}
              className={`w-full h-16 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex flex-col items-center justify-center active:scale-95 transition-all ${
                hasBet
                  ? 'bg-rose-900/60 border border-rose-500 text-rose-300'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:opacity-95 text-white shadow-emerald-600/30'
              }`}
            >
              <span>{hasBet ? 'CANCEL BET' : 'BET'}</span>
              <span className="text-base font-mono font-black mt-0.5">₹{betAmount.toFixed(2)}</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Players Betting List */}
      <div className="bg-[#121824] rounded-3xl p-3 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1 border-b border-slate-800/80 pb-1.5">
          <span>All Bets ({simulatedBets.length + (hasBet ? 1 : 0)})</span>
          <span>Cashout Multiplier</span>
        </div>

        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {hasBet && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-red-950/50 border border-red-700/60 text-xs">
              <span className="font-bold text-white">You ({user.username})</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-300">₹{betAmount}</span>
                {hasCashedOut ? (
                  <span className="font-mono font-black text-emerald-400 text-[11px] bg-emerald-950/80 px-2 py-0.5 rounded-full">
                    {multiplier.toFixed(2)}x
                  </span>
                ) : gameState === 'crashed' ? (
                  <span className="text-[10px] text-red-400 font-bold">Crashed</span>
                ) : (
                  <span className="text-[10px] text-amber-400 font-bold animate-pulse">In Flight</span>
                )}
              </div>
            </div>
          )}

          {simulatedBets.map((b, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs"
            >
              <span className="text-slate-400 font-medium">User {b.player}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-200">₹{b.amount}</span>
                {b.cashedMultiplier ? (
                  <span className="font-mono font-black text-emerald-400 text-[11px] bg-emerald-950/60 px-1.5 py-0.2 rounded">
                    {b.cashedMultiplier}x (+₹{b.wonAmount})
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">-</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
