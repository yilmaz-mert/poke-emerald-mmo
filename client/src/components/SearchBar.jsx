import React, { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [input, setInput] = useState('');

  // Form gönderildiğinde (Enter'a veya butona basıldığında) çalışır
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 flex justify-center">
      <input
        type="text"
        placeholder="Pokemon ara (örn: pikachu)..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full max-w-md px-4 py-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
      />
      <button
        type="submit"
        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-r-lg font-bold transition-colors shadow-sm"
      >
        Ara
      </button>
    </form>
  );
}