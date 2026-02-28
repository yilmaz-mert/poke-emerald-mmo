// src/hooks/usePokemons.js

import { useState, useEffect } from 'react';

export function usePokemons(searchQuery = '') {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPokemons = async () => {
      setLoading(true);
      try {
        // Kendi Backend URL'imiz (env ile dinamik)
        const baseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/pokemons`;
        const url = searchQuery ? `${baseUrl}?search=${searchQuery}` : baseUrl;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Backend bağlantısı başarısız!');
        
        const data = await response.json();
        setPokemons(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemons();
  }, [searchQuery]);

  return { pokemons, loading, error };
}