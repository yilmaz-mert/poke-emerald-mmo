// client/src/features/pokedex/PokemonDetail.jsx
import { useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import useGameStore from '../../store/useGameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { TYPE_COLORS } from '../../constants/typeColors';
import StatBar from '../../components/StatBar';
import EvolutionChain from './EvolutionChain';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const buildUrl = (path) => path?.startsWith('http') ? path : `${API_URL}${path?.startsWith('/') ? '' : '/'}${path}`;

export default function PokemonDetail() {
  const selectedPokemon = useGameStore((state) => state.ui.selectedPokemon);
  const closeDetail = useGameStore((state) => state.closeDetail);
  const { playSound } = useSoundEffects();

  const handleClose = useCallback(() => {
    playSound('back');
    closeDetail();
  }, [closeDetail, playSound]);

  // --- KLAVYE KONTROLÜ  ---
  useEffect(() => {
    const handleDetailKeys = (e) => {
      if (['b', 'Backspace', 'Escape'].includes(e.key)) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleDetailKeys);
    return () => window.removeEventListener('keydown', handleDetailKeys);
  }, [handleClose]);

  const { data: pokemonFullData, isLoading } = useQuery({
    queryKey: ['pokemon', selectedPokemon?.id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/pokemons/${selectedPokemon.id}`);
      if (!res.ok) throw new Error('Pokemon detayı alınamadı');
      return res.json();
    },
    enabled: !!selectedPokemon?.id,
    staleTime: 1000 * 60 * 60,
  });

  if (!selectedPokemon) return null;
  const mainTypeColor = TYPE_COLORS[selectedPokemon.types[0].type.name] || '#777';
  const displayImg = buildUrl(pokemonFullData?.sprites?.animated || pokemonFullData?.sprites?.artwork || selectedPokemon.spriteUrl);

  const playCry = () => {
    if (pokemonFullData?.criesUrl) {
      const audio = new Audio(buildUrl(pokemonFullData.criesUrl));
      audio.volume = 0.5;
      audio.play();
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
      <div className="relative bg-[#38b000] border-8 border-[#081820] w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col p-6 overflow-hidden max-h-[95vh]">
        
        {/* Başlık Bölümü */}
        <div className="flex justify-between items-end border-b-4 border-[#081820] pb-4 shrink-0">
          <div>
            <p className="font-pixel text-[8px] text-white/80 mb-1">#{String(selectedPokemon.id).padStart(3, '0')}</p>
            <h2 className="font-pixel text-xl text-white uppercase truncate">{selectedPokemon.name}</h2>
          </div>
          <div className="flex items-end gap-2">
            {selectedPokemon.types.map((t) => (
              <span key={t.type.name} style={{ backgroundColor: TYPE_COLORS[t.type.name] }} className="px-3 py-1 border-2 border-black font-pixel text-[8px] text-white shadow-pixel uppercase">
                {t.type.name}
              </span>
            ))}
            <button onClick={playCry} className="ml-1 bg-blue-500 border-4 border-black p-2 font-pixel text-[10px] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 cursor-pointer">
              SES
            </button>
            <button onClick={handleClose} className="bg-red-600 border-4 border-black p-2 font-pixel text-[10px] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 cursor-pointer">
              GERİ (B)
            </button>
          </div>
        </div>

        {/* İçerik Bölümü */}
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar pr-2">
          <div className="relative mt-2 flex items-center justify-center h-48 w-full bg-white/10 border-4 border-dashed border-[#081820]/20 rounded-lg overflow-hidden">
            <img src={displayImg} alt={selectedPokemon.name} className={`w-36 h-36 object-contain pixelated transition-all duration-500 ease-out ${isLoading ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`} />
          </div>

          {pokemonFullData?.flavorText && (
            <div className="bg-[#e0f8d0] mt-4 p-3 border-4 border-[#081820] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-pixel text-[10px] text-[#34441c] leading-relaxed">
              {pokemonFullData.flavorText}
            </div>
          )}

          <div className="space-y-4 mt-4">
            <div className="bg-[#e0f8d0] p-3 border-4 border-[#081820] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-pixel text-[10px] flex justify-between">
              <span className="uppercase">Boy: {(pokemonFullData?.height || selectedPokemon?.height) / 10} m</span>
              <span className="uppercase">Kilo: {(pokemonFullData?.weight || selectedPokemon?.weight) / 10} kg</span>
            </div>

            {pokemonFullData?.abilities?.length > 0 && (
              <div className="bg-[#e0f8d0] p-3 border-4 border-[#081820] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap gap-2">
                <span className="font-pixel text-[8px] text-[#081820] uppercase w-full">Yetenekler:</span>
                {pokemonFullData.abilities.map((ab) => (
                  <span key={ab.ability.name} className={`font-pixel text-[8px] px-2 py-1 border-2 border-[#081820] uppercase ${ab.isHidden ? 'bg-black/10 text-[#081820]/60' : 'bg-white text-black shadow-pixel'}`}>
                    {ab.ability.name.replace('-', ' ')} {ab.isHidden && '(GİZLİ)'}
                  </span>
                ))}
              </div>
            )}
            
            <div className="bg-[#e0f8d0] p-4 border-4 border-[#081820] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h4 className="font-pixel text-[10px] text-[#081820] mb-3 border-b-2 border-[#081820]/20 pb-1 uppercase">İstatistikler</h4>
              <div className="space-y-3">
                {selectedPokemon.stats?.map((s) => (
                  <StatBar key={s.stat.name} statName={s.stat.name} baseStat={s.base_stat} color={mainTypeColor} />
                ))}
              </div>
            </div>
          </div>

          <EvolutionChain 
            evolutionChain={pokemonFullData?.evolutionChain} 
            isLoading={isLoading} 
            selectedPokemonId={selectedPokemon.id} 
          />
        </div>
      </div>
    </div>
  );
}