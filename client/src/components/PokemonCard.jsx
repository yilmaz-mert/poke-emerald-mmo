// components/PokemonCard.jsx
import React from 'react';

export default function PokemonCard({ pokemon }) {
  // 1. Eğer resim yüklenemezse göstereceğimiz varsayılan resim (Poketop)
  const fallbackImage = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";

  // 2. Güvenli zincirleme (Optional Chaining: '?.' kullanımı)
  // Eğer sprites veya other objesi hiç yoksa uygulama çökmez, direkt undefined döner.
  // Biz de '||' (VEYA) operatörüyle undefined durumunda baştan fallbackImage'i atarız.
  const imageUrl = pokemon?.sprites?.other?.['official-artwork']?.front_default || fallbackImage;

  // 3. Resim linki var ama URL 404 (Not Found) verirse çalışacak fonksiyon
  const handleImageError = (e) => {
    e.currentTarget.src = fallbackImage;
    // ÖNEMLİ: Eğer fallback resmi de yüklenemezse sonsuz döngüye girmesin diye onError'u null yapıyoruz.
    e.currentTarget.onerror = null; 
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      
      <span className="text-gray-400 text-sm font-bold w-full text-right">
        #{pokemon.id.toString().padStart(3, '0')}
      </span>

      {/* 4. Resim etiketimizi güncelledik */}
      <img
        src={imageUrl}
        alt={pokemon.name}
        onError={handleImageError} // Hata yakalayıcıyı ekledik
        className="w-32 h-32 object-contain mb-4 drop-shadow-lg"
      />
      
      <h2 className="text-xl font-semibold capitalize text-gray-800 mb-3">
        {pokemon.name}
      </h2>

      <div className="flex gap-2">
        {pokemon.types.map((typeInfo) => (
          <span 
            key={typeInfo.type.name} // index yerine benzersiz tipi kullandık
            className="px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 text-xs font-bold rounded-full capitalize"
          >
            {typeInfo.type.name}
          </span>
        ))}
      </div>
    </div>
  );
}