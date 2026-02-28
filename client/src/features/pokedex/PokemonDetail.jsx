import { useEffect, useState, useCallback } from 'react';
import useGameStore from '../../store/useGameStore';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { TYPE_COLORS } from '../../constants/typeColors';

// --- 1. SABİTLER VE YARDIMCI FONKSİYONLAR (Bileşen Dışında) ---
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const buildUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default function PokemonDetail() {
  // --- 2. GLOBAL STATE ---
  const selectedPokemon = useGameStore((state) => state.ui.selectedPokemon);
  const closeDetail = useGameStore((state) => state.closeDetail);
  const openDetail = useGameStore((state) => state.openDetail);
  const { playSound } = useSoundEffects();

  // --- 3. LOCAL STATE ---
  const [pokemonFullData, setPokemonFullData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false); // Sıçrama engelleyici ön yükleme

  // --- 4. CALLBACKS (Optimizasyon) ---
  const handleClose = useCallback(() => {
    playSound('back');
    closeDetail();
  }, [closeDetail, playSound]);

  // --- 5. YAN ETKİLER (useEffect) ---

  // Klavye Kontrolü
  useEffect(() => {
    const handleDetailKeys = (e) => {
      if (['b', 'Backspace', 'Escape'].includes(e.key)) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleDetailKeys);
    return () => window.removeEventListener('keydown', handleDetailKeys);
  }, [handleClose]);

  // Veri Çekme ve Görsel Ön Yükleme
  useEffect(() => {
    if (!selectedPokemon?.id) return;

    const abortController = new AbortController();
    
    const fetchAndPreload = async () => {
      setLoading(true);
      setImageLoaded(false); // Her yeni seçimde loader başlar
      
      try {
        const res = await fetch(`${API_URL}/api/pokemons/${selectedPokemon.id}`, {
          signal: abortController.signal
        });
        const data = await res.json();
        
        if (!abortController.signal.aborted) {
          setPokemonFullData(data);
          
          // Görsel Ön Yükleme (Preload)
          const imgUrl = buildUrl(data.sprites?.animated || data.sprites?.artwork || selectedPokemon.spriteUrl);
          const img = new Image();
          img.src = imgUrl;
          img.onload = () => !abortController.signal.aborted && setImageLoaded(true);
          img.onerror = () => !abortController.signal.aborted && setImageLoaded(true);
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Fetch error:', err);
      } finally {
        if (!abortController.signal.aborted) setLoading(false);
      }
    };

    fetchAndPreload();
    return () => abortController.abort();
    // Dependency listesi eksiksiz ve hatasız
  }, [selectedPokemon?.id, selectedPokemon?.spriteUrl]);

  if (!selectedPokemon) return null;

  const mainTypeColor = TYPE_COLORS[selectedPokemon.types[0].type.name] || '#777';

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
      
      {/* Cihaz Konteynırı (Emerald Teması) */}
      <div className="relative bg-[#38b000] border-8 border-[#081820] w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col p-6 overflow-hidden max-h-[95vh]">
        
        {/* Başlık ve Rozetler */}
        <div className="flex justify-between items-end border-b-4 border-[#081820] pb-4 shrink-0">
          <div>
            <p className="font-pixel text-[8px] text-white/80 mb-1">#{String(selectedPokemon.id).padStart(3, '0')}</p>
            <h2 className="font-pixel text-xl text-white uppercase truncate">{selectedPokemon.name}</h2>
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
              onClick={handleClose}
              className="ml-2 bg-red-600 border-4 border-black p-2 font-pixel text-[10px] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 cursor-pointer"
            >
              GERİ (B)
            </button>
          </div>
        </div>

        {/* Kaydırılabilir İçerik */}
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar pr-2">
          
          {/* Görsel Alanı (Sabit Boyut + Loader) */}
          <div className="relative mt-2 flex items-center justify-center h-48 w-full bg-white/10 border-4 border-dashed border-[#081820]/20 rounded-lg overflow-hidden">
            <img
              src={buildUrl(pokemonFullData?.sprites?.animated || pokemonFullData?.sprites?.artwork || selectedPokemon.spriteUrl)}
              alt={selectedPokemon.name}
              className={`
                w-36 h-36 object-contain pixelated
                transition-all duration-500 ease-out
                ${imageLoaded && !loading ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
              `}
            />
          </div>

          {/* İstatistikler */}
          <div className="space-y-4 mt-6">
            <div className="bg-[#e0f8d0] p-3 border-4 border-[#081820] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-pixel text-[10px] flex justify-between">
              <span className="uppercase">Boy: {selectedPokemon.height / 10} m</span>
              <span className="uppercase">Kilo: {selectedPokemon.weight / 10} kg</span>
            </div>
            
            <div className="bg-[#e0f8d0] p-4 border-4 border-[#081820] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h4 className="font-pixel text-[10px] text-[#081820] mb-3 border-b-2 border-[#081820]/20 pb-1 uppercase">İstatistikler</h4>
              <div className="space-y-3">
                {selectedPokemon.stats?.map((s) => (
                  <div key={s.stat.name}>
                    <div className="flex justify-between font-pixel text-[8px] text-[#34441c] uppercase mb-1">
                      <span>{s.stat.name.replace('-', ' ')}</span>
                      <span>{s.base_stat}</span>
                    </div>
                    <div className="h-2 w-full bg-black/10 border-2 border-[#081820] rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${Math.min(100, (s.base_stat / 150) * 100)}%`,
                          backgroundColor: mainTypeColor 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Evrim Zinciri */}
          <div className="mt-6 border-4 border-[#081820] p-4 bg-white/30 relative min-h-35 flex flex-col justify-center">
            <h3 className="absolute -top-3 left-2 bg-[#e0f8d0] px-2 font-pixel text-[10px] text-[#081820] border-2 border-[#081820]">
              EVRİM ZİNCİRİ
            </h3>

            {loading ? (
              <div className="flex flex-col items-center gap-2 animate-pulse">
                <div className="w-8 h-8 bg-[#081820]/10 rounded-full border-2 border-[#081820]/20"></div>
              </div>
            ) : pokemonFullData?.evolutionChain?.length > 1 ? (
              <div className="flex items-center justify-around gap-2 pt-2">
                {pokemonFullData.evolutionChain.map((evo, idx) => (
                  <div key={evo.id} className="flex items-center">
                    <button 
                      onClick={() => { playSound('select'); openDetail(evo); }}
                      className={`group flex flex-col items-center p-1 transition-all hover:scale-110 ${evo.id === selectedPokemon.id ? 'opacity-100' : 'opacity-60'}`}
                    >
                      <div className={`bg-white border-2 border-[#081820] rounded-full p-1 mb-1 shadow-pixel ${evo.id === selectedPokemon.id ? 'ring-2 ring-yellow-400' : ''}`}>
                        <img src={buildUrl(evo.spriteUrl)} alt={evo.name} className="w-10 h-10 pixelated" />
                      </div>
                      <span className="font-pixel text-[7px] text-[#081820] uppercase">{evo.name}</span>
                    </button>
                    {idx < pokemonFullData.evolutionChain.length - 1 && (
                      <div className="text-[#081820] font-bold animate-pulse text-xs mb-4">→</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="font-pixel text-[8px] text-center py-4 text-[#081820]/60 uppercase">BU POKEMON EVRİMLERİN SONUNDA VEYA EVRİMSİZ.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}