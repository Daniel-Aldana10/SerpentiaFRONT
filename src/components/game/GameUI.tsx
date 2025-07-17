import React, { useState, useEffect } from 'react';
import { GameManager } from './GameManager';
import type { Player } from '../../types/types';
import './GameUI.css';

interface GameUIProps {
  gameManager: GameManager | null;
  players?: Player[];
  playerName?: string;
}

export const GameUI: React.FC<GameUIProps> = ({ gameManager, players, playerName }) => {
  const [localPlayer, setLocalPlayer] = useState<Player | null>(null);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [gameStatus, setGameStatus] = useState<string>('waiting');
  
  useEffect(() => {
    if (players && players.length > 0) {
      setLeaderboard([...players].sort((a, b) => b.score - a.score));
      // Buscar el jugador local por playerName
      const found = playerName ? players.find(p => p.name === playerName) : null;
      setLocalPlayer(found || null);
      // El estado del juego debe venir del gameManager o de un prop si lo tienes
      setGameStatus(gameManager?.getGameState().status || 'waiting');
      return;
    }
    if (!gameManager) return;
    const updateUI = () => {
      const player = gameManager.getLocalPlayer();
      const leaders = gameManager.getLeaderboard();
      const state = gameManager.getGameState();
      setLocalPlayer(player || null);
      setLeaderboard(leaders);
      setGameStatus(state.status);
    };
    const interval = setInterval(updateUI, 16);
    return () => clearInterval(interval);
  }, [gameManager, players, playerName]);
  
  return (
    <div className="game-ui">
      {/* Player Info */}
      {localPlayer && (
        <div className="player-info">
          <h3>Tu Puntuación: {localPlayer.score}</h3>
          <div className="player-status">
            Estado: {localPlayer.alive ? 'Vivo' : 'Muerto'}
          </div>
          {localPlayer.maxScore && (
            <div className="player-max-score">
              Mejor puntuación: {localPlayer.maxScore}
            </div>
          )}
          
        </div>
      )}
      
      {/* Game Status */}
      <div className="game-status">
        <h4>Estado del Juego</h4>
        <div className={`status-indicator ${gameStatus.toLowerCase()}`}>
          {gameStatus === 'WAITING' && '🔄 Esperando jugadores...'}
          {gameStatus === 'IN_GAME' && '🎮 Juego en curso'}
          {gameStatus === 'FINISHED' && '🏁 Juego terminado'}
        </div>
      </div>
      
      {/* Leaderboard */}
      <div className="leaderboard">
        <h3>Tabla de Posiciones</h3>
        <ol>
          {leaderboard.slice(0, 5).map((player, index) => (
            <li key={player.name} className={`leaderboard-item ${player.name === localPlayer?.name ? 'current-player' : ''}`}>
              <span className="player-rank">#{index + 1}</span>
              <span className="player-name">{player.name}</span>
              <span className="player-score">{player.score} pts</span>
              <span 
                className="player-color" 
                style={{ backgroundColor: player.color }}
              />
              <span className="player-status-indicator">
                {player.alive ? '🟢' : '🔴'}
              </span>
            </li>
          ))}
        </ol>
      </div>
      
    </div>
  );
};