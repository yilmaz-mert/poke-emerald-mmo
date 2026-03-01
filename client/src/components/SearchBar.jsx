// src/components/SearchBar.jsx
import React, { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
      setInput(''); 
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
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-[#e0f8d0] border-4 border-[#e0f8d0] pl-8 p-2 font-pixel text-[#081820] text-[10px] placeholder:text-[#081820]/50 focus:outline-none focus:border-white uppercase"
        />
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