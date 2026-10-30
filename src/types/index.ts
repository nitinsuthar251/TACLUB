export type TabType = 'home' | 'activity' | 'invite-wheel' | 'promotion' | 'account';

export type GameViewType = 'lobby' | 'wingo' | 'aviator' | 'k3' | 'mines';

export type WinGoDuration = '30sec' | '1min' | '3min' | '5min';

export type AccountMode = 'real' | 'influencer_demo';

export interface WinGoResult {
  period: string;
  number: number;
  color: 'green' | 'red' | 'violet' | 'green-violet' | 'red-violet';
  size: 'Big' | 'Small';
  time: string;
}

export interface WinGoBet {
  id: string;
  period: string;
  duration: WinGoDuration;
  selection: string; // 'Green' | 'Violet' | 'Red' | 'Big' | 'Small' | '0'..'9'
  amount: number;
  multiplier: number;
  totalBet: number;
  payout?: number;
  status: 'pending' | 'won' | 'lost';
  createdAt: string;
  isInfluencerDemo?: boolean;
}

export interface AviatorBet {
  id: string;
  player: string;
  amount: number;
  cashedAt?: number;
  wonAmount?: number;
  status: 'active' | 'cashed' | 'crashed';
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'win' | 'bet' | 'bonus' | 'commission' | 'referral';
  amount: number;
  description: string;
  status: 'completed' | 'processing' | 'failed';
  date: string;
  isDemo?: boolean;
}

export interface UserProfile {
  uid: string;
  username: string;
  balance: number;
  influencerDemoBalance: number;
  accountMode: AccountMode;
  vipLevel: number;
  vipExp: number;
  invitationCode: string;
  phone: string;
  avatar: string;
  activeInfluencerAccount?: InfluencerAccount | null;
  totalReferrals: number;
  referralEarnings: number;
  firstDepositClaimed?: boolean;
}

export interface PaymentRequest {
  id: string;
  userUid: string;
  amount: number;
  bonusAmount?: number;
  totalCredited?: number;
  utr: string;
  channel: string;
  payeeUpi: string;
  status: 'verifying' | 'approved' | 'rejected';
  date: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface WithdrawalRequest {
  id: string;
  userUid: string;
  amount: number;
  upiOrBank: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface InfluencerAccount {
  id: string;
  username: string; // e.g. 'dmd_creator01'
  password: string; // e.g. 'DMD#Influencer01'
  name: string; // e.g. 'VIP Insta Influencer #1'
  balance: number; // e.g. 50000
  assignedTo?: string; // notes e.g. 'Assigned to @rahul_reels'
  status: 'active' | 'assigned' | 'available';
}

export interface AdminSettings {
  brandName: string;
  brandTagline: string;
  masterKey: string;
  upiId: string;
  payeeName: string;
  bankName: string;
  qrImageUrl: string;
  marqueeNotice: string;
  verificationMode: 'strict_admin' | 'automated_gateway';
  usedUtrs: string[];
  referralBonusAmount: number; // ₹25 per referral
  influencerAccounts: InfluencerAccount[];
  forcedWinGoNumber: number | null;
  forcedAviatorCrash: number | null;
  customGifts: { code: string; amount: number; totalClaims: number }[];
}
