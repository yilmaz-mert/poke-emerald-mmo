// hooks/usePokemons.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export const usePokemons = (currentUrl, searchQuery) => {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);

  useEffect(() => {
    // 1. Controller'ı oluşturuyoruz (Emniyet Kemerimiz)
    const controller = new AbortController();

    const fetchPokemons = async () => {
      setLoading(true);
      setError(false);
      try {
        if (searchQuery) {
          // ARAMA DURUMU: Tek bir istek
          const response = await axios.get(
            `https://pokeapi.co/api/v2/pokemon/${searchQuery.toLowerCase()}`,
            { signal: controller.signal } 
          );
          setPokemons([response.data]);
          setNextUrl(null);
          setPrevUrl(null);
        } else {
          // LİSTE DURUMU: Sayfa verisini çekiyoruz
          const response = await axios.get(currentUrl, { signal: controller.signal });
          setNextUrl(response.data.next);
          setPrevUrl(response.data.previous);

          // --- CONCURRENCY POOL (EŞZAMANLILIK HAVUZU) ---
          const limit = 10; // Havuz Kapasitesi: Aynı anda en fazla 10 istek uçabilir
          const allPromises = []; // Sonuçları (sırayı bozmadan) tutacağımız dizi
          const activeTasks = new Set(); // O an aktif çalışanları takip eden havuz

          for (const pokemon of response.data.results) {
            // 1. İsteği başlat (await koymuyoruz, anında fırlatıyoruz)
            // AbortController sinyalini her bir iç isteğe veriyoruz!
            const requestPromise = axios.get(pokemon.url, { signal: controller.signal })
              .then(res => res.data);
            
            // 2. Sıralama bozulmasın diye ana listeye ekliyoruz
            allPromises.push(requestPromise);

            // 3. Havuz kontrolü: İstek bitince kendini havuzdan silsin (Yer açılsın)
            const task = requestPromise.finally(() => activeTasks.delete(task));
            activeTasks.add(task);

            // 4. Havuz dolduysa (10 olduysa), içlerinden EN HIZLI olanın bitmesini bekle
            if (activeTasks.size >= limit) {
              await Promise.race(activeTasks);
            }
          }

          // 5. Döngü bitti ama havuzda hala son birkaç istek kalmış olabilir.
          // Hepsinin tamamen bitmesini bekliyoruz.
          const detailedPokemons = await Promise.all(allPromises);
          
          setPokemons(detailedPokemons);
        }
      } catch (err) {
        // Hata Yönetimi: İstek BİZİM tarafımızdan mı iptal edildi?
        if (axios.isCancel(err)) {
          console.log("Önceki istek başarıyla iptal edildi, yarış durumu engellendi!");
        } else {
          console.error("Veri çekilirken hata:", err.message);
          setError(true);
          setPokemons([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPokemons();

    // CLEANUP: Uygulama yeni bir isteğe geçerse eski istekleri havada vurur
    return () => {
      controller.abort();
    };
  }, [currentUrl, searchQuery]);

  return { pokemons, loading, error, nextUrl, prevUrl };
};