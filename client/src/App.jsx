import { useState, useEffect } from 'react';
import { usePokemons } from './hooks/usePokemons'; 
import PokemonCard from './components/PokemonCard';
import Pagination from './components/Pagination';
import SearchBar from './components/SearchBar';

function App() {
  // Uygulamanın navigasyon ve arama durumlarını (state) burada yönetiyoruz
  const [currentUrl, setCurrentUrl] = useState('https://pokeapi.co/api/v2/pokemon?limit=20');
  
  // 1. Kullanıcının klavyede anlık olarak yazdığı kelime
  const [searchQuery, setSearchQuery] = useState('');
  
  // 2. 500ms bekletilmiş, API'ye gerçekten gönderilecek kelime
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // --- DEBOUNCE (BEKLETME) MANTIĞI ---
  useEffect(() => {
    // Kullanıcı her harf yazdığında 500 milisaniyelik bir sayaç başlat
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    // CLEANUP: Eğer 500ms dolmadan kullanıcı yeni bir harf yazarsa, 
    // eski sayacı iptal et ki API'ye yarım kalan kelime gitmesin.
    return () => clearTimeout(timer);
  }, [searchQuery]); // searchQuery her değiştiğinde bu efekti tetikle

  // Custom Hook'umuza anlık kelimeyi değil, debounced (bekletilmiş) kelimeyi veriyoruz!
  const { pokemons, loading, error, nextUrl, prevUrl } = usePokemons(currentUrl, debouncedQuery);

  // Arama çubuğundan gelen kelimeyi state'e kaydeder
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Aramayı iptal edip ana listeye döndürür
  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery(''); // İptal durumunda ikisini de sıfırlıyoruz
    setCurrentUrl('https://pokeapi.co/api/v2/pokemon?limit=20');
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Başlık: Tıklandığında aramayı sıfırlar */}
        <h1 
          className="text-5xl font-extrabold text-center text-red-500 mb-8 cursor-pointer drop-shadow-sm hover:scale-105 transition-transform"
          onClick={clearSearch}
        >
          Pokedex
        </h1>

        {/* Arama Bileşeni */}
        <SearchBar onSearch={handleSearch} />

        {/* UI'da "Geri Dön" butonunu göstermek için debouncedQuery kullanıyoruz */}
        {debouncedQuery && (
          <div className="text-center mb-6">
            <button onClick={clearSearch} className="text-blue-500 font-semibold hover:underline">
              &larr; Tüm Pokemonlara Dön
            </button>
          </div>
        )}

        {/* Duruma göre farklı arayüzler (Loading, Error veya Liste) render ediyoruz */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <h2 className="text-2xl font-bold text-gray-500 animate-pulse">Pokemon Aranıyor...</h2>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center mt-10">
            <h2 className="text-2xl font-bold text-red-500 mb-2">Pokemon bulunamadı!</h2>
            <p className="text-gray-600">Lütfen ismini doğru yazdığından emin ol (örn: pikachu).</p>
          </div>
        ) : (
          <>
            {/* Pokemon Listesi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {pokemons.map((pokemon) => (
                <PokemonCard key={pokemon.name} pokemon={pokemon} />
              ))}
            </div>

            {/* Arama yapılmıyorsa sayfalama butonlarını göster */}
            {!searchQuery && (
              <Pagination 
                prevUrl={prevUrl} 
                nextUrl={nextUrl} 
                onPageChange={setCurrentUrl} 
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;