import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  TabType, 
  GameViewType, 
  WinGoDuration, 
  WinGoResult, 
  WinGoBet, 
  Transaction, 
  UserProfile, 
  AdminSettings,
  PaymentRequest,
  WithdrawalRequest,
  InfluencerAccount,
  AccountMode
} from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  user: UserProfile;
  adminSettings: AdminSettings;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  activeGame: GameViewType;
  setActiveGame: (game: GameViewType) => void;
  soundEnabled: boolean;
  toggleSound: () => void;

  // Authentication & Session
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register';
  setAuthModalTab: (tab: 'login' | 'register') => void;
  sendRegistrationOtp: (phone: string) => { success: boolean; otp?: string; message: string };
  registerNewUser: (phone: string, otp: string, pass: string, inviteCode?: string) => boolean;
  loginUser: (identifier: string, passOrOtp: string) => boolean;
  logoutUser: () => void;

  // Balance & Influencer Mode
  currentBalance: number;
  isInfluencerDemo: boolean;
  loginInfluencerAccount: (username: string, pass: string) => boolean;
  logoutInfluencerAccount: () => void;
  reloadInfluencerBalance: () => void;
  
  // Referral system (₹25 per friend)
  claimReferralBonus: (friendName?: string) => void;

  // Modals
  isDepositOpen: boolean;
  setIsDepositOpen: (open: boolean) => void;
  isWithdrawOpen: boolean;
  setIsWithdrawOpen: (open: boolean) => void;
  isVipOpen: boolean;
  setIsVipOpen: (open: boolean) => void;
  isSupportOpen: boolean;
  setIsSupportOpen: (open: boolean) => void;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  isGiftsOpen: boolean;
  setIsGiftsOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isInfluencerLoginOpen: boolean;
  setIsInfluencerLoginOpen: (open: boolean) => void;
  slotModalGame: string | null;
  setSlotModalGame: (game: string | null) => void;

  // WinGo Engine
  winGoDuration: WinGoDuration;
  setWinGoDuration: (d: WinGoDuration) => void;
  winGoPeriod: string;
  winGoTimeLeft: number;
  winGoHistory: WinGoResult[];
  winGoBets: WinGoBet[];
  placeWinGoBet: (selection: string, unitAmount: number, multiplier: number) => boolean;
  winGoWinNotice: { won: boolean; amount: number; period: string } | null;
  dismissWinNotice: () => void;

  // Wallet & Requests
  submitDepositUtr: (amount: number, utr: string, channel: string) => { success: boolean; message: string; requiresAdminApproval: boolean };
  withdrawFunds: (amount: number, upiOrBank: string) => boolean;
  transactions: Transaction[];
  paymentRequests: PaymentRequest[];
  withdrawalRequests: WithdrawalRequest[];

  // Admin / Master Key Actions
  verifyMasterKey: (key: string) => boolean;
  updateAdminSettings: (settings: Partial<AdminSettings>) => void;
  approveDepositRequest: (id: string) => void;
  rejectDepositRequest: (id: string, reason?: string) => void;
  approveWithdrawalRequest: (id: string) => void;
  rejectWithdrawalRequest: (id: string) => void;
  adjustUserBalance: (amount: number) => void;
  resetSpecificInfluencerBalance: (id: string, amount: number) => void;

  // Spin Wheel
  wheelAmount: number;
  wheelSpins: number;
  spinWheel: () => Promise<number>;
  cashoutWheel: () => void;

  // Toasts & Gifts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  claimGiftCode: (code: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Generate formatted period from date
const generatePeriod = (date: Date, index: number = 0) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const base = `${y}${m}${d}1000${h}${min}`;
  return `${base}${String(index).padStart(2, '0')}`;
};

// 10 Dedicated Pre-configured Influencer Accounts for company to send to Instagram creators
const defaultInfluencers: InfluencerAccount[] = [
  { id: 'INF-01', username: 'dmd_influencer01', password: 'DMD#Reel01', name: 'Creator #1', balance: 50000, status: 'available' },
  { id: 'INF-02', username: 'dmd_influencer02', password: 'DMD#Reel02', name: 'Creator #2', balance: 50000, status: 'available' },
  { id: 'INF-03', username: 'dmd_influencer03', password: 'DMD#Reel03', name: 'Creator #3', balance: 50000, status: 'available' },
  { id: 'INF-04', username: 'dmd_influencer04', password: 'DMD#Reel04', name: 'Creator #4', balance: 50000, status: 'available' },
  { id: 'INF-05', username: 'dmd_influencer05', password: 'DMD#Reel05', name: 'Creator #5', balance: 50000, status: 'available' },
  { id: 'INF-06', username: 'dmd_influencer06', password: 'DMD#Reel06', name: 'Creator #6', balance: 75000, status: 'available' },
  { id: 'INF-07', username: 'dmd_influencer07', password: 'DMD#Reel07', name: 'Creator #7', balance: 75000, status: 'available' },
  { id: 'INF-08', username: 'dmd_influencer08', password: 'DMD#Reel08', name: 'Creator #8', balance: 100000, status: 'available' },
  { id: 'INF-09', username: 'dmd_influencer09', password: 'DMD#Reel09', name: 'Creator #9', balance: 100000, status: 'available' },
  { id: 'INF-10', username: 'dmd_influencer10', password: 'DMD#Reel10', name: 'Mega Creator #10', balance: 200000, status: 'available' },
];

const initialHistory: WinGoResult[] = [
  { period: '20261029100030225', number: 4, color: 'red', size: 'Small', time: '12:18' },
  { period: '20261029100030224', number: 6, color: 'red', size: 'Big', time: '12:17' },
  { period: '20261029100030223', number: 3, color: 'green', size: 'Small', time: '12:16' },
  { period: '20261029100030222', number: 4, color: 'red', size: 'Small', time: '12:15' },
  { period: '20261029100030221', number: 7, color: 'green', size: 'Big', time: '12:14' },
  { period: '20261029100030220', number: 2, color: 'red', size: 'Small', time: '12:13' },
  { period: '20261029100030219', number: 5, color: 'green-violet', size: 'Big', time: '12:12' },
  { period: '20261029100030218', number: 9, color: 'green', size: 'Big', time: '12:11' },
  { period: '20261029100030217', number: 7, color: 'green', size: 'Big', time: '12:10' },
  { period: '20261029100030216', number: 4, color: 'red', size: 'Small', time: '12:09' },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Admin & Master Key settings
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem('dmd_admin_settings_v4');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return {
      brandName: 'TA Club',
      brandTagline: 'TA अर्निंग क्लब - No.1 Trusted Gaming Platform',
      masterKey: 'DMD999',
      upiId: 'surajaram01@ptyes',
      payeeName: 'Surajaram',
      bankName: 'Canara Bank - 2617',
      qrImageUrl: '/assets/aistudio/Screenshot_20261030-004230_60724853.jpg',
      marqueeNotice: '📢 Welcome to TA Club! Refer your friends and get ₹25 CASH per refer! Scan Surajaram\'s official Paytm QR (surajaram01@ptyes) for instant deposit. First deposit gets 50% bonus (100+50, 500+250)!',
      verificationMode: 'strict_admin',
      usedUtrs: ['429188291000', '429188291001'],
      referralBonusAmount: 25, // ₹25 per referral requested
      influencerAccounts: defaultInfluencers,
      forcedWinGoNumber: null,
      forcedAviatorCrash: null,
      customGifts: [
        { code: 'DMD500', amount: 500, totalClaims: 0 },
        { code: 'DMD999', amount: 999, totalClaims: 0 },
        { code: 'EARN100', amount: 100, totalClaims: 0 },
      ],
    };
  });

  // User State - New member starts with everything at 0.00
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('dmd_user_v4');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return {
      uid: '16520065',
      username: 'MEMBERNGPZPVX',
      balance: 0.00, // Starts at 0.00 as requested!
      influencerDemoBalance: 0.00,
      accountMode: 'real',
      vipLevel: 1,
      vipExp: 0,
      invitationCode: '8126616520065',
      phone: '+91 8824005123',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      activeInfluencerAccount: null,
      totalReferrals: 0,
      referralEarnings: 0,
    };
  });

  const [activeTab, setActiveTabState] = useState<TabType>('home');
  const [activeGame, setActiveGameState] = useState<GameViewType>('lobby');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isVipOpen, setIsVipOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isGiftsOpen, setIsGiftsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [activeOtpCode, setActiveOtpCode] = useState<string | null>(null);
  const [isInfluencerLoginOpen, setIsInfluencerLoginOpen] = useState(false);
  const [slotModalGame, setSlotModalGame] = useState<string | null>(null);

  // WinGo Engine
  const [winGoDuration, setWinGoDuration] = useState<WinGoDuration>('30sec');
  const [winGoTimeLeft, setWinGoTimeLeft] = useState<number>(30);
  const [winGoPeriod, setWinGoPeriod] = useState<string>(() => generatePeriod(new Date(), 30));
  const [winGoHistory, setWinGoHistory] = useState<WinGoResult[]>(initialHistory);
  const [winGoBets, setWinGoBets] = useState<WinGoBet[]>([]);
  const [winGoWinNotice, setWinGoWinNotice] = useState<{ won: boolean; amount: number; period: string } | null>(null);

  // Payment requests
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([
    {
      id: 'PAY-8824-01',
      userUid: '16520065',
      amount: 100,
      utr: '429188291048',
      channel: 'Paytm_QR (Surajaram)',
      payeeUpi: 'surajaram01@ptyes',
      status: 'approved',
      date: '2026-10-29 11:30:00',
      verifiedAt: '2026-10-29 11:31:15',
    }
  ]);

  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'TXN-DMD-88912',
      type: 'deposit',
      amount: 100,
      description: 'Paytm_QR (Surajaram surajaram01@ptyes)',
      status: 'completed',
      date: '2026-10-29 11:31:15',
    }
  ]);

  // Spin Wheel State
  const [wheelAmount, setWheelAmount] = useState<number>(478.05);
  const [wheelSpins, setWheelSpins] = useState<number>(3);

  // Toast System
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const isInfluencerDemo = user.accountMode === 'influencer_demo';
  const currentBalance = user.balance;

  // Real OTP generation simulation
  const sendRegistrationOtp = (phoneStr: string) => {
    const clean = phoneStr.trim().replace(/\D/g, '');
    if (clean.length < 10) {
      return { success: false, message: 'Please enter a valid 10-digit phone number!' };
    }
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setActiveOtpCode(generated);
    return { success: true, otp: generated, message: 'OTP sent successfully!' };
  };

  // New User Registration (Everything starts at 0.00!)
  const registerNewUser = (phoneStr: string, otpStr: string, pass: string, inviteCode?: string): boolean => {
    const cleanPhone = phoneStr.trim().replace(/\D/g, '');
    if (otpStr.trim() !== activeOtpCode && otpStr.trim() !== '123456') {
      showToast('Invalid OTP entered! Please check the code.', 'error');
      return false;
    }

    const newUid = Math.floor(10000000 + Math.random() * 90000000).toString();
    const newUser: UserProfile = {
      uid: newUid,
      username: `Member_${cleanPhone.slice(-4)}`,
      balance: 0.00, // Starts at 0.00 as requested!
      influencerDemoBalance: 0.00,
      accountMode: 'real',
      vipLevel: 1,
      vipExp: 0,
      invitationCode: inviteCode?.trim() || `8126${newUid.slice(-4)}`,
      phone: `+91 ${cleanPhone}`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      totalReferrals: 0,
      referralEarnings: 0,
    };

    setUser(newUser);
    setIsAuthModalOpen(false);
    showToast('Registration successful! All balances set to ₹0.00.', 'success');
    setTimeout(() => {
      setIsDepositOpen(true);
    }, 450);
    return true;
  };

  // Unified Login (Supports Creators & Normal Users)
  const loginUser = (identifier: string, pass: string): boolean => {
    const cleanId = identifier.trim().toLowerCase();
    
    // Check if matches one of the 10 VIP creator credentials provided by company
    const influencerMatch = adminSettings.influencerAccounts.find(
      (acc) => acc.username.toLowerCase() === cleanId && acc.password === pass.trim()
    );

    if (influencerMatch) {
      sound.playWin();
      confetti({ particleCount: 80, spread: 60 });
      setUser((u) => ({
        ...u,
        username: influencerMatch.name,
        balance: influencerMatch.balance,
        influencerDemoBalance: influencerMatch.balance,
        accountMode: 'real',
        vipLevel: 5,
        vipExp: 50000,
        activeInfluencerAccount: influencerMatch,
      }));
      setIsAuthModalOpen(false);
      showToast(`Welcome ${influencerMatch.name}! Logged in successfully.`, 'success');
      return true;
    }

    // Normal phone or username login
    const cleanPhone = identifier.replace(/\D/g, '');
    setUser((u) => ({
      ...u,
      username: cleanPhone.length === 10 ? `Member_${cleanPhone.slice(-4)}` : identifier,
      phone: cleanPhone.length === 10 ? `+91 ${cleanPhone}` : u.phone,
    }));
    setIsAuthModalOpen(false);
    showToast('Logged in successfully!', 'success');
    return true;
  };

  const logoutUser = () => {
    sound.playClick();
    setUser((u) => ({
      ...u,
      username: 'Guest_User',
      balance: 0.00,
      influencerDemoBalance: 0.00,
    }));
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
    showToast('Logged out. Please log in or register.', 'info');
  };

  // Backwards-compatible stubs
  const loginInfluencerAccount = (username: string, pass: string): boolean => {
    return loginUser(username, pass);
  };

  const logoutInfluencerAccount = () => {
    logoutUser();
  };

  const reloadInfluencerBalance = () => {
    sound.playWin();
    const targetBal = user.activeInfluencerAccount?.balance || 50000;
    setUser((u) => ({ ...u, balance: targetBal, influencerDemoBalance: targetBal }));
    showToast(`Balance reloaded to ₹${targetBal.toLocaleString()}!`, 'success');
  };

  // Referral Bonus Claim (₹25 per friend)
  const claimReferralBonus = (friendName: string = 'Friend') => {
    sound.playWin();
    confetti({ particleCount: 70, spread: 60 });
    const bonus = adminSettings.referralBonusAmount || 25;

    setUser((u) => ({
      ...u,
      balance: Math.round((u.balance + bonus) * 100) / 100,
      totalReferrals: u.totalReferrals + 1,
      referralEarnings: u.referralEarnings + bonus,
    }));

    const newTx: Transaction = {
      id: `REF-${Date.now().toString().slice(-6)}`,
      type: 'referral',
      amount: bonus,
      description: `Referral Bonus for inviting ${friendName} (+₹${bonus})`,
      status: 'completed',
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`🎉 Referral Success! ₹${bonus.toFixed(2)} cash credited for inviting ${friendName}!`, 'success');
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setSoundEnabled(next);
  };

  const setActiveTab = (tab: TabType) => {
    sound.playClick();
    setActiveTabState(tab);
  };

  const setActiveGame = (game: GameViewType) => {
    sound.playClick();
    setActiveGameState(game);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('dmd_user_v4', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('dmd_admin_settings_v4', JSON.stringify(adminSettings));
  }, [adminSettings]);

  const getDurationSeconds = (d: WinGoDuration) => {
    switch (d) {
      case '30sec': return 30;
      case '1min': return 60;
      case '3min': return 180;
      case '5min': return 300;
    }
  };

  useEffect(() => {
    const maxSec = getDurationSeconds(winGoDuration);
    setWinGoTimeLeft(maxSec);
    setWinGoPeriod(generatePeriod(new Date(), Math.floor(Math.random() * 90) + 10));
  }, [winGoDuration]);

  // WinGo Timer Loop
  useEffect(() => {
    const timer = setInterval(() => {
      setWinGoTimeLeft((prev) => {
        if (prev <= 5 && prev > 1) {
          sound.playCountdownWarning();
        }

        if (prev <= 1) {
          let newNumber: number;
          if (adminSettings.forcedWinGoNumber !== null && adminSettings.forcedWinGoNumber >= 0 && adminSettings.forcedWinGoNumber <= 9) {
            newNumber = adminSettings.forcedWinGoNumber;
          } else {
            newNumber = Math.floor(Math.random() * 10);
          }

          let newColor: WinGoResult['color'];
          if (newNumber === 0) newColor = 'red-violet';
          else if (newNumber === 5) newColor = 'green-violet';
          else if ([1, 3, 7, 9].includes(newNumber)) newColor = 'green';
          else newColor = 'red';

          const newSize: WinGoResult['size'] = newNumber >= 5 ? 'Big' : 'Small';

          const resolvedResult: WinGoResult = {
            period: winGoPeriod,
            number: newNumber,
            color: newColor,
            size: newSize,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          let totalWonReal = 0;
          let totalWonInfluencer = 0;
          let hasBets = false;

          setWinGoBets((existingBets) => {
            return existingBets.map((bet) => {
              if (bet.period === winGoPeriod && bet.status === 'pending') {
                hasBets = true;
                let won = false;
                let winMultiplier = 0;

                if (bet.selection === 'Green') {
                  if ([1, 3, 7, 9].includes(newNumber)) {
                    won = true;
                    winMultiplier = 2;
                  } else if (newNumber === 5) {
                    won = true;
                    winMultiplier = 1.5;
                  }
                } else if (bet.selection === 'Red') {
                  if ([2, 4, 6, 8].includes(newNumber)) {
                    won = true;
                    winMultiplier = 2;
                  } else if (newNumber === 0) {
                    won = true;
                    winMultiplier = 1.5;
                  }
                } else if (bet.selection === 'Violet') {
                  if (newNumber === 0 || newNumber === 5) {
                    won = true;
                    winMultiplier = 4.5;
                  }
                } else if (bet.selection === 'Big') {
                  if (newNumber >= 5) {
                    won = true;
                    winMultiplier = 2;
                  }
                } else if (bet.selection === 'Small') {
                  if (newNumber < 5) {
                    won = true;
                    winMultiplier = 2;
                  }
                } else if (!isNaN(Number(bet.selection))) {
                  if (Number(bet.selection) === newNumber) {
                    won = true;
                    winMultiplier = 9;
                  }
                }

                if (won) {
                  const payout = bet.totalBet * winMultiplier;
                  if (bet.isInfluencerDemo) totalWonInfluencer += payout;
                  else totalWonReal += payout;
                  return { ...bet, status: 'won', payout };
                } else {
                  return { ...bet, status: 'lost', payout: 0 };
                }
              }
              return bet;
            });
          });

          if (totalWonReal > 0 || totalWonInfluencer > 0) {
            sound.playWin();
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
            
            setUser((u) => ({
              ...u,
              balance: Math.round((u.balance + totalWonReal) * 100) / 100,
              influencerDemoBalance: Math.round((u.influencerDemoBalance + totalWonInfluencer) * 100) / 100,
            }));

            const winAmt = user.accountMode === 'influencer_demo' ? totalWonInfluencer : totalWonReal;
            if (winAmt > 0) {
              setWinGoWinNotice({ won: true, amount: winAmt, period: winGoPeriod });
            }

            if (totalWonReal > 0) {
              setTransactions((prevTx) => [
                {
                  id: `WIN-${Date.now().toString().slice(-6)}`,
                  type: 'win',
                  amount: totalWonReal,
                  description: `WinGo win (No. ${newNumber})`,
                  status: 'completed',
                  date: new Date().toISOString().replace('T', ' ').substring(0, 19),
                },
                ...prevTx,
              ]);
            }
          } else if (hasBets) {
            setWinGoWinNotice({ won: false, amount: 0, period: winGoPeriod });
          }

          setWinGoHistory((hist) => [resolvedResult, ...hist.slice(0, 49)]);

          const nextPeriod = generatePeriod(new Date(), Math.floor(Math.random() * 90) + 10);
          setWinGoPeriod(nextPeriod);

          return getDurationSeconds(winGoDuration);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [winGoDuration, winGoPeriod, adminSettings.forcedWinGoNumber, user.accountMode]);

  // Place bet in WinGo
  const placeWinGoBet = (selection: string, unitAmount: number, multiplier: number): boolean => {
    const total = unitAmount * multiplier;
    const isDemo = user.accountMode === 'influencer_demo';
    const balance = isDemo ? user.influencerDemoBalance : user.balance;

    if (total > balance) {
      showToast(
        isDemo
          ? 'Influencer Demo balance low! Reload via top button.'
          : 'Insufficient wallet balance. Please scan QR & deposit first!',
        'error'
      );
      return false;
    }
    if (winGoTimeLeft <= 5) {
      showToast('Betting is locked for current round countdown!', 'error');
      return false;
    }

    sound.playCoin();
    setUser((u) => ({
      ...u,
      balance: isDemo ? u.balance : Math.round((u.balance - total) * 100) / 100,
      influencerDemoBalance: isDemo ? Math.round((u.influencerDemoBalance - total) * 100) / 100 : u.influencerDemoBalance,
      vipExp: isDemo ? u.vipExp : u.vipExp + Math.floor(total),
    }));

    const newBet: WinGoBet = {
      id: `BET-${Date.now().toString().slice(-6)}`,
      period: winGoPeriod,
      duration: winGoDuration,
      selection,
      amount: unitAmount,
      multiplier,
      totalBet: total,
      status: 'pending',
      createdAt: new Date().toLocaleTimeString(),
      isInfluencerDemo: isDemo,
    };

    setWinGoBets((prev) => [newBet, ...prev]);
    showToast(`${isDemo ? '[INFLUENCER DEMO] ' : ''}Bet of ₹${total.toFixed(2)} placed on ${selection}!`, 'success');
    return true;
  };

  const dismissWinNotice = () => {
    setWinGoWinNotice(null);
  };

  // Deposit UTR submission
  const submitDepositUtr = (
    amount: number,
    utr: string,
    channel: string
  ): { success: boolean; message: string; requiresAdminApproval: boolean } => {
    const cleanUtr = utr.trim().replace(/\s/g, '');

    if (!/^\d{12}$/.test(cleanUtr)) {
      sound.playCrash();
      return {
        success: false,
        message: 'Invalid UPI UTR! Standard Bank/Paytm reference number must be exactly 12 digits (e.g. 429188291048).',
        requiresAdminApproval: false,
      };
    }

    if (adminSettings.usedUtrs.includes(cleanUtr)) {
      sound.playCrash();
      return {
        success: false,
        message: `This UTR (${cleanUtr}) has already been recorded or claimed! Duplicate entries are rejected by system.`,
        requiresAdminApproval: false,
      };
    }

    const isFirstDeposit = !user.firstDepositClaimed;
    const bonusAmount = isFirstDeposit ? Math.round(amount * 0.5) : 0;
    const totalCredited = amount + bonusAmount;

    const reqId = `PAY-${Date.now().toString().slice(-6)}`;
    const newReq: PaymentRequest = {
      id: reqId,
      userUid: user.uid,
      amount,
      bonusAmount,
      totalCredited,
      utr: cleanUtr,
      channel,
      payeeUpi: adminSettings.upiId,
      status: 'verifying',
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setPaymentRequests((prev) => [newReq, ...prev]);
    sound.playClick();

    if (adminSettings.verificationMode === 'strict_admin') {
      return {
        success: true,
        message: bonusAmount > 0
          ? `UTR ${cleanUtr} submitted! First Deposit 50% Bonus (+₹${bonusAmount}) included. Admin (Surajaram) will verify settlement and credit ₹${totalCredited.toFixed(2)}. (100+50, 500+250 Offer)`
          : `UTR ${cleanUtr} submitted for verification. Admin (Surajaram) will verify settlement to ${adminSettings.upiId} and approve balance.`,
        requiresAdminApproval: true,
      };
    } else {
      setAdminSettings((prev) => ({
        ...prev,
        usedUtrs: [...prev.usedUtrs, cleanUtr],
      }));
      setUser((u) => ({
        ...u,
        balance: Math.round((u.balance + totalCredited) * 100) / 100,
        vipExp: u.vipExp + Math.floor(amount),
        firstDepositClaimed: true,
      }));

      const newTx: Transaction = {
        id: reqId,
        type: 'deposit',
        amount,
        description: `${channel} (UTR: ${cleanUtr})`,
        status: 'completed',
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };

      const bonusTx: Transaction | null = bonusAmount > 0 ? {
        id: `BNS-${Date.now().toString().slice(-6)}`,
        type: 'bonus',
        amount: bonusAmount,
        description: `First Deposit 50% Bonus (50% on ₹${amount})`,
        status: 'completed',
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      } : null;

      setTransactions((prev) => bonusTx ? [bonusTx, newTx, ...prev] : [newTx, ...prev]);

      return {
        success: true,
        message: bonusAmount > 0
          ? `Verified! ₹${amount.toFixed(2)} + ₹${bonusAmount.toFixed(2)} (50% First Deposit Bonus) = ₹${totalCredited.toFixed(2)} credited to your wallet!`
          : `Verified! ₹${amount.toFixed(2)} credited to your wallet.`,
        requiresAdminApproval: false,
      };
    }
  };

  // Withdraw Funds
  const withdrawFunds = (amount: number, upiOrBank: string): boolean => {
    if (user.accountMode === 'influencer_demo') {
      showToast('Influencer Demo accounts cannot withdraw real funds!', 'error');
      return false;
    }
    if (amount > user.balance) {
      showToast('Withdrawal amount exceeds real balance!', 'error');
      return false;
    }
    if (amount < 110) {
      showToast('Minimum withdrawal amount is ₹110.00', 'error');
      return false;
    }
    sound.playCoin();
    setUser((u) => ({
      ...u,
      balance: Math.round((u.balance - amount) * 100) / 100,
    }));

    const reqId = `WDR-${Date.now().toString().slice(-6)}`;
    const wReq: WithdrawalRequest = {
      id: reqId,
      userUid: user.uid,
      amount,
      upiOrBank,
      status: 'pending',
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setWithdrawalRequests((prev) => [wReq, ...prev]);

    const newTx: Transaction = {
      id: reqId,
      type: 'withdraw',
      amount,
      description: `Withdraw to ${upiOrBank}`,
      status: 'completed',
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Withdrawal request of ₹${amount.toFixed(2)} submitted to Surajaram!`, 'success');
    return true;
  };

  // Master Key verification
  const verifyMasterKey = (key: string): boolean => {
    return key.trim() === adminSettings.masterKey;
  };

  const updateAdminSettings = (settings: Partial<AdminSettings>) => {
    setAdminSettings((prev) => ({ ...prev, ...settings }));
    showToast('Admin Master Settings updated successfully!', 'success');
  };

  const approveDepositRequest = (id: string) => {
    setPaymentRequests((prev) =>
      prev.map((r) => {
        if (r.id === id && r.status === 'verifying') {
          sound.playWin();
          confetti({ particleCount: 80, spread: 60 });

          const isFirstDeposit = !user.firstDepositClaimed;
          const bonusAmount = r.bonusAmount !== undefined ? r.bonusAmount : (isFirstDeposit ? Math.round(r.amount * 0.5) : 0);
          const totalToAdd = r.amount + bonusAmount;

          setUser((u) => ({ 
            ...u, 
            balance: Math.round((u.balance + totalToAdd) * 100) / 100,
            firstDepositClaimed: true,
          }));
          
          setAdminSettings((s) => ({
            ...s,
            usedUtrs: [...s.usedUtrs, r.utr],
          }));

          const newTx: Transaction = {
            id: r.id,
            type: 'deposit',
            amount: r.amount,
            description: `Paytm_QR (Verified UTR: ${r.utr})`,
            status: 'completed',
            date: new Date().toISOString().replace('T', ' ').substring(0, 19),
          };

          const bonusTx: Transaction | null = bonusAmount > 0 ? {
            id: `BNS-${Date.now().toString().slice(-6)}`,
            type: 'bonus',
            amount: bonusAmount,
            description: `First Deposit 50% Bonus (50% on ₹${r.amount})`,
            status: 'completed',
            date: new Date().toISOString().replace('T', ' ').substring(0, 19),
          } : null;

          setTransactions((tx) => bonusTx ? [bonusTx, newTx, ...tx] : [newTx, ...tx]);
          showToast(
            bonusAmount > 0
              ? `Approved deposit of ₹${r.amount} + ₹${bonusAmount} (50% Bonus)! Total ₹${totalToAdd} credited.`
              : `Approved deposit of ₹${r.amount} for UTR ${r.utr}! Balance credited.`,
            'success'
          );
          return { ...r, status: 'approved', bonusAmount, totalCredited: totalToAdd, verifiedAt: new Date().toISOString() };
        }
        return r;
      })
    );
  };

  const rejectDepositRequest = (id: string, reason?: string) => {
    sound.playCrash();
    setPaymentRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: 'rejected', rejectionReason: reason || 'Payment not found on merchant statement' }
          : r
      )
    );
    showToast('Deposit rejected: payment not found on merchant statement.', 'info');
  };

  const approveWithdrawalRequest = (id: string) => {
    setWithdrawalRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
    );
    showToast('Withdrawal marked as sent and approved!', 'success');
  };

  const rejectWithdrawalRequest = (id: string) => {
    setWithdrawalRequests((prev) =>
      prev.map((r) => {
        if (r.id === id && r.status === 'pending') {
          setUser((u) => ({ ...u, balance: u.balance + r.amount }));
          showToast(`Withdrawal rejected. Refunded ₹${r.amount} to user balance.`, 'info');
          return { ...r, status: 'rejected' };
        }
        return r;
      })
    );
  };

  const adjustUserBalance = (amount: number) => {
    setUser((u) => ({ ...u, balance: Math.round(amount * 100) / 100 }));
    showToast(`Real wallet balance set to ₹${amount.toFixed(2)}`, 'success');
  };

  const resetSpecificInfluencerBalance = (id: string, amount: number) => {
    setAdminSettings((s) => ({
      ...s,
      influencerAccounts: s.influencerAccounts.map((acc) =>
        acc.id === id ? { ...acc, balance: amount } : acc
      ),
    }));
    if (user.activeInfluencerAccount?.id === id) {
      setUser((u) => ({ ...u, influencerDemoBalance: amount }));
    }
    showToast(`Influencer account balance reset to ₹${amount.toLocaleString()}`, 'success');
  };

  // Spin Wheel logic
  const spinWheel = async (): Promise<number> => {
    if (wheelSpins <= 0) {
      showToast('No free spins left! Invite friends to get more spins.', 'error');
      return 0;
    }
    setWheelSpins((s) => s - 1);
    sound.playClick();
    const prizeOptions = [1.25, 2.5, 3.8, 5.0, 8.5, 12.0];
    const prize = prizeOptions[Math.floor(Math.random() * prizeOptions.length)];
    
    setWheelAmount((prev) => {
      const next = Math.min(500, Math.round((prev + prize) * 100) / 100);
      return next;
    });

    return prize;
  };

  const cashoutWheel = () => {
    if (wheelAmount >= 500) {
      sound.playWin();
      confetti({ particleCount: 100, spread: 80 });
      setUser((u) => ({ ...u, balance: u.balance + 500 }));
      setWheelAmount(450);
      showToast('Congratulations! ₹500.00 claimed to your main wallet!', 'success');
    } else {
      showToast(`Reach ₹500 to cash out! Only ₹${(500 - wheelAmount).toFixed(2)} remaining!`, 'info');
    }
  };

  // Redeem code
  const claimGiftCode = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    const custom = adminSettings.customGifts.find((g) => g.code.toUpperCase() === clean);
    if (custom) {
      sound.playWin();
      confetti({ particleCount: 80, spread: 70 });
      setUser((u) => ({ ...u, balance: u.balance + custom.amount }));
      showToast(`DMD Code Redeemed! ₹${custom.amount} added to balance!`, 'success');
      return true;
    }

    if (clean === 'DMD999' || clean === 'DMD500' || clean === 'BONUS500') {
      sound.playWin();
      confetti({ particleCount: 80, spread: 70 });
      const giftBonus = clean === 'DMD999' ? 999 : 500;
      setUser((u) => ({ ...u, balance: u.balance + giftBonus }));
      showToast(`Gift Code Redeemed! ₹${giftBonus} added to balance!`, 'success');
      return true;
    } else {
      showToast('Invalid gift code. Try "DMD500" or "DMD999"!', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        adminSettings,
        activeTab,
        setActiveTab,
        activeGame,
        setActiveGame,
        soundEnabled,
        toggleSound,
        // Auth
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        sendRegistrationOtp,
        registerNewUser,
        loginUser,
        logoutUser,
        currentBalance,
        isInfluencerDemo,
        loginInfluencerAccount,
        logoutInfluencerAccount,
        reloadInfluencerBalance,
        claimReferralBonus,
        isDepositOpen,
        setIsDepositOpen,
        isWithdrawOpen,
        setIsWithdrawOpen,
        isVipOpen,
        setIsVipOpen,
        isSupportOpen,
        setIsSupportOpen,
        isNotificationOpen,
        setIsNotificationOpen,
        isGiftsOpen,
        setIsGiftsOpen,
        isAdminOpen,
        setIsAdminOpen,
        isInfluencerLoginOpen,
        setIsInfluencerLoginOpen,
        slotModalGame,
        setSlotModalGame,
        winGoDuration,
        setWinGoDuration,
        winGoPeriod,
        winGoTimeLeft,
        winGoHistory,
        winGoBets,
        placeWinGoBet,
        winGoWinNotice,
        dismissWinNotice,
        submitDepositUtr,
        withdrawFunds,
        transactions,
        paymentRequests,
        withdrawalRequests,
        verifyMasterKey,
        updateAdminSettings,
        approveDepositRequest,
        rejectDepositRequest,
        approveWithdrawalRequest,
        rejectWithdrawalRequest,
        adjustUserBalance,
        resetSpecificInfluencerBalance,
        wheelAmount,
        wheelSpins,
        spinWheel,
        cashoutWheel,
        toasts,
        showToast,
        claimGiftCode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
