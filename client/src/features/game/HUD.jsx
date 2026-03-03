import React from 'react';
import useGameStore from '../../store/useGameStore'; // Yolunu kontrol et
import { useAuthStore } from '../../store/useAuthStore';

const HUD = () => {
  // Store'lardan gerekli aksiyonları alıyoruz
  const togglePokedex = useGameStore((state) => state.togglePokedex);
  const isPokedexOpen = useGameStore((state) => state.ui.isPokedexOpen);
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-3 pointer-events-auto">
      
      {/* Pokedex Butonu - Duruma göre metni değiştirir */}
      <button 
        onClick={() => togglePokedex()}
        className={`${
          isPokedexOpen ? 'bg-red-800' : 'bg-red-600'
        } text-white font-bold py-2 px-6 rounded-md border-2 border-white shadow-[0_4px_0_rgb(153,27,27)] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider text-sm`}
      >
        {isPokedexOpen ? 'Kapat' : 'Pokédex'}
      </button>

      {/* Çıkış Butonu - useAuthStore içindeki logout'u çağırır */}
      <button 
        onClick={() => {
          if(window.confirm("Çıkış yapmak istediğine emin misin?")) {
            logout();
          }
        }}
        className="bg-gray-700 text-white font-bold py-2 px-6 rounded-md border-2 border-white shadow-[0_4px_0_rgb(55,65,81)] active:translate-y-1 active:shadow-none transition-all uppercase tracking-wider text-sm mt-4"
      >
        Çıkış
      </button>

    </div>
  );
};

export default HUD;