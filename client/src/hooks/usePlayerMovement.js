import { useState, useEffect } from 'react';

// Grid boyutu (Pokémon oyunlarındaki 1 kare = 32px veya 64px)
const TILE_SIZE = 48; 

export function usePlayerMovement(initialX = 5, initialY = 5) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [direction, setDirection] = useState('down'); // down, up, left, right
  const [isWalking, setIsWalking] = useState(false);

  useEffect(() => {
    let movementInterval;
    const keysPressed = {};

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (!['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) return;
      
      keysPressed[key] = true;
      setIsWalking(true);

      // Yön belirleme
      if (key === 'w' || key === 'arrowup') setDirection('up');
      else if (key === 's' || key === 'arrowdown') setDirection('down');
      else if (key === 'a' || key === 'arrowleft') setDirection('left');
      else if (key === 'd' || key === 'arrowright') setDirection('right');
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      delete keysPressed[key];
      if (Object.keys(keysPressed).length === 0) {
        setIsWalking(false);
      }
    };

    // Yürüme döngüsü (Eğer tuşa basılı tutuluyorsa koordinatları günceller)
    const gameLoop = () => {
      if (Object.keys(keysPressed).length > 0) {
        setPosition((prev) => {
          let newX = prev.x;
          let newY = prev.y;
          // Hareket hızı ayarlaması (küsüratlı verip CSS transition ile yumuşatıyoruz)
          const speed = 0.15; 

          if (keysPressed['w'] || keysPressed['arrowup']) newY -= speed;
          if (keysPressed['s'] || keysPressed['arrowdown']) newY += speed;
          if (keysPressed['a'] || keysPressed['arrowleft']) newX -= speed;
          if (keysPressed['d'] || keysPressed['arrowright']) newX += speed;

          return { x: newX, y: newY };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    movementInterval = setInterval(gameLoop, 20); // 50fps

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(movementInterval);
    };
  }, []);

  return { 
    x: position.x * TILE_SIZE, 
    y: position.y * TILE_SIZE, 
    direction, 
    isWalking 
  };
}