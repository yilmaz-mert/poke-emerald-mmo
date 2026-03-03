import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import MainScene from './MainScene';
import HUD from './HUD'; 
import PokedexModule from '../pokedex/PokedexModule';
import useGameStore from '../../store/useGameStore'; // Store'u import et

const GameScreen = () => {
  const gameRef = useRef(null);
  
  // Store'dan Pokedex'in açık olup olmadığını dinliyoruz
  const isPokedexOpen = useGameStore((state) => state.ui.isPokedexOpen);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      parent: 'phaser-game-container',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600,
      },
      render: { pixelArt: true, roundPixels: true },
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 } }
      },
      scene: [MainScene]
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Oyun Alanı */}
      <div id="phaser-game-container" className="absolute inset-0 z-0 flex items-center justify-center" />
      
      {/* UI Katmanı */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <HUD />
        
        {/* KRİTİK DÜZELTME: Sadece açıkken render et */}
        {isPokedexOpen && (
          <div className="pointer-events-auto w-full flex justify-center">
            <PokedexModule />
          </div>
        )}
      </div>
    </div>
  );
};

export default GameScreen;