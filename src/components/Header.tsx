import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Headphones, Bell, Plus, User, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';

export const Header: React.FC = () => {
  const { 
    user,
    currentBalance,
    soundEnabled, 
    toggleSound, 
    setIsSupportOpen, 
    setIsNotificationOpen, 
    setIsAdminOpen,
    setIsDepositOpen,
    setIsAuthModalOpen,
    setAuthModalTab,
    adminSettings 
  } = useApp();

  // Secret Admin Trigger: 5 rapid taps on DMD CLUB logo
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoSecretClick = () => {
    sound.playClick();
    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    if (nextCount >= 5) {
      // Secret 5-tap triggered: Open Master Key Console
      sound.playWin();
      setIsAdminOpen(true);
      setClickCount(0);
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        setClickCount(0);
      }, 2500);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-md mx-auto px-3 py-2 flex items-center justify-between">
        {/* Brand Logo - TA Club with Secret Admin Trigger (5 taps) */}
        <div 
          onClick={handleLogoSecretClick}
          className="flex items-center gap-2 cursor-pointer select-none active:scale-95 transition-transform"
          title="TA Club (5 taps opens Master Admin)"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 flex items-center justify-center shadow-md shadow-rose-500/20">
            <span className="text-white font-black text-xs tracking-tighter">TA</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-wider text-slate-900 leading-none flex items-center gap-1">
              TA CLUB <span className="text-[8px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold tracking-normal uppercase">VIP</span>
            </span>
            <span className="text-[9px] font-semibold text-rose-500 tracking-wider">TA अर्निंग क्लब</span>
          </div>
        </div>

        {/* Quick Balance & Deposit Action */}
        <div className="flex items-center gap-1.5">
          <div 
            onClick={() => { sound.playClick(); setIsDepositOpen(true); }}
            className="flex items-center gap-1 bg-rose-50/80 hover:bg-rose-100/80 px-2.5 py-1 rounded-full border border-rose-200 cursor-pointer transition-all active:scale-95"
          >
            <span className="text-[10px] font-black text-rose-600">₹{currentBalance.toFixed(2)}</span>
            <div className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold">
              <Plus size={10} />
            </div>
          </div>
        </div>

        {/* Quick action icons (Customer Support, Notifications, Sound, Account) */}
        <div className="flex items-center gap-1">
          {/* Quick Login / Register Trigger */}
          <button
            onClick={() => {
              sound.playClick();
              setAuthModalTab('login');
              setIsAuthModalOpen(true);
            }}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
            title="Log In / Register"
          >
            <LogIn size={13} />
          </button>

          <button
            onClick={() => setIsNotificationOpen(true)}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors relative"
            title="Notifications"
          >
            <Bell size={13} />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          <button
            onClick={() => setIsSupportOpen(true)}
            className="w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 hover:bg-rose-100 transition-colors"
            title="Customer Support 24/7"
          >
            <Headphones size={13} />
          </button>

          <button
            onClick={toggleSound}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
              soundEnabled ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'
            }`}
            title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>
        </div>
      </div>

      {/* Marquee Audio Announce ticker from Admin Settings */}
      <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 px-3 py-1 flex items-center gap-2 text-[11px] text-slate-700 border-t border-rose-100/50 overflow-hidden">
        <span className="text-rose-500 font-bold shrink-0 flex items-center gap-1">
          <Volume2 size={12} className="animate-pulse" />
          <span>Notice:</span>
        </span>
        <div className="overflow-hidden whitespace-nowrap w-full">
          <div className="inline-block animate-[marquee_22s_linear_infinite] font-medium text-slate-700">
            {adminSettings.marqueeNotice}
          </div>
        </div>
      </div>
    </header>
  );
};
