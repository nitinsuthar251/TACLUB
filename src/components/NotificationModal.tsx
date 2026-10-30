import React from 'react';
import { Bell, Megaphone, ShieldAlert, Gift } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationModal: React.FC = () => {
  const { isNotificationOpen, setIsNotificationOpen } = useApp();

  if (!isNotificationOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <Bell size={18} className="text-rose-500" />
            <h4 className="font-black text-sm text-slate-900">Notifications &amp; Notices</h4>
          </div>
          <button onClick={() => setIsNotificationOpen(false)} className="text-slate-400 font-bold p-1">✕</button>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto text-xs pr-1">
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-700">
              <Megaphone size={14} />
              <span>Withdrawal System Announcement</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              If your withdrawal is pending, please make sure your UPI ID and Bank Account details match your registered name. Processing is guaranteed within 24 hours.
            </p>
            <div className="text-[9px] text-rose-400">2026-10-29 10:00:00</div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-700">
              <Gift size={14} />
              <span>Agent Referral Program Bonus</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Every time a referred member makes their first deposit, your agency tier bonus increases by up to 1.2%!
            </p>
            <div className="text-[9px] text-amber-500">2026-10-28 15:30:00</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <ShieldAlert size={14} />
              <span>Beware of Phishing Websites</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Always ensure you are using the official 91 CLUB platform. Never share your withdrawal password with anyone.
            </p>
            <div className="text-[9px] text-slate-400">2026-10-27 12:00:00</div>
          </div>
        </div>

        <button
          onClick={() => setIsNotificationOpen(false)}
          className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
        >
          Close
        </button>
      </div>
    </div>
  );
};
