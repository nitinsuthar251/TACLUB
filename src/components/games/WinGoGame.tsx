import React, { useState } from 'react';
import { 
  ChevronLeft, 
  HelpCircle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  LineChart, 
  UserCheck, 
  Volume2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WinGoDuration, WinGoResult } from '../../types';
import { sound } from '../../utils/audio';

const durations: { id: WinGoDuration; label: string; time: string }[] = [
  { id: '30sec', label: 'WinGo 30sec', time: '30s' },
  { id: '1min', label: 'WinGo 1 Min', time: '1m' },
  { id: '3min', label: 'WinGo 3 Min', time: '3m' },
  { id: '5min', label: 'WinGo 5 Min', time: '5m' },
];

export const WinGoGame: React.FC = () => {
  const { 
    user, 
    currentBalance,
    isInfluencerDemo,
    setIsInfluencerLoginOpen,
    setActiveGame, 
    setIsDepositOpen, 
    setIsWithdrawOpen,
    winGoDuration, 
    setWinGoDuration, 
    winGoPeriod, 
    winGoTimeLeft, 
    winGoHistory, 
    winGoBets, 
    placeWinGoBet,
    winGoWinNotice,
    dismissWinNotice,
    showToast
  } = useApp();

  const [bottomTab, setBottomTab] = useState<'history' | 'chart' | 'mybets'>('history');

  // Betting Sheet state
  const [selectedBet, setSelectedBet] = useState<string | null>(null);
  const [unitAmount, setUnitAmount] = useState<number>(10);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [ruleAgreed, setRuleAgreed] = useState<boolean>(true);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      m1: Math.floor(mins / 10),
      m2: mins % 10,
      s1: Math.floor(secs / 10),
      s2: secs % 10,
    };
  };

  const cd = formatCountdown(winGoTimeLeft);
  const isLocked = winGoTimeLeft <= 5;

  const handleOpenBetModal = (selection: string) => {
    if (isLocked) {
      showToast('Betting is locked for current round countdown!', 'error');
      return;
    }
    sound.playClick();
    setSelectedBet(selection);
  };

  const handleConfirmBet = () => {
    if (!selectedBet) return;
    if (!ruleAgreed) {
      showToast('Please agree to PRESALE RULES', 'error');
      return;
    }
    const success = placeWinGoBet(selectedBet, unitAmount, multiplier);
    if (success) {
      setSelectedBet(null);
    }
  };

  const handleRandomSelect = () => {
    const randomNum = Math.floor(Math.random() * 10);
    handleOpenBetModal(String(randomNum));
  };

  // Color dot renderer
  const renderColorBall = (num: number, size: string = 'w-7 h-7 text-xs') => {
    let bg = '';
    if (num === 0) {
      bg = 'bg-gradient-to-tr from-red-500 via-rose-500 to-purple-600 border-2 border-purple-300 text-white';
    } else if (num === 5) {
      bg = 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-purple-600 border-2 border-purple-300 text-white';
    } else if ([1, 3, 7, 9].includes(num)) {
      bg = 'bg-gradient-to-br from-emerald-500 to-green-600 border-2 border-green-300 text-white';
    } else {
      bg = 'bg-gradient-to-br from-rose-500 to-red-600 border-2 border-rose-300 text-white';
    }
    return (
      <div className={`${size} rounded-full flex items-center justify-center font-black shadow-sm shrink-0 ${bg}`}>
        {num}
      </div>
    );
  };

  return (
    <div className="pb-24 max-w-md mx-auto px-3 space-y-3 pt-2 relative">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { sound.playClick(); setActiveGame('lobby'); }}
          className="flex items-center gap-1 text-slate-700 font-bold text-xs bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs hover:bg-slate-50"
        >
          <ChevronLeft size={16} />
          <span>Lobby</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs text-right">
            <div className="text-[9px] text-slate-400 font-bold uppercase">Balance</div>
            <div className="text-xs font-black text-slate-900">₹{currentBalance.toFixed(2)}</div>
          </div>
          <button
            onClick={() => { sound.playClick(); setIsDepositOpen(true); }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold text-xs shadow-xs"
          >
            Deposit
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="bg-rose-50/80 rounded-xl p-2.5 flex items-center justify-between text-[11px] text-slate-700 border border-rose-100">
        <div className="flex items-center gap-1.5">
          <Volume2 size={14} className="text-rose-500 shrink-0" />
          <span className="truncate">Ensure stable internet connection for real-time live draws.</span>
        </div>
        <button
          onClick={() => setShowHowToPlay(true)}
          className="text-rose-600 font-bold shrink-0 ml-2"
        >
          Rules
        </button>
      </div>

      {/* Duration selector tabs matching 00:07 */}
      <div className="grid grid-cols-4 gap-1.5 bg-white p-1 rounded-2xl border border-slate-200/70 shadow-2xs">
        {durations.map((d) => (
          <button
            key={d.id}
            onClick={() => { sound.playClick(); setWinGoDuration(d.id); }}
            className={`py-2 px-1 rounded-xl text-center transition-all flex flex-col items-center justify-center ${
              winGoDuration === d.id
                ? 'bg-gradient-to-b from-rose-500 to-red-600 text-white shadow-sm font-black'
                : 'text-slate-600 hover:bg-slate-50 font-bold text-xs'
            }`}
          >
            <Clock size={14} className={winGoDuration === d.id ? 'text-amber-200' : 'text-slate-400'} />
            <span className="text-[11px] mt-0.5 whitespace-nowrap">{d.label.replace('WinGo ', '')}</span>
          </button>
        ))}
      </div>

      {/* Period Card with Countdown Timer (Perforated ticket design matching 00:07) */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 text-white p-3.5 shadow-md">
        {/* Perforated edge effect */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-4 h-4 bg-[#f0f2f5] rounded-full" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-4 h-4 bg-[#f0f2f5] rounded-full" />

        <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-2.5">
          <div>
            <div className="flex items-center gap-1 text-[11px] text-white/90">
              <span>Period</span>
              <button
                onClick={() => setShowHowToPlay(true)}
                className="underline text-amber-200 font-semibold text-[10px] flex items-center gap-0.5 ml-1"
              >
                <HelpCircle size={11} />
                <span>How to play</span>
              </button>
            </div>
            <div className="text-sm font-black tracking-wider text-amber-200">{winGoPeriod}</div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-white/90 font-medium uppercase tracking-wider">Time remaining</div>
            {/* Countdown Boxes */}
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-5 h-7 rounded bg-black/40 border border-white/30 flex items-center justify-center font-mono font-black text-base text-yellow-300">
                {cd.m1}
              </span>
              <span className="w-5 h-7 rounded bg-black/40 border border-white/30 flex items-center justify-center font-mono font-black text-base text-yellow-300">
                {cd.m2}
              </span>
              <span className="font-bold text-white">:</span>
              <span className="w-5 h-7 rounded bg-black/40 border border-white/30 flex items-center justify-center font-mono font-black text-base text-yellow-300">
                {cd.s1}
              </span>
              <span className="w-5 h-7 rounded bg-black/40 border border-white/30 flex items-center justify-center font-mono font-black text-base text-yellow-300">
                {cd.s2}
              </span>
            </div>
          </div>
        </div>

        {/* Previous results ball preview row */}
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[10px] text-white/80 font-bold">Recent:</span>
          <div className="flex items-center gap-1.5">
            {winGoHistory.slice(0, 5).map((h, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-xs font-black border border-white/40"
              >
                {h.number}
              </div>
            ))}
          </div>
        </div>

        {/* Count Down overlay when under 5 seconds */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs z-20 flex flex-col items-center justify-center text-center animate-fade-in">
            <span className="text-xs font-black tracking-widest text-amber-300 uppercase">
              COUNTDOWN LOCKED
            </span>
            <div className="text-6xl font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] font-mono animate-ping">
              {winGoTimeLeft}
            </div>
            <span className="text-[10px] text-white/80 mt-1">Drawing winning result...</span>
          </div>
        )}
      </div>

      {/* Color Prediction Buttons: Green, Violet, Red */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => handleOpenBetModal('Green')}
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black py-3 px-2 rounded-2xl shadow-md shadow-emerald-500/25 active:scale-95 transition-all text-center flex flex-col items-center"
        >
          <span className="text-sm">Green</span>
          <span className="text-[10px] font-bold text-emerald-100">2x Payout</span>
        </button>

        <button
          onClick={() => handleOpenBetModal('Violet')}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black py-3 px-2 rounded-2xl shadow-md shadow-purple-500/25 active:scale-95 transition-all text-center flex flex-col items-center"
        >
          <span className="text-sm">Violet</span>
          <span className="text-[10px] font-bold text-purple-100">4.5x Payout</span>
        </button>

        <button
          onClick={() => handleOpenBetModal('Red')}
          className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black py-3 px-2 rounded-2xl shadow-md shadow-rose-500/25 active:scale-95 transition-all text-center flex flex-col items-center"
        >
          <span className="text-sm">Red</span>
          <span className="text-[10px] font-bold text-rose-100">2x Payout</span>
        </button>
      </div>

      {/* Number Selection Balls (0 to 9) */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-slate-800">Select Number (9x Payout)</span>
          <button
            onClick={handleRandomSelect}
            className="text-[11px] font-bold text-rose-500 hover:underline"
          >
            Random
          </button>
        </div>

        {/* Row 1: 0 - 4 */}
        <div className="grid grid-cols-5 gap-2">
          {[0, 1, 2, 3, 4].map((num) => (
            <button
              key={num}
              onClick={() => handleOpenBetModal(String(num))}
              className="flex flex-col items-center justify-center p-1.5 rounded-xl hover:bg-slate-50 active:scale-90 transition-transform"
            >
              {renderColorBall(num, 'w-10 h-10 text-sm')}
            </button>
          ))}
        </div>

        {/* Row 2: 5 - 9 */}
        <div className="grid grid-cols-5 gap-2">
          {[5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleOpenBetModal(String(num))}
              className="flex flex-col items-center justify-center p-1.5 rounded-xl hover:bg-slate-50 active:scale-90 transition-transform"
            >
              {renderColorBall(num, 'w-10 h-10 text-sm')}
            </button>
          ))}
        </div>
      </div>

      {/* Multipliers & Big / Small buttons */}
      <div className="space-y-2">
        {/* Multiplier Chips */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={handleRandomSelect}
            className="px-2.5 py-1.5 rounded-xl border border-rose-300 text-rose-600 bg-rose-50 font-black text-xs shrink-0"
          >
            Random
          </button>
          {[1, 5, 10, 20, 50, 100].map((m) => (
            <button
              key={m}
              onClick={() => { sound.playClick(); setMultiplier(m); }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all ${
                multiplier === m
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              X{m}
            </button>
          ))}
        </div>

        {/* Big / Small */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => handleOpenBetModal('Big')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black py-3 rounded-2xl shadow-md shadow-amber-500/20 active:scale-95 transition-all text-center flex flex-col items-center"
          >
            <span className="text-base tracking-wide">Big</span>
            <span className="text-[10px] text-amber-100 font-bold">5-9 (2x Payout)</span>
          </button>

          <button
            onClick={() => handleOpenBetModal('Small')}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-black py-3 rounded-2xl shadow-md shadow-blue-500/20 active:scale-95 transition-all text-center flex flex-col items-center"
          >
            <span className="text-base tracking-wide">Small</span>
            <span className="text-[10px] text-blue-100 font-bold">0-4 (2x Payout)</span>
          </button>
        </div>
      </div>

      {/* Bottom Tabs: Game history | Chart | My Bets */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden mt-4">
        <div className="flex border-b border-slate-100 text-xs font-bold">
          <button
            onClick={() => { sound.playClick(); setBottomTab('history'); }}
            className={`flex-1 py-3 text-center flex items-center justify-center gap-1 border-b-2 transition-all ${
              bottomTab === 'history'
                ? 'border-rose-500 text-rose-600 bg-rose-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History size={14} />
            <span>Game history</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setBottomTab('chart'); }}
            className={`flex-1 py-3 text-center flex items-center justify-center gap-1 border-b-2 transition-all ${
              bottomTab === 'chart'
                ? 'border-rose-500 text-rose-600 bg-rose-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <LineChart size={14} />
            <span>Chart</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setBottomTab('mybets'); }}
            className={`flex-1 py-3 text-center flex items-center justify-center gap-1 border-b-2 transition-all ${
              bottomTab === 'mybets'
                ? 'border-rose-500 text-rose-600 bg-rose-50/30'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserCheck size={14} />
            <span>My Bets ({winGoBets.length})</span>
          </button>
        </div>

        {/* Tab 1: Game History Table matching 00:11 in video */}
        {bottomTab === 'history' && (
          <div className="divide-y divide-slate-100 text-xs">
            {/* Header row */}
            <div className="bg-slate-50/80 px-3 py-2 grid grid-cols-4 text-slate-400 font-extrabold text-[11px]">
              <div>Period</div>
              <div className="text-center">Number</div>
              <div className="text-center">Big/Small</div>
              <div className="text-right">Color</div>
            </div>

            {/* Data rows */}
            {winGoHistory.slice(0, 10).map((item, idx) => (
              <div key={idx} className="px-3 py-2.5 grid grid-cols-4 items-center">
                <div className="font-mono text-[11px] text-slate-600">{item.period}</div>
                <div className="flex justify-center">
                  <span className={`text-base font-black ${
                    item.color.includes('green') ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {item.number}
                  </span>
                </div>
                <div className="text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.size === 'Big' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.size}
                  </span>
                </div>
                <div className="flex justify-end items-center gap-1">
                  {item.color === 'green-violet' ? (
                    <div className="flex -space-x-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    </div>
                  ) : item.color === 'red-violet' ? (
                    <div className="flex -space-x-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    </div>
                  ) : (
                    <span className={`w-3 h-3 rounded-full ${
                      item.color === 'green' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Chart View */}
        {bottomTab === 'chart' && (
          <div className="p-4 space-y-3">
            <div className="text-xs text-slate-500 font-medium">Trend sequence (Last 10 results):</div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              {winGoHistory.slice(0, 8).map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  {renderColorBall(h.number, 'w-7 h-7 text-xs')}
                  <span className="text-[10px] text-slate-400 font-mono">{h.period.slice(-3)}</span>
                </div>
              ))}
            </div>
            <div className="text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center justify-between">
                <span>Green occurrences:</span>
                <span className="font-bold text-emerald-600">
                  {winGoHistory.filter(h => h.color.includes('green')).length} / 50
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Red occurrences:</span>
                <span className="font-bold text-rose-600">
                  {winGoHistory.filter(h => h.color.includes('red')).length} / 50
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Violet occurrences:</span>
                <span className="font-bold text-purple-600">
                  {winGoHistory.filter(h => h.color.includes('violet')).length} / 50
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: My Bets */}
        {bottomTab === 'mybets' && (
          <div className="p-3 space-y-2">
            {winGoBets.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No bets placed yet. Tap any color, number, or Big/Small to place a bet!
              </div>
            ) : (
              winGoBets.map((bet) => (
                <div key={bet.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{bet.selection}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{bet.period.slice(-6)}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Bet: ₹{bet.totalBet.toFixed(2)} ({bet.amount} x {bet.multiplier})
                    </div>
                  </div>

                  <div>
                    {bet.status === 'pending' ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] animate-pulse">
                        Waiting Draw
                      </span>
                    ) : bet.status === 'won' ? (
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px]">
                          Won!
                        </span>
                        <div className="text-xs font-black text-emerald-600 mt-0.5">
                          +₹{bet.payout?.toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-bold text-[10px]">
                        Lost
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Betting Modal / Bottom Sheet */}
      {selectedBet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center">
          <div className="w-full max-w-md bg-white rounded-t-3xl p-4 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Bet on:</span>
                <span className="text-base font-black px-3 py-1 rounded-full bg-rose-500 text-white">
                  {selectedBet}
                </span>
              </div>
              <button
                onClick={() => setSelectedBet(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Unit Balance selection */}
            <div>
              <div className="text-xs font-bold text-slate-500 mb-1.5">Unit Balance</div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 10, 100, 1000].map((val) => (
                  <button
                    key={val}
                    onClick={() => { sound.playClick(); setUnitAmount(val); }}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      unitAmount === val
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>
            </div>

            {/* Multiplier / Quantity */}
            <div>
              <div className="text-xs font-bold text-slate-500 mb-1.5">Quantity Multiplier</div>
              <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar pb-1">
                {[1, 5, 10, 20, 50, 100].map((m) => (
                  <button
                    key={m}
                    onClick={() => { sound.playClick(); setMultiplier(m); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      multiplier === m
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    X{m}
                  </button>
                ))}
              </div>
            </div>

            {/* Rule agreement */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
              <input
                type="checkbox"
                checked={ruleAgreed}
                onChange={(e) => setRuleAgreed(e.target.checked)}
                className="accent-rose-500 w-4 h-4 rounded"
              />
              <span>I agree to the <span className="text-rose-500 font-bold">PRESALE RULE</span></span>
            </label>

            {/* Total Amount & Submit Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedBet(null)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBet}
                className="flex-2 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-xs shadow-lg shadow-rose-500/25 active:scale-95 transition-all"
              >
                Confirm ₹{(unitAmount * multiplier).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Win Celebration Modal Popup */}
      {winGoWinNotice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 text-center max-w-xs w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            {winGoWinNotice.won ? (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-3xl shadow-inner">
                  🎉
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">Congratulations!</h4>
                  <p className="text-xs text-slate-500">You won in round {winGoWinNotice.period.slice(-4)}!</p>
                </div>
                <div className="text-3xl font-black text-emerald-600">
                  +₹{winGoWinNotice.amount.toFixed(2)}
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-3xl">
                  💔
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-800">Better Luck Next Time</h4>
                  <p className="text-xs text-slate-500">Period {winGoWinNotice.period.slice(-4)} closed.</p>
                </div>
              </>
            )}

            <button
              onClick={dismissWinNotice}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-black text-xs shadow-md"
            >
              Continue Playing
            </button>
          </div>
        </div>
      )}

      {/* How to play modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="font-black text-sm text-slate-900">Win Go Rules</h4>
              <button onClick={() => setShowHowToPlay(false)} className="text-slate-400 font-bold">✕</button>
            </div>
            <div className="text-xs text-slate-600 space-y-2 max-h-72 overflow-y-auto pr-1">
              <p>• <strong>Green:</strong> If numbers 1, 3, 7, 9 appear, you get <strong>2x</strong>. If 5 appears, you get <strong>1.5x</strong>.</p>
              <p>• <strong>Red:</strong> If numbers 2, 4, 6, 8 appear, you get <strong>2x</strong>. If 0 appears, you get <strong>1.5x</strong>.</p>
              <p>• <strong>Violet:</strong> If 0 or 5 appears, you get <strong>4.5x</strong>.</p>
              <p>• <strong>Numbers (0-9):</strong> If your picked number appears, you get <strong>9x</strong> payout!</p>
              <p>• <strong>Big/Small:</strong> Big (5,6,7,8,9), Small (0,1,2,3,4) gives <strong>2x</strong>.</p>
              <p>• Last 5 seconds are locked for draw processing.</p>
            </div>
            <button
              onClick={() => setShowHowToPlay(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
