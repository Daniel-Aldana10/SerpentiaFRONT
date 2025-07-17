import React, { useState, useEffect } from 'react';
import type { User, Room } from '../../types/types';
import type { GameState, Player, Direction } from '../../types/types';
import './GameScreen.css';
import { SerpentiaGame } from './SerpentiaGame';
import { GameManager } from './GameManager';
import { getCurrentUsername } from '../../api/ApiLobby';
import webSocketService from '../../api/WebSocketService';

export function adaptBoardToGameState(board: any): GameState {
  const players: Player[] = [];

  if (!board) {
    return {
      roomId: '',
      width: 40,
      height: 30,
      players: [],
      fruits: [],
      status: 'WAITING'
    };
  }

  if (board && board.players && Array.isArray(board.players)) {
    players.push(...board.players);
  } else if (board && board.snakePositions && board.snakeDirections) {
    for (const playerId in board.snakePositions) {
      players.push({
        id: playerId,
        name: playerId,
        color: board.playerColors?.[playerId] || '#4CAF50',
        snake: board.snakePositions[playerId],
        direction: board.snakeDirections[playerId] as Direction,
        score: board.playerScores?.[playerId] || 0,
        alive: board.playerAlive?.[playerId] !== false
      });
    }
  }

  return {
    roomId: board.roomId || '',
    width: board.width || 40,
    height: board.height || 30,
    players,
    fruits: board.fruits || board.food || [],
    status: board.status || 'WAITING'
  };
}

interface GameScreenProps {
  user: User | null;
  room: Room;
  board?: any;
  rooms: Room[]; // <-- nueva prop
  onNavigate: (screen: string, params?: any) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ user, room, board, rooms, onNavigate}) => {
  const [gameManager, setGameManager] = useState<GameManager | null>(null);
  const [gameBoard, setGameBoard] = useState<any>(board);

  useEffect(() => {
    // Suscribirse a /topic/game/{roomId}
    const handleGameEvent = (event: any) => {
      console.log('[GAME EVENT]', event);
      if (event.type === 'START' && event.board) {
        setGameBoard(event.board);
      }
      // Aquí puedes manejar otros eventos del juego y actualizar el estado si lo necesitas
    };
    const removeGameListener = webSocketService.addGameListener(room.roomId, handleGameEvent);
    return () => {
      removeGameListener();
    };
  }, [room.roomId]);

  const adaptedBoard = gameBoard ? adaptBoardToGameState(gameBoard) : undefined;

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
                onNavigate={onNavigate}
                room={room}
                rooms={rooms} // <-- pasa rooms aquí
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;