import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  CalendarCheck, 
  Sparkles, 
  Trophy, 
  Users, 
  Percent, 
  ChevronRight, 
  CheckCircle2,
  Lock,
  Flame,
  Clock,
  Coins,
  HelpCircle,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface CheckInReward {
  day: number;
  reward: number;
  label: string;
  isMega?: boolean;
}

const CHECK_IN_SCHEDULE: CheckInReward[] = [
  { day: 1, reward: 5, label: '₹5.00' },
  { day: 2, reward: 10, label: '₹10.00' },
  { day: 3, reward: 15, label: '₹15.00' },
  { day: 4, reward: 20, label: '₹20.00' },
  { day: 5, reward: 30, label: '₹30.00' },
  { day: 6, reward: 50, label: '₹50.00' },
  { day: 7, reward: 100, label: '₹100.00', isMega: true },
];

export const ActivityPage: React.FC = () => {
  const { user, setActiveTab, setIsGiftsOpen, showToast, adjustUserBalance } = useApp();

  // Daily Check-in state with local persistence
  const [checkInState, setCheckInState] = useState<{
    consecutiveDays: number;
    lastClaimDate: string | null;
    claimedDays: number[];
    totalEarned: number;
  }>(() => {
    const saved = localStorage.getItem('dmd_daily_checkin_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* fallback */
      }
    }
    return {
      consecutiveDays: 0,
      lastClaimDate: null,
      claimedDays: [],
      totalEarned: 0,
    };
  });

  const [showRulesModal, setShowRulesModal] = useState(false);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState('');

  // Get current date string (YYYY-MM-DD)
  const getTodayDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayStr = getTodayDateString();
  const isClaimedToday = checkInState.lastClaimDate === todayStr;

  // Next claimable day: 1 to 7
  const currentClaimDay = isClaimedToday 
    ? checkInState.consecutiveDays 
    : (checkInState.consecutiveDays % 7) + 1;

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('dmd_daily_checkin_v2', JSON.stringify(checkInState));
  }, [checkInState]);

  // Live countdown to midnight reset
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight.getTime() - now.getTime();
      if (diffMs > 0) {
        const hrs = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
        setTimeUntilMidnight(
          `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`
        );
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Claim Daily Check-in Handler
  const handleClaimToday = () => {
    if (isClaimedToday) {
      showToast(`Today's check-in bonus is already claimed! Next bonus available in ${timeUntilMidnight}.`, 'info');
      return;
    }

    const targetSchedule = CHECK_IN_SCHEDULE.find((s) => s.day === currentClaimDay);
    if (!targetSchedule) return;

    sound.playWin();
    confetti({ 
      particleCount: targetSchedule.isMega ? 120 : 80, 
      spread: 70, 
      origin: { y: 0.6 } 
    });

    const reward = targetSchedule.reward;
    const newConsecutive = (checkInState.consecutiveDays % 7) + 1;
    const newClaimedDays = [...checkInState.claimedDays, currentClaimDay];
    const newTotal = checkInState.totalEarned + reward;

    setCheckInState({
      consecutiveDays: newConsecutive,
      lastClaimDate: todayStr,
      claimedDays: newClaimedDays,
      totalEarned: newTotal,
    });

    // Credit real user balance directly
    adjustUserBalance(user.balance + reward);

    showToast(
      `🎉 Day ${currentClaimDay} Check-in Complete! ₹${reward.toFixed(2)} added directly to your real wallet!`,
      'success'
    );
  };

  // Activity Top Banner calculations
  const totalBonusAmount = (user.referralEarnings || 0) + checkInState.totalEarned;
  const todayBonusAmount = isClaimedToday 
    ? (CHECK_IN_SCHEDULE.find((s) => s.day === checkInState.consecutiveDays)?.reward || 0) 
    : 0;

  return (
    <div className="pb-24 max-w-md mx-auto px-3 space-y-4 pt-2">
      {/* Top Bonus Banner - Real calculations starting at ₹0.00 for new members */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-2xl p-4 text-white shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] text-white/80 font-medium">Today's bonus</div>
            <div className="text-2xl font-black font-mono">₹{todayBonusAmount.toFixed(2)}</div>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-white/80 font-medium">Total bonus earned</div>
            <div className="text-2xl font-black font-mono text-yellow-300">₹{totalBonusAmount.toFixed(2)}</div>
          </div>
        </div>

        <button
          onClick={() => setShowRulesModal(true)}
          className="w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-xs rounded-xl text-xs font-bold text-center border border-white/20 flex items-center justify-center gap-1 active:scale-95 transition-all"
        >
          <HelpCircle size={13} />
          <span>Daily Check-in &amp; Bonus Rules</span>
        </button>
      </div>

      {/* Visual Daily Check-in Progress Calendar Card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3.5">
        {/* Calendar Header with Streak & Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
              <CalendarCheck size={20} />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                <span>Daily Check-in</span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold uppercase">
                  7-Day Calendar
                </span>
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">Claim free cash every day &amp; unlock Day 7 Mega Reward</p>
            </div>
          </div>

          <div className="text-right bg-amber-50/80 border border-amber-200 px-2.5 py-1 rounded-xl flex items-center gap-1">
            <Flame size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-black text-amber-900">{checkInState.consecutiveDays}d Streak</span>
          </div>
        </div>

        {/* Visual Progress Bar (Connecting line across 7 days) */}
        <div className="space-y-1 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
            <span>Progress: {checkInState.consecutiveDays}/7 Days Completed</span>
            <span className="text-amber-600 font-extrabold">{Math.round((checkInState.consecutiveDays / 7) * 100)}%</span>
          </div>

          <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, (checkInState.consecutiveDays / 7) * 100))}%` }}
            />
          </div>

          <div className="flex justify-between text-[9px] font-bold text-slate-400 pt-0.5">
            <span>Day 1 (₹5)</span>
            <span>Day 4 (₹20)</span>
            <span className="text-amber-600 font-black">Day 7 (₹100 Mega)</span>
          </div>
        </div>

        {/* 7-Day Visual Calendar Grid */}
        <div className="grid grid-cols-4 gap-2">
          {CHECK_IN_SCHEDULE.map((item) => {
            const isClaimed = checkInState.claimedDays.includes(item.day);
            const isTodayTarget = !isClaimedToday && item.day === currentClaimDay;
            const isLocked = !isClaimed && !isTodayTarget;

            return (
              <div
                key={item.day}
                onClick={() => {
                  if (isTodayTarget) {
                    handleClaimToday();
                  } else if (isClaimed) {
                    showToast(`Day ${item.day} reward of ${item.label} was already claimed!`, 'info');
                  } else {
                    showToast(`Day ${item.day} will unlock on your next consecutive check-in day!`, 'info');
                  }
                }}
                className={`relative rounded-2xl p-2.5 flex flex-col items-center justify-between text-center transition-all cursor-pointer ${
                  item.isMega ? 'col-span-2 bg-gradient-to-br from-amber-400 to-amber-500 text-slate-900 border-2 border-amber-300 shadow-md' : ''
                } ${
                  isClaimed
                    ? 'bg-emerald-50/80 border-2 border-emerald-300 text-slate-800'
                    : isTodayTarget
                    ? 'bg-gradient-to-b from-rose-50 to-amber-50 border-2 border-rose-500 ring-2 ring-rose-500/20 shadow-md scale-[1.02] animate-pulse'
                    : !item.isMega ? 'bg-slate-50 border border-slate-200 text-slate-400 opacity-80' : ''
                }`}
              >
                {/* Header Tag */}
                <div className="w-full flex items-center justify-between">
                  <span className={`text-[10px] font-black ${isClaimed ? 'text-emerald-700' : isTodayTarget ? 'text-rose-600 font-extrabold' : 'text-slate-500'}`}>
                    Day {item.day}
                  </span>

                  {isClaimed ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">
                      ✓
                    </span>
                  ) : isLocked ? (
                    <Lock size={11} className="text-slate-400" />
                  ) : (
                    <Sparkles size={12} className="text-rose-500 animate-spin" />
                  )}
                </div>

                {/* Center Icon & Amount */}
                <div className="my-1.5 flex flex-col items-center justify-center">
                  <div className="text-xl">
                    {item.isMega ? '👑' : isClaimed ? '💰' : isTodayTarget ? '🎁' : '🪙'}
                  </div>
                  <span className={`text-xs font-black font-mono tracking-tight ${item.isMega ? 'text-slate-950 font-black text-sm' : isClaimed ? 'text-emerald-700' : isTodayTarget ? 'text-rose-600' : 'text-slate-700'}`}>
                    {item.label}
                  </span>
                </div>

                {/* Status Footer */}
                <div className="w-full">
                  {isClaimed ? (
                    <span className="block text-[9px] font-black text-emerald-700 bg-emerald-100/80 py-0.5 rounded-full">
                      Claimed
                    </span>
                  ) : isTodayTarget ? (
                    <span className="block text-[9px] font-black text-white bg-rose-500 py-0.5 rounded-full shadow-2xs">
                      Claim Now
                    </span>
                  ) : item.isMega ? (
                    <span className="block text-[9px] font-black text-amber-950 bg-amber-300 py-0.5 rounded-full">
                      Mega Reward
                    </span>
                  ) : (
                    <span className="block text-[9px] font-bold text-slate-400 py-0.5">
                      Locked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Primary Action Button / Countdown */}
        {isClaimedToday ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <div className="text-left">
                <div className="text-xs font-black text-emerald-950">Today's Check-in Claimed!</div>
                <div className="text-[10px] text-emerald-700">Streak preserved: {checkInState.consecutiveDays} days</div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Next Check-in in</span>
              <span className="text-xs font-mono font-black text-slate-900">{timeUntilMidnight}</span>
            </div>
          </div>
        ) : (
          <button
            onClick={handleClaimToday}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Gift size={16} />
            <span>Claim Day {currentClaimDay} Bonus (+₹{CHECK_IN_SCHEDULE.find((s) => s.day === currentClaimDay)?.reward}.00)</span>
          </button>
        )}
      </div>

      {/* 5 Quick Action Badges matching 00:26 */}
      <div className="grid grid-cols-5 gap-1.5 text-center">
        {[
          { label: 'Invitation bonus', icon: Users, color: 'bg-blue-50 text-blue-600', action: () => setActiveTab('promotion') },
          { label: 'Betting rebate', icon: Percent, color: 'bg-emerald-50 text-emerald-600', action: () => showToast('Daily rebate of 0.8% applied on all bets!', 'info') },
          { label: 'Super Jackpot', icon: Trophy, color: 'bg-amber-50 text-amber-600', action: () => showToast('Super Jackpot prize pool: ₹300,000.00', 'info') },
          { label: 'First gift', icon: Gift, color: 'bg-purple-50 text-purple-600', action: () => setIsGiftsOpen(true) },
          { label: 'Invite Wheel', icon: Sparkles, color: 'bg-rose-50 text-rose-600', action: () => setActiveTab('invite-wheel') },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => { sound.playClick(); item.action(); }}
            className="flex flex-col items-center justify-center p-1.5 rounded-xl hover:bg-slate-50 transition-colors active:scale-95"
          >
            <div className={`w-11 h-11 rounded-2xl ${item.color} flex items-center justify-center shadow-2xs mb-1`}>
              <item.icon size={20} />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* 2 Main Action Cards: Gifts Redemption & Attendance Bonus */}
      <div className="grid grid-cols-2 gap-3">
        {/* Gifts Redeem */}
        <div
          onClick={() => { sound.playClick(); setIsGiftsOpen(true); }}
          className="cursor-pointer bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-3.5 text-white shadow-sm flex flex-col justify-between h-36 active:scale-95 transition-transform"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-black uppercase">Gifts</span>
            <Gift size={20} className="text-rose-200" />
          </div>
          <div className="text-[10px] text-rose-100">
            Enter redemption code to receive gift rewards
          </div>
          <button className="w-full py-1.5 bg-white text-rose-600 text-xs font-black rounded-xl shadow-xs">
            Redeem Code
          </button>
        </div>

        {/* Attendance Bonus */}
        <div
          onClick={() => { 
            sound.playClick(); 
            if (!isClaimedToday) {
              handleClaimToday();
            } else {
              showToast(`You have already checked in today! Streak: ${checkInState.consecutiveDays} days.`, 'info');
            }
          }}
          className="cursor-pointer bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-3.5 text-white shadow-sm flex flex-col justify-between h-36 active:scale-95 transition-transform"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-black uppercase">Attendance bonus</span>
            <CalendarCheck size={20} className="text-amber-200" />
          </div>
          <div className="text-[10px] text-amber-100">
            {isClaimedToday ? `Checked in today (+${checkInState.consecutiveDays}d)` : 'Claim your daily free bonus now'}
          </div>
          <button className="w-full py-1.5 bg-white text-amber-700 text-xs font-black rounded-xl shadow-xs">
            {isClaimedToday ? 'Checked In ✓' : 'Check-In Today'}
          </button>
        </div>
      </div>

      {/* Special Event Promotional Cards */}
      <div className="space-y-3 pt-1">
        <h4 className="font-extrabold text-sm text-slate-900">Platform Events</h4>

        {/* Event 1: First Deposit Bonus */}
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-600">
              NEW MEMBER SPECIAL
            </span>
            <h5 className="font-black text-sm text-slate-900">First Deposit Bonus</h5>
            <p className="text-[11px] text-slate-500">Deposit ₹100 get extra ₹100 bonus instantly!</p>
          </div>
          <button
            onClick={() => setActiveTab('home')}
            className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shrink-0 shadow-xs active:scale-95"
          >
            Claim
          </button>
        </div>

        {/* Event 2: Refer Friends Rewards */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
              HIGH COMMISSION
            </span>
            <h5 className="font-black text-sm text-white">Invite Friends Earn ₹25 Cash</h5>
            <p className="text-[11px] text-slate-400">Earn ₹25 per friend directly in wallet.</p>
          </div>
          <button
            onClick={() => setActiveTab('promotion')}
            className="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shrink-0 active:scale-95"
          >
            Invite
          </button>
        </div>
      </div>

      {/* Rules & Info Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <CalendarCheck size={18} className="text-amber-500" />
                <h4 className="font-black text-sm text-slate-900">Daily Check-in Rules</h4>
              </div>
              <button 
                onClick={() => setShowRulesModal(false)} 
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                <div className="font-black text-amber-900 text-xs">📅 Consecutive Check-in Rules:</div>
                <p>1. Check in once every 24 hours to receive progressive daily bonuses.</p>
                <p>2. Day 1: ₹5, Day 2: ₹10, Day 3: ₹15, Day 4: ₹20, Day 5: ₹30, Day 6: ₹50, Day 7: ₹100 Mega Box!</p>
                <p>3. Check-in resets daily at midnight (00:00:00).</p>
                <p>4. All rewards are credited immediately to your real wallet balance and can be used on WinGo, Aviator, and slots.</p>
              </div>
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
