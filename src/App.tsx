/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeLobby } from './components/HomeLobby';
import { WinGoGame } from './components/games/WinGoGame';
import { AviatorGame } from './components/games/AviatorGame';
import { K3Game } from './components/games/K3Game';
import { MinesGame } from './components/games/MinesGame';
import { SlotModal } from './components/games/SlotModal';
import { InviteWheel } from './components/InviteWheel';
import { ActivityPage } from './components/ActivityPage';
import { PromotionPage } from './components/PromotionPage';
import { AccountPage } from './components/AccountPage';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { VipPage } from './components/VipPage';
import { CustomerSupportModal } from './components/CustomerSupportModal';
import { NotificationModal } from './components/NotificationModal';
import { GiftsModal } from './components/GiftsModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AuthModal } from './components/AuthModal';

const AppContent: React.FC = () => {
  const { activeTab, activeGame, toasts } = useApp();

  const renderMainContent = () => {
    if (activeGame === 'wingo') return <WinGoGame />;
    if (activeGame === 'aviator') return <AviatorGame />;
    if (activeGame === 'k3') return <K3Game />;
    if (activeGame === 'mines') return <MinesGame />;

    switch (activeTab) {
      case 'home':
        return <HomeLobby />;
      case 'activity':
        return <ActivityPage />;
      case 'invite-wheel':
        return <InviteWheel />;
      case 'promotion':
        return <PromotionPage />;
      case 'account':
        return <AccountPage />;
      default:
        return <HomeLobby />;
    }
  };

  return (
    <div className="min-h-screen bg-[#e8ecf2] flex justify-center">
      {/* Mobile container viewport */}
      <div className="w-full max-w-md bg-[#f8fafc] min-h-screen relative shadow-2xl flex flex-col justify-between overflow-x-hidden">
        {/* Top Header shown on Lobby and primary pages */}
        {activeGame !== 'aviator' && activeTab !== 'invite-wheel' && <Header />}

        {/* Main Content Area */}
        <main className="flex-1">
          {renderMainContent()}
        </main>

        {/* Global Bottom Navigation */}
        {activeGame !== 'aviator' && <BottomNav />}

        {/* Global Modals & Master Console */}
        <DepositModal />
        <WithdrawModal />
        <VipPage />
        <CustomerSupportModal />
        <NotificationModal />
        <GiftsModal />
        <SlotModal />
        <AdminPanelModal />
        <AuthModal />

        {/* Toast Notification Stack */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none w-full max-w-xs px-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`py-2 px-3.5 rounded-2xl text-xs font-bold shadow-xl border backdrop-blur-md text-center animate-in slide-in-from-top duration-200 pointer-events-auto ${
                t.type === 'success'
                  ? 'bg-emerald-600/95 text-white border-emerald-400/50'
                  : t.type === 'error'
                  ? 'bg-rose-600/95 text-white border-rose-400/50'
                  : 'bg-slate-900/90 text-white border-slate-700/50'
              }`}
            >
              {t.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
