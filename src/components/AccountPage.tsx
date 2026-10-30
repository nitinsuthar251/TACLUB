import React, { useState, useRef, useMemo } from 'react';
import { 
  Copy, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Crown, 
  Gamepad2, 
  ReceiptText, 
  Bell, 
  Gift, 
  Ticket, 
  BarChart3, 
  Globe, 
  Settings, 
  MessageSquare, 
  Megaphone, 
  Headphones, 
  Info, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  BookOpen,
  LogIn,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';
import { TransactionHistoryModal, HistoryTab } from './TransactionHistoryModal';

export const AccountPage: React.FC = () => {
  const { 
    user, 
    currentBalance,
    setIsDepositOpen, 
    setIsWithdrawOpen, 
    setIsVipOpen, 
    setIsSupportOpen, 
    setIsNotificationOpen, 
    setIsGiftsOpen, 
    setIsAdminOpen,
    setIsAuthModalOpen,
    setAuthModalTab,
    logoutUser,
    showToast,
    transactions,
    paymentRequests,
    withdrawalRequests,
    winGoBets
  } = useApp();

  const [activeHistoryModal, setActiveHistoryModal] = useState<string | null>(null);
  const [isTxHistoryOpen, setIsTxHistoryOpen] = useState(false);
  const [txHistoryTab, setTxHistoryTab] = useState<HistoryTab>('all');
  const [showArWalletNotice, setShowArWalletNotice] = useState(false);
  const [language, setLanguage] = useState<'English' | 'Hindi'>('Hindi');

  // Unified recent transactions preview for Account Page
  const recentTransactions = useMemo(() => {
    const list: Array<{
      id: string;
      type: 'deposit' | 'withdraw' | 'win' | 'bonus' | 'referral';
      title: string;
      subtitle: string;
      amount: number;
      status: 'pending' | 'success' | 'failed';
      date: string;
      rawDate: string;
    }> = [];

    paymentRequests.forEach((pr) => {
      let status: 'pending' | 'success' | 'failed' = 'pending';
      if (pr.status === 'approved') status = 'success';
      else if (pr.status === 'rejected') status = 'failed';
      list.push({
        id: pr.id,
        type: 'deposit',
        title: 'Paytm QR Deposit',
        subtitle: `UTR: ${pr.utr}`,
        amount: pr.amount,
        status,
        date: pr.date.slice(5, 16),
        rawDate: pr.date,
      });
    });

    withdrawalRequests.forEach((wr) => {
      let status: 'pending' | 'success' | 'failed' = 'pending';
      if (wr.status === 'approved') status = 'success';
      else if (wr.status === 'rejected') status = 'failed';
      list.push({
        id: wr.id,
        type: 'withdraw',
        title: 'Bank / UPI Withdraw',
        subtitle: `To: ${wr.upiOrBank}`,
        amount: wr.amount,
        status,
        date: wr.date.slice(5, 16),
        rawDate: wr.date,
      });
    });

    transactions.forEach((tx) => {
      if (list.some((i) => i.id === tx.id)) return;
      let status: 'pending' | 'success' | 'failed' = 'success';
      if (tx.status === 'processing') status = 'pending';
      else if (tx.status === 'failed') status = 'failed';
      list.push({
        id: tx.id,
        type: tx.type === 'deposit' ? 'deposit' : tx.type === 'withdraw' ? 'withdraw' : 'bonus',
        title: tx.type === 'deposit' ? 'Wallet Deposit' : tx.type === 'withdraw' ? 'Wallet Withdraw' : tx.description,
        subtitle: tx.description,
        amount: tx.amount,
        status,
        date: tx.date.slice(5, 16),
        rawDate: tx.date,
      });
    });

    list.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
    return list.slice(0, 3);
  }, [paymentRequests, withdrawalRequests, transactions]);

  // Secret Admin Trigger on App Version (5 taps)
  const [adminTapCount, setAdminTapCount] = useState(0);
  const adminTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSecretVersionTap = () => {
    sound.playClick();
    const next = adminTapCount + 1;
    setAdminTapCount(next);

    if (adminTapTimerRef.current) clearTimeout(adminTapTimerRef.current);

    if (next >= 5) {
      sound.playWin();
      setIsAdminOpen(true);
      setAdminTapCount(0);
    } else {
      adminTapTimerRef.current = setTimeout(() => {
        setAdminTapCount(0);
      }, 2500);
    }
  };

  const copyUid = () => {
    sound.playClick();
    navigator.clipboard?.writeText(user.uid);
    showToast('UID copied to clipboard!', 'success');
  };

  return (
    <div className="pb-24 max-w-md mx-auto px-3 space-y-4 pt-2">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={user.avatar}
              alt="Profile"
              className="w-14 h-14 rounded-full object-cover border-2 border-rose-500 shadow-xs"
            />
            <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-white">
              VIP{user.vipLevel}
            </span>
          </div>

          <div className="flex-1 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-slate-900 tracking-tight">{user.username}</span>
              <button
                onClick={() => {
                  sound.playClick();
                  setAuthModalTab('login');
                  setIsAuthModalOpen(true);
                }}
                className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1 active:scale-95"
              >
                <LogIn size={11} />
                <span>Switch / Login</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>UID: {user.uid}</span>
              <button
                onClick={copyUid}
                className="text-slate-400 hover:text-slate-600 active:scale-90 transition-transform"
                title="Copy UID"
              >
                <Copy size={13} />
              </button>
            </div>
            
            <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <span>● Verified 91 Club Member</span>
            </div>
          </div>
        </div>

        {/* Real Money Wallet Card */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-red-50 to-amber-50 border border-rose-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Real Balance
              </span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                ₹{user.balance.toFixed(2)}
              </div>
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsDepositOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-xs shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center gap-1"
              >
                <ArrowDownLeft size={14} />
                <span>Deposit QR</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setIsWithdrawOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 font-black text-xs shadow-2xs active:scale-95 transition-all flex items-center gap-1"
              >
                <ArrowUpRight size={14} />
                <span>Withdraw</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Main Action Icons matching 00:35 in video */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
          {/* ARWallet */}
          <button
            onClick={() => { sound.playClick(); setShowArWalletNotice(true); }}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-50 active:scale-95"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
              <Wallet size={18} />
            </div>
            <span className="text-[11px] font-bold text-slate-700">ARWallet</span>
          </button>

          {/* Deposit */}
          <button
            onClick={() => { sound.playClick(); setIsDepositOpen(true); }}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-50 active:scale-95"
          >
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-1">
              <ArrowDownLeft size={18} />
            </div>
            <span className="text-[11px] font-bold text-slate-700">Deposit</span>
          </button>

          {/* Withdraw */}
          <button
            onClick={() => { sound.playClick(); setIsWithdrawOpen(true); }}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-50 active:scale-95"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
              <ArrowUpRight size={18} />
            </div>
            <span className="text-[11px] font-bold text-slate-700">Withdraw</span>
          </button>

          {/* VIP */}
          <button
            onClick={() => { sound.playClick(); setIsVipOpen(true); }}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-50 active:scale-95"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
              <Crown size={18} />
            </div>
            <span className="text-[11px] font-bold text-slate-700">VIP</span>
          </button>
        </div>
      </div>

      {/* 4 History Shortcut Cards matching 00:36 in reference */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => { sound.playClick(); setActiveHistoryModal('game'); }}
          className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3 text-left hover:bg-slate-50 active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Gamepad2 size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Game History</div>
            <div className="text-[10px] text-slate-400">WinGo & lottery records</div>
          </div>
        </button>

        <button
          onClick={() => { 
            sound.playClick(); 
            setTxHistoryTab('all'); 
            setIsTxHistoryOpen(true); 
          }}
          className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3 text-left hover:bg-slate-50 active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ReceiptText size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Transaction</div>
            <div className="text-[10px] text-slate-400">All ledger records</div>
          </div>
        </button>

        <button
          onClick={() => { 
            sound.playClick(); 
            setTxHistoryTab('deposit'); 
            setIsTxHistoryOpen(true); 
          }}
          className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3 text-left hover:bg-slate-50 active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <ArrowDownLeft size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Deposit</div>
            <div className="text-[10px] text-slate-400">UTR & status tracker</div>
          </div>
        </button>

        <button
          onClick={() => { 
            sound.playClick(); 
            setTxHistoryTab('withdraw'); 
            setIsTxHistoryOpen(true); 
          }}
          className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3 text-left hover:bg-slate-50 active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ArrowUpRight size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Withdraw</div>
            <div className="text-[10px] text-slate-400">Payout & bank history</div>
          </div>
        </button>
      </div>

      {/* Recent Transactions View with Status Indicators */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <ReceiptText size={16} className="text-rose-600" />
            <h4 className="font-black text-xs text-slate-900">Recent Transactions (हालिया लेन-देन)</h4>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              setTxHistoryTab('all');
              setIsTxHistoryOpen(true);
            }}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-0.5 active:scale-95 transition-all"
          >
            <span>View All</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-5 space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mx-auto">
              <ReceiptText size={20} />
            </div>
            <p className="text-xs text-slate-400 font-medium">No deposits or withdrawals recorded yet.</p>
            <button
              onClick={() => {
                sound.playClick();
                setIsDepositOpen(true);
              }}
              className="text-[11px] font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full hover:bg-rose-100 active:scale-95 transition-all inline-flex items-center gap-1"
            >
              <ArrowDownLeft size={12} />
              <span>Deposit via Paytm QR</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx) => {
              const isPositive = ['deposit', 'win', 'bonus', 'referral'].includes(tx.type);

              return (
                <div
                  key={tx.id}
                  onClick={() => {
                    sound.playClick();
                    setTxHistoryTab(tx.type === 'deposit' ? 'deposit' : tx.type === 'withdraw' ? 'withdraw' : 'all');
                    setIsTxHistoryOpen(true);
                  }}
                  className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between hover:bg-slate-100/70 cursor-pointer active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      tx.type === 'deposit' 
                        ? 'bg-rose-50 text-rose-600' 
                        : tx.type === 'withdraw' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {tx.type === 'deposit' ? <ArrowDownLeft size={16} /> : tx.type === 'withdraw' ? <ArrowUpRight size={16} /> : <ReceiptText size={16} />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 leading-snug">{tx.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span className="truncate max-w-[110px]">{tx.subtitle}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className={`text-xs font-black ${isPositive ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {isPositive ? '+' : '-'}₹{tx.amount.toFixed(2)}
                    </div>
                    <div>
                      {tx.status === 'success' && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-200">
                          <CheckCircle2 size={9} /> Success
                        </span>
                      )}
                      {tx.status === 'pending' && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 text-[9px] font-bold border border-amber-200 animate-pulse">
                          <Clock size={9} /> Pending
                        </span>
                      )}
                      {tx.status === 'failed' && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-700 text-[9px] font-bold border border-rose-200">
                          <XCircle size={9} /> Failed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Account Settings Menu List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden text-xs">
        <button
          onClick={() => { sound.playClick(); setIsNotificationOpen(true); }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50"
        >
          <div className="flex items-center gap-3 text-slate-700">
            <Bell size={16} className="text-rose-500" />
            <span className="font-bold">Notification</span>
          </div>
          <ChevronRight size={16} className="text-slate-400" />
        </button>

        <button
          onClick={() => { sound.playClick(); setIsGiftsOpen(true); }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50"
        >
          <div className="flex items-center gap-3 text-slate-700">
            <Gift size={16} className="text-purple-500" />
            <span className="font-bold">Gifts Code</span>
          </div>
          <ChevronRight size={16} className="text-slate-400" />
        </button>

        <button
          onClick={() => showToast('No coupons available at this time.', 'info')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50"
        >
          <div className="flex items-center gap-3 text-slate-700">
            <Ticket size={16} className="text-amber-500" />
            <span className="font-bold">Top-Up Coupons</span>
          </div>
          <ChevronRight size={16} className="text-slate-400" />
        </button>

        <button
          onClick={() => showToast('Win rate: 64.2% | Rounds played: 48', 'info')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50"
        >
          <div className="flex items-center gap-3 text-slate-700">
            <BarChart3 size={16} className="text-emerald-500" />
            <span className="font-bold">Game Statistics</span>
          </div>
          <ChevronRight size={16} className="text-slate-400" />
        </button>

        <button
          onClick={() => {
            const next = language === 'English' ? 'Hindi' : 'English';
            setLanguage(next);
            showToast(`Language switched to ${next}`, 'success');
          }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50"
        >
          <div className="flex items-center gap-3 text-slate-700">
            <Globe size={16} className="text-blue-500" />
            <span className="font-bold">Language / भाषा</span>
          </div>
          <span className="text-slate-500 font-bold flex items-center gap-1">
            <span>{language}</span>
            <ChevronRight size={16} className="text-slate-400" />
          </span>
        </button>
      </div>

      {/* Service Center Grid */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2">
          Service Center
        </div>

        <div className="grid grid-cols-3 gap-2.5 text-center">
          {[
            { label: 'Security', icon: ShieldCheck, action: () => showToast('Security Center: 2FA Active.', 'info') },
            { label: 'Feedback', icon: MessageSquare, action: () => showToast('Feedback submitted.', 'info') },
            { label: 'Announcement', icon: Megaphone, action: () => setIsNotificationOpen(true) },
            { label: '24/7 Support', icon: Headphones, action: () => setIsSupportOpen(true) },
            { label: 'Beginner Guide', icon: BookOpen, action: () => showToast('WinGo & Aviator Rules Guide.', 'info') },
            { label: 'About App', icon: Info, action: () => showToast('DMD Earning Club (DMD अर्निंग क्लब)', 'info') },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => { sound.playClick(); item.action(); }}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100 text-slate-700 active:scale-95 transition-all"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-1 bg-white text-slate-700 shadow-2xs">
                <item.icon size={17} />
              </div>
              <span className="text-[10px] font-bold leading-tight">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Log Out & Switch Account Buttons */}
      <div className="space-y-2">
        <button
          onClick={logoutUser}
          className="w-full py-3 rounded-2xl border border-slate-200 bg-white text-slate-600 hover:text-red-600 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs active:scale-95"
        >
          <LogOut size={15} />
          <span>Log Out Account</span>
        </button>

        {/* Discreet Version Info with 5-tap Secret Admin Trigger */}
        <div 
          onClick={handleSecretVersionTap}
          className="text-center text-[10px] text-slate-400 cursor-pointer select-none py-1"
        >
          <span>TA Club v2.6.0 (91 Club Architecture)</span>
        </div>
      </div>

      {/* AR Wallet Notice Modal */}
      {showArWalletNotice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <Wallet size={18} className="text-amber-500" />
                <h4 className="font-black text-sm text-slate-900">AR Wallet</h4>
              </div>
              <button onClick={() => setShowArWalletNotice(false)} className="text-slate-400 font-bold">✕</button>
            </div>
            <div className="text-xs text-slate-600 space-y-2">
              <p className="font-bold text-slate-800">AR Wallet fast payment gateway enabled with extra +2% deposit cashback.</p>
              <p>• Verified Paytm QR directly connected to merchant Surajaram.</p>
              <p>• Direct withdrawal to your bank UPI ID.</p>
            </div>
            <button
              onClick={() => {
                setShowArWalletNotice(false);
                showToast('AR Wallet active! +2% deposit bonus enabled.', 'success');
              }}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-md"
            >
              Activate AR Wallet
            </button>
          </div>
        </div>
      )}

      {/* History Modal */}
      {activeHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="font-black text-sm text-slate-900 capitalize">{activeHistoryModal} History</h4>
              <button onClick={() => setActiveHistoryModal(null)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 text-xs">
              {activeHistoryModal === 'game' ? (
                winGoBets.length === 0 ? (
                  <p className="text-slate-400 text-center py-6">No game bets recorded yet.</p>
                ) : (
                  winGoBets.map((b) => (
                    <div key={b.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                      <div>
                        <div className="font-bold">{b.selection}</div>
                        <div className="text-[10px] text-slate-400">{b.createdAt}</div>
                      </div>
                      <span className={`font-black ${b.status === 'won' ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {b.status === 'won' ? `+₹${b.payout?.toFixed(2)}` : `-₹${b.totalBet.toFixed(2)}`}
                      </span>
                    </div>
                  ))
                )
              ) : (
                transactions.length === 0 ? (
                  <p className="text-slate-400 text-center py-6">No transactions recorded yet.</p>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-800">{tx.description}</div>
                        <div className="text-[10px] text-slate-400">{tx.date}</div>
                      </div>
                      <span className={`font-black ${tx.type === 'deposit' || tx.type === 'win' || tx.type === 'bonus' || tx.type === 'referral' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.type === 'deposit' || tx.type === 'win' || tx.type === 'bonus' || tx.type === 'referral' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                      </span>
                    </div>
                  ))
                )
              )}
            </div>

            <button
              onClick={() => setActiveHistoryModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Full-featured Transaction History View Modal with Deposits & Withdrawals status */}
      <TransactionHistoryModal
        isOpen={isTxHistoryOpen}
        onClose={() => setIsTxHistoryOpen(false)}
        initialTab={txHistoryTab}
      />
    </div>
  );
};

