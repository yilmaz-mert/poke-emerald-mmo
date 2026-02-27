import { useEffect } from 'react';
import useGameStore from '../../store/useGameStore';

export default function PokemonDetail() {
  const selectedPokemon = useGameStore((state) => state.ui.selectedPokemon);
  const closeDetail = useGameStore((state) => state.closeDetail);

  // Key handlers (close)
  useEffect(() => {
    const handleDetailKeys = (e) => {
      if (!e.key) return;
      if (e.key.toLowerCase() === 'b' || e.key === 'Backspace' || e.key === 'Escape') {
        closeDetail();
      }
    };

    window.addEventListener('keydown', handleDetailKeys);
    return () => window.removeEventListener('keydown', handleDetailKeys);
  }, [closeDetail]);

  if (!selectedPokemon) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
      
      {/* Device container */}
      <div className="relative bg-[#38b000] border-8 border-[#081820] w-full max-w-lg h-auto max-h-[95vh] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col p-6 overflow-hidden">
        
        {/* Header: title and close button */}
        <div className="flex justify-between items-center border-b-4 border-[#081820] pb-4">
          <h2 className="font-pixel text-xl text-white uppercase">{selectedPokemon.name}</h2>
          <button 
            type="button"
            onClick={closeDetail} 
            className="bg-red-600 border-4 border-black p-2 font-pixel text-[10px] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 cursor-pointer"
          >
            GERİ (B)
          </button>
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
        </div>

        {/* Footer info */}
        <div className="mt-4 bg-[#081820] p-3 border-4 border-[#88c070] text-[#88c070] font-pixel text-[10px] leading-relaxed shadow-inner text-center">
          VERİ TABANI BAĞLANTISI BEKLENİYOR...
        </div>
      </div>
    </div>
  );
}