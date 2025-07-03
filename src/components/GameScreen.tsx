import React, { useEffect, useRef, useState } from 'react';
import type { User, Room, GameEvent, BoardState } from '../types/types';
import './GameScreen.css';
import gameService from '../api/ApiGame';
import GameControls from './GameControls';

interface GameScreenProps {
  user: User | null;
  room: Room;
  onLogout: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ user, room, onLogout }) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState<BoardState | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    console.log('Intentando suscribirse a /topic/game/' + room.roomId, { user, room });
    const token = localStorage.getItem('authToken') || '';
    gameService.connect(room.roomId, token, (event: GameEvent) => {
      console.log('Evento recibido en GameScreen:', event);
      setBoard(event.board);
      if (event.message) setMessage(event.message);
    });
    return () => {
      gameService.disconnect();
    };
  }, [room.roomId, user]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!user) return;
    const direction = { w: 'UP', a: 'LEFT', s: 'DOWN', d: 'RIGHT' }[e.key.toLowerCase()];
    if (direction) {
      gameService.sendMove(room.roomId, user.username, direction);
    }
  };

  return (
    <div className="game-screen" tabIndex={0} onKeyDown={handleKeyDown} style={{ outline: 'none' }}>
      <div className="game-header">
        <div className="game-info">
          <h2 className="game-logo">🐍 SERPENTIA</h2>
          {user && (
            <div className="user-info">
              <span>¡Hola, {user.username}!</span>
            </div>
          )}
        </div>
        <div className="game-controls">
          <div className="score-display">
            <span>Puntuación: <strong>0</strong></span>
          </div>
          <button className="btn btn-small" onClick={onLogout}>
            {user ? 'Cerrar Sesión' : 'Volver al Inicio'}
          </button>
        </div>
      </div>
      <div className="game-container" ref={gameContainerRef}>
        {/* Aquí se renderizará el juego de Phaser */}
        <div className="game-placeholder">
          <div className="placeholder-content">
            <h3>🐍 Juego Serpentia</h3>
            <p>En proceso</p>
            {message && <div className="game-message">{message}</div>}
            <GameControls />
          </div>
        </div>
      </div>
      {/* Puedes agregar aquí la lógica para renderizar el tablero y las serpientes con Phaser */}
    </div>
  );
};

export default GameScreen;