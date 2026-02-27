import { useState, useEffect, useRef } from 'react';
import { usePokemons } from '../../hooks/usePokemons'; 
import PokemonCard from '../../components/PokemonCard';
import SearchBar from '../../components/SearchBar';
import PokemonDetail from './PokemonDetail';
import useGameStore from '../../store/useGameStore';

export default function PokedexModule() {
  // Store
  const togglePokedex = useGameStore((state) => state.togglePokedex);
  const openDetail = useGameStore((state) => state.openDetail);
  const isDetailOpen = useGameStore((state) => state.ui.isDetailOpen);
  const closeDetail = useGameStore((state) => state.closeDetail);

  const [currentUrl, setCurrentUrl] = useState('https://pokeapi.co/api/v2/pokemon?limit=20');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0); 
  
  const pokemonRefs = useRef(new Map());
  const searchContainerRef = useRef(null);
  const paginationPrevRef = useRef(null);
  const paginationNextRef = useRef(null);

  // Search focus & caret handling
  useEffect(() => {
    const input = searchContainerRef.current?.querySelector('input');
    if (selectedIndex === -1 && input) {
      input.focus();
      // Tarayıcı odağı tamamladıktan sonra imleci kelimenin sonuna zorla
      requestAnimationFrame(() => {
        const length = input.value.length;
        input.setSelectionRange(length, length);
      });
    } else {
      input?.blur();
    }
  }, [selectedIndex]);

  // Global keys (Escape)
  useEffect(() => {
    const handleGlobalKeys = (e) => {
      if (e.key === 'Escape') {
        if (isDetailOpen) closeDetail();
        else togglePokedex();
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [isDetailOpen, closeDetail, togglePokedex]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { pokemons, loading, error, nextUrl, prevUrl } = usePokemons(currentUrl, debouncedQuery);

  // Keyboard navigation
  useEffect(() => {
    if (isDetailOpen) return;

    const handleKeyDown = (e) => {
      const gridCols = 3;
      const total = pokemons.length;

      switch (e.key) {
        case 'ArrowRight': setSelectedIndex(prev => Math.min(prev + 1, total + 1)); break;
        case 'ArrowLeft': setSelectedIndex(prev => Math.max(prev - 1, -1)); break;
        
        case 'ArrowDown':
          if (selectedIndex === -1) setSelectedIndex(0);
          else if (selectedIndex + gridCols < total) setSelectedIndex(prev => prev + gridCols);
          else if (selectedIndex < total) setSelectedIndex(total); 
          break;

        case 'ArrowUp':
          if (selectedIndex >= total) setSelectedIndex(total - 1); 
          else if (selectedIndex >= gridCols) setSelectedIndex(prev => prev - gridCols);
          else if (selectedIndex >= 0) setSelectedIndex(-1); 
          break;

        case 'Enter':
          // Allow Enter to submit when search is focused
          if (selectedIndex === -1) return;
          
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < total) {
            openDetail(pokemons[selectedIndex]);
          } else if (selectedIndex === total && prevUrl) {
            setCurrentUrl(prevUrl);
            setSelectedIndex(0); 
          } else if (selectedIndex === total + 1 && nextUrl) {
            setCurrentUrl(nextUrl);
            setSelectedIndex(0);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, pokemons, isDetailOpen, openDetail, nextUrl, prevUrl]);

  // Camera (scroll)
  useEffect(() => {
    if (isDetailOpen) return;

    let target = null;
    if (selectedIndex === -1) target = searchContainerRef.current;
    else if (selectedIndex < pokemons.length) target = pokemonRefs.current.get(selectedIndex);
    else if (selectedIndex === pokemons.length) target = paginationPrevRef.current;
    else if (selectedIndex === pokemons.length + 1) target = paginationNextRef.current;

    if (target) {
      target.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, [selectedIndex, isDetailOpen, pokemons.length]);

  return (
    <div className={`relative bg-[#e0f8d0] border-8 border-[#081820] p-6 max-w-5xl w-[90%] h-[80vh] shadow-pixel ${isDetailOpen ? 'overflow-hidden' : 'overflow-y-auto'} custom-scrollbar`}>
      
      <button onClick={togglePokedex} className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 font-pixel text-[8px] border-2 border-black z-20 shadow-pixel-hover active:translate-y-1 cursor-pointer">
        ESC: KAPAT
      </button>

      <h1 className="text-3xl font-pixel text-center text-[#081820] mb-6 uppercase">Pokedex</h1>

      {/* Searchbar */}
      <div 
        ref={searchContainerRef} 
        className={`mb-6 p-2 transition-all duration-200 border-4 ${selectedIndex === -1 ? 'bg-yellow-100 border-yellow-400 shadow-pixel' : 'border-transparent'}`}
      >
        <SearchBar onSearch={setSearchQuery} />
      </div>

      {error && <div className="bg-red-100 border-4 border-red-800 text-red-800 p-2 my-4 font-pixel text-[8px] text-center shadow-pixel">HATA: {error}</div>}

      {/* Pokemon list */}
      {loading ? (
        <div className="flex items-center justify-center h-64 font-pixel text-[#34441c] animate-pulse">Yükleniyor...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

      {/* Pagination controls */}
      {!searchQuery && (
        <div className="flex justify-center items-center gap-4 mt-10 pb-10">
          <button 
            type="button"
            ref={paginationPrevRef}
            onClick={(e) => { 
              e.preventDefault(); 
              if (prevUrl) {
                setCurrentUrl(prevUrl); 
                setSelectedIndex(0);
              }
            }}
            className={`font-pixel text-[10px] px-6 py-3 border-4 border-black shadow-pixel transition-all
              ${selectedIndex === pokemons.length ? 'bg-yellow-400 -translate-y-1' : 'bg-[#88c070]'}
              ${!prevUrl ? 'opacity-30 grayscale' : 'cursor-pointer'}
            `}
          >
            &lt; PREV
          </button>

          <button 
            type="button"
            ref={paginationNextRef}
            onClick={(e) => { 
              e.preventDefault(); 
              if (nextUrl) {
                setCurrentUrl(nextUrl); 
                setSelectedIndex(0);
              }
            }}
            className={`font-pixel text-[10px] px-6 py-3 border-4 border-black shadow-pixel transition-all
              ${selectedIndex === pokemons.length + 1 ? 'bg-yellow-400 -translate-y-1' : 'bg-[#88c070]'}
              ${!nextUrl ? 'opacity-30 grayscale' : 'cursor-pointer'}
            `}
          >
            NEXT &gt;
          </button>
        </div>
      )}
      
      {isDetailOpen && <PokemonDetail />}
    </div>
  );
}