import React from 'react';
import { TYPE_COLORS } from '../constants/typeColors';

export default function PokemonCard({ pokemon, isSelected }) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const fallbackImage = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

  const rawPath = pokemon?.sprites?.other?.['official-artwork']?.front_default || pokemon?.spriteUrl;
  const imageUrl = rawPath ? (rawPath.startsWith('http') ? rawPath : `${API_URL}${rawPath}`) : fallbackImage;

  const handleImageError = (e) => {
    e.currentTarget.src = fallbackImage;
    e.currentTarget.onerror = null;
  };

  const mainType = pokemon.types?.[0]?.type?.name || 'normal';
  const cardColor = TYPE_COLORS[mainType] || '#A8A878';

  // Seçili olma durumuna göre Gameboy menü efekti (Renkleri tersine çevir)
  const bgColor = isSelected ? '#081820' : 'transparent';
  const textColor = isSelected ? '#e0f8d0' : '#081820';

  return (
    <div
      style={{ backgroundColor: bgColor, color: textColor }}
      className={`border-b-4 border-[#081820] p-2 flex items-center justify-between gap-2 transition-colors duration-75 cursor-pointer ${isSelected ? 'pl-4' : 'pl-2'}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center border-2 border-current">
          <img 
            src={imageUrl} 
            alt={pokemon.name} 
            onError={handleImageError} 
            className="w-6 h-6 object-contain pixelated" 
          />
        </div>
        <span className="font-pixel text-[10px] uppercase truncate max-w-30">
          {pokemon.name}
        </span>
      </div>
      
      <div className="flex items-center gap-2 pr-2">
         <div
            style={{ backgroundColor: cardColor }}
            className="w-3 h-3 border-2 border-current shadow-sm"
            title={mainType}
          />
         <span className="font-pixel text-[10px]">
            No.{pokemon.id.toString().padStart(3, '0')}
         </span>
      </div>
    </div>
  );
}