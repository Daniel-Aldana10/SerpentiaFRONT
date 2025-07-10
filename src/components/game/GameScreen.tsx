import React, { useState, useEffect } from 'react';
import type { User, Room } from '../../types/types';
import type { GameState, Player, Position, Direction } from '../../types/types';
import './GameScreen.css';
import { SerpentiaGame } from './SerpentiaGame';
import { GameUI } from './GameUI';
import { GameManager } from './GameManager';

export function adaptBoardToGameState(board: any): GameState {
  const players = new Map<string, Player>();

  if (board && board.snakePositions && board.snakeDirections) {
    for (const playerId in board.snakePositions) {
      players.set(playerId, {
        id: playerId,
        name: playerId,
        color: board.playerColors?.[playerId] || '#4CAF50', // Usa el color del backend si existe
        snake: board.snakePositions[playerId], // [{x, y}, ...]
        direction: board.snakeDirections[playerId] as Direction,
        score: 0, // Si tienes puntuación, cámbialo aquí
        alive: true // Si tienes info de vivos/muertos, cámbialo aquí
      });
    }
  }

  return {
    roomId: board.roomId || '',
    players,
    food: board.fruits || [], // Usamos 'fruits' del backend
    gridSize: 20, // Tamaño de celda en píxeles (ajusta si es necesario)
    gameWidth: (board.width || 40) * 20,
    gameHeight: (board.height || 30) * 20,
    gameStatus: board.status || 'WAITING'
  };
}

interface GameScreenProps {
  user: User | null;
  room: Room;
  board?: any;
  onNavigate: (screen: string) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ user, room, board, onNavigate}) => {
  const [gameManager, setGameManager] = useState<GameManager | null>(null);
  const adaptedBoard = board ? adaptBoardToGameState(board) : undefined;
  
  // Asegurar que el roomId esté disponible
  const roomId = adaptedBoard?.roomId || room.roomId;
  
  return (
    <div className="game-screen">
      <div className="game-header">
        <h2 className="game-logo">🐍 SERPENTIA</h2>
        <div >
          <button className="btn btn-primary full-width" onClick={() => onNavigate('rooms')}>Salir de la partida</button>
          
        </div>
      </div>
      <div className="game-content">
        <div className="game-area">
          <div className="game-container">
            {user && (
              <SerpentiaGame 
                playerId={user.username} 
                playerName={user.username} 
                initialBoard={adaptedBoard}
                onGameManagerChange={setGameManager}
              />
            )}
          </div>
        </div>
        <div className="game-sidebar">
          <div className="ui-panel">
            <GameUI gameManager={gameManager} />
          </div>
          <div className="ui-panel controls-help">
            <h4>Controles:</h4>
            <p>🔼 Flechas o WASD para mover</p>
            <p>🎮 Evita las paredes y otros jugadores</p>
            <p>🍎 Come la comida roja para crecer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;