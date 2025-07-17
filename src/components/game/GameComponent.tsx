import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameScene } from './GameScene';
import { GameManager } from './GameManager';

interface GameComponentProps {
  playerId: string;
  onGameStateChange?: (gameManager: GameManager) => void;
}

export const GameComponent: React.FC<GameComponentProps> = ({ 
  playerId, 
  onGameStateChange 
}) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const gameSceneRef = useRef<GameScene | null>(null);
  
  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return;
    
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      backgroundColor: '#ffffff',
      scene: GameScene,
      physics: {
        default: 'arcade',
        arcade: {
          debug: false
        }
      }
    };
    
    phaserGameRef.current = new Phaser.Game(config);
    
    // Espera a que la escena esté disponible antes de llamar a setLocalPlayerId
    const trySetLocalPlayerId = () => {
      const scene = phaserGameRef.current?.scene.getScene('GameScene') as GameScene | undefined;
      if (scene && typeof scene.setLocalPlayerId === 'function') {
        gameSceneRef.current = scene;
        scene.setLocalPlayerId(playerId);

        // Eliminado: listener de teclado para depuración
      } else {
        setTimeout(trySetLocalPlayerId, 50);
      }
    };

    trySetLocalPlayerId();
    
    // Setup game manager
    const setupGameManager = () => {
      const manager = gameSceneRef.current?.getGameManager();
      if (manager) {
        onGameStateChange?.(manager);
      } else {
        setTimeout(setupGameManager, 100);
      }
    };
    
    setupGameManager();
    
    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [playerId]);
  return (
    <div className="game-container">
      <div ref={gameRef} style={{ width: '800px', height: '600px' }} />
    </div>
  );
};