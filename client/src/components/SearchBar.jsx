// src/components/SearchBar.jsx
import React, { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
      setInput(''); // Clear input after search
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2">
      <input
        type="text"
        placeholder="Pokemon ara..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full bg-white border-4 border-[#081820] p-3 font-pixel text-[#081820] text-[10px] placeholder:text-gray-400 focus:outline-none"
      />
      <button
        type="submit"
        className="bg-[#58d030] border-4 border-[#081820] px-4 font-pixel text-[10px] text-[#081820] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 cursor-pointer whitespace-nowrap"
      >
        ARA
      </button>
    </form>
  );
}