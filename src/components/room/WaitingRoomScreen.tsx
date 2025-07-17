import React, { useEffect, useState } from 'react';
import type { Room } from '../../types/types';
import './WaitingRoomScreen.css';
import { useUser } from '../../context/UserContext';
import webSocketService from '../../api/WebSocketService';
import lobbyService from '../../api/ApiLobby';
interface WaitingRoomProps {
  room: Room;
  rooms: Room[];
  onLeave: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

const WaitingRoomScreen: React.FC<WaitingRoomProps> = ({ room, rooms, onLeave, onNavigate }) => {
  // Verificación defensiva
  console.log('[WaitingRoomScreen] rooms prop:', rooms);
  if (!rooms) {
    console.error('[WaitingRoomScreen] La prop rooms es undefined');
    return <div>Cargando salas...</div>;
  }

  const { username } = useUser();
  const [currentRoom, setCurrentRoom] = useState<Room>(room);

  useEffect(() => {
    // Actualiza la sala si cambia en rooms
    const updatedRoom = rooms.find(r => r.roomId === room.roomId);
    if (updatedRoom && updatedRoom !== currentRoom) {
      setCurrentRoom(updatedRoom);
    }
  }, [rooms, room.roomId]);

  useEffect(() => {
    // Escucha el evento START en el canal de juego
    console.log('[WAITING ROOM] Suscribiéndose a /topic/game/' + room.roomId);
    const handleGameEvent = (event: any) => {
      console.log('[WAITING ROOM] Evento recibido en /topic/game/' + room.roomId + ':', event);
      if (event.type === 'START') {
        console.log('Iniciando juego con board:', event.board);
        onNavigate('game', { room: currentRoom, board: event.board, user: { username } });
      }
    };
    const removeGameListener = webSocketService.addGameListener(room.roomId, handleGameEvent);
    return () => {
      removeGameListener();
    };
  }, [room.roomId, currentRoom, onNavigate, username]);

  // Log para depuración
  console.log('currentRoom:', currentRoom);
  console.log('username actual:', username);

  const handleStartGame = () => {
    console.log('Iniciando partida...');
    console.log('Room ID:', currentRoom.roomId);
    lobbyService.startGame(currentRoom.roomId);
  };

  return (
    <div className="waiting-room">
      <h2>Sala: {currentRoom.roomId}</h2>
      <h3>Jugadores:</h3>
      <ul>
        {currentRoom.currentPlayers?.map(player => (
          <li key={player}>
            {player} {player.trim().toLowerCase() === currentRoom.host.trim().toLowerCase() && <span>(Host)</span>}
          </li>
        ))}
      </ul>
      <button onClick={onLeave} className="leave-btn">❌ Salir</button>
      {currentRoom.host && username && username.trim().toLowerCase() === currentRoom.host.trim().toLowerCase() && (
        <button
          className="start-btn"
          disabled={currentRoom.currentPlayers.length < currentRoom.maxPlayers}
          onClick={handleStartGame}
        >
          Iniciar partida
        </button>
      )}
      <p>Esperando a que se unan más jugadores...</p>
    </div>
  );
};

export default WaitingRoomScreen; 