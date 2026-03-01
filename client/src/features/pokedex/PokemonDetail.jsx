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

  useEffect(() => {
    const handleDetailKeys = (e) => {
      if (['b', 'Backspace', 'Escape'].includes(e.key)) handleClose();
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

  useEffect(() => {
    if (pokemonFullData?.criesUrl) {
      const timer = setTimeout(() => {
        const audio = new Audio(buildUrl(pokemonFullData.criesUrl));
        audio.volume = 0.1;
        audio.play().catch(err => console.log("Ses otomatik çalınamadı:", err));
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [pokemonFullData?.criesUrl]);

  if (!selectedPokemon) return null;
  const mainTypeColor = TYPE_COLORS[selectedPokemon.types[0].type.name] || '#777';
  const displayImg = buildUrl(pokemonFullData?.sprites?.animated || pokemonFullData?.sprites?.artwork || selectedPokemon.spriteUrl);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#081820]/95 p-4 backdrop-blur-sm">
      {/* Detay ekranında da scanline olması için */}
      <div className="scanlines"></div>
      
      <div className="relative bg-[#e0f8d0] border-8 border-[#58d030] w-full max-w-2xl shadow-[0_0_30px_rgba(88,208,48,0.2)] flex flex-col p-6 max-h-[90vh] z-10">
        
        <div className="flex justify-between items-end border-b-4 border-[#081820] pb-4 shrink-0">
          <div>
            <p className="font-pixel text-[12px] text-[#081820] mb-1">NO. {String(selectedPokemon.id).padStart(3, '0')}</p>
            <h2 className="font-pixel text-3xl text-[#081820] uppercase tracking-wider">{selectedPokemon.name}</h2>
          </div>
          <div className="flex items-end gap-3">
            {selectedPokemon.types.map((t) => (
              <span key={t.type.name} style={{ backgroundColor: TYPE_COLORS[t.type.name] }} className="px-3 py-1 border-2 border-black font-pixel text-[10px] text-white uppercase shadow-[2px_2px_0_#081820]">
                {t.type.name}
              </span>
            ))}
            <button onClick={handleClose} className="bg-gray-400 border-4 border-black px-4 py-2 font-pixel text-[12px] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 cursor-pointer">
              GERİ (B)
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mt-4 retro-scrollbar pr-4 flex flex-col md:flex-row gap-6">
          {/* Sol Kolon: Görsel ve Açıklama */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <div className="relative flex items-center justify-center h-56 w-full bg-[#081820] border-4 border-[#58d030] shadow-[inset_0_0_20px_rgba(88,208,48,0.3)]">
              <img src={displayImg} alt={selectedPokemon.name} className={`w-40 h-40 object-contain pixelated transition-all duration-500 ease-out ${isLoading ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`} />
            </div>

            {pokemonFullData?.flavorText && (
              <div className="bg-[#081820] p-4 border-4 border-[#58d030] font-pixel text-[10px] text-[#58d030] leading-relaxed uppercase">
                {"> "} {pokemonFullData.flavorText}
              </div>
            )}
            
            <div className="flex justify-between bg-white/50 p-3 border-4 border-[#081820] font-pixel text-[10px] text-[#081820] uppercase">
              <span>BOY: {(pokemonFullData?.height || selectedPokemon?.height) / 10} M</span>
              <span>KİLO: {(pokemonFullData?.weight || selectedPokemon?.weight) / 10} KG</span>
            </div>
          </div>

          {/* Sağ Kolon: İstatistikler ve Yetenekler */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            {pokemonFullData?.abilities?.length > 0 && (
              <div className="bg-white/50 p-3 border-4 border-[#081820] flex flex-wrap gap-2">
                <span className="font-pixel text-[10px] text-[#081820] uppercase w-full mb-1">YETENEKLER:</span>
                {pokemonFullData.abilities.map((ab) => (
                  <span key={ab.ability.name} className={`font-pixel text-[8px] px-2 py-1 border-2 border-[#081820] uppercase ${ab.isHidden ? 'bg-[#081820] text-[#e0f8d0]' : 'bg-white text-black'}`}>
                    {ab.ability.name.replace('-', ' ')} {ab.isHidden && '(GİZLİ)'}
                  </span>
                ))}
              </div>
            )}
            
            <div className="bg-white/50 p-4 border-4 border-[#081820]">
              <h4 className="font-pixel text-[12px] text-[#081820] mb-3 border-b-2 border-[#081820]/30 pb-1 uppercase">İSTATİSTİKLER</h4>
              <div className="space-y-4">
                {selectedPokemon.stats?.map((s) => (
                  <StatBar key={s.stat.name} statName={s.stat.name} baseStat={s.base_stat} color={mainTypeColor} />
                ))}
              </div>
            </div>
            
            {/* Evrim zinciri buraya sığdırıldı */}
            <EvolutionChain 
              evolutionChain={pokemonFullData?.evolutionChain} 
              isLoading={isLoading} 
              selectedPokemonId={selectedPokemon.id} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}