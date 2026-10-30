import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Users, 
  ChevronRight, 
  FileText, 
  Percent, 
  Headphones, 
  Share2, 
  TrendingUp,
  Award,
  Gift,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';

export const PromotionPage: React.FC = () => {
  const { user, setIsSupportOpen, showToast, claimReferralBonus, adminSettings } = useApp();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const inviteLink = `https://dmdearning.club/join?ref=${user.invitationCode}`;

  const copyCode = () => {
    sound.playClick();
    navigator.clipboard?.writeText(user.invitationCode);
    setCopiedCode(true);
    showToast('Invitation Code copied!', 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLink = () => {
    sound.playClick();
    navigator.clipboard?.writeText(inviteLink);
    setCopiedLink(true);
    showToast('Invitation Link copied! Share to earn ₹25 per refer!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareOnWhatsApp = () => {
    sound.playClick();
    const text = `🔥 Join DMD Earning Club (DMD अर्निंग क्लब) using my referral code: ${user.invitationCode}\n💰 Get instant signup bonus & play WinGo / Aviator!\n👉 Register link: ${inviteLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSimulateReferral = () => {
    const friendNames = ['Rahul Sharma', 'Pooja Verma', 'Amit Kumar', 'Vikram Singh', 'Deepak Soni', 'Neha Patel'];
    const randomFriend = friendNames[Math.floor(Math.random() * friendNames.length)];
    claimReferralBonus(randomFriend);
  };

  return (
    <div className="pb-24 max-w-md mx-auto px-3 space-y-4 pt-2">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h3 className="font-black text-lg text-slate-900 tracking-tight">Agency &amp; Referrals</h3>
          <span className="text-[10px] text-rose-500 font-bold">DMD अर्निंग क्लब रेफरल प्रोग्राम</span>
        </div>
        <button
          onClick={() => setIsSupportOpen(true)}
          className="text-xs text-rose-600 font-bold flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-xl"
        >
          <Headphones size={13} />
          <span>Support</span>
        </button>
      </div>

      {/* ₹25 Per Refer Highlight Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-4 text-white shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-300">
            <Gift size={15} />
            <span>INSTANT REFER BONUS</span>
          </div>
          <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">
            UNLIMITED
          </span>
        </div>

        <div className="space-y-1">
          <h4 className="text-xl font-black tracking-tight leading-tight">
            Earn <span className="text-amber-300 text-2xl font-mono">₹25.00 CASH</span> Per Friend!
          </h4>
          <p className="text-xs text-rose-100 font-medium">
            हर रेफर पर आपके वॉलेट में तुरंत ₹25 कैश क्रेडिट होंगे। जितने ज्यादा दोस्त, उतनी ज्यादा कमाई!
          </p>
        </div>

        {/* User Referral Metrics */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/20 text-center">
          <div className="bg-black/20 rounded-xl p-2.5">
            <div className="text-2xl font-black font-mono text-yellow-300">{user.totalReferrals}</div>
            <div className="text-[10px] text-white/80">Friends Invited</div>
          </div>
          <div className="bg-black/20 rounded-xl p-2.5">
            <div className="text-2xl font-black font-mono text-emerald-300">₹{user.referralEarnings.toFixed(2)}</div>
            <div className="text-[10px] text-white/80">Total Refer Cash Earned</div>
          </div>
        </div>

        {/* Test Referral Simulator Button */}
        <button
          onClick={handleSimulateReferral}
          className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Sparkles size={14} />
          <span>Test Refer A Friend (+₹25 Instant Cash)</span>
        </button>
      </div>

      {/* Invitation Link Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div className="flex gap-2">
          <button
            onClick={copyLink}
            className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            {copiedLink ? <Check size={15} /> : <Share2 size={15} />}
            <span>{copiedLink ? 'Copied Link!' : 'Copy Invite Link'}</span>
          </button>

          <button
            onClick={shareOnWhatsApp}
            className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            title="Share directly on WhatsApp"
          >
            <MessageCircle size={16} />
            <span>WhatsApp</span>
          </button>
        </div>

        {/* Copy Invitation Code row */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">My Referral Code</div>
            <div className="font-mono font-black text-sm text-slate-900 tracking-wider">{user.invitationCode}</div>
          </div>
          <button
            onClick={copyCode}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-rose-600 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all shadow-2xs"
          >
            {copiedCode ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            <span>{copiedCode ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Agency Navigation List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden text-xs">
        {[
          { label: 'Subordinate data & team members', icon: Users, id: 'subordinate' },
          { label: 'Commission detail (Daily 0.8%)', icon: TrendingUp, id: 'commission' },
          { label: 'Invitation rules (₹25 per friend)', icon: FileText, id: 'rules' },
          { label: 'Agent line customer service', icon: Headphones, id: 'support' },
          { label: 'Rebate ratio breakdown', icon: Percent, id: 'rebate' },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              sound.playClick();
              if (item.id === 'support') setIsSupportOpen(true);
              else setActiveModal(item.id);
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                <item.icon size={16} />
              </div>
              <span className="font-bold text-slate-800">{item.label}</span>
            </div>
            <ChevronRight size={16} className="text-slate-400" />
          </button>
        ))}
      </div>

      {/* Info Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="font-black text-sm text-slate-900 capitalize">{activeModal} Information</h4>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold">✕</button>
            </div>
            <div className="text-xs text-slate-600 space-y-2 max-h-60 overflow-y-auto">
              {activeModal === 'rules' && (
                <>
                  <p>• <strong>Instant Referral Cash:</strong> जब भी आपका कोई दोस्त आपके कोड से जॉइन करता है, तो आपको <strong>₹25.00 सीधे वॉलेट</strong> में मिलते हैं।</p>
                  <p>• <strong>Betting Turnover Rebate:</strong> उनके द्वारा खेले जाने वाले हर WinGo और Aviator राउंड पर आपको <strong>0.6% से 1.2%</strong> लाइफटाइम कमीशन मिलता है।</p>
                  <p>• कोई लिमिट नहीं — जितने चाहे उतने दोस्तों को रेफर करें और रोज कमाई करें।</p>
                </>
              )}
              {activeModal === 'rebate' && (
                <>
                  <p>• Tier 1: 0.60% (Turnover &lt; 100k)</p>
                  <p>• Tier 2: 0.75% (Turnover 100k - 500k)</p>
                  <p>• Tier 3: 0.90% (Turnover 500k - 2M)</p>
                  <p>• Tier VIP: 1.20% (Turnover &gt; 2M)</p>
                </>
              )}
              {activeModal !== 'rules' && activeModal !== 'rebate' && (
                <p className="text-slate-600">Total Referrals: {user.totalReferrals} • Total Bonus: ₹{user.referralEarnings.toFixed(2)}</p>
              )}
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
