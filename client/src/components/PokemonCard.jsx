import React from 'react';

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

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <span className="text-gray-400 text-sm font-bold w-full text-right">#{pokemon.id.toString().padStart(3, '0')}</span>

      {/* Image */}
      <img src={imageUrl} alt={pokemon.name} onError={handleImageError} className="w-32 h-32 object-contain mb-4 drop-shadow-lg" />

      <h2 className="text-xl font-semibold capitalize text-gray-800 mb-3">{pokemon.name}</h2>

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