import { useState, useEffect, useRef } from 'react';
import { usePokemons } from '../../hooks/usePokemons'; 
import PokemonCard from '../../components/PokemonCard';
import SearchBar from '../../components/SearchBar';
import PokemonDetail from './PokemonDetail';
import useGameStore from '../../store/useGameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { TYPE_COLORS } from '../../constants/typeColors';

export default function PokedexModule() {
  const togglePokedex = useGameStore((state) => state.togglePokedex);
  const openDetail = useGameStore((state) => state.openDetail);
  const isDetailOpen = useGameStore((state) => state.ui.isDetailOpen);

  const { playSound } = useSoundEffects();
  const pokemonRefs = useRef(new Map());
  const searchContainerRef = useRef(null);
  const listContainerRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0); 

  useEffect(() => {
    const input = searchContainerRef.current?.querySelector('input');
    if (selectedIndex === -1 && input) {
      input.focus();
      requestAnimationFrame(() => {
        const length = input.value.length;
        input.setSelectionRange(length, length);
      });
    } else {
      input?.blur();
    }
  }, [selectedIndex]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { pokemons, loading, error } = usePokemons(debouncedQuery);

  // Klavye Navigasyonu: Grid iptal edildiği için sadece Aşağı/Yukarı mantığı var
  useEffect(() => {
    if (isDetailOpen) return;

    const total = pokemons.length;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          if (selectedIndex < total - 1) {
            setSelectedIndex(prev => prev + 1);
            playSound('move');
          }
          break;
        case 'ArrowUp':
          if (selectedIndex > -1) {
            setSelectedIndex(prev => prev - 1);
            playSound('move');
          }
          break;
        case 'ArrowRight': // Sayfa atlama
          if (selectedIndex + 5 < total) {
            setSelectedIndex(prev => prev + 5);
            playSound('move');
          }
          break;
        case 'ArrowLeft': // Sayfa geri
          if (selectedIndex - 5 >= -1) {
            setSelectedIndex(prev => prev - 5);
            playSound('move');
          }
          break;
        case 'Enter':
        case 'a':
          if (selectedIndex === -1) {
            playSound('select');
            return;
          }
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < total) {
            playSound('select');
            openDetail(pokemons[selectedIndex]);
          }
          break;
        case 'b':
        case 'Backspace':
        case 'Escape':
          togglePokedex();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, pokemons, isDetailOpen, openDetail, togglePokedex, playSound]);

  // Kamera Takibi
  useEffect(() => {
    if (isDetailOpen) return;
    let target = null;
    if (selectedIndex === -1) target = searchContainerRef.current;
    else if (selectedIndex < pokemons.length) target = pokemonRefs.current.get(selectedIndex);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedIndex, isDetailOpen, pokemons.length]);

  // Önizleme için seçili pokemonu al
  const previewPokemon = pokemons[selectedIndex >= 0 ? selectedIndex : 0];
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const buildUrl = (path) => path?.startsWith('http') ? path : `${API_URL}${path?.startsWith('/') ? '' : '/'}${path}`;

  return (
    <div className={`relative bg-[#cc0000] border-8 border-black p-4 max-w-6xl w-[95%] h-[85vh] shadow-pixel flex flex-col ${isDetailOpen ? 'overflow-hidden' : ''}`}>
      {/* Scanline Efekti */}
      <div className="scanlines"></div>

      {/* Üst Kısım: Pokedex Işıkları ve Başlık */}
      <div className="flex justify-between items-center mb-4 px-2 z-10 relative">
        <div className="flex gap-2 items-center">
          <div className="w-10 h-10 rounded-full bg-blue-400 border-4 border-white shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.3)] animate-pulse"></div>
          <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-black"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-black"></div>
          <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-black"></div>
        </div>
        <button onClick={togglePokedex} className="bg-gray-800 text-white px-3 py-1 font-pixel text-[10px] border-4 border-black z-20 active:translate-y-1 cursor-pointer">
          KAPAT (ESC)
        </button>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden z-10 relative">
        {/* SOL PANEL: Liste ve Arama */}
        <div className="w-1/2 flex flex-col bg-[#e0f8d0] border-8 border-[#081820] shadow-[inset_4px_4px_0_rgba(0,0,0,0.1)] rounded-bl-3xl overflow-hidden">
          <div ref={searchContainerRef} className={`p-2 bg-[#e0f8d0] border-b-4 border-[#081820] ${selectedIndex === -1 ? 'bg-yellow-200' : ''}`}>
            <SearchBar onSearch={setSearchQuery} />
          </div>

          <div ref={listContainerRef} className="flex-1 overflow-y-auto retro-scrollbar bg-[#e0f8d0]">
            {error ? (
              <div className="p-4 font-pixel text-[10px] text-center text-red-600">BAĞLANTI HATASI!</div>
            ) : loading ? (
              <div className="p-4 font-pixel text-[10px] text-center text-[#081820] animate-pulse">VERİ ARANIYOR...</div>
            ) : (
              <div className="flex flex-col pb-10">
                {pokemons.map((pokemon, index) => (
                  <div key={pokemon.id || pokemon.name} ref={(el) => el ? pokemonRefs.current.set(index, el) : pokemonRefs.current.delete(index)}>
                    <PokemonCard pokemon={pokemon} isSelected={index === selectedIndex} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SAĞ PANEL: Önizleme (Preview) Ekranı */}
        <div className="w-1/2 bg-[#081820] border-8 border-gray-300 p-4 rounded-br-3xl flex flex-col relative shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.5)]">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-2 bg-gray-400 rounded-full"></div>
          
          <div className="flex-1 flex flex-col items-center justify-center mt-4">
            {previewPokemon ? (
              <>
                <div className="w-48 h-48 bg-[#e0f8d0] border-4 border-[#58d030] shadow-[0_0_15px_rgba(88,208,48,0.5)] rounded-md flex items-center justify-center relative overflow-hidden mb-6">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                  <img 
                    src={buildUrl(previewPokemon.spriteUrl || previewPokemon.sprites?.front_default)} 
                    alt={previewPokemon.name} 
                    className="w-36 h-36 object-contain pixelated z-10 animate-bounce-slow" 
                  />
                </div>
                
                <div className="w-full bg-[#e0f8d0] p-4 border-4 border-gray-400 text-[#081820]">
                  <h2 className="font-pixel text-xl uppercase mb-2 border-b-2 border-[#081820] pb-2">
                    {previewPokemon.name}
                  </h2>
                  <div className="flex gap-2 mb-2">
                    {previewPokemon.types?.map(t => (
                      <span key={t.type.name} style={{ backgroundColor: TYPE_COLORS[t.type.name] }} className="px-2 py-1 border-2 border-[#081820] text-white font-pixel text-[8px] uppercase">
                        {t.type.name}
                      </span>
                    ))}
                  </div>
                  <p className="font-pixel text-[8px] mt-4 opacity-70 animate-pulse">
                    TAM VERİ İÇİN (A) VEYA ENTER'A BASIN
                  </p>
                </div>
              </>
            ) : (
              <div className="font-pixel text-white/50 text-sm animate-pulse">VERİ BEKLENİYOR...</div>
            )}
          </div>
        </div>
      </div>

      {isDetailOpen && <PokemonDetail />}
    </div>
  );
}