import React, { useState, useEffect } from 'react';
import { GameComponent } from './GameComponent';
import { GameUI } from './GameUI';
import { GameManager } from './GameManager';
import type { GameState } from '../../types/types';
import gameService from '../../api/ApiGame';
import { adaptBoardToGameState } from './GameScreen';

interface SerpentiaGameProps {
  playerId: string;
  playerName: string;
  initialBoard?: GameState;
  onGameEnd?: (finalScore: number) => void;
  onGameManagerChange?: (gameManager: GameManager | null) => void;
}

export const SerpentiaGame: React.FC<SerpentiaGameProps> = ({
  playerId,
  playerName,
  initialBoard,
  onGameEnd,
  onGameManagerChange
}) => {
  const [gameManager, setGameManager] = useState<GameManager | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    if (gameManager && initialBoard) {
      
      if (initialBoard.roomId) {
        gameManager.setRoomId(initialBoard.roomId);
      }
      
      gameManager.updateFromServer(initialBoard);
    }
  }, [gameManager, initialBoard]);
  
  useEffect(() => {
    // Mock connection for demo
    setTimeout(() => setIsConnected(true), 1000);
  }, [gameManager]);
  
  useEffect(() => {
    const roomId = initialBoard?.roomId;
    const token = localStorage.getItem('authToken');
    if (roomId && token) {
      gameService.connect(roomId, token, (event) => {
        console.log('[FRONT] Evento recibido en SerpentiaGame:', event);
        if (event.type === 'COLLISION' || event.type === 'FRUIT') {
          console.log(`Paso esto: ${event.type} para el jugador: ${event.playerId} && ${event.board}` );
        }
        if ((event.type === 'START' || event.type === 'UPDATE') && event.board) {
          const adaptedBoard = adaptBoardToGameState(event.board);
          
          // Asegurar que el roomId esté en el adaptedBoard
          adaptedBoard.roomId = roomId;
          
          if (gameManager) {
            gameManager.updateFromServer(adaptedBoard);
            
            // Debug después de actualizar
            setTimeout(() => {
              gameManager.debugState();
            }, 100);
          }
        }
      });
    }
  }, [initialBoard, gameManager]);
  
  const handleGameStateChange = (manager: GameManager) => {
    setGameManager(manager);
    
    // Configurar roomId inmediatamente si está disponible
    if (initialBoard?.roomId) {
      manager.setRoomId(initialBoard.roomId);
    }
    
    // Debug del estado
    setTimeout(() => {
      manager.debugState();
    }, 1000);
    
    // Notificar al componente padre
    onGameManagerChange?.(manager);
  };
  
  return (
    <div className="serpentia-game">
      <div className="game-header">
        <h1>Serpentia</h1>
        <div className="connection-status">
          {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
        </div>
      </div>
      
      <div className="game-content">
        <div className="game-area">
          <GameComponent 
            playerId={playerId}
            onGameStateChange={handleGameStateChange}
          />
        </div>
        
        <div className="game-sidebar">
          <GameUI gameManager={gameManager} />
        </div>
      </div>
    </div>
  );
};