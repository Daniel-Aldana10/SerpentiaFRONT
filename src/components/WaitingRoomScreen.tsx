import React, { useEffect, useState } from 'react';
import type { Room } from '../types/types';
import './WaitingRoomScreen.css';
import { useUser } from '../context/UserContext';
import lobbyWebSocketService from '../api/ApiLobby';

interface WaitingRoomProps {
  room: Room;
  onLeave: () => void;
}

const WaitingRoomScreen: React.FC<WaitingRoomProps> = ({ room, onLeave }) => {
  const { username } = useUser();
  const [currentRoom, setCurrentRoom] = useState<Room>(room);
  const isHost = username && username.trim().toLowerCase() === currentRoom.host.trim().toLowerCase();

  useEffect(() => {
    // Conectar WebSocket al entrar
    lobbyWebSocketService.connectWebSocket();
    // Suscribirse a cambios de salas para actualizar la sala actual
    const unsubscribe = lobbyWebSocketService.addRoomsListener((rooms) => {
      const updatedRoom = rooms.find(r => r.roomId === room.roomId);
      if (updatedRoom) {
        setCurrentRoom(updatedRoom);
      }
    });
    return () => {
      unsubscribe();
      lobbyWebSocketService.disconnect();
    };
  }, [room.roomId]);

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
      {isHost && <button className="start-btn" disabled>Iniciar partida</button>}
      <p>Esperando a que se unan más jugadores...</p>
    </div>
  );
};

export default WaitingRoomScreen; 