import React, { useState } from 'react';
import { Headphones, Send, Bot, User, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';

interface Message {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  time: string;
}

export const CustomerSupportModal: React.FC = () => {
  const { isSupportOpen, setIsSupportOpen } = useApp();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'agent',
      text: 'Namaste! Welcome to 91 CLUB 24/7 Official Customer Support. How may I assist you with your deposit, withdrawal, or games today?',
      time: '12:00',
    },
  ]);

  if (!isSupportOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    sound.playClick();
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = input.toLowerCase();
    setInput('');

    // Simulated responsive agent reply
    setTimeout(() => {
      sound.playTick();
      let reply = 'Thank you for reaching out. Your request has been queued with our support desk.';
      if (query.includes('deposit') || query.includes('recharge') || query.includes('pay')) {
        reply = 'For fast deposits, please use Phonepe_QR or Innate UPI-QR in the Deposit section. If you have completed payment, it is credited automatically within 1 minute!';
      } else if (query.includes('withdraw') || query.includes('money')) {
        reply = 'Withdrawals are processed 24/7. Minimum withdrawal is ₹110.00 and funds are usually credited into your bank/UPI within 5 - 15 minutes!';
      } else if (query.includes('bonus') || query.includes('code') || query.includes('gift')) {
        reply = 'You can redeem gift codes BONUS500 or 91CLUB2026 in the Gifts section, or spin the Invite Wheel to get free bonuses!';
      } else if (query.includes('wingo') || query.includes('aviator') || query.includes('game')) {
        reply = 'All games on 91 CLUB are 100% provably fair and certified by international gaming authorities!';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-center p-3 items-center">
      <div className="w-full max-w-sm bg-white rounded-3xl h-[520px] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 p-3.5 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Headphones size={18} />
            </div>
            <div>
              <div className="font-black text-xs">91 CLUB Support Desk</div>
              <div className="text-[10px] text-emerald-200 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Online 24/7 Agent</span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsSupportOpen(false)} className="text-white/80 hover:text-white font-bold p-1">✕</button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-50 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-2.5 shadow-2xs ${
                  m.sender === 'user'
                    ? 'bg-rose-500 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                }`}
              >
                <p className="leading-relaxed">{m.text}</p>
                <div
                  className={`text-[9px] mt-1 text-right ${
                    m.sender === 'user' ? 'text-rose-200' : 'text-slate-400'
                  }`}
                >
                  {m.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-100 text-xs px-3.5 py-2 rounded-full outline-hidden text-slate-800"
          />
          <button
            type="submit"
            className="w-8 h-8 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shrink-0 active:scale-95"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};
