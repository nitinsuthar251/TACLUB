import React, { useState } from 'react';
import { 
  RotateCw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Crown, 
  Sparkles, 
  Flame, 
  Trophy, 
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  Gamepad2,
  Dice5,
  Coins,
  Megaphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GameViewType } from '../types';
import { sound } from '../utils/audio';

const categories = [
  { id: 'lobby', label: 'Lobby', icon: '🏛️' },
  { id: 'minigame', label: 'Mini Game', icon: '🎮' },
  { id: 'slots', label: 'Slots', icon: '🎰' },
  { id: 'lottery', label: 'Lottery', icon: '🎲' },
  { id: 'card', label: 'Card', icon: '🃏' },
  { id: 'fishing', label: 'Fishing', icon: '🎣' },
  { id: 'casino', label: 'Casino', icon: '💎' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
];

export const HomeLobby: React.FC = () => {
  const { 
    user, 
    currentBalance,
    isInfluencerDemo,
    setActiveGame, 
    setIsDepositOpen, 
    setIsWithdrawOpen, 
    setIsVipOpen, 
    setActiveTab, 
    setSlotModalGame,
    adminSettings,
    showToast 
  } = useApp();

  const [activeCat, setActiveCat] = useState('lobby');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshBalance = () => {
    sound.playClick();
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Wallet balance updated!', 'info');
    }, 600);
  };

  const handleOpenGame = (gameId: GameViewType) => {
    sound.playClick();
    setActiveGame(gameId);
  };

  return (
    <div className="pb-24 max-w-md mx-auto px-3 space-y-4 pt-2">
      {/* Promo Hero Carousel Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-md bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-4">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-300 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
            <Sparkles size={14} className="animate-spin" />
            <span>VIP AGENT BONUS</span>
          </div>
          <h2 className="text-xl font-black tracking-tight leading-tight uppercase">
            Every Time Member Deposit
          </h2>
          <p className="text-xs text-rose-100 font-medium mt-1">
            Agents receive bonus up to <span className="text-amber-300 font-black text-sm">₹2,000,000</span>
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => setActiveTab('promotion')}
              className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1 active:scale-95 transition-transform"
            >
              <span>Join Agency</span>
              <ChevronRight size={13} />
            </button>
            <span className="text-[10px] text-white/80 bg-black/20 px-2 py-1 rounded-full">
              Safe & Instant Payout
            </span>
          </div>
        </div>
      </div>

      {/* 91 Club Style Scrolling Announcement Notice */}
      <div className="bg-white rounded-xl px-3 py-2 border border-slate-100 shadow-2xs flex items-center gap-2 overflow-hidden">
        <div className="flex items-center gap-1 text-rose-500 shrink-0 font-bold text-xs">
          <Megaphone size={14} className="text-rose-500 animate-pulse" />
          <span className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.2 rounded-full font-black uppercase">Notice</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="animate-marquee text-xs font-semibold text-slate-700">
            {adminSettings.marqueeNotice}
          </div>
        </div>
        <button 
          onClick={() => { sound.playClick(); setIsDepositOpen(true); }}
          className="relative shrink-0 text-[10px] bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold px-2.5 py-1 rounded-lg shadow-2xs active:scale-95 transition-transform flex items-center gap-1"
        >
          <span>Deposit</span>
          {!user.firstDepositClaimed && (
            <span className="text-[8px] bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-black">
              +50%
            </span>
          )}
        </button>
      </div>

      {/* Wallet Balance Card matching 91 Club */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <span>💰 Total Wallet Balance</span>
            <button
              onClick={handleRefreshBalance}
              className={`text-slate-400 hover:text-slate-700 transition-transform ${isRefreshing ? 'animate-spin text-rose-500' : ''}`}
              title="Refresh Balance"
            >
              <RotateCw size={13} />
            </button>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            REAL INR (₹)
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
            <span className="text-rose-500 text-xl">₹</span>
            <span>{currentBalance.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { sound.playClick(); setIsWithdrawOpen(true); }}
              className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 font-bold text-xs hover:bg-amber-100 active:scale-95 transition-all shadow-xs"
            >
              <ArrowUpRight size={14} className="text-amber-600" />
              <span>Withdraw</span>
            </button>
            <button
              onClick={() => { sound.playClick(); setIsDepositOpen(true); }}
              className="relative flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold text-xs hover:from-rose-600 hover:to-red-700 active:scale-95 transition-all shadow-md shadow-rose-500/25"
            >
              <ArrowDownLeft size={14} />
              <span>Deposit</span>
              {!user.firstDepositClaimed && (
                <span className="absolute -top-2 -right-1 text-[8px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full border border-white shadow-xs animate-bounce">
                  +50%
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2 Quick Action Cards: Wheel of Fortune & VIP Privileges */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setActiveTab('invite-wheel')}
          className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-3 flex items-center gap-3 text-left hover:shadow-md transition-shadow active:scale-95"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-sm shrink-0">
            <Sparkles size={22} className="animate-spin text-yellow-100" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Wheel of fortune</div>
            <div className="text-[10px] text-amber-700 font-medium">Win up to ₹500 free</div>
          </div>
        </button>

        <button
          onClick={() => setIsVipOpen(true)}
          className="bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200/60 rounded-2xl p-3 flex items-center gap-3 text-left hover:shadow-md transition-shadow active:scale-95"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Crown size={22} className="text-yellow-300" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">VIP privileges</div>
            <div className="text-[10px] text-rose-700 font-medium">Level rewards & rebate</div>
          </div>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              sound.playClick();
              setActiveCat(cat.id);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeCat === cat.id
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-105'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Recommended Games Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <Flame size={18} className="text-rose-500 fill-rose-500" />
          <h3 className="font-extrabold text-sm text-slate-900">Recommended Games</h3>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Popular Now</span>
      </div>

      {/* Main Recommended Cards Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Aviator Crash Game */}
        <div
          onClick={() => handleOpenGame('aviator')}
          className="group relative cursor-pointer rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-black text-white p-2.5 flex flex-col justify-between h-36 border border-slate-800 shadow-sm hover:shadow-lg transition-all active:scale-95"
        >
          <div className="flex justify-between items-start">
            <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full tracking-wider animate-pulse">
              HOT CRASH
            </span>
            <span className="text-[10px] text-amber-400 font-bold">500x+</span>
          </div>

          <div className="my-auto text-center py-1">
            <div className="text-3xl font-black text-rose-500 tracking-tighter">✈️</div>
            <div className="text-xs font-black tracking-wider text-white uppercase mt-1">AVIATOR</div>
            <div className="text-[9px] text-slate-400">Crash Game</div>
          </div>

          <div className="w-full py-1 text-center bg-rose-600 hover:bg-rose-500 text-[10px] font-bold rounded-lg transition-colors">
            Play Now
          </div>
        </div>

        {/* Win Go Color Game */}
        <div
          onClick={() => handleOpenGame('wingo')}
          className="group relative cursor-pointer rounded-2xl overflow-hidden bg-gradient-to-b from-red-600 to-rose-700 text-white p-2.5 flex flex-col justify-between h-36 border border-red-500 shadow-sm hover:shadow-lg transition-all active:scale-95"
        >
          <div className="flex justify-between items-start">
            <span className="bg-amber-400 text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded-full">
              LIVE 30s
            </span>
            <span className="text-[10px] text-white/90 font-bold">9x Win</span>
          </div>

          <div className="my-auto text-center py-1">
            <div className="text-3xl">🔴🟢🟣</div>
            <div className="text-xs font-black tracking-wider text-white uppercase mt-1">WIN GO</div>
            <div className="text-[9px] text-rose-100">Color Prediction</div>
          </div>

          <div className="w-full py-1 text-center bg-white text-rose-600 text-[10px] font-bold rounded-lg shadow-xs transition-colors">
            Play Now
          </div>
        </div>

        {/* K3 Dice Game */}
        <div
          onClick={() => handleOpenGame('k3')}
          className="group relative cursor-pointer rounded-2xl overflow-hidden bg-gradient-to-b from-emerald-700 to-teal-900 text-white p-2.5 flex flex-col justify-between h-36 border border-emerald-600 shadow-sm hover:shadow-lg transition-all active:scale-95"
        >
          <div className="flex justify-between items-start">
            <span className="bg-yellow-400 text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded-full">
              207x
            </span>
            <Dice5 size={14} className="text-emerald-300" />
          </div>

          <div className="my-auto text-center py-1">
            <div className="text-3xl">🎲🎲🎲</div>
            <div className="text-xs font-black tracking-wider text-white uppercase mt-1">K3 LOTTERY</div>
            <div className="text-[9px] text-emerald-200">Dice Numbers</div>
          </div>

          <div className="w-full py-1 text-center bg-emerald-500 hover:bg-emerald-400 text-[10px] font-bold rounded-lg transition-colors">
            Play Now
          </div>
        </div>
      </div>

      {/* Lottery Section Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-black">
            8
          </span>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Lottery</h3>
            <p className="text-[10px] text-slate-400">Fair, independent, transparent rounds</p>
          </div>
        </div>
        <button onClick={() => handleOpenGame('wingo')} className="text-xs text-rose-500 font-bold flex items-center">
          <span>All</span>
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Lottery Cards Banner Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Win Go Banner */}
        <div
          onClick={() => handleOpenGame('wingo')}
          className="cursor-pointer bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-3 text-white flex items-center justify-between shadow-sm active:scale-95 transition-transform"
        >
          <div>
            <div className="text-xs font-black uppercase">Win Go</div>
            <div className="text-[10px] text-purple-200">Guess Green/Red/Violet</div>
            <div className="mt-2 inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[9px] font-bold">
              <span>Enter 30s &amp; 1m</span>
            </div>
          </div>
          <div className="text-3xl">🎯</div>
        </div>

        {/* K3 Banner */}
        <div
          onClick={() => handleOpenGame('k3')}
          className="cursor-pointer bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-3 text-white flex items-center justify-between shadow-sm active:scale-95 transition-transform"
        >
          <div>
            <div className="text-xs font-black uppercase">K3 Lottery</div>
            <div className="text-[10px] text-rose-200">3 Dice Total Sums</div>
            <div className="mt-2 inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[9px] font-bold">
              <span>Enter K3</span>
            </div>
          </div>
          <div className="text-3xl">🎲</div>
        </div>

        {/* 5D Banner */}
        <div
          onClick={() => handleOpenGame('wingo')}
          className="cursor-pointer bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl p-3 text-white flex items-center justify-between shadow-sm active:scale-95 transition-transform"
        >
          <div>
            <div className="text-xs font-black uppercase">5D Lottery</div>
            <div className="text-[10px] text-blue-200">5 Ball Draw</div>
            <div className="mt-2 inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[9px] font-bold">
              <span>Enter 5D</span>
            </div>
          </div>
          <div className="text-3xl">🔮</div>
        </div>

        {/* TRX WinGo */}
        <div
          onClick={() => handleOpenGame('wingo')}
          className="cursor-pointer bg-gradient-to-br from-violet-600 to-indigo-800 rounded-2xl p-3 text-white flex items-center justify-between shadow-sm active:scale-95 transition-transform"
        >
          <div>
            <div className="text-xs font-black uppercase">TRX WinGo</div>
            <div className="text-[10px] text-violet-200">Blockchain Hash Win</div>
            <div className="mt-2 inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[9px] font-bold">
              <span>Trx Fair</span>
            </div>
          </div>
          <div className="text-3xl">⚡</div>
        </div>
      </div>

      {/* Mini Games Section Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1.5">
          <Gamepad2 size={18} className="text-purple-600" />
          <h3 className="font-extrabold text-sm text-slate-900">Mini Game</h3>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Fast Payouts</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {/* Mines */}
        <div
          onClick={() => handleOpenGame('mines')}
          className="cursor-pointer bg-gradient-to-br from-purple-800 to-slate-900 text-white rounded-2xl p-2.5 text-center flex flex-col justify-between h-32 border border-purple-700 active:scale-95 transition-transform"
        >
          <span className="text-[9px] bg-purple-500/80 font-bold px-1.5 py-0.5 rounded-full self-start">
            GEM FIELD
          </span>
          <div className="text-2xl my-auto">💎💣</div>
          <div className="text-xs font-extrabold text-white">MINES</div>
          <div className="text-[9px] text-purple-300">Cash Out Anytime</div>
        </div>

        {/* Limbo */}
        <div
          onClick={() => handleOpenGame('aviator')}
          className="cursor-pointer bg-gradient-to-br from-amber-600 to-rose-700 text-white rounded-2xl p-2.5 text-center flex flex-col justify-between h-32 border border-amber-500 active:scale-95 transition-transform"
        >
          <span className="text-[9px] bg-amber-400 text-slate-900 font-bold px-1.5 py-0.5 rounded-full self-start">
            500X
          </span>
          <div className="text-2xl my-auto">🚀</div>
          <div className="text-xs font-extrabold text-white">LIMBO</div>
          <div className="text-[9px] text-amber-200">Rocket Multiplier</div>
        </div>

        {/* Cricket */}
        <div
          onClick={() => handleOpenGame('wingo')}
          className="cursor-pointer bg-gradient-to-br from-blue-700 to-cyan-900 text-white rounded-2xl p-2.5 text-center flex flex-col justify-between h-32 border border-blue-600 active:scale-95 transition-transform"
        >
          <span className="text-[9px] bg-blue-500 font-bold px-1.5 py-0.5 rounded-full self-start">
            CRICKET
          </span>
          <div className="text-2xl my-auto">🏏</div>
          <div className="text-xs font-extrabold text-white">CRICKET 1M</div>
          <div className="text-[9px] text-blue-200">Sixes &amp; Wickets</div>
        </div>
      </div>

      {/* Slots Section Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1.5">
          <Coins size={18} className="text-amber-500" />
          <h3 className="font-extrabold text-sm text-slate-900">Popular Slots</h3>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">JILI &amp; PG</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {[
          { name: 'Fortune Gems', jackpot: '₹35,000', icon: '👑', color: 'from-amber-500 to-red-600' },
          { name: 'Super Ace', jackpot: '₹120,000', icon: '🃏', color: 'from-purple-600 to-indigo-700' },
          { name: 'Crazy 777', jackpot: '₹88,888', icon: '🎰', color: 'from-emerald-600 to-teal-800' },
        ].map((slot, idx) => (
          <div
            key={idx}
            onClick={() => {
              sound.playClick();
              setSlotModalGame(slot.name);
            }}
            className={`cursor-pointer rounded-2xl bg-gradient-to-br ${slot.color} text-white p-2.5 flex flex-col justify-between h-32 shadow-sm active:scale-95 transition-transform`}
          >
            <span className="text-[9px] bg-black/30 font-bold px-1.5 py-0.5 rounded-full self-start">
              JACKPOT
            </span>
            <div className="text-3xl text-center">{slot.icon}</div>
            <div className="text-center">
              <div className="text-xs font-black truncate">{slot.name}</div>
              <div className="text-[9px] text-amber-200 font-bold">{slot.jackpot}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Earnings Chart matching exact 91 Club screen from 00:02 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Trophy size={16} className="text-amber-500" />
            <span className="font-extrabold text-sm text-slate-900">Today's earnings chart</span>
          </div>
          <span className="text-[11px] text-rose-500 font-bold">Real-time Top 3</span>
        </div>

        {/* Podium Top 3 */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-center items-end">
          {/* Rank 2 */}
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 text-xs font-black flex items-center justify-center mb-1">
              2
            </div>
            <div className="text-xl">🥈</div>
            <div className="text-[11px] font-bold text-slate-800 truncate w-full">Mem***882</div>
            <div className="text-[10px] font-black text-rose-600 mt-0.5">₹64,150.00</div>
          </div>

          {/* Rank 1 */}
          <div className="bg-gradient-to-b from-amber-50 to-orange-50 rounded-xl p-3 border-2 border-amber-300 flex flex-col items-center shadow-xs -mt-2">
            <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-900 text-xs font-black flex items-center justify-center mb-1 shadow-sm">
              1
            </div>
            <div className="text-2xl animate-bounce">👑</div>
            <div className="text-xs font-bold text-slate-900 truncate w-full">No ***ata</div>
            <div className="text-xs font-black text-amber-700 mt-0.5">₹98,420.00</div>
          </div>

          {/* Rank 3 */}
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-black flex items-center justify-center mb-1">
              3
            </div>
            <div className="text-xl">🥉</div>
            <div className="text-[11px] font-bold text-slate-800 truncate w-full">Mem***319</div>
            <div className="text-[10px] font-black text-rose-600 mt-0.5">₹49,200.00</div>
          </div>
        </div>
      </div>

      {/* Winning Information Live Feed matching 00:03 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-2">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={16} className="text-emerald-500" />
            <span className="font-extrabold text-sm text-slate-900">Winning information</span>
          </div>
          <span className="text-[10px] text-slate-400">Live Payouts</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {[
            { game: 'ARBET', user: 'Mem***OAH', amount: '₹314.00', color: 'text-rose-500' },
            { game: 'WinGo 30s', user: 'Mem***XRC', amount: '₹306.00', color: 'text-rose-500' },
            { game: 'Aviator', user: 'Mem***TRE', amount: '₹580.00', color: 'text-amber-600' },
            { game: '5D 1 min', user: 'Mem***EOS', amount: '₹49.00', color: 'text-rose-500' },
            { game: 'K3 1 min', user: 'Mem***CGN', amount: '₹729.12', color: 'text-emerald-600' },
            { game: 'K3 3 min', user: 'Mem***GVP', amount: '₹3,920.00', color: 'text-purple-600' },
          ].map((item, idx) => (
            <div key={idx} className="py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-slate-100 font-bold text-[10px] text-slate-700">
                  {item.game}
                </span>
                <span className="text-slate-600 text-xs">{item.user}</span>
              </div>
              <span className={`font-black text-xs ${item.color}`}>{item.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* +18 Responsible Gaming Notice matching 00:02 in video */}
      <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 text-[11px] text-slate-500 space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center shrink-0">
            +18
          </span>
          <span className="font-bold text-slate-700">Fair, Certified &amp; Responsible Gaming</span>
        </div>
        <p className="leading-relaxed">
          The DMD Earning Club (DMD अर्निंग क्लब) platform advocates fairness, justice, and openness. We mainly operate fair lottery, blockchain games, and instant games, all of which are verified fair games.
        </p>
        <p className="leading-relaxed">
          DMD Earning Club supports fast UPI deposit and withdrawal, and looks forward to your visit. Gambling can be addictive, please play rationally. DMD Earning Club only accepts customers above the age of 18.
        </p>
      </div>
    </div>
  );
};
