import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import MainScene from './MainScene';

const GameComponent = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    // Gameboy Emerald hissiyatını korumak için pixelArt: true çok önemli.
    const config = {
      type: Phaser.AUTO,
      width: 800, // Oyun penceresi genişliği (kendi tasarımına göre ayarlayabilirsin)
      height: 600,
      parent: 'phaser-game-container',
      pixelArt: true, // Anti-aliasing'i kapatır, keskin pikseller sağlar
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 }, // Üstten görünümlü (Top-down) RPG olduğu için yerçekimi 0
          debug: false // Geliştirme aşamasında true yaparak collision kutularını görebilirsin
        }
      },
      scene: [MainScene]
    };

    // Oyunu başlat
    const game = new Phaser.Game(config);
    gameRef.current = game;

    // React bileşeni unmount olduğunda Phaser instance'ını temizle
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    // React UI bileşenlerini bu kapsayıcının üzerine z-index ile yerleştirebilirsin
    <div id="phaser-game-container" className="relative w-full h-full overflow-hidden" />
  );
};

export default GameComponent;