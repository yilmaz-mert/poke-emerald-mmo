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
    // Use AbortController to cancel in-flight requests on cleanup
    const controller = new AbortController();

    const fetchPokemons = async () => {
      setLoading(true);
      setError(false);
      try {
        if (searchQuery) {
          // Single-item search
          const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${searchQuery.toLowerCase()}`, { signal: controller.signal });
          setPokemons([response.data]);
          setNextUrl(null);
          setPrevUrl(null);
        } else {
          // Page list: fetch page then detailed entries with limited concurrency
          const response = await axios.get(currentUrl, { signal: controller.signal });
          setNextUrl(response.data.next);
          setPrevUrl(response.data.previous);

          const limit = 10; // max concurrent requests
          const allPromises = [];
          const activeTasks = new Set();

          for (const pokemon of response.data.results) {
            const requestPromise = axios.get(pokemon.url, { signal: controller.signal }).then(res => res.data);
            allPromises.push(requestPromise);

            const task = requestPromise.finally(() => activeTasks.delete(task));
            activeTasks.add(task);

            if (activeTasks.size >= limit) {
              await Promise.race(activeTasks);
            }
          }

          const detailedPokemons = await Promise.all(allPromises);
          setPokemons(detailedPokemons);
        }
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log('Request canceled (likely due to a new request)');
        } else {
          console.error('Error fetching pokemons:', err.message);
          setError(true);
          setPokemons([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPokemons();

    return () => controller.abort();
  }, [currentUrl, searchQuery]);

  return { pokemons, loading, error, nextUrl, prevUrl };
};