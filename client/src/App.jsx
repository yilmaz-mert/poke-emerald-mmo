import React, { useEffect, useState } from 'react';
import { useAuthStore } from "./store/useAuthStore";
import AuthScreen from "./features/auth/AuthScreen";
import TrainerCardTransition from "./features/auth/TrainerCardTransition"; 
// ARTIK POKEDEX YERİNE GAMESCREEN'İ ÇAĞIRIYORUZ:
import GameScreen from "./features/game/GameScreen"; 

function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [showTransition, setShowTransition] = useState(false);
  const [gameReady, setGameReady] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowTransition(true);
    } else {
      setGameReady(false); // Logout olursa resetle
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return <AuthScreen />;

  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      {showTransition && (
        <TrainerCardTransition onComplete={() => {
          setShowTransition(false);
          setGameReady(true);
        }} />
      )}

      {/* Oyun sadece animasyon bitince veya kullanıcı zaten oyundaysa yüklenir */}
      {(gameReady || !showTransition) && <GameScreen />}
    </div>
  );
}

export default App;