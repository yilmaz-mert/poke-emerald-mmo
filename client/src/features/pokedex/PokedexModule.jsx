import { useState, useEffect, useRef } from 'react';
import { usePokemons } from '../../hooks/usePokemons'; 
import PokemonCard from '../../components/PokemonCard';
import SearchBar from '../../components/SearchBar';
import PokemonDetail from './PokemonDetail';
import useGameStore from '../../store/useGameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';

export default function PokedexModule() {
  // --- STORE YÖNETİMİ ---
  const togglePokedex = useGameStore((state) => state.togglePokedex);
  const openDetail = useGameStore((state) => state.openDetail);
  const isDetailOpen = useGameStore((state) => state.ui.isDetailOpen);

  // --- SES VE REF'LER ---
  const { playSound } = useSoundEffects();
  const isMounted = useRef(false);
  const pokemonRefs = useRef(new Map());
  const searchContainerRef = useRef(null);

  // --- LOCAL STATE ---
  // NOT: Artık currentUrl kullanmıyoruz çünkü veriler kendi backend'imizden geliyor.
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0); 

  // --- ARAMA ODAKLANMA VE İMLEÇ KONTROLÜ ---
  useEffect(() => {
    const input = searchContainerRef.current?.querySelector('input');
    if (selectedIndex === -1 && input) {
      input.focus();
      // İmleci kelimenin sonuna taşı
      requestAnimationFrame(() => {
        const length = input.value.length;
        input.setSelectionRange(length, length);
      });
    } else {
      input?.blur();
    }
  }, [selectedIndex]);

  // --- DEBOUNCE ARAMA ---
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- VERİ ÇEKME (LOCAL BACKEND) ---
  // usePokemons hook'una artık sadece debouncedQuery gönderiyoruz.
  const { pokemons, loading, error } = usePokemons(debouncedQuery);

  // --- SES EFEKTİ KONTROLÜ ---
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (isDetailOpen || loading) return;
    playSound('move');
  }, [selectedIndex, isDetailOpen, loading, playSound]);

  // --- KLAVYE NAVİGASYON MANTIĞI ---
  useEffect(() => {
    if (isDetailOpen) return;

    const handleKeyDown = (e) => {
      const gridCols = 3;
      const total = pokemons.length;

      switch (e.key) {
        case 'ArrowRight': setSelectedIndex(prev => Math.min(prev + 1, total - 1)); break;
        case 'ArrowLeft': setSelectedIndex(prev => Math.max(prev - 1, -1)); break;
        
        case 'ArrowDown':
          if (selectedIndex === -1) setSelectedIndex(0);
          else if (selectedIndex + gridCols < total) setSelectedIndex(prev => prev + gridCols);
          break;

        case 'ArrowUp':
          if (selectedIndex >= gridCols) setSelectedIndex(prev => prev - gridCols);
          else if (selectedIndex >= 0) setSelectedIndex(-1); 
          break;

        case 'Enter':
          if (selectedIndex === -1) {
            playSound('select');
            return; // SearchBar'ın kendi submit'i çalışacak
          }
          
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < total) {
            playSound('select');
            openDetail(pokemons[selectedIndex]);
          }
          break;
        
        case 'Escape':
          togglePokedex();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, pokemons, isDetailOpen, openDetail, togglePokedex, playSound]);

  // --- KAMERA TAKİBİ (SCROLL) ---
  useEffect(() => {
    if (isDetailOpen) return;

    let target = null;
    if (selectedIndex === -1) target = searchContainerRef.current;
    else if (selectedIndex < pokemons.length) target = pokemonRefs.current.get(selectedIndex);

    if (target) {
      target.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, [selectedIndex, isDetailOpen, pokemons.length]);

  return (
    <div className={`relative bg-[#e0f8d0] border-8 border-[#081820] p-6 max-w-5xl w-[90%] h-[80vh] shadow-pixel ${isDetailOpen ? 'overflow-hidden' : 'overflow-y-auto'}`}>
      
      <button onClick={togglePokedex} className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 font-pixel text-[8px] border-2 border-black z-20 shadow-pixel-hover active:translate-y-1 cursor-pointer">
        ESC: KAPAT
      </button>

      <h1 className="text-3xl font-pixel text-center text-[#081820] mb-6 uppercase tracking-widest">Pokedex</h1>

      {/* --- SEARCHBAR BÖLÜMÜ --- */}
      <div 
        ref={searchContainerRef} 
        className={`mb-6 p-2 transition-all duration-200 border-4 ${selectedIndex === -1 ? 'bg-yellow-100 border-yellow-400 shadow-pixel' : 'border-transparent'}`}
      >
        <SearchBar onSearch={setSearchQuery} />
      </div>

      {error && (
        <div className="bg-red-100 border-4 border-red-800 text-red-800 p-2 my-4 font-pixel text-[8px] text-center shadow-pixel animate-bounce">
          HATA: Backend sunucusu çalışıyor mu?
        </div>
      )}

      {/* --- POKEMON LİSTESİ --- */}
      {loading ? (
        <div className="flex items-center justify-center h-64 font-pixel text-[#34441c] animate-pulse">VERİLER VERİTABANINDAN ÇEKİLİYOR...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-10">
          {pokemons.map((pokemon, index) => (
            <div 
              key={pokemon.id || pokemon.name}
              ref={(el) => el ? pokemonRefs.current.set(index, el) : pokemonRefs.current.delete(index)}
              className={`transition-all duration-150 ${index === selectedIndex ? 'ring-4 ring-yellow-400 scale-105 z-10 shadow-pixel' : ''}`}
            >
              <PokemonCard pokemon={pokemon} />
            </div>
          ))}
        </div>
      )}

      {isDetailOpen && <PokemonDetail />}
    </div>
  );
}