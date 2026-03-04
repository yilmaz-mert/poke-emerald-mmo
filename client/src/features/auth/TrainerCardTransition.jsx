import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

export default function TrainerCardTransition({ onComplete }) {
  const { user } = useAuthStore();
  const [phase, setPhase] = useState('entering'); // entering, displaying, exiting

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('displaying'), 500);
    const timer2 = setTimeout(() => setPhase('exiting'), 2500);
    const timer3 = setTimeout(() => onComplete(), 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-700 ${phase === 'exiting' ? 'opacity-0' : 'opacity-100'}`}>
      <div className={`
        relative w-80 h-48 bg-emerald-100 border-4 border-emerald-900 rounded-lg shadow-2xl overflow-hidden
        transform transition-all duration-700 ease-out
        ${phase === 'entering' ? 'scale-0 rotate-180' : 'scale-100 rotate-0'}
      `}>
        {/* Kart Üst Bilgisi */}
        <div className="bg-emerald-700 text-white p-2 text-xs flex justify-between px-4">
          <span>TRAINER CARD</span>
          <span className="opacity-70">ID: 000{user?.id}</span>
        </div>

        <div className="p-4 flex gap-4">
          {/* Avatar Kısmı - ATLAS ENTEGRASYONU */}
          <div className="w-20 h-24 bg-white border-2 border-emerald-800 flex items-center justify-center p-1 overflow-hidden">
            <div 
              style={{
                width: '37px', 
                height: '55px',
                backgroundImage: "url('/assets/sprites/players.png')",
                // user.avatar 'may' ise X ekseninde -37px kaydır, değilse 0'da bırak
                backgroundPosition: user?.avatar === 'may' ? '-37px -330px' : '0px -330px', 
                imageRendering: 'pixelated',
                transform: 'scale(1.5)' // Avatarı kartın içine tam oturtmak için
              }}
            />
          </div>

          {/* İsim ve Bilgiler */}
          <div className="flex flex-col gap-2 font-pixel">
            <div className="border-b-2 border-emerald-800 pb-1">
              <span className="text-[10px] text-emerald-800 block">NAME:</span>
              <span className="text-sm uppercase text-emerald-900">{user?.username}</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-800 block">MONEY:</span>
              <span className="text-sm text-emerald-900">${user?.pokeDollars || 3000}</span>
            </div>
          </div>
        </div>

        {/* Alt Süsleme */}
        <div className="absolute bottom-0 w-full h-4 bg-linear-to-r from-emerald-600 to-emerald-400 opacity-50"></div>
      </div>

      {/* Geçiş Efekti (Beyaz Parlama) */}
      <div className={`absolute inset-0 bg-white transition-opacity duration-300 pointer-events-none ${phase === 'exiting' ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
}