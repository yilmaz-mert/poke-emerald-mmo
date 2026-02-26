import React from 'react';

export default function Pagination({ prevUrl, nextUrl, onPageChange }) {
  return (
    <div className="flex justify-center gap-6 mt-12">
      <button
        onClick={() => onPageChange(prevUrl)}
        disabled={!prevUrl}
        className={`px-6 py-3 rounded-lg font-bold text-white transition-colors ${
          !prevUrl ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 shadow-md'
        }`}
      >
        Önceki
      </button>
      
      <button
        onClick={() => onPageChange(nextUrl)}
        disabled={!nextUrl}
        className={`px-6 py-3 rounded-lg font-bold text-white transition-colors ${
          !nextUrl ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 shadow-md'
        }`}
      >
        Sonraki
      </button>
    </div>
  );
}