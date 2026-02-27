import React from 'react';
import { TYPE_COLORS } from '../constants/typeColors';

export default function PokemonCard({ pokemon }) {
  // Fallback image when artwork is unavailable
  const fallbackImage = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

  // Safe access to artwork with fallback
  const imageUrl = pokemon?.sprites?.other?.['official-artwork']?.front_default || fallbackImage;

  // Replace broken images with fallback and avoid infinite onError loop
  const handleImageError = (e) => {
    e.currentTarget.src = fallbackImage;
    e.currentTarget.onerror = null;
  };

  const mainType = pokemon.types?.[0]?.type?.name || 'normal';
  const cardColor = TYPE_COLORS[mainType] || '#A8A878';

  return (
    <div
      style={{ backgroundColor: `${cardColor}33`, borderColor: cardColor }}
      className="relative border-4 p-4 flex flex-col items-center bg-opacity-20 shadow-pixel"
    >
      <span className="text-gray-400 text-sm font-bold w-full text-right">#{pokemon.id.toString().padStart(3, '0')}</span>

      {/* Type badge (main type) */}
      <div
        style={{ backgroundColor: cardColor }}
        className="absolute top-2 left-2 px-2 py-0.5 text-[8px] font-pixel text-white border-2 border-black/20 uppercase"
      >
        {mainType}
      </div>

      {/* Image */}
      <img src={imageUrl} alt={pokemon.name} onError={handleImageError} className="w-32 h-32 object-contain mb-4 drop-shadow-lg" />

      <h2 className="text-xl font-semibold capitalize text-[#081820] mb-3">{pokemon.name}</h2>

      <div className="flex gap-2">
        {pokemon.types.map((typeInfo) => (
          <span key={typeInfo.type.name} className="px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 text-xs font-bold rounded-full capitalize">
            {typeInfo.type.name}
          </span>
        ))}
      </div>
    </div>
  );
}