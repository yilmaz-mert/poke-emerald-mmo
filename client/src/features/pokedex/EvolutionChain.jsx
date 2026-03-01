// client/src/features/pokedex/EvolutionChain.jsx
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const buildUrl = (path) => path?.startsWith('http') ? path : `${API_URL}${path?.startsWith('/') ? '' : '/'}${path}`;

export default function EvolutionChain({ evolutionChain, isLoading, selectedPokemonId }) {
  return (
    <div className="mt-6 border-4 border-[#081820] p-4 bg-white/30 relative min-h-35 flex flex-col justify-center">
      <h3 className="absolute -top-3 left-2 bg-[#e0f8d0] px-2 font-pixel text-[10px] text-[#081820] border-2 border-[#081820]">
        EVRİM ZİNCİRİ
      </h3>

      {isLoading ? (
        <div className="flex flex-col items-center gap-2 animate-pulse">
          <div className="w-8 h-8 bg-[#081820]/10 rounded-full border-2 border-[#081820]/20"></div>
        </div>
      ) : evolutionChain?.length > 1 ? (
        <div className="flex items-center justify-around gap-2 pt-2">
          {evolutionChain.map((evo, idx) => {
            const isSelected = evo.id === selectedPokemonId;

            return (
              <div key={evo.id} className="flex items-center">
                {/* Tıklanabilir buton div'e dönüştürüldü ve interaktif sınıflar kaldırıldı */}
                <div className={`flex flex-col items-center p-1 ${isSelected ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`bg-white border-2 border-[#081820] rounded-full p-1 mb-1 shadow-pixel ${isSelected ? 'ring-2 ring-yellow-400' : ''}`}>
                    <img src={buildUrl(evo.spriteUrl)} alt={evo.name} className="w-10 h-10 pixelated" />
                  </div>
                  <span className="font-pixel text-[7px] text-[#081820] uppercase">
                    {evo.name}
                  </span>
                </div>
                {idx < evolutionChain.length - 1 && (
                  <div className="text-[#081820] font-bold animate-pulse text-xs mb-4">→</div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="font-pixel text-[8px] text-center py-4 text-[#081820]/60 uppercase">BU POKEMON EVRİMLERİN SONUNDA VEYA EVRİMSİZ.</div>
      )}
    </div>
  );
}