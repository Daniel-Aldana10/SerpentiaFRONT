import React, { useState, useEffect } from 'react';
import { GameManager } from './GameManager';
import type { Player } from '../../types/types';

interface GameUIProps {
  gameManager: GameManager | null;
}

export const GameUI: React.FC<GameUIProps> = ({ gameManager }) => {
  const [localPlayer, setLocalPlayer] = useState<Player | null>(null);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [gameStatus, setGameStatus] = useState<string>('waiting');
  
  useEffect(() => {
    if (!gameManager) return;
    
    const updateUI = () => {
      const player = gameManager.getLocalPlayer();
      const leaders = gameManager.getLeaderboard();
      const state = gameManager.getGameState();
      
      setLocalPlayer(player || null);
      console.log(leaders.data + "este es");
      setLeaderboard(leaders);
      setGameStatus(state.gameStatus);
    };
    
    // Update UI every frame
    const interval = setInterval(updateUI, 16);
    
    return () => clearInterval(interval);
  }, [gameManager]);
  
  return (
    <div className="game-ui">
      {/* Player Info */}
      {localPlayer && (
        <div className="player-info">
          <h3>Tu Puntuación: {localPlayer.score}</h3>
          <div className="player-status">
            Estado: {localPlayer.alive ? 'Vivo' : 'Muerto'}
          </div>
        </div>
      )}
      
     
      
      {/* Leaderboard */}
      <div className="leaderboard">
        <h3>Tabla de Posiciones</h3>
        <ol>
          {leaderboard.slice(0, 5).map((player, index) => (
            <li key={player.id} className="leaderboard-item">
              <span className="player-name">{player.name}</span>
              <span className="player-score">{player.score}</span>
              <span 
                className="player-color" 
                style={{ backgroundColor: player.color }}
              />
            </li>
          ))}
        </ol>
      </div>
      
     
    </div>
  );
};