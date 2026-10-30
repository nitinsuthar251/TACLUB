import React from 'react';
import { ChevronLeft, Crown, Award, Gift, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';

export const VipPage: React.FC = () => {
  const { user, isVipOpen, setIsVipOpen } = useApp();

  if (!isVipOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-center overflow-y-auto">
      <div className="w-full max-w-md bg-[#f8fafc] min-h-screen text-slate-800 flex flex-col justify-between">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white px-4 py-3 border-b border-slate-100 flex items-center justify-between shadow-2xs">
          <button
            onClick={() => setIsVipOpen(false)}
            className="flex items-center gap-1 text-slate-700 font-bold text-xs"
          >
            <ChevronLeft size={18} />
            <span>Back</span>
          </button>
          <span className="font-black text-sm text-slate-900">VIP Privileges</span>
          <span className="text-xs text-rose-500 font-bold">Rules</span>
        </div>

        <div className="p-3 space-y-4 flex-1">
          {/* User VIP Badge Card matching 01:04 */}
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-2xl p-4 text-white shadow-md space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt="VIP"
                className="w-12 h-12 rounded-full border-2 border-yellow-300 object-cover"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm">{user.username}</span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-yellow-400 text-slate-950">
                    VIP{user.vipLevel}
                  </span>
                </div>
                <div className="text-[10px] text-rose-100 mt-0.5">
                  UID: {user.uid}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/20 text-center">
              <div className="bg-black/20 rounded-xl p-2">
                <div className="text-lg font-black font-mono text-yellow-300">{user.vipExp} EXP</div>
                <div className="text-[10px] text-white/80">My Experience</div>
              </div>
              <div className="bg-black/20 rounded-xl p-2">
                <div className="text-lg font-black font-mono text-yellow-300">2 Days</div>
                <div className="text-[10px] text-white/80">Payout Time</div>
              </div>
            </div>
          </div>

          {/* Upgrading VIP Card matching 01:05 */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-black text-xs text-slate-900">
                <Crown size={16} className="text-amber-500" />
                <span>VIP 1 (Next Tier)</span>
              </div>
              <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full">
                Bet ₹1 = 1 EXP
              </span>
            </div>

            <div className="text-[11px] text-slate-500">
              Upgrading VIP1 requires <strong className="text-rose-600">3000 EXP</strong> (2,297 EXP remaining)
            </div>

            {/* EXP Bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (user.vipExp / 3000) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{user.vipExp} / 3000</span>
              <span>VIP 1</span>
            </div>
          </div>

          {/* VIP Benefits Level list matching 01:05 */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <div className="font-black text-xs text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Award size={16} className="text-rose-500" />
              <span>VIP1 Benefits &amp; Rewards</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    🪙
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Level up reward</div>
                    <div className="text-[10px] text-slate-400">Claim once per level</div>
                  </div>
                </div>
                <span className="font-black text-amber-600">+₹60.00</span>
              </div>

              <div className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    🎁
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Monthly reward</div>
                    <div className="text-[10px] text-slate-400">Claim on 1st of every month</div>
                  </div>
                </div>
                <span className="font-black text-rose-600">+₹30.00</span>
              </div>

              <div className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    📈
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Rebate rate</div>
                    <div className="text-[10px] text-slate-400">Automatic turnover cashback</div>
                  </div>
                </div>
                <span className="font-black text-emerald-600">0.75%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
