// client/src/hooks/usePokemons.js
import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function usePokemons(searchQuery = '') {
  const { data, isLoading, error } = useQuery({
    queryKey: ['pokemons', searchQuery], // Query değiştiğinde otomatik yeniler
    queryFn: async () => {
      const url = searchQuery ? `${API_URL}/api/pokemons?search=${searchQuery}` : `${API_URL}/api/pokemons`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Backend bağlantısı başarısız!');
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // Veriyi 5 dakika önbellekte (cache) tutar
  });

  return { pokemons: data || [], loading: isLoading, error };
}