import React from 'react';
import { Home, Gift, Users, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TabType } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setActiveGame } = useApp();

  const handleTabClick = (tab: TabType) => {
    if (tab === 'home') {
      setActiveGame('lobby');
    }
    setActiveTab(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto px-2 flex items-center justify-between relative h-16">
        {/* Home */}
        <button
          onClick={() => handleTabClick('home')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'home' ? 'text-rose-500 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home size={21} className={activeTab === 'home' ? 'stroke-[2.5]' : ''} />
          <span className="text-[11px] mt-0.5">Home</span>
        </button>

        {/* Activity */}
        <button
          onClick={() => handleTabClick('activity')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'activity' ? 'text-rose-500 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Gift size={21} className={activeTab === 'activity' ? 'stroke-[2.5]' : ''} />
          <span className="text-[11px] mt-0.5">Activity</span>
        </button>

        {/* Center Floating Get ₹500 Wheel Button */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-6">
          <button
            onClick={() => handleTabClick('invite-wheel')}
            className="group relative flex flex-col items-center cursor-pointer"
          >
            {/* Pulsing wheel outer glow */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-red-500 p-0.5 shadow-lg shadow-rose-500/30 transform transition-transform group-hover:scale-110 active:scale-95">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-red-500 to-rose-600 flex flex-col items-center justify-center text-white border-2 border-yellow-300">
                <span className="text-[10px] font-black tracking-tight leading-none text-yellow-200 uppercase">GO</span>
                <span className="text-[8px] font-extrabold tracking-tighter text-white">SPIN</span>
              </div>
            </div>
            <span className={`text-[10px] mt-1 font-bold whitespace-nowrap px-1.5 py-0.5 rounded-full ${
              activeTab === 'invite-wheel'
                ? 'bg-rose-500 text-white'
                : 'text-rose-600 bg-rose-50 font-semibold'
            }`}>
              Get ₹500
            </span>
          </button>
        </div>

        {/* Promotion */}
        <button
          onClick={() => handleTabClick('promotion')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'promotion' ? 'text-rose-500 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users size={21} className={activeTab === 'promotion' ? 'stroke-[2.5]' : ''} />
          <span className="text-[11px] mt-0.5">Promotion</span>
        </button>

        {/* Account */}
        <button
          onClick={() => handleTabClick('account')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === 'account' ? 'text-rose-500 font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <User size={21} className={activeTab === 'account' ? 'stroke-[2.5]' : ''} />
          <span className="text-[11px] mt-0.5">Account</span>
        </button>
      </div>
    </nav>
  );
};
