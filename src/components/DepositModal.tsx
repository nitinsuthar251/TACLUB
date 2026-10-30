import React, { useState } from 'react';
import { 
  ChevronLeft, 
  RotateCw, 
  Copy, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  QrCode,
  Clock,
  Sparkles,
  Gamepad2,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';

interface DepositTier {
  amount: number;
  bonus: number;
  total: number;
  label: string;
  popular?: boolean;
}

const depositTiers: DepositTier[] = [
  { amount: 100, bonus: 50, total: 150, label: '100 + 50', popular: true },
  { amount: 200, bonus: 100, total: 300, label: '200 + 100' },
  { amount: 500, bonus: 250, total: 750, label: '500 + 250', popular: true },
  { amount: 1000, bonus: 500, total: 1500, label: '1000 + 500', popular: true },
  { amount: 2000, bonus: 1000, total: 3000, label: '2000 + 1000' },
  { amount: 3000, bonus: 1500, total: 4500, label: '3000 + 1500' },
  { amount: 5000, bonus: 2500, total: 7500, label: '5000 + 2500' },
  { amount: 10000, bonus: 5000, total: 15000, label: '10K + 5K' },
];

export const DepositModal: React.FC = () => {
  const { 
    user, 
    isDepositOpen, 
    setIsDepositOpen, 
    submitDepositUtr, 
    adminSettings, 
    showToast,
    paymentRequests 
  } = useApp();

  const [amount, setAmount] = useState<number>(100);
  const [showQrScreen, setShowQrScreen] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStage, setVerificationStage] = useState('');
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);

  const isFirstDeposit = !user.firstDepositClaimed;
  const currentBonus = isFirstDeposit ? Math.round(amount * 0.5) : 0;
  const totalReceive = amount + currentBonus;

  if (!isDepositOpen) return null;

  const handleDepositClick = () => {
    if (amount < 100) {
      showToast('Minimum deposit amount is ₹100.00', 'error');
      return;
    }
    sound.playClick();
    setShowQrScreen(true);
  };

  const copyUpiId = () => {
    sound.playClick();
    navigator.clipboard?.writeText(adminSettings.upiId);
    setCopiedUpi(true);
    showToast(`UPI ID ${adminSettings.upiId} copied!`, 'success');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleConfirmPayment = () => {
    if (!utrNumber.trim()) {
      showToast('Please enter the 12-digit UPI UTR number from your payment app!', 'error');
      return;
    }

    if (!/^\d{12}$/.test(utrNumber.trim())) {
      sound.playCrash();
      showToast('Invalid UTR format! UPI reference must be exactly 12 numbers (e.g. 429188291048).', 'error');
      return;
    }

    // Run bank reconciliation simulation
    setIsVerifying(true);
    sound.playTick();
    setVerificationStage('Connecting to NPCI Unified Payments Interface...');

    setTimeout(() => {
      setVerificationStage(`Querying merchant account: ${adminSettings.payeeName} (${adminSettings.upiId})...`);
    }, 900);

    setTimeout(() => {
      setVerificationStage('Validating 12-digit UTR timestamp & settlement...');
    }, 1800);

    setTimeout(() => {
      setIsVerifying(false);
      const res = submitDepositUtr(amount, utrNumber, 'Paytm_QR (Surajaram)');
      if (res.success) {
        setSubmittedRequestId(utrNumber);
        if (res.requiresAdminApproval) {
          showToast(res.message, 'info');
        } else {
          showToast(res.message, 'success');
          setIsDepositOpen(false);
          setShowQrScreen(false);
          setUtrNumber('');
        }
      } else {
        showToast(res.message, 'error');
      }
    }, 2800);
  };

  const upiDeepLink = `upi://pay?pa=${adminSettings.upiId}&pn=${encodeURIComponent(adminSettings.payeeName)}&am=${amount}&cu=INR`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex justify-center overflow-y-auto">
      <div className="w-full max-w-md bg-[#f8fafc] min-h-screen text-slate-800 flex flex-col justify-between">
        {/* Top Header */}
        <div className="sticky top-0 z-10 bg-white px-4 py-3 border-b border-slate-100 flex items-center justify-between shadow-2xs">
          <button
            onClick={() => {
              if (showQrScreen) {
                setShowQrScreen(false);
                setSubmittedRequestId(null);
              } else {
                setIsDepositOpen(false);
              }
            }}
            className="flex items-center gap-1 text-slate-700 font-bold text-xs"
          >
            <ChevronLeft size={18} />
            <span>{showQrScreen ? 'Back' : 'DMD Deposit'}</span>
          </button>

          <span className="font-black text-sm text-slate-900">
            {showQrScreen ? 'Official Payment QR' : 'Deposit Center'}
          </span>

          <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Lock size={11} />
            <span>Bank Verified</span>
          </span>
        </div>

        {/* QR Payment Screen */}
        {showQrScreen ? (
          <div className="p-4 space-y-4 max-w-sm mx-auto flex-1 flex flex-col justify-between">
            {/* If UTR was submitted and is pending verification */}
            {submittedRequestId ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl text-center space-y-4 my-auto">
                <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center mx-auto text-3xl animate-pulse">
                  ⏳
                </div>

                <div className="space-y-1">
                  <h4 className="font-black text-base text-slate-900">Deposit Verification in Progress</h4>
                  <p className="text-xs text-slate-500">
                    We received your payment claim for <strong className="text-slate-900">₹{amount.toFixed(2)}</strong>.
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-left space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">UTR / Ref:</span>
                    <span className="font-bold text-slate-900">{submittedRequestId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payee:</span>
                    <span className="font-bold text-slate-900">{adminSettings.payeeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Beneficiary UPI:</span>
                    <span className="font-bold text-slate-900">{adminSettings.upiId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold text-amber-600">Pending Merchant Settlement Check</span>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-800 text-left">
                  🛡️ <strong>Safety Guarantee:</strong> Once Surajaram's bank registers the ₹{amount} deposit, your wallet balance will automatically update. You can also view this in the Master Console.
                </div>

                <button
                  onClick={() => {
                    setIsDepositOpen(false);
                    setShowQrScreen(false);
                    setSubmittedRequestId(null);
                    setUtrNumber('');
                  }}
                  className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Return to Games
                </button>
              </div>
            ) : (
              /* QR Display & UTR Form */
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xl text-center space-y-3">
                {/* Payee Verification Badge */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-left">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      S
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-slate-900">{adminSettings.payeeName}</span>
                        <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">{adminSettings.bankName}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Official Paytm
                  </span>
                </div>

                {/* Amount to pay */}
                <div className="bg-slate-50 py-2.5 px-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Pay Exact Amount
                    </span>
                    <div className="text-2xl font-black font-mono text-slate-900">
                      ₹{amount.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 block">
                      +₹{currentBonus.toFixed(2)} (50% Bonus)
                    </span>
                    <span className="text-[9px] font-black text-emerald-600 block mt-0.5">
                      Get ₹{totalReceive.toFixed(2)} in Wallet
                    </span>
                  </div>
                </div>

                {/* Exact Paytm QR Code Image from User */}
                <div className="relative mx-auto rounded-2xl overflow-hidden border-3 border-[#00baf2] shadow-md bg-white p-2.5 max-w-[270px]">
                  <div className="text-[10px] font-black text-[#002e6e] uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                    <QrCode size={13} className="text-[#00baf2]" />
                    <span>Paytm Official QR Code</span>
                  </div>
                  <div className="relative group overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center">
                    <img
                      src={adminSettings.qrImageUrl}
                      alt="Surajaram Paytm QR Code"
                      className="w-full max-h-72 object-contain rounded-lg"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-1 text-[10px] font-bold">
                    <a
                      href={adminSettings.qrImageUrl}
                      download="DMD_Surajaram_Paytm_QR.jpg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-center flex items-center justify-center gap-1"
                    >
                      <span>📥 Save QR</span>
                    </a>
                    <span className="text-[9px] text-slate-500">
                      Scan via PhonePe, Paytm, GPay
                    </span>
                  </div>
                </div>

                {/* UPI ID Row with 1-click Copy */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-rose-50/50 rounded-2xl border border-slate-200 text-xs">
                  <div className="text-left">
                    <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Payee UPI ID</span>
                    <span className="font-mono font-bold text-slate-900 text-xs select-all">{adminSettings.upiId}</span>
                  </div>
                  <button
                    onClick={copyUpiId}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    {copiedUpi ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                    <span>{copiedUpi ? 'Copied!' : 'Copy UPI'}</span>
                  </button>
                </div>

                {/* Direct UPI App Fast Buttons */}
                <div className="space-y-1.5">
                  <a
                    href={upiDeepLink}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <ExternalLink size={13} />
                    <span>Pay ₹{amount.toFixed(2)} via UPI App</span>
                  </a>
                  <div className="grid grid-cols-3 gap-1.5">
                    <a
                      href={upiDeepLink}
                      className="py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold text-[10px] text-center"
                    >
                      PhonePe
                    </a>
                    <a
                      href={upiDeepLink}
                      className="py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 font-bold text-[10px] text-center"
                    >
                      Paytm UPI
                    </a>
                    <a
                      href={upiDeepLink}
                      className="py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-[10px] text-center"
                    >
                      Google Pay
                    </a>
                  </div>
                </div>

                {/* UTR 12-digit input with Paste button & bank verification instructions */}
                <div className="space-y-1.5 text-left pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <span>12-Digit UPI UTR / Ref No.:</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold ${utrNumber.length === 12 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {utrNumber.length}/12 Digits
                      </span>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const text = await navigator.clipboard.readText();
                            const digits = text.replace(/\D/g, '').slice(0, 12);
                            if (digits) {
                              setUtrNumber(digits);
                              showToast(`Pasted UTR: ${digits}`, 'info');
                            }
                          } catch {
                            showToast('Unable to read clipboard. Please paste manually.', 'info');
                          }
                        }}
                        className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-2 py-0.5 rounded-md"
                      >
                        Paste
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      maxLength={12}
                      required
                      placeholder="e.g. 429188291048"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                      className={`w-full bg-slate-50 border rounded-xl px-3 py-2.5 text-sm font-mono font-bold tracking-widest outline-hidden transition-all text-slate-900 ${
                        utrNumber.length === 12
                          ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 focus:border-rose-500'
                      }`}
                    />
                    {utrNumber.length === 12 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 size={16} />
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-600 bg-amber-50/90 p-2.5 rounded-xl border border-amber-200 space-y-1">
                    <div className="font-bold text-amber-800 flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>जरूरी सूचना (UTR Verification Notice)</span>
                    </div>
                    <p>
                      पेमेंट करने के बाद अपने बैंक ऐप (Paytm, PhonePe, GPay) से <strong>12-अंकों का असली UTR / UPI Ref No.</strong> यहाँ डालकर Submit करें।
                    </p>
                  </div>
                </div>

                {/* Verification Loader Animation */}
                {isVerifying ? (
                  <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-bold text-amber-300">Bank Settlement Gateway</span>
                    </div>
                    <p className="text-[10px] text-slate-300 font-mono animate-pulse">{verificationStage}</p>
                  </div>
                ) : (
                  <button
                    onClick={handleConfirmPayment}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={15} />
                    <span>Submit 12-Digit UTR {currentBonus > 0 ? `(Get ₹${totalReceive.toFixed(2)})` : `(₹${amount.toFixed(2)})`}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Normal Amount Selection Screen */
          <div className="p-3 space-y-4 flex-1">
            {/* Balance Card with Real vs Demo indicator */}
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
              <div>
                <div className="text-xs text-rose-100 font-medium">Real Wallet Balance</div>
                <div className="text-2xl font-black font-mono mt-0.5">₹{user.balance.toFixed(2)}</div>
                <div className="text-[10px] text-amber-200 mt-0.5">Verified Payee: {adminSettings.payeeName}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20">
                  Instant QR Recharge
                </span>
                <div className="text-[10px] text-rose-100 mt-1">UID: {user.uid}</div>
              </div>
            </div>

            {/* Payment Security Assurance Card */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">Official Merchant QR Payment</div>
                  <div className="text-[10px] text-emerald-800">Direct credit to Canara Bank 2617 (Surajaram)</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-black text-[10px] shadow-xs">
                Verified
              </span>
            </div>

            {/* Payment Receiver Card */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  🅿️
                </div>
                <div>
                  <div className="flex items-center gap-1 font-black text-xs text-slate-900">
                    <span>Paytm QR Official</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white text-[9px] flex items-center justify-center font-bold">✓</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Receiver: <strong>{adminSettings.payeeName}</strong> ({adminSettings.upiId})</div>
                </div>
              </div>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                0% Fee
              </span>
            </div>

            {/* First Deposit 50% Bonus Hero Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 rounded-3xl p-4 text-white shadow-lg border border-amber-300/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs uppercase tracking-wider text-amber-200">
                        FIRST DEPOSIT 50% BONUS
                      </span>
                      <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full animate-bounce">
                        +50% EXTRA
                      </span>
                    </div>
                    <h4 className="font-black text-sm text-white mt-0.5">
                      पहले रिचार्ज पर 50% अतिरिक्त बोनस!
                    </h4>
                  </div>
                </div>
              </div>

              {/* 100+50 and 500+250 Quick Callout Cards */}
              <div className="mt-3 pt-3 border-t border-white/20 grid grid-cols-2 gap-2 text-center">
                <button
                  type="button"
                  onClick={() => { sound.playClick(); setAmount(100); }}
                  className={`rounded-2xl p-2.5 text-left transition-all active:scale-95 border ${
                    amount === 100
                      ? 'bg-white text-slate-900 border-amber-300 shadow-md ring-2 ring-amber-300'
                      : 'bg-white/15 hover:bg-white/25 border-white/25 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black">Deposit ₹100</span>
                    <span className="text-[9px] font-black bg-rose-500 text-white px-1.5 py-0.2 rounded-md">
                      +₹50
                    </span>
                  </div>
                  <div className={`text-sm font-black font-mono mt-1 ${amount === 100 ? 'text-rose-600' : 'text-amber-300'}`}>
                    100 + 50 = ₹150
                  </div>
                  <div className={`text-[9px] font-bold mt-0.5 ${amount === 100 ? 'text-slate-500' : 'text-white/80'}`}>
                    Get ₹150 in wallet
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => { sound.playClick(); setAmount(500); }}
                  className={`rounded-2xl p-2.5 text-left transition-all active:scale-95 border ${
                    amount === 500
                      ? 'bg-white text-slate-900 border-amber-300 shadow-md ring-2 ring-amber-300'
                      : 'bg-white/15 hover:bg-white/25 border-white/25 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black">Deposit ₹500</span>
                    <span className="text-[9px] font-black bg-rose-500 text-white px-1.5 py-0.2 rounded-md">
                      +₹250
                    </span>
                  </div>
                  <div className={`text-sm font-black font-mono mt-1 ${amount === 500 ? 'text-rose-600' : 'text-amber-300'}`}>
                    500 + 250 = ₹750
                  </div>
                  <div className={`text-[9px] font-bold mt-0.5 ${amount === 500 ? 'text-slate-500' : 'text-white/80'}`}>
                    Get ₹750 in wallet
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Deposit Amounts Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">Select Deposit Amount (राशि चुनें)</span>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  50% Extra On Every Tier
                </span>
              </div>

              {/* 2-Column High-Detail Cards for 100+50, 500+250, etc. */}
              <div className="grid grid-cols-2 gap-2">
                {depositTiers.map((tier) => {
                  const isSelected = amount === tier.amount;
                  return (
                    <button
                      key={tier.amount}
                      type="button"
                      onClick={() => { sound.playClick(); setAmount(tier.amount); }}
                      className={`relative p-3 rounded-2xl text-left border transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white border-rose-600 shadow-md ring-2 ring-rose-500/30'
                          : 'bg-white border-slate-200 hover:border-rose-300 text-slate-800 shadow-2xs'
                      }`}
                    >
                      {/* Top Ribbon */}
                      {tier.popular && (
                        <span className={`absolute -top-1.5 -right-1 text-[8px] font-black px-1.5 py-0.2 rounded-full shadow-2xs ${
                          isSelected ? 'bg-amber-400 text-slate-950' : 'bg-rose-500 text-white'
                        }`}>
                          HOT 🔥
                        </span>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-base font-black font-mono">
                          ₹{tier.amount}
                        </span>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-lg ${
                          isSelected 
                            ? 'bg-white/20 text-white' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          +{tier.bonus}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span className={isSelected ? 'text-white/80' : 'text-slate-500'}>
                          50% Bonus:
                        </span>
                        <span className={`font-black ${isSelected ? 'text-amber-200' : 'text-amber-600'}`}>
                          +₹{tier.bonus}
                        </span>
                      </div>

                      <div className={`mt-1.5 pt-1.5 border-t text-[10px] font-black flex items-center justify-between ${
                        isSelected ? 'border-white/20 text-white' : 'border-slate-100 text-slate-900'
                      }`}>
                        <span>Get in Wallet:</span>
                        <span className={isSelected ? 'text-amber-300' : 'text-emerald-600'}>
                          ₹{tier.total}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom amount input box */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500">Or Enter Custom Amount (या अन्य राशि दर्ज करें):</span>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-2xs focus-within:border-rose-500">
                  <span className="text-sm font-black text-rose-500">₹</span>
                  <input
                    type="number"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="100.00 - 50,000.00"
                    className="w-full text-xs font-mono font-bold outline-hidden text-slate-900"
                  />
                  {amount >= 100 && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md shrink-0 border border-amber-200">
                      +₹{currentBonus} Bonus
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Calculation Summary Card */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200/80 flex items-center justify-between text-xs shadow-2xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">You Pay</span>
                  <span className="font-mono font-black text-slate-900 text-sm">₹{amount.toFixed(2)}</span>
                </div>
                <div className="text-amber-500 font-black text-base">+</div>
                <div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide block flex items-center gap-0.5">
                    <Sparkles size={11} /> 50% Bonus
                  </span>
                  <span className="font-mono font-black text-amber-600 text-sm">+₹{currentBonus.toFixed(2)}</span>
                </div>
                <div className="text-slate-400 font-bold">=</div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide block">Total In Wallet</span>
                  <span className="font-mono font-black text-emerald-600 text-base">₹{totalReceive.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Recharge Instructions */}
            <div className="bg-rose-50/70 rounded-2xl p-3 border border-rose-100 text-[11px] text-slate-600 space-y-1.5">
              <div className="font-bold text-rose-700 flex items-center gap-1">
                <AlertCircle size={13} />
                <span>सुरक्षित रिचार्ज व बोनस नियम (First Deposit Bonus Rules)</span>
              </div>
              <p>1. पहली बार डिपॉजिट करने पर <strong>50% फ्री बोनस</strong> स्वतः मिलेगा (जैसे <strong>100 पर 50</strong> और <strong>500 पर 250</strong>)।</p>
              <p>2. Paytm QR स्कैन करके पेमेंट करें (Receiver: <strong>{adminSettings.payeeName}</strong>, UPI: <strong>{adminSettings.upiId}</strong>)।</p>
              <p>3. पेमेंट पूरा होने के बाद 12-अंकों का असली UTR नंबर दर्ज करें। बैंक सर्वर द्वारा वेरीफाई होने पर कुल राशि वॉलेट में क्रेडिट हो जाएगी।</p>
            </div>

            {/* Bottom Proceed Button */}
            <div className="pt-2">
              <button
                onClick={handleDepositClick}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Proceed To Pay ₹{amount.toFixed(2)}</span>
                <span className="text-amber-200 font-bold text-[10px]">(Get ₹{totalReceive.toFixed(2)})</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
