import React, { useState, useEffect } from 'react';
import { GameManager } from './GameManager';
import type { Player } from '../../types/types';
import './GameUI.css';

interface GameUIProps {
  gameManager: GameManager | null;
  players?: Player[];
  playerName?: string;
}

interface TeamScore {
  teamName: string;
  totalScore: number;
  members: Player[];
  color: string;
}

interface PlayerWithTeam extends Player {
  teamName?: string;
  teamColor?: string;
}

export const GameUI: React.FC<GameUIProps> = ({ gameManager, players, playerName }) => {
  const [localPlayer, setLocalPlayer] = useState<Player | null>(null);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [teamScores, setTeamScores] = useState<TeamScore[]>([]);
  const [playersWithTeams, setPlayersWithTeams] = useState<PlayerWithTeam[]>([]);
  const [gameStatus, setGameStatus] = useState<string>('waiting');
  const [gameMode, setGameMode] = useState<string>('COMPETITIVE');
  const [targetScore, setTargetScore] = useState<number>(100);

  // Debug logs
  console.log('GameUI Debug:', {
    gameMode,
    playersCount: players?.length || 0,
    playersWithTeamsCount: playersWithTeams.length,
    teamScoresCount: teamScores.length,
    gameManager: !!gameManager
  });

  useEffect(() => {
    const assignTeamsToPlayers = (players: Player[], teams: any, playerToTeam: Record<string, string>): PlayerWithTeam[] => {
      return players.map(player => {
        const teamName = playerToTeam[player.name];
        const teamColor = teamName && teams[teamName]?.color ? teams[teamName].color : player.color;
        return {
          ...player,
          teamName,
          teamColor
        };
      });
    };

    if (players && players.length > 0) {
      const gameState = gameManager?.getGameState();

      setGameStatus(gameState?.status || 'waiting');
      setGameMode(gameState?.gameMode || 'COMPETITIVE');
      setTargetScore(gameState?.targetScore || 100);

      const found = playerName ? players.find(p => p.name === playerName) : null;
      setLocalPlayer(found || null);

      if (gameState?.gameMode === 'TEAM' && gameState.teams && gameState.playerToTeam) {
        const teamMap: Map<string, TeamScore> = new Map();

        Object.entries(gameState.teams).forEach(([teamName, teamInfo]: [string, any]) => {
          teamMap.set(teamName, {
            teamName,
            totalScore: 0,
            members: [],
            color: teamInfo.color || '#4CAF50'
          });
        });

        players.forEach(player => {
          const playerTeam = gameState.playerToTeam?.[player.name];
          if (playerTeam && teamMap.has(playerTeam)) {
            const team = teamMap.get(playerTeam)!;
            team.members.push(player);
            team.totalScore += player.score;
          }
        });

        const sortedTeams = Array.from(teamMap.values())
          .sort((a, b) => b.totalScore - a.totalScore);

        const playersWithTeam = assignTeamsToPlayers(players, gameState.teams, gameState.playerToTeam);
        playersWithTeam.sort((a, b) => b.score - a.score);

        setTeamScores(sortedTeams);
        setPlayersWithTeams(playersWithTeam);
        setLeaderboard([]);
      } else {
        setLeaderboard([...players].sort((a, b) => b.score - a.score));
        setTeamScores([]);
        setPlayersWithTeams([]);
      }
      return;
    }

    if (!gameManager) return;

    const updateUI = () => {
      const player = gameManager.getLocalPlayer();
      const leaders = gameManager.getLeaderboard();
      const state = gameManager.getGameState();

      setLocalPlayer(player || null);
      setGameStatus(state.status);
      setGameMode(state.gameMode || 'COMPETITIVE');
      setTargetScore(state.targetScore || 100);

      if (state.gameMode === 'TEAM' && state.teams && state.playerToTeam) {
        const teamMap: Map<string, TeamScore> = new Map();

        Object.entries(state.teams).forEach(([teamName, teamInfo]: [string, any]) => {
          teamMap.set(teamName, {
            teamName,
            totalScore: 0,
            members: [],
            color: teamInfo.color || '#4CAF50'
          });
        });

        state.players.forEach(player => {
          const playerTeam = state.playerToTeam?.[player.name];
          if (playerTeam && teamMap.has(playerTeam)) {
            const team = teamMap.get(playerTeam)!;
            team.members.push(player);
            team.totalScore += player.score;
          }
        });

        const sortedTeams = Array.from(teamMap.values())
          .sort((a, b) => b.totalScore - a.totalScore);

        const playersWithTeam = assignTeamsToPlayers(state.players, state.teams, state.playerToTeam);
        playersWithTeam.sort((a, b) => b.score - a.score);

        setTeamScores(sortedTeams);
        setPlayersWithTeams(playersWithTeam);
        setLeaderboard([]);
      } else {
        setLeaderboard(leaders);
        setTeamScores([]);
        setPlayersWithTeams([]);
      }
    };

    const interval = setInterval(updateUI, 16);
    return () => clearInterval(interval);
  }, [gameManager, players, playerName]);

  const getStatusDisplay = () => {
    switch (gameStatus) {
      case 'WAITING': return '🔄 Esperando jugadores...';
      case 'IN_GAME': return '🎮 Juego en curso';
      case 'FINISHED': return '🏁 Juego terminado';
      default: return '🔄 Estado desconocido';
    }
  };

  const getGameModeDisplay = () => {
    switch (gameMode) {
      case 'TEAM': return '👥 Equipos';
      case 'COMPETITIVE': return '🏆 Competitivo';
      default: return gameMode;
    }
  };

  const getTeamEmoji = (teamColor: string) => {
    // Mapear colores a emojis de círculo
    const colorMap: Record<string, string> = {
      '#FF0000': '🔴', // Rojo
      '#00FF00': '🟢', // Verde
      '#0000FF': '🔵', // Azul
      '#FFFF00': '🟡', // Amarillo
      '#FF00FF': '🟣', // Púrpura
      '#00FFFF': '🔵', // Cian -> Azul
      '#FFA500': '🟠', // Naranja
      '#000000': '⚫', // Negro
      '#FFFFFF': '⚪', // Blanco
      '#4CAF50': '🟢', // Verde por defecto
    };
    
    return colorMap[teamColor.toUpperCase()] || '⚫';
  };

  return (
    <div className="game-ui">
      {localPlayer && (
        <div className="player-info">
          <h3>Tu Puntuación: {localPlayer.score}</h3>
          <div className="player-status">Estado: {localPlayer.alive ? 'Vivo' : 'Muerto'}</div>
          {localPlayer.maxScore && (
            <div className="player-max-score">Mejor puntuación: {localPlayer.maxScore}</div>
          )}
        </div>
      )}

      <div className="game-status">
        <h4>Estado del Juego</h4>
        <div className={`status-indicator ${gameStatus.toLowerCase()}`}>{getStatusDisplay()}</div>
        <div className="game-mode">Modo: {getGameModeDisplay()}</div>
        <div className="target-score">Objetivo: {targetScore} puntos</div>
      </div>

      {/* Mostrar siempre si hay jugadores y es modo TEAM */}
      {gameMode === 'TEAM' && ( playersWithTeams.length > 0) && (
        <>
          {teamScores.length > 0 && (
            <div className="team-scores">
              <h3>Puntuaciones por Equipo</h3>
              <ol>
                {teamScores.map((team, index) => (
                  <li key={team.teamName} className="team-score-item">
                    <span className="team-rank">#{index + 1}</span>
                    <span className="team-name">{team.teamName}</span>
                    <span className="team-total-score">{team.totalScore} pts total</span>
                    <span className="team-emoji">{getTeamEmoji(team.color)}</span>
                    <span className="team-member-count">({team.members.length} miembros)</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="team-player-leaderboard">
            <h3>Tabla de Jugadores</h3>
            <ol>
              {(playersWithTeams.length > 0 ? playersWithTeams : players || []).map((player, index) => (
                <li key={player.name} className={`leaderboard-item ${player.name === localPlayer?.name ? 'current-player' : ''}`}>
                  <span className="player-rank">#{index + 1}</span>
                  <span className="player-name">{player.name}</span>
                  <span className="player-score">{player.score} pts</span>
                  <span className="team-info">
                    {getTeamEmoji((player as PlayerWithTeam).teamColor || player.color)} ({(player as PlayerWithTeam).teamName || 'Sin equipo'})
                  </span>
                  <span className="player-status-indicator">{player.alive ? '🟢' : '🔴'}</span>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}

      {gameMode === 'COMPETITIVE' && leaderboard.length > 0 && (
        <div className="leaderboard">
          <h3>Tabla de Posiciones</h3>
          <ol>
            {leaderboard.slice(0, 5).map((player, index) => (
              <li key={player.name} className={`leaderboard-item ${player.name === localPlayer?.name ? 'current-player' : ''}`}>
                <span className="player-rank">#{index + 1}</span>
                <span className="player-name">{player.name}</span>
                <span className="player-score">{player.score} pts</span>
                <span className="player-color" style={{ backgroundColor: player.color }} />
                <span className="player-status-indicator">{player.alive ? '🟢' : '🔴'}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};