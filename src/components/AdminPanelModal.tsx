import React, { useState } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  Wallet, 
  Megaphone, 
  Gift, 
  Eye, 
  Save, 
  RotateCcw,
  Sparkles,
  Instagram,
  Copy,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';

export const AdminPanelModal: React.FC = () => {
  const { 
    isAdminOpen, 
    setIsAdminOpen, 
    adminSettings, 
    updateAdminSettings, 
    verifyMasterKey,
    paymentRequests,
    approveDepositRequest,
    rejectDepositRequest,
    withdrawalRequests,
    approveWithdrawalRequest,
    rejectWithdrawalRequest,
    adjustUserBalance,
    resetSpecificInfluencerBalance,
    loginInfluencerAccount,
    user,
    showToast 
  } = useApp();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredKey, setEnteredKey] = useState('');
  const [activeTab, setActiveTab] = useState<'payment' | 'influencers' | 'deposits' | 'withdrawals' | 'games' | 'wallet' | 'notice'>('influencers');

  // Form states
  const [payeeName, setPayeeName] = useState(adminSettings.payeeName);
  const [upiId, setUpiId] = useState(adminSettings.upiId);
  const [bankName, setBankName] = useState(adminSettings.bankName);
  const [newMasterKey, setNewMasterKey] = useState(adminSettings.masterKey);
  const [verificationMode, setVerificationMode] = useState(adminSettings.verificationMode);
  const [marqueeNotice, setMarqueeNotice] = useState(adminSettings.marqueeNotice);

  // Game control
  const [forcedWinGo, setForcedWinGo] = useState<number | null>(adminSettings.forcedWinGoNumber);
  const [forcedAviator, setForcedAviator] = useState<string>(
    adminSettings.forcedAviatorCrash ? String(adminSettings.forcedAviatorCrash) : ''
  );

  // Balance direct edit
  const [customBalance, setCustomBalance] = useState(user.balance);

  // New Gift Code generator
  const [newGiftCode, setNewGiftCode] = useState('');
  const [newGiftAmount, setNewGiftAmount] = useState(500);

  if (!isAdminOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyMasterKey(enteredKey)) {
      sound.playWin();
      setIsAuthenticated(true);
      showToast('Master Key Verified! Welcome to DMD Admin Console.', 'success');
    } else {
      sound.playCrash();
      showToast('Invalid Master Key! Try default key: DMD999', 'error');
    }
  };

  const handleSavePaymentSettings = () => {
    sound.playClick();
    updateAdminSettings({
      payeeName,
      upiId,
      bankName,
      masterKey: newMasterKey,
      verificationMode,
    });
  };

  const handleSaveGameControl = () => {
    sound.playClick();
    updateAdminSettings({
      forcedWinGoNumber: forcedWinGo,
      forcedAviatorCrash: forcedAviator ? Number(forcedAviator) : null,
    });
    showToast('Game outcomes configured!', 'success');
  };

  const handleSaveNotice = () => {
    sound.playClick();
    updateAdminSettings({ marqueeNotice });
    showToast('Scrolling marquee announcement updated!', 'success');
  };

  const handleCreateGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGiftCode.trim()) return;
    const updated = [
      ...adminSettings.customGifts,
      { code: newGiftCode.toUpperCase().trim(), amount: newGiftAmount, totalClaims: 0 },
    ];
    updateAdminSettings({ customGifts: updated });
    setNewGiftCode('');
    showToast(`Gift Code ${newGiftCode.toUpperCase()} for ₹${newGiftAmount} created!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-4 flex items-center justify-between border-b border-rose-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <KeyRound size={18} />
            </div>
            <div>
              <h3 className="font-black text-sm text-amber-300">DMD Master Control Console</h3>
              <p className="text-[10px] text-slate-400">Owner &amp; Maintenance Master Key: <strong>{adminSettings.masterKey}</strong></p>
            </div>
          </div>
          <button
            onClick={() => setIsAdminOpen(false)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-xs"
          >
            ✕
          </button>
        </div>

        {/* Not Logged In State: Enter Master Key */}
        {!isAuthenticated ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-3xl shadow-inner border border-amber-200">
              🔑
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-base text-slate-900">Enter Admin Master Key</h4>
              <p className="text-xs text-slate-500">
                Authorized access only for DMD Earning Club administrators.
              </p>
              <div className="inline-block bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-mono font-bold px-3 py-1 rounded-full mt-1">
                Default Master Key: <strong>DMD999</strong>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-3 max-w-xs mx-auto">
              <input
                type="password"
                required
                value={enteredKey}
                onChange={(e) => setEnteredKey(e.target.value)}
                placeholder="Enter Master Key (e.g. DMD999)"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-center text-sm font-mono font-bold tracking-widest outline-hidden focus:border-rose-500"
              />

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-rose-500/25 active:scale-95 transition-all"
              >
                Unlock Master Controls
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Management Tabs */
          <div className="flex-1 flex flex-col overflow-hidden text-xs">
            {/* Tabs Bar */}
            <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto no-scrollbar font-bold text-slate-600">
              {[
                { id: 'influencers', label: '10 Insta Accounts 📸', icon: Instagram },
                { id: 'payment', label: 'QR & UPI', icon: QrCode },
                { id: 'deposits', label: `Deposits (${paymentRequests.filter(r => r.status === 'verifying').length})`, icon: Wallet },
                { id: 'withdrawals', label: `Withdrawals (${withdrawalRequests.filter(r => r.status === 'pending').length})`, icon: CheckCircle2 },
                { id: 'games', label: 'Game Rig/Fair', icon: Sliders },
                { id: 'wallet', label: 'Wallet Adjust', icon: Gift },
                { id: 'notice', label: 'Notice Editor', icon: Megaphone },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { sound.playClick(); setActiveTab(tab.id as typeof activeTab); }}
                  className={`px-3.5 py-2.5 whitespace-nowrap flex items-center gap-1.5 border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-rose-500 text-rose-600 bg-white font-black'
                      : 'border-transparent hover:text-slate-900'
                  }`}
                >
                  <tab.icon size={13} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* TAB 0: 10 Instagram Influencer Demo Accounts */}
              {activeTab === 'influencers' && (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-purple-50 via-rose-50 to-amber-50 rounded-2xl p-3 border border-purple-200 text-slate-800 space-y-1">
                    <span className="font-bold flex items-center gap-1 text-purple-700">
                      <Instagram size={15} />
                      <span>10 Official Instagram Influencer Demo Accounts</span>
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      ये 10 डेमो अकाउंट्स सिर्फ आपकी कंपनी के पास हैं। आप यहाँ से 1-क्लिक में आईडी व पासवर्ड कॉपी करके अपने इंस्टाग्राम इन्फ्लुएंसर्स को DM / WhatsApp पर भेज सकते हैं ताकि वे रील्स बनाकर प्रमोट कर सकें।
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {adminSettings.influencerAccounts.map((acc, index) => (
                      <div
                        key={acc.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 hover:border-purple-300 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-black text-[10px] flex items-center justify-center">
                                {index + 1}
                              </span>
                              <span className="font-black text-slate-900 text-xs">{acc.name}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                                ₹{acc.balance.toLocaleString()} Demo
                              </span>
                            </div>
                            <div className="text-[11px] font-mono font-bold text-slate-700 pt-0.5">
                              User ID: <span className="text-purple-600 select-all">{acc.username}</span>
                            </div>
                            <div className="text-[11px] font-mono font-bold text-slate-700">
                              Password: <span className="text-rose-600 select-all">{acc.password}</span>
                            </div>
                          </div>

                          <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full text-slate-700 font-bold uppercase">
                            Ready
                          </span>
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                          <button
                            onClick={() => {
                              sound.playClick();
                              const msg = `🔥 Welcome to DMD Earning Club! Here are your official Influencer Demo Account credentials to create videos:\n\n📱 User ID: ${acc.username}\n🔑 Password: ${acc.password}\n💰 Demo Balance: ₹${acc.balance.toLocaleString()}\n🌐 Login Link: ${window.location.origin}\n\nStart playing WinGo & Aviator and share your referral link to earn ₹25 per friend!`;
                              navigator.clipboard?.writeText(msg);
                              showToast(`Credentials for ${acc.name} copied! Ready to paste into Instagram DM.`, 'success');
                            }}
                            className="flex-1 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition-all"
                          >
                            <Copy size={12} />
                            <span>Copy for Insta DM</span>
                          </button>

                          <button
                            onClick={() => {
                              sound.playWin();
                              loginInfluencerAccount(acc.username, acc.password);
                              setIsAdminOpen(false);
                            }}
                            className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1 active:scale-95 transition-all"
                            title="Direct Login as this Creator"
                          >
                            <UserCheck size={12} />
                            <span>Login As</span>
                          </button>

                          <button
                            onClick={() => {
                              resetSpecificInfluencerBalance(acc.id, 50000);
                            }}
                            className="py-1.5 px-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 text-[10px] font-bold"
                            title="Reset Balance to ₹50,000"
                          >
                            Reset ₹50k
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 1: Payment & QR Settings */}
              {activeTab === 'payment' && (
                <div className="space-y-3">
                  <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 text-amber-900 space-y-1">
                    <span className="font-bold flex items-center gap-1">
                      <ShieldCheck size={14} className="text-amber-600" />
                      <span>Official Payment Receiver (Surajaram)</span>
                    </span>
                    <p className="text-[11px] text-amber-800">
                      When players click Deposit, they see Surajaram's Paytm QR code and UPI ID.
                    </p>
                  </div>

                  {/* QR Image Preview */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center space-y-2">
                    <span className="text-[11px] font-bold text-slate-500">Active QR Code Shown To Users:</span>
                    <div className="w-36 h-36 mx-auto rounded-xl overflow-hidden border-2 border-slate-300 shadow-xs bg-white p-1">
                      <img
                        src={adminSettings.qrImageUrl}
                        alt="Paytm QR"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">Payee: {adminSettings.payeeName} ({adminSettings.upiId})</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Payee Name</label>
                      <input
                        type="text"
                        value={payeeName}
                        onChange={(e) => setPayeeName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-hidden focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Payee UPI ID</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 outline-hidden focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-hidden focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Admin Master Key PIN</label>
                      <input
                        type="text"
                        value={newMasterKey}
                        onChange={(e) => setNewMasterKey(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-rose-600 outline-hidden focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSavePaymentSettings}
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs"
                  >
                    <Save size={14} />
                    <span>Save Payment Settings</span>
                  </button>
                </div>
              )}

              {/* TAB 2: Deposits Approvals */}
              {activeTab === 'deposits' && (
                <div className="space-y-3">
                  <div className="font-bold text-slate-800 flex justify-between items-center">
                    <span>Payment Claims (Anti-Fraud UTR Checks)</span>
                    <span className="text-[10px] text-slate-400">Pending: {paymentRequests.filter(r => r.status === 'verifying').length}</span>
                  </div>

                  {paymentRequests.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">No deposit records yet.</div>
                  ) : (
                    paymentRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-900 text-sm">
                                ₹{req.amount.toFixed(2)}
                              </span>
                              {req.bonusAmount && req.bonusAmount > 0 && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                                  +₹{req.bonusAmount} Bonus (50%)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-rose-600 font-mono font-bold">UTR: {req.utr}</div>
                            <div className="text-[9px] text-slate-400">UID: {req.userUid} • {req.date}</div>
                            {req.totalCredited && (
                              <div className="text-[10px] text-emerald-700 font-bold">
                                Total Wallet Credit: ₹{req.totalCredited.toFixed(2)}
                              </div>
                            )}
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              req.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800 animate-pulse'
                            }`}
                          >
                            {req.status === 'verifying' ? 'VERIFICATION PENDING' : req.status.toUpperCase()}
                          </span>
                        </div>

                        {req.status === 'verifying' && (
                          <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                            <button
                              onClick={() => approveDepositRequest(req.id)}
                              className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                            >
                              Approve &amp; Credit ₹{req.totalCredited || req.amount}
                            </button>
                            <button
                              onClick={() => rejectDepositRequest(req.id, 'Payment not received in Surajaram Paytm account')}
                              className="flex-1 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px]"
                            >
                              Reject Fake UTR
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: Withdrawal Approvals */}
              {activeTab === 'withdrawals' && (
                <div className="space-y-3">
                  <div className="font-bold text-slate-800 flex justify-between items-center">
                    <span>Withdrawal Requests</span>
                    <span className="text-[10px] text-slate-400">Total: {withdrawalRequests.length}</span>
                  </div>

                  {withdrawalRequests.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">No withdrawal requests right now.</div>
                  ) : (
                    withdrawalRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono font-bold text-slate-900 text-xs">
                              ₹{req.amount.toFixed(2)}
                            </span>
                            <div className="text-[10px] text-slate-500">To: {req.upiOrBank}</div>
                            <div className="text-[9px] text-slate-400">UID: {req.userUid} • {req.date}</div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              req.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {req.status.toUpperCase()}
                          </span>
                        </div>

                        {req.status === 'pending' && (
                          <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                            <button
                              onClick={() => approveWithdrawalRequest(req.id)}
                              className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                            >
                              Mark Paid (Approve)
                            </button>
                            <button
                              onClick={() => rejectWithdrawalRequest(req.id)}
                              className="flex-1 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px]"
                            >
                              Reject &amp; Refund
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: Game Outcome Master Rig/Fair Controller */}
              {activeTab === 'games' && (
                <div className="space-y-4">
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-rose-900 space-y-1">
                    <span className="font-bold flex items-center gap-1">
                      <Sliders size={14} className="text-rose-600" />
                      <span>Live Outcome Master Override</span>
                    </span>
                    <p className="text-[11px] text-rose-800">
                      As admin, you can set the exact winning result of the next round or leave it in 100% fair random mode!
                    </p>
                  </div>

                  {/* WinGo Controller */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-2">
                    <div className="font-black text-slate-900 flex justify-between items-center">
                      <span>WinGo Next Draw Override:</span>
                      <span className="text-[10px] text-rose-600 font-bold">
                        {forcedWinGo !== null ? `Forced: ${forcedWinGo}` : 'Fair (Random)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                          key={num}
                          onClick={() => setForcedWinGo(num)}
                          className={`py-1.5 rounded-xl text-xs font-black transition-all ${
                            forcedWinGo === num
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setForcedWinGo(null)}
                      className={`w-full py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        forcedWinGo === null
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      Reset to 100% Fair / Random
                    </button>
                  </div>

                  {/* Aviator Controller */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-2">
                    <div className="font-black text-slate-900 flex justify-between items-center">
                      <span>Aviator Next Crash Multiplier:</span>
                      <span className="text-[10px] text-rose-600 font-bold">
                        {forcedAviator ? `${forcedAviator}x` : 'Fair (Random)'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {['1.20', '2.50', '5.00', '15.00', '50.00'].map((val) => (
                        <button
                          key={val}
                          onClick={() => setForcedAviator(val)}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-black font-mono transition-all ${
                            forcedAviator === val
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {val}x
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={forcedAviator}
                        onChange={(e) => setForcedAviator(e.target.value)}
                        placeholder="Custom crash (e.g. 8.4)"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold"
                      />
                      <button
                        onClick={() => setForcedAviator('')}
                        className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-600"
                      >
                        Reset Fair
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveGameControl}
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
                  >
                    Apply Outcome Overrides
                  </button>
                </div>
              )}

              {/* TAB 5: Wallet & Gifts Manager */}
              {activeTab === 'wallet' && (
                <div className="space-y-4">
                  {/* Balance injection */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-2">
                    <span className="font-black text-slate-900 block">Manage Player Wallet Balance</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-rose-500">₹</span>
                      <input
                        type="number"
                        value={customBalance}
                        onChange={(e) => setCustomBalance(Number(e.target.value))}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => adjustUserBalance(customBalance)}
                          className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs shadow-xs"
                        >
                          Update Wallet Balance
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[100, 500, 1000, 5000, 10000].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => adjustUserBalance(amt)}
                          className="flex-1 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold hover:bg-slate-200"
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Create New Gift Code */}
                  <form onSubmit={handleCreateGift} className="bg-white border border-slate-200 rounded-2xl p-3 space-y-2">
                    <span className="font-black text-slate-900 block">Create New Gift Promo Code</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        value={newGiftCode}
                        onChange={(e) => setNewGiftCode(e.target.value)}
                        placeholder="Code (e.g. DMDNEW)"
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase"
                      />
                      <input
                        type="number"
                        required
                        value={newGiftAmount}
                        onChange={(e) => setNewGiftAmount(Number(e.target.value))}
                        placeholder="₹ Amount"
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-black text-xs shadow-xs"
                    >
                      + Create Gift Code
                    </button>
                  </form>

                  {/* Existing codes */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">Active Promo Codes:</span>
                    {adminSettings.customGifts.map((g, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-slate-200 last:border-none">
                        <span className="font-mono font-bold text-rose-600">{g.code}</span>
                        <span className="font-black text-slate-900">₹{g.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: Announcement Marquee Editor */}
              {activeTab === 'notice' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Scrolling Audio Marquee Banner Text
                    </label>
                    <textarea
                      rows={4}
                      value={marqueeNotice}
                      onChange={(e) => setMarqueeNotice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed outline-hidden focus:border-rose-500"
                    />
                  </div>

                  <button
                    onClick={handleSaveNotice}
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs"
                  >
                    <Save size={14} />
                    <span>Update Live Announcement</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
