import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  CheckCircle2, 
  Gift, 
  ArrowRight,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authModalTab, 
    setAuthModalTab,
    sendRegistrationOtp,
    registerNewUser,
    loginUser,
    showToast,
    user
  } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [inviteCode, setInviteCode] = useState(user.invitationCode || '8126616520065');
  const [showPass, setShowPass] = useState(false);
  
  // OTP Countdown timer
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [simulatedSms, setSimulatedSms] = useState<{ otp: string; phone: string } | null>(null);

  useEffect(() => {
    setActiveTab(authModalTab);
  }, [authModalTab]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = () => {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      showToast('Please enter a valid 10-digit mobile number!', 'error');
      return;
    }

    sound.playClick();
    const res = sendRegistrationOtp(cleanPhone);
    if (res.success && res.otp) {
      setOtpCountdown(60);
      setSimulatedSms({ otp: res.otp, phone: cleanPhone });
      // Auto-fill OTP for ultra-convenient UX
      setOtp(res.otp);
      showToast(`OTP sent to +91 ${cleanPhone}! Check simulated SMS banner.`, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      showToast('Please enter a valid 10-digit mobile number!', 'error');
      return;
    }

    if (!otp.trim()) {
      showToast('Please enter the 6-digit OTP sent to your phone!', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters!', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match!', 'error');
      return;
    }

    sound.playWin();
    const ok = registerNewUser(cleanPhone, otp, password, inviteCode);
    if (ok) {
      setSimulatedSms(null);
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setOtp('');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) {
      showToast('Please enter your mobile number/account ID and password!', 'error');
      return;
    }

    sound.playClick();
    const ok = loginUser(phone.trim(), password.trim());
    if (ok) {
      setIsAuthModalOpen(false);
      setPhone('');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3">
      {/* Floating simulated SMS banner at top of viewport */}
      {simulatedSms && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-60 w-full max-w-sm px-2 animate-in slide-in-from-top duration-300">
          <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-rose-500/50 flex items-start justify-between gap-3 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                <MessageSquare size={18} />
              </div>
              <div className="text-left">
                <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <span>MESSAGES</span>
                  <span className="text-[9px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-400">NOW</span>
                </div>
                <div className="text-xs font-medium text-slate-100 mt-0.5">
                  DMD Club OTP: <strong className="text-yellow-400 font-mono text-sm tracking-wider">{simulatedSms.otp}</strong>. Do not share with anyone.
                </div>
              </div>
            </div>
            <button
              onClick={() => setSimulatedSms(null)}
              className="text-slate-400 hover:text-white text-xs font-bold p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main 91 Club Authentication Modal */}
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 p-5 text-white relative">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white font-bold text-base p-1"
          >
            ✕
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-sm text-yellow-300 border border-white/30 shadow-inner">
              DMD
            </div>
            <div>
              <h3 className="font-black text-lg tracking-tight leading-none">DMD EARNING CLUB</h3>
              <p className="text-[11px] text-rose-100 font-medium mt-1">
                {activeTab === 'login' ? 'लॉग इन करें और गेम खेलना शुरू करें' : 'नया खाता बनाएं और असली पैसे जीतें'}
              </p>
            </div>
          </div>

          {/* 91 Club Dual Tab Switcher */}
          <div className="grid grid-cols-2 gap-1 bg-black/20 p-1 rounded-2xl mt-4">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('login');
                setAuthModalTab('login');
              }}
              className={`py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-rose-600 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Log In (लॉग इन)
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveTab('register');
                setAuthModalTab('register');
              }}
              className={`py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-rose-600 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Register (पंजीकरण)
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {activeTab === 'register' ? (
            /* =================== REGISTER FORM =================== */
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-center gap-2">
                <Gift size={16} className="text-amber-600 shrink-0" />
                <span>पंजीकरण के बाद अपना पहला डिपॉज़िट करें और ₹25 रेफरल बोनस पाएं!</span>
              </div>

              {/* Mobile Number with +91 */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Mobile Phone Number
                </label>
                <div className="flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-rose-500 focus-within:ring-1 focus-within:ring-rose-500">
                  <span className="px-3 py-2.5 text-xs font-bold text-slate-600 bg-slate-100/80 border-r border-slate-200 flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10 digit mobile number"
                    className="flex-1 px-3 py-2 text-xs font-bold text-slate-900 outline-hidden bg-transparent"
                  />
                </div>
              </div>

              {/* OTP Verification Input with Send Button */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Verification Code (OTP)
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-rose-500 focus-within:ring-1 focus-within:ring-rose-500">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit OTP"
                      className="w-full px-3 py-2 text-xs font-bold font-mono text-slate-900 outline-hidden bg-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={otpCountdown > 0}
                    onClick={handleSendOtp}
                    className={`px-3 py-2 rounded-xl text-xs font-black shrink-0 transition-all ${
                      otpCountdown > 0
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-rose-500 hover:bg-rose-600 text-white shadow-xs active:scale-95'
                    }`}
                  >
                    {otpCountdown > 0 ? `${otpCountdown}s Resend` : 'Send OTP'}
                  </button>
                </div>
              </div>

              {/* Set Password */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Set Password
                </label>
                <div className="relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-rose-500">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set password (min 6 chars)"
                    className="w-full px-3 py-2 pr-9 text-xs font-bold text-slate-900 outline-hidden bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Confirm Password
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-rose-500">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 outline-hidden bg-transparent"
                  />
                </div>
              </div>

              {/* Invitation Code */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Invitation Code (रेफरल कोड)
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-rose-500">
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Enter referral code"
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 outline-hidden bg-transparent"
                  />
                </div>
              </div>

              <div className="text-[10px] text-slate-500 leading-tight">
                पंजीकरण करने पर आपका खाता 0.00 से शुरू होगा। इसके बाद आप पेटीएम क्यूआर से तुरंत फंड ऐड करके गेम खेल सकते हैं।
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Register &amp; Start Playing</span>
                <ArrowRight size={14} />
              </button>
            </form>
          ) : (
            /* =================== LOGIN FORM =================== */
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Phone Number or Account ID
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-rose-500">
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter mobile number or assigned ID"
                    className="w-full px-3 py-2.5 text-xs font-bold text-slate-900 outline-hidden bg-transparent"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => showToast('Please contact Customer Support for password reset.', 'info')}
                    className="text-[10px] font-bold text-rose-500 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-rose-500">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3 py-2.5 pr-9 text-xs font-bold text-slate-900 outline-hidden bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Log In Now</span>
                <ArrowRight size={14} />
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('register');
                    setAuthModalTab('register');
                  }}
                  className="text-xs font-black text-rose-600 hover:underline"
                >
                  Register Here
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
