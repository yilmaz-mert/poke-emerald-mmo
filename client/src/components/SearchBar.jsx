import React, { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
      // Arama yaptıktan sonra input'ta yazının kalması daha iyi bir deneyimdir. 
      // Ancak "X" butonuna basılırsa temizlenecek.
    }
  };

  const handleClear = () => {
    setInput('');
    onSearch(''); // Aramayı sıfırla, böylece tüm pokemonlar tekrar listelenir
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setInput(val);
    // Eğer kullanıcı yazıyı tamamen silerse, anında eski tam listeye dön:
    if (val === '') {
      onSearch('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-4 items-center bg-[#081820] p-3 border-4 border-black shadow-pixel">
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#e0f8d0] font-pixel text-[12px] animate-pulse">
          ▶
        </span>
        <input
          type="text"
          placeholder="POKEMON ARA..."
          value={input}
          onChange={handleChange}
          className="w-full bg-[#e0f8d0] border-4 border-[#e0f8d0] pl-8 pr-8 p-2 font-pixel text-[#081820] text-[10px] placeholder:text-[#081820]/50 focus:outline-none focus:border-white uppercase"
        />
        {/* ÇÖZÜM: Arama temizleme butonu */}
        {input && (
          <button 
            type="button" 
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#081820] font-pixel text-[12px] hover:text-red-600 transition-colors"
          >
            X
          </button>
        )}
      </div>
      <button
        type="submit"
        className="w-12 h-12 rounded-full bg-red-600 border-4 border-black flex items-center justify-center font-pixel text-[14px] text-white shadow-[2px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer shrink-0"
      >
        A
      </button>
    </form>
  );
}