import React, { Suspense, lazy, useEffect } from 'react';
import useGameStore from './store/useGameStore';

const PokedexModule = lazy(() => import('./features/pokedex/PokedexModule'));

export default function App() {
  const isPokedexOpen = useGameStore((state) => state.ui.isPokedexOpen);
  const togglePokedex = useGameStore((state) => state.togglePokedex);

  // Global Enter listener to open Pokedex when closed
  useEffect(() => {
    const handleGlobalEnter = (e) => {
      if (e.key === 'Enter' && !isPokedexOpen) {
        togglePokedex();
      }
    };
    window.addEventListener('keydown', handleGlobalEnter);
    return () => window.removeEventListener('keydown', handleGlobalEnter);
  }, [isPokedexOpen, togglePokedex]);

  return (
    <div className="relative w-screen h-screen bg-[#202020] overflow-hidden">
      
      {/* Game world */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-pixel">
        <h2 className="mb-4 text-xl text-green-400">Pokemon Emerald MMO</h2>
        <button 
          onClick={togglePokedex}
          className="bg-[#58d030] border-4 border-black px-6 py-3 text-black font-bold hover:bg-[#48b028] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all cursor-pointer"
        >
          POKEDEX'İ AÇ
        </button>
      </div>

      {/* UI overlay */}
      <Suspense fallback={<div className="font-pixel text-white text-center absolute inset-0 flex items-center justify-center">Modül Yükleniyor...</div>}>
        {isPokedexOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60">
             <PokedexModule />
          </div>
        )}
      </Suspense>
    </div>
  );
}