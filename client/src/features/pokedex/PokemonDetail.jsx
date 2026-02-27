import { useEffect, useState } from 'react';
import useGameStore from '../../store/useGameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { TYPE_COLORS } from '../../constants/typeColors';

export default function PokemonDetail() {
  const selectedPokemon = useGameStore((state) => state.ui.selectedPokemon);
  const closeDetail = useGameStore((state) => state.closeDetail);
  const { playSound } = useSoundEffects();
  const [evolutionChain, setEvolutionChain] = useState([]);

  // Key handlers (close)
  useEffect(() => {
    const handleDetailKeys = (e) => {
      if (!e.key) return;
      if (e.key.toLowerCase() === 'b' || e.key === 'Backspace' || e.key === 'Escape') {
        playSound('back');
        closeDetail();
      }
    };

    window.addEventListener('keydown', handleDetailKeys);
    return () => window.removeEventListener('keydown', handleDetailKeys);
  }, [closeDetail, playSound]);

  // Fetch evolution chain when selectedPokemon changes
  useEffect(() => {
    if (!selectedPokemon) {
      const t = setTimeout(() => setEvolutionChain([]), 0);
      return () => clearTimeout(t);
    }

    let cancelled = false;

    const fetchEvolutions = async () => {
      try {
        // 1. Get species data
        const speciesRes = await fetch(selectedPokemon.species.url);
        const speciesData = await speciesRes.json();

        // 2. Get evolution chain
        const evoRes = await fetch(speciesData.evolution_chain.url);
        const evoData = await evoRes.json();

        // 3. Parse linear chain into name+sprite list
        const chain = [];
        let current = evoData.chain;
        while (current) {
          const id = current.species.url.split('/').filter(Boolean).pop();
          chain.push({
            name: current.species.name,
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          });
          current = current.evolves_to && current.evolves_to[0];
        }

        if (!cancelled) setEvolutionChain(chain);
      } catch (err) {
        console.error('Evrim zinciri yüklenemedi:', err);
        if (!cancelled) setEvolutionChain([]);
      }
    };

    fetchEvolutions();

    return () => { cancelled = true; };
  }, [selectedPokemon]);

  if (!selectedPokemon) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
      
      {/* Device container */}
      <div className="relative bg-[#38b000] border-8 border-[#081820] w-full max-w-lg h-auto max-h-[95vh] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col p-6 overflow-hidden">
        
        {/* Üst Kısım: İsim ve Tür Rozetleri */}
        <div className="flex justify-between items-end border-b-4 border-[#081820] pb-4">
          <div>
            <p className="font-pixel text-[8px] text-white/80 mb-1">#{String(selectedPokemon.id).padStart(3, '0')}</p>
            <h2 className="font-pixel text-xl text-white uppercase">{selectedPokemon.name}</h2>
          </div>
          
          <div className="flex items-end gap-2">
            {selectedPokemon.types.map((t) => (
              <span 
                key={t.type.name}
                style={{ backgroundColor: TYPE_COLORS[t.type.name] }}
                className="px-3 py-1 border-2 border-black font-pixel text-[8px] text-white shadow-pixel uppercase"
              >
                {t.type.name}
              </span>
            ))}

            <button 
              type="button"
              onClick={() => { playSound('back'); closeDetail(); }}
              className="ml-2 bg-red-600 border-4 border-black p-2 font-pixel text-[10px] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 cursor-pointer"
            >
              GERİ (B)
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {/* Artwork */}
          <div className="bg-white border-4 border-[#081820] p-4 mb-4 flex justify-center shadow-inner">
             <img 
               src={selectedPokemon.sprites?.other?.showdown?.front_default || selectedPokemon.sprites?.front_default} 
               alt={selectedPokemon.name}
               className="w-40 h-40 pixelated"
             />
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="bg-[#e0f8d0] p-3 border-4 border-[#081820] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-pixel text-[10px]">
              <p className="text-[#34441c] mb-1 uppercase">Boy: {selectedPokemon.height / 10} m</p>
              <p className="text-[#34441c] uppercase">Kilo: {selectedPokemon.weight / 10} kg</p>
            </div>
            
            <div className="bg-[#e0f8d0] p-3 border-4 border-[#081820] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-pixel text-[8px]">
              <h4 className="text-[#081820] mb-2 underline uppercase text-[10px]">İstatistikler</h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedPokemon.stats?.map(stat => (
                  <div key={stat.stat.name} className="flex justify-between border-b border-[#34441c]/20">
                    <span className="uppercase">{stat.stat.name}:</span>
                    <span className="font-bold">{stat.base_stat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Evolution Chain Panel */}
          <div className="mt-6 bg-[#e0f8d0] p-4 border-4 border-[#081820] shadow-pixel">
            <h4 className="font-pixel text-[10px] text-[#081820] mb-4 underline uppercase">EVRİM ZİNCİRİ</h4>
            <div className="flex items-center justify-around gap-2">
              {evolutionChain.map((evo, index) => (
                <div key={evo.name} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className="bg-white border-2 border-black/10 rounded-full p-1 mb-1">
                      <img src={evo.sprite} alt={evo.name} className="w-12 h-12 pixelated" />
                    </div>
                    <span className="font-pixel text-[8px] text-[#34441c] uppercase">{evo.name}</span>
                  </div>
                  {index < evolutionChain.length - 1 && (
                    <span className="font-pixel text-[12px] text-[#081820] mx-2 animate-pulse">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 bg-[#081820] p-3 border-4 border-[#88c070] text-[#88c070] font-pixel text-[10px] leading-relaxed shadow-inner text-center">
          VERİ TABANI BAĞLANTISI BEKLENİYOR...
        </div>
      </div>
    </div>
  );
}