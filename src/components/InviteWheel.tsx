import React, { useState } from 'react';
import { ChevronLeft, HelpCircle, Share2, Sparkles, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

const wheelSectors = [
  { label: '₹10', value: 10, angle: 0, color: '#fef08a' },
  { label: '₹500', value: 500, angle: 45, color: '#f87171' },
  { label: '₹50', value: 50, angle: 90, color: '#fde047' },
  { label: '₹80', value: 80, angle: 135, color: '#fb923c' },
  { label: '₹20', value: 20, angle: 180, color: '#fef08a' },
  { label: '₹30', value: 30, angle: 225, color: '#fde047' },
  { label: '₹50', value: 50, angle: 270, color: '#fb923c' },
  { label: '₹10', value: 10, angle: 315, color: '#fef08a' },
];

export const InviteWheel: React.FC = () => {
  const { user, setActiveTab, wheelAmount, wheelSpins, spinWheel, cashoutWheel, showToast } = useApp();

  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const remaining = Math.max(0, Math.round((500 - wheelAmount) * 100) / 100);

  const handleSpinClick = async () => {
    if (isSpinning) return;
    if (wheelSpins <= 0) {
      showToast('No free spins left! Click "Invite Friends" below to get +1 Free Spin!', 'info');
      return;
    }

    setIsSpinning(true);
    sound.playClick();

    // Random sector offset
    const randomSector = Math.floor(Math.random() * wheelSectors.length);
    const extraSpins = 5 * 360;
    const targetRotation = rotation + extraSpins + (360 - wheelSectors[randomSector].angle);

    setRotation(targetRotation);

    setTimeout(async () => {
      setIsSpinning(false);
      const wonPrize = await spinWheel();
      sound.playWin();
      confetti({ particleCount: 60, spread: 50 });
      showToast(`Won ₹${wonPrize.toFixed(2)} added towards your ₹500 prize!`, 'success');
    }, 3200);
  };

  const handleShareInvite = () => {
    sound.playCoin();
    navigator.clipboard?.writeText(`https://91club.app/invite?code=${user.invitationCode}`);
    showToast('Invitation link copied! Share to get +1 Free Spin bonus!', 'success');
  };

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-gradient-to-b from-red-600 via-rose-700 to-red-900 text-white px-3 pt-2 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { sound.playClick(); setActiveTab('home'); }}
          className="flex items-center gap-1 text-white/90 hover:text-white font-bold text-xs bg-white/10 px-2.5 py-1.5 rounded-xl backdrop-blur-xs"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        <h3 className="font-black text-base text-yellow-300 tracking-wide uppercase">
          Invite Wheel
        </h3>

        <button
          onClick={() => setShowRules(true)}
          className="text-white/80 hover:text-white"
        >
          <HelpCircle size={18} />
        </button>
      </div>

      {/* Cash Status Card matching 00:30 */}
      <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center space-y-2">
        <div className="text-[11px] text-yellow-200 font-bold uppercase tracking-wider">
          My Amount (56:10:00 remaining)
        </div>
        <div className="text-4xl font-black font-mono tracking-tight text-yellow-300 drop-shadow-md">
          ₹{wheelAmount.toFixed(2)}
        </div>
        <div>
          <button
            onClick={cashoutWheel}
            className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all ${
              wheelAmount >= 500
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 animate-bounce'
                : 'bg-white/20 text-white/80 border border-white/30'
            }`}
          >
            {wheelAmount >= 500 ? 'CASH OUT ₹500 NOW' : 'CASH OUT'}
          </button>
        </div>
      </div>

      {/* Rotating Lucky Wheel Container */}
      <div className="relative flex flex-col items-center justify-center my-4">
        {/* Pointer Triangle at top */}
        <div className="absolute top-0 z-30 -mt-2">
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-yellow-300 filter drop-shadow-lg" />
        </div>

        {/* Wheel Body */}
        <div className="w-72 h-72 rounded-full p-2.5 bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 shadow-[0_0_35px_rgba(250,204,21,0.5)] border-4 border-yellow-200">
          <div
            className="w-full h-full rounded-full relative overflow-hidden transition-all duration-[3000ms] cubic-bezier(0.15,0.9,0.2,1)"
            style={{
              transform: `rotate(${rotation}deg)`,
              backgroundColor: '#b91c1c',
            }}
          >
            {/* 8 Sector Slices */}
            {wheelSectors.map((sector, idx) => (
              <div
                key={idx}
                className="absolute w-full h-full top-0 left-0"
                style={{
                  transform: `rotate(${sector.angle}deg)`,
                  transformOrigin: '50% 50%',
                }}
              >
                <div className="w-full flex justify-center pt-3">
                  <span className="text-sm font-black text-yellow-200 drop-shadow-sm font-mono transform rotate-90">
                    {sector.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Spin Hub Button */}
        <button
          onClick={handleSpinClick}
          disabled={isSpinning}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 rounded-full bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600 border-4 border-white flex flex-col items-center justify-center shadow-2xl active:scale-95 transition-transform"
        >
          <span className="text-xs font-black text-slate-950 uppercase leading-none">
            {isSpinning ? '...' : `X${wheelSpins}`}
          </span>
          <span className="text-[9px] font-black text-red-950 uppercase">FREE SPIN</span>
        </button>
      </div>

      {/* Progress & Invite CTA matching 00:31 */}
      <div className="space-y-3">
        <div className="text-center text-xs font-bold text-yellow-200">
          Only <span className="text-white font-black text-sm">₹{remaining.toFixed(2)}</span> left to get prize ₹500.00!
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/20">
          <div
            className="h-full bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${Math.min(100, (wheelAmount / 500) * 100)}%` }}
          />
        </div>

        <button
          onClick={handleShareInvite}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 hover:from-yellow-300 hover:to-yellow-200 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-yellow-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Share2 size={16} />
          <span>Invite Friends To Get Free Spin</span>
        </button>
      </div>

      {/* Recent Records list matching 00:31 */}
      <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3 border border-white/10 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-yellow-200 pb-1 border-b border-white/10">
          <span>Winner Record</span>
          <span className="text-[10px] text-white/70">Real-time Claims</span>
        </div>

        <div className="space-y-1.5 text-xs">
          {[
            { user: 'MemberNNGPZPVX', amount: '₹0.10', time: '2026-10-29 08:29:27' },
            { user: 'Member8841920', amount: '₹500.00', time: '2026-10-29 08:25:12' },
            { user: 'Member2019481', amount: '₹500.00', time: '2026-10-29 08:18:44' },
          ].map((rec, i) => (
            <div key={i} className="flex items-center justify-between text-white/90">
              <span className="truncate max-w-[140px] text-[11px]">{rec.user}</span>
              <span className="font-black text-yellow-300">{rec.amount}</span>
              <span className="text-[10px] text-white/50">{rec.time.slice(11)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 text-slate-900">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full space-y-3 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="font-black text-sm">Wheel Rules</h4>
              <button onClick={() => setShowRules(false)} className="text-slate-400 font-bold">✕</button>
            </div>
            <div className="text-xs text-slate-600 space-y-2">
              <p>1. Spin the wheel to accumulate cash.</p>
              <p>2. Once your amount reaches ₹500.00, click Cash Out to credit funds directly into your main gaming wallet.</p>
              <p>3. Every friend invited through your code gives +1 Free Spin!</p>
            </div>
            <button
              onClick={() => setShowRules(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
