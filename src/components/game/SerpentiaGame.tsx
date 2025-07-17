import React, { useState, useEffect } from 'react';
import { GameComponent } from './GameComponent';
import { GameUI } from './GameUI';
import { GameManager } from './GameManager';
import type { GameState, GameEvent, Player } from '../../types/types';
import type { Room } from '../../types/types';
import gameService from '../../api/ApiGame';
import { adaptBoardToGameState } from './GameScreen';
import lobbyService from '../../api/ApiLobby';

interface SerpentiaGameProps {
  playerId: string;
  playerName: string;
  initialBoard?: GameState;
  onGameManagerChange?: (gameManager: GameManager | null) => void;
  onNavigate?: (screen: string, params?: any) => void;
  room: Room;
  rooms: Room[]; // <-- nueva prop
}

export const SerpentiaGame: React.FC<SerpentiaGameProps> = ({
  playerId,
  playerName,
  initialBoard,
  onGameManagerChange,
  onNavigate,
  room,
  rooms // <-- nueva prop
}) => {
  const [gameManager, setGameManager] = useState<GameManager | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]); // Nuevo estado para los jugadores
  const [showEndModal, setShowEndModal] = useState(false);
  
  useEffect(() => {
    if (gameManager && initialBoard) {
      if (initialBoard.roomId) {
        gameManager.setRoomId(initialBoard.roomId);
      }
      gameManager.updateFromServer(initialBoard);
      setPlayers(initialBoard.players || []); // Inicializa el estado de jugadores
    }
  }, [gameManager, initialBoard]);
  
  useEffect(() => {
    // Mock connection for demo
    setTimeout(() => setIsConnected(true), 1000);
  }, [gameManager]);

  useEffect(() => {
    if (gameManager && gameManager.getGameState().status === 'FINISHED' && !showEndModal) {
      setShowEndModal(true);
    }
  }, [gameManager, gameManager?.getGameState().status]);
  
  useEffect(() => {
    const roomId = initialBoard?.roomId;
    const token = localStorage.getItem('authToken');
    if (roomId && token) {
      gameService.connect(roomId, token, (event: GameEvent) => {
        // console.log('[FRONT] Evento recibido en SerpentiaGame:', event); // Comentado: solo logs de puntuación
        
        // Manejar eventos de puntuación
        if (event.type === 'SCORE_UPDATE' && event.players && Array.isArray(event.players)) {
          if (gameManager) {
            const prevState = gameManager.getGameState();
            const newState = {
              ...prevState,
              players: event.players
            };
            gameManager.updateFromServer(newState);
            setPlayers(event.players); // Actualiza el estado de jugadores
            // Log para depuración: mostrar los jugadores después de actualizar
            console.log('Jugadores después de updateFromServer:', gameManager.getGameState().players);
          }
        }
        
        // Manejar eventos de fin de juego
        if (event.type === 'END' && event.board) {
          // Extraer jugadores y estado desde event.board
          const board = event.board;
          const players = board.players ? Object.values(board.players) as Player[] : [];
          const status = board.status || 'FINISHED';
          // Mostrar resultados finales
          // Actualizar estado del juego
          if (gameManager) {
            const adaptedBoard = adaptBoardToGameState({
              ...board,
              players,
              status
            });
            gameManager.updateFromServer(adaptedBoard);
            setPlayers(players);
          }
        }
        
        // Manejar eventos de actualización del tablero
        if ((event.type === 'START' || event.type === 'UPDATE') && event.board) {
          const adaptedBoard = adaptBoardToGameState(event.board);
          
          // Asegurar que el roomId esté en el adaptedBoard
          adaptedBoard.roomId = roomId;
          
          if (gameManager) {
            gameManager.updateFromServer(adaptedBoard);
            
            // Debug después de actualizar
            // setTimeout(() => {
            //   gameManager.debugState();
            // }, 100);
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

  // Handlers para los botones del modal
  const handleGoToLobby = async () => {
    if (initialBoard?.roomId) {
      await lobbyService.leaveRoom(initialBoard.roomId);
    }
    if (onNavigate) {
      onNavigate('rooms');
    }
  };

  const handleGoToWaitingRoom = async () => {
    lobbyService.connectWebSocket();
    if (onNavigate) {
      onNavigate('waitingRoom', { room, rooms }); // <-- pasa rooms aquí
    }
  };
  
  return (
    <div className="serpentia-game">
      <div className="game-header">
        <h1>Serpentia</h1>
        <div className="connection-status">
          {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
        </div>
      </div>
      
      
        <div className="game-area">
          <GameComponent 
            playerId={playerId}
            onGameStateChange={handleGameStateChange}
          />
          <GameUI gameManager={gameManager} players={players} playerName={playerName} />
          
        </div>
        
      {showEndModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal" style={{ background: '#232526', color: '#fff', borderRadius: 16, padding: '2rem', minWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.25)', textAlign: 'center' }}>
            <h2 style={{ marginBottom: 16 }}>¡Juego terminado!</h2>
            <p style={{ marginBottom: 24 }}>¿Qué quieres hacer?</p>
            <button className="btn btn-primary" style={{ margin: '0 0.5rem 0.5rem 0', minWidth: 120 }} onClick={handleGoToLobby}>Salir al lobby</button>
            <button className="btn btn-secondary" style={{ margin: '0 0.5rem 0.5rem 0', minWidth: 120 }} onClick={handleGoToWaitingRoom}>Volver a la sala de espera</button>
          </div>
      </div>
      )}
    </div>
  );
};