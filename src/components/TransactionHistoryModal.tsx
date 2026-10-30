import React, { useState, useMemo } from 'react';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Filter, 
  ReceiptText, 
  Search, 
  Trophy, 
  Gift, 
  ShieldCheck, 
  RotateCw, 
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';

export type HistoryTab = 'all' | 'deposit' | 'withdraw' | 'reward';
export type StatusFilter = 'all' | 'pending' | 'success' | 'failed';

export interface UnifiedTransactionItem {
  id: string;
  type: 'deposit' | 'withdraw' | 'win' | 'bet' | 'bonus' | 'referral' | 'commission';
  title: string;
  subtitle: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  date: string;
  rawDate: string;
  referenceId: string;
  utr?: string;
  destination?: string;
  payee?: string;
  channel?: string;
  rejectionReason?: string;
}

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: HistoryTab;
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'all'
}) => {
  const { 
    transactions, 
    paymentRequests, 
    withdrawalRequests, 
    adminSettings, 
    setIsDepositOpen, 
    setIsWithdrawOpen,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<HistoryTab>(initialTab);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<UnifiedTransactionItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync initialTab when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setStatusFilter('all');
      setSearchQuery('');
      setSelectedItem(null);
    }
  }, [isOpen, initialTab]);

  // Aggregate and unify all deposits, withdrawals, and transactions
  const unifiedList = useMemo<UnifiedTransactionItem[]>(() => {
    const list: UnifiedTransactionItem[] = [];
    const processedIds = new Set<string>();

    // 1. Process payment requests (deposits)
    paymentRequests.forEach((pr) => {
      processedIds.add(pr.id);
      let status: 'pending' | 'success' | 'failed' = 'pending';
      if (pr.status === 'approved') status = 'success';
      else if (pr.status === 'rejected') status = 'failed';

      list.push({
        id: pr.id,
        type: 'deposit',
        title: pr.bonusAmount ? 'Paytm QR Deposit (+50% Bonus)' : 'Paytm QR Deposit',
        subtitle: pr.bonusAmount ? `UTR: ${pr.utr} (Total: ₹${(pr.totalCredited || (pr.amount + pr.bonusAmount)).toFixed(2)})` : `UTR: ${pr.utr}`,
        amount: pr.totalCredited || pr.amount,
        status,
        date: pr.date,
        rawDate: pr.date,
        referenceId: pr.id,
        utr: pr.utr,
        channel: pr.channel || 'Paytm_QR',
        payee: `${adminSettings.payeeName} (${adminSettings.upiId})`,
        rejectionReason: pr.rejectionReason,
      });
    });

    // 2. Process withdrawal requests
    withdrawalRequests.forEach((wr) => {
      processedIds.add(wr.id);
      let status: 'pending' | 'success' | 'failed' = 'pending';
      if (wr.status === 'approved') status = 'success';
      else if (wr.status === 'rejected') status = 'failed';

      list.push({
        id: wr.id,
        type: 'withdraw',
        title: 'UPI / Bank Withdrawal',
        subtitle: `To: ${wr.upiOrBank}`,
        amount: wr.amount,
        status,
        date: wr.date,
        rawDate: wr.date,
        referenceId: wr.id,
        destination: wr.upiOrBank,
        channel: 'Bank Transfer / UPI',
        payee: adminSettings.payeeName,
      });
    });

    // 3. Process remaining transactions from transactions list (wins, bonuses, referrals, or standalone)
    transactions.forEach((tx) => {
      if (processedIds.has(tx.id)) return; // Skip if already unified from requests

      let status: 'pending' | 'success' | 'failed' = 'success';
      if (tx.status === 'processing') status = 'pending';
      else if (tx.status === 'failed') status = 'failed';

      let title = 'Wallet Transaction';
      let subtitle = tx.description;
      if (tx.type === 'deposit') {
        title = 'Wallet Deposit';
      } else if (tx.type === 'withdraw') {
        title = 'Wallet Withdrawal';
      } else if (tx.type === 'win') {
        title = 'Game Lottery Win';
      } else if (tx.type === 'bonus') {
        title = 'Daily / Activity Bonus';
      } else if (tx.type === 'referral') {
        title = 'Referral Reward (₹25)';
      } else if (tx.type === 'bet') {
        title = 'Game Bet';
      }

      list.push({
        id: tx.id,
        type: tx.type,
        title,
        subtitle,
        amount: tx.amount,
        status,
        date: tx.date,
        rawDate: tx.date,
        referenceId: tx.id,
        channel: tx.description,
      });
    });

    // Sort descending by date
    list.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());

    return list;
  }, [paymentRequests, withdrawalRequests, transactions, adminSettings]);

  // Filtered list
  const filteredList = useMemo(() => {
    return unifiedList.filter((item) => {
      // Tab filter
      if (activeTab === 'deposit' && item.type !== 'deposit') return false;
      if (activeTab === 'withdraw' && item.type !== 'withdraw') return false;
      if (activeTab === 'reward' && !['win', 'bonus', 'referral'].includes(item.type)) return false;

      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchSubtitle = item.subtitle.toLowerCase().includes(query);
        const matchRef = item.referenceId.toLowerCase().includes(query);
        const matchUtr = item.utr ? item.utr.toLowerCase().includes(query) : false;
        const matchAmt = item.amount.toString().includes(query);
        if (!matchTitle && !matchSubtitle && !matchRef && !matchUtr && !matchAmt) return false;
      }

      return true;
    });
  }, [unifiedList, activeTab, statusFilter, searchQuery]);

  // Total summary statistics
  const totalDepositSuccess = useMemo(() => {
    return unifiedList
      .filter((i) => i.type === 'deposit' && i.status === 'success')
      .reduce((sum, i) => sum + i.amount, 0);
  }, [unifiedList]);

  const totalWithdrawSuccess = useMemo(() => {
    return unifiedList
      .filter((i) => i.type === 'withdraw' && i.status === 'success')
      .reduce((sum, i) => sum + i.amount, 0);
  }, [unifiedList]);

  const pendingCount = useMemo(() => {
    return unifiedList.filter((i) => i.status === 'pending').length;
  }, [unifiedList]);

  const handleCopy = (text: string, label: string) => {
    sound.playClick();
    navigator.clipboard?.writeText(text);
    setCopiedId(text);
    showToast(`${label} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRefresh = () => {
    sound.playClick();
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Transaction list refreshed', 'info');
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-md h-[92vh] max-h-[720px] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 text-white p-4 shrink-0 shadow-sm relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
                <ReceiptText size={20} />
              </div>
              <div>
                <h3 className="font-black text-base tracking-tight leading-tight">Transaction History</h3>
                <p className="text-[10px] text-white/80 font-medium">लेन-देन इतिहास • Live Status Tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={handleRefresh}
                title="Refresh"
                className={`w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all ${isRefreshing ? 'animate-spin' : ''}`}
              >
                <RotateCw size={15} />
              </button>
              <button 
                onClick={() => { sound.playClick(); onClose(); }}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center font-bold text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/15 text-center">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-1.5">
              <div className="text-[9px] uppercase tracking-wider text-white/70 font-semibold">Total Deposits</div>
              <div className="text-xs font-black text-emerald-300">₹{totalDepositSuccess.toFixed(2)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-1.5">
              <div className="text-[9px] uppercase tracking-wider text-white/70 font-semibold">Total Withdraw</div>
              <div className="text-xs font-black text-white">₹{totalWithdrawSuccess.toFixed(2)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-1.5">
              <div className="text-[9px] uppercase tracking-wider text-white/70 font-semibold">Pending</div>
              <div className={`text-xs font-black ${pendingCount > 0 ? 'text-amber-300 animate-pulse' : 'text-white/80'}`}>
                {pendingCount} records
              </div>
            </div>
          </div>
        </div>

        {/* Primary Type Filter Tabs */}
        <div className="bg-slate-50 border-b border-slate-100 p-2 shrink-0">
          <div className="flex bg-slate-200/80 p-0.5 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => { sound.playClick(); setActiveTab('all'); }}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${activeTab === 'all' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'hover:text-slate-900'}`}
            >
              All ({unifiedList.length})
            </button>
            <button
              onClick={() => { sound.playClick(); setActiveTab('deposit'); }}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${activeTab === 'deposit' ? 'bg-white text-rose-600 shadow-2xs font-black' : 'hover:text-slate-900'}`}
            >
              Deposits
            </button>
            <button
              onClick={() => { sound.playClick(); setActiveTab('withdraw'); }}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${activeTab === 'withdraw' ? 'bg-white text-blue-600 shadow-2xs font-black' : 'hover:text-slate-900'}`}
            >
              Withdrawals
            </button>
            <button
              onClick={() => { sound.playClick(); setActiveTab('reward'); }}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${activeTab === 'reward' ? 'bg-white text-amber-600 shadow-2xs font-black' : 'hover:text-slate-900'}`}
            >
              Rewards
            </button>
          </div>

          {/* Status Sub-Filters & Search */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search UTR, Ref ID, or ₹"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7.5 pr-2 py-1 text-[11px] rounded-lg bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-rose-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0 text-[10px] font-bold">
              <button
                onClick={() => { sound.playClick(); setStatusFilter('all'); }}
                className={`px-2 py-1 rounded-md border transition-all ${statusFilter === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'}`}
              >
                All
              </button>
              <button
                onClick={() => { sound.playClick(); setStatusFilter('pending'); }}
                className={`px-2 py-1 rounded-md border flex items-center gap-1 transition-all ${statusFilter === 'pending' ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
              >
                <Clock size={10} /> Pending
              </button>
              <button
                onClick={() => { sound.playClick(); setStatusFilter('success'); }}
                className={`px-2 py-1 rounded-md border flex items-center gap-1 transition-all ${statusFilter === 'success' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}
              >
                <CheckCircle2 size={10} /> Success
              </button>
              <button
                onClick={() => { sound.playClick(); setStatusFilter('failed'); }}
                className={`px-2 py-1 rounded-md border flex items-center gap-1 transition-all ${statusFilter === 'failed' ? 'bg-rose-600 text-white border-rose-600' : 'bg-rose-50 text-rose-700 border-rose-200'}`}
              >
                <XCircle size={10} /> Failed
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Cards List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
          {filteredList.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
                <ReceiptText size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-sm text-slate-800">No Transactions Found</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {searchQuery 
                    ? `No records matching "${searchQuery}". Try a different search.` 
                    : statusFilter !== 'all' 
                    ? `No ${statusFilter} transactions in this category.` 
                    : 'Your recent deposit and withdrawal activities will appear here.'}
                </p>
              </div>

              {activeTab === 'deposit' && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onClose();
                    setIsDepositOpen(true);
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold shadow-md hover:from-red-700 hover:to-rose-700"
                >
                  <ArrowDownLeft size={14} /> Scan & Deposit Now
                </button>
              )}

              {activeTab === 'withdraw' && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onClose();
                    setIsWithdrawOpen(true);
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-slate-800"
                >
                  <ArrowUpRight size={14} /> Request Withdrawal
                </button>
              )}
            </div>
          ) : (
            filteredList.map((item) => {
              const isPositive = ['deposit', 'win', 'bonus', 'referral'].includes(item.type);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedItem(item);
                  }}
                  className="bg-white rounded-2xl p-3 border border-slate-100 shadow-2xs hover:border-rose-200 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* Icon + Title */}
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        item.type === 'deposit'
                          ? 'bg-rose-50 text-rose-600'
                          : item.type === 'withdraw'
                          ? 'bg-blue-50 text-blue-600'
                          : item.type === 'win'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {item.type === 'deposit' && <ArrowDownLeft size={18} />}
                        {item.type === 'withdraw' && <ArrowUpRight size={18} />}
                        {item.type === 'win' && <Trophy size={18} />}
                        {(item.type === 'bonus' || item.type === 'referral') && <Gift size={18} />}
                        {item.type === 'bet' && <ReceiptText size={18} />}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{item.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">#{item.referenceId.slice(-6)}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    {/* Amount + Status Badge */}
                    <div className="text-right shrink-0 space-y-1">
                      <div className={`text-xs font-black ${isPositive ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {isPositive ? '+' : '-'}₹{item.amount.toFixed(2)}
                      </div>

                      {/* Status Indicator */}
                      {item.status === 'success' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold">
                          <CheckCircle2 size={10} /> Success
                        </span>
                      )}
                      {item.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-bold animate-pulse">
                          <Clock size={10} /> Pending
                        </span>
                      )}
                      {item.status === 'failed' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[9px] font-bold">
                          <XCircle size={10} /> Failed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer details: Date & Fast Action */}
                  <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{item.date}</span>
                    <span className="text-rose-600 font-bold group-hover:underline flex items-center gap-0.5">
                      Receipt <ChevronRight size={11} />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
              setIsDepositOpen(true);
            }}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <ArrowDownLeft size={14} /> Deposit
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
              setIsWithdrawOpen(true);
            }}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <ArrowUpRight size={14} /> Withdraw
          </button>
        </div>
      </div>

      {/* Detailed Receipt Modal Popup */}
      {selectedItem && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ReceiptText size={18} className="text-rose-600" />
                <h4 className="font-black text-sm text-slate-900">Transaction Receipt</h4>
              </div>
              <button 
                onClick={() => setSelectedItem(null)} 
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Receipt Amount Header */}
            <div className="text-center py-2 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {selectedItem.type.toUpperCase()} AMOUNT
              </span>
              <div className={`text-2xl font-black ${['deposit', 'win', 'bonus', 'referral'].includes(selectedItem.type) ? 'text-emerald-600' : 'text-slate-900'}`}>
                {['deposit', 'win', 'bonus', 'referral'].includes(selectedItem.type) ? '+' : '-'}₹{selectedItem.amount.toFixed(2)}
              </div>
              <div>
                {selectedItem.status === 'success' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                    <CheckCircle2 size={12} /> Transaction Successful
                  </span>
                )}
                {selectedItem.status === 'pending' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold animate-pulse">
                    <Clock size={12} /> Verification In Progress
                  </span>
                )}
                {selectedItem.status === 'failed' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                    <XCircle size={12} /> Transaction Failed
                  </span>
                )}
              </div>
            </div>

            {/* Receipt Table Details */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Order ID:</span>
                <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                  <span>{selectedItem.referenceId}</span>
                  <button 
                    onClick={() => handleCopy(selectedItem.referenceId, 'Order ID')}
                    className="text-slate-400 hover:text-rose-600 p-0.5"
                  >
                    {copiedId === selectedItem.referenceId ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              {selectedItem.utr && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Bank UTR (12-digit):</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    <span>{selectedItem.utr}</span>
                    <button 
                      onClick={() => handleCopy(selectedItem.utr!, 'UTR Number')}
                      className="text-slate-400 hover:text-rose-600 p-0.5"
                    >
                      {copiedId === selectedItem.utr ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              )}

              {selectedItem.destination && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Recipient Bank/UPI:</span>
                  <span className="font-bold text-slate-800 font-mono">{selectedItem.destination}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Merchant / Payee:</span>
                <span className="font-bold text-slate-800">{adminSettings.payeeName} ({adminSettings.bankName})</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Payee UPI:</span>
                <span className="font-bold text-slate-800 font-mono">{adminSettings.upiId}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Channel / Type:</span>
                <span className="font-bold text-slate-800">{selectedItem.channel || selectedItem.title}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Time:</span>
                <span className="font-medium text-slate-600">{selectedItem.date}</span>
              </div>

              {selectedItem.rejectionReason && (
                <div className="pt-2 border-t border-slate-200 text-rose-600 text-[11px] flex items-start gap-1.5 bg-rose-50/70 p-2 rounded-xl">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Rejection Note: </span>
                    <span>{selectedItem.rejectionReason}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Status Guidance notice */}
            {selectedItem.status === 'pending' && selectedItem.type === 'deposit' && (
              <div className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-start gap-2">
                <Clock size={14} className="shrink-0 mt-0.5" />
                <span>
                  Admin merchant <strong>{adminSettings.payeeName}</strong> is verifying your ₹{selectedItem.amount} transfer on Canara Bank statement. Your wallet balance will update automatically upon verification.
                </span>
              </div>
            )}

            <button
              onClick={() => setSelectedItem(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistoryModal;
