import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { usePlayerMovement } from '../../hooks/usePlayerMovement';
import PokedexModule from '../pokedex/PokedexModule';

export default function GameScreen() {
  const { user, logout } = useAuthStore();
  const [activeApp, setActiveApp] = useState(null); 
  
  // Yürüme hook'umuzu çağırıyoruz (Başlangıç koordinatları veritabanından)
  const { x, y, direction, isWalking } = usePlayerMovement(user?.posX || 5, user?.posY || 5);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-pixel select-none">
      
      {/* 1. OYUN DÜNYASI (Kamera oyuncuyu takip etmesi için dünyayı ters yönde kaydırıyoruz) */}
      <div 
        className="absolute inset-0 transition-transform duration-75 ease-linear"
        style={{ 
          transform: `translate(calc(50vw - ${x}px), calc(50vh - ${y}px))` 
        }}
      >
        {/* Spriters Resource'dan indireceğin Harita Görseli buraya gelecek */}
        <div 
          className="absolute w-500 h-500"
          style={{ 
            backgroundImage: 'repeating-linear-gradient(45deg, #1f2937 25%, transparent 25%, transparent 75%, #1f2937 75%, #1f2937), repeating-linear-gradient(45deg, #1f2937 25%, #111827 25%, #111827 75%, #1f2937 75%, #1f2937)',
            backgroundSize: '96px 96px',
            backgroundPosition: '0 0, 48px 48px'
          }}
        />

        {/* OYUNCU KARAKTERİ (Harita üzerinde kendi x,y koordinatında durur) */}
        <div 
          className="absolute z-20 w-12 h-16 transform -translate-x-1/2 -translate-y-full"
          style={{ left: `${x}px`, top: `${y}px` }}
        >
          {/* Karakter Gölgeliği */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-8 h-3 bg-black/60 rounded-full blur-sm"></div>
          
          {/* Sprite Dosyası (Yön ve Yürüme durumuna göre değişir) */}
          <img 
            src={`/sprites/${user?.avatar || 'brendan'}_${direction}${isWalking ? '_walk' : ''}.gif`} 
            alt="Player" 
            className="w-full h-full object-contain pixelated relative z-10"
            // Görsel bulunamazsa varsayılan Pikachu göster
            onError={(e) => e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'}
          />
        </div>
      </div>

      {/* 2. HUD - POKEDEX AESTHETIC (Sol Üst) */}
      <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
        <div className="bg-gray-900 border-l-4 border-red-600 p-3 rounded shadow-[4px_4px_0_rgba(0,0,0,0.8)] flex flex-col min-w-50">
          <span className="text-gray-500 text-[10px] tracking-widest mb-1">LOCATION DATA</span>
          <span className="text-white text-md uppercase tracking-wider">{user?.mapLocation?.replace('_', ' ') || 'LITTLEROOT TOWN'}</span>
        </div>
        <div className="bg-gray-900 border-l-4 border-red-600 p-2 rounded shadow-[4px_4px_0_rgba(0,0,0,0.8)] inline-block">
           <span className="text-gray-500 text-[10px] tracking-widest mr-2">FUNDS:</span>
           <span className="text-yellow-400 text-sm tracking-widest">¥ {user?.pokeDollars || 3000}</span>
        </div>
      </div>

      {/* 3. HUD - POKEDEX OS MENÜSÜ (Sağ Taraf) */}
      {!activeApp && (
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-3 w-48">
          {/* Oyuncu ID Kartı Minyatür */}
          <div className="bg-gray-900 border-r-4 border-red-600 p-2 shadow-[4px_4px_0_rgba(0,0,0,0.8)] text-right">
            <span className="text-gray-500 text-[10px] block">TRAINER</span>
            <span className="text-white text-sm uppercase">{user?.username}</span>
          </div>

          <button onClick={() => setActiveApp('pokedex')} className="bg-gray-800 border-2 border-gray-600 hover:border-red-500 text-white p-3 text-right shadow-[4px_4px_0_rgba(0,0,0,0.8)] transition-colors group">
            <span className="text-red-500 group-hover:text-red-400 mr-2">►</span> POKéDEX
          </button>
          
          <button className="bg-gray-800 border-2 border-gray-700 text-gray-500 p-3 text-right cursor-not-allowed">
            POKéMON
          </button>
          
          <button className="bg-gray-800 border-2 border-gray-700 text-gray-500 p-3 text-right cursor-not-allowed">
            BAG
          </button>

          <button onClick={logout} className="mt-8 bg-red-900/50 hover:bg-red-800 border-2 border-red-900 text-red-200 p-2 text-xs text-center transition-colors">
            SYSTEM DISCONNECT
          </button>
        </div>
      )}

      {/* 4. POKEDEX MODÜLÜ */}
      {activeApp === 'pokedex' && (
        <div className="absolute inset-0 z-50 bg-gray-900 flex flex-col animate-fade-in-up">
          <div className="w-full bg-red-700 p-3 flex justify-between items-center border-b-4 border-red-900 shadow-lg z-10">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-300 rounded-full border-2 border-white shadow-[0_0_5px_white]"></div>
              <span className="text-white text-xl tracking-widest">POKéDEX DATABASE</span>
            </div>
            <button onClick={() => setActiveApp(null)} className="bg-gray-900 hover:bg-gray-800 text-red-500 px-4 py-1 border-2 border-gray-700 text-sm tracking-widest">
              X CLOSE
            </button>
          </div>
          <div className="flex-1 overflow-y-auto relative">
             <PokedexModule />
          </div>
        </div>
      )}

    </div>
  );
}