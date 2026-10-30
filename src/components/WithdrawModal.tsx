import React, { useState } from 'react';
import { ChevronLeft, ArrowUpRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';

export const WithdrawModal: React.FC = () => {
  const { user, isWithdrawOpen, setIsWithdrawOpen, withdrawFunds, showToast } = useApp();

  const [withdrawType, setWithdrawType] = useState<'upi' | 'bank'>('upi');
  const [upiId, setUpiId] = useState('user91@okhdfcbank');
  const [bankAccount, setBankAccount] = useState('987654321098');
  const [ifsc, setIfsc] = useState('HDFC0001234');
  const [amount, setAmount] = useState<number>(200);

  if (!isWithdrawOpen) return null;

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount > user.balance) {
      showToast('Insufficient balance for withdrawal!', 'error');
      return;
    }
    if (amount < 110) {
      showToast('Minimum withdrawal amount is ₹110.00', 'error');
      return;
    }

    const destination = withdrawType === 'upi' ? upiId : `${bankAccount} (${ifsc})`;
    const success = withdrawFunds(amount, destination);
    if (success) {
      setIsWithdrawOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-center overflow-y-auto">
      <div className="w-full max-w-md bg-[#f8fafc] min-h-screen text-slate-800 flex flex-col justify-between">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white px-4 py-3 border-b border-slate-100 flex items-center justify-between shadow-2xs">
          <button
            onClick={() => setIsWithdrawOpen(false)}
            className="flex items-center gap-1 text-slate-700 font-bold text-xs"
          >
            <ChevronLeft size={18} />
            <span>Back</span>
          </button>
          <span className="font-black text-sm text-slate-900">Withdraw Funds</span>
          <span className="text-xs text-rose-500 font-bold cursor-pointer">Records</span>
        </div>

        <form onSubmit={handleWithdrawSubmit} className="p-3 space-y-4 flex-1">
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-4 text-white shadow-md">
            <div className="text-xs text-amber-100 font-medium">Withdrawable Balance</div>
            <div className="text-2xl font-black font-mono mt-0.5">₹{user.balance.toFixed(2)}</div>
            <div className="text-[10px] text-amber-100 mt-1">24/7 Fast Payouts • 0% Handling Fee</div>
          </div>

          {/* Type selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { sound.playClick(); setWithdrawType('upi'); }}
              className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                withdrawType === 'upi'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              UPI Account
            </button>
            <button
              type="button"
              onClick={() => { sound.playClick(); setWithdrawType('bank'); }}
              className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                withdrawType === 'bank'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              Bank Card
            </button>
          </div>

          {/* Form Fields */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
            {withdrawType === 'upi' ? (
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">UPI ID</label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. mobile@upi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-hidden focus:border-rose-500"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Bank Account Number</label>
                  <input
                    type="text"
                    required
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-hidden focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">IFSC Code</label>
                  <input
                    type="text"
                    required
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-hidden focus:border-rose-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Withdrawal Amount (Min ₹110)</label>
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <span className="text-rose-500 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="110"
                  max={user.balance}
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-transparent text-xs font-mono font-bold text-slate-900 outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setAmount(Math.floor(user.balance))}
                  className="text-[10px] text-rose-500 font-bold uppercase"
                >
                  All
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 text-[11px] text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1 text-amber-700">
              <AlertCircle size={13} />
              <span>Withdrawal Instructions</span>
            </div>
            <p>• Withdrawal time is 00:00 - 23:59 daily.</p>
            <p>• Minimum withdrawal amount: ₹110.00, maximum single withdrawal: ₹50,000.00.</p>
            <p>• Payout is usually processed within 5 - 15 minutes.</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-500/25 active:scale-95 transition-all"
            >
              Confirm Withdrawal ₹{amount.toFixed(2)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
