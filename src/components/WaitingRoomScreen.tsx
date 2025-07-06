import React, { useEffect, useState } from 'react';
import type { Room } from '../types/types';
import './WaitingRoomScreen.css';
import { useUser } from '../context/UserContext';
import lobbyWebSocketService from '../api/ApiLobby';
import { Client } from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client';

interface WaitingRoomProps {
  room: Room;
  onLeave: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

const WaitingRoomScreen: React.FC<WaitingRoomProps> = ({ room, onLeave, onNavigate }) => {
  const { username } = useUser();
  const [currentRoom, setCurrentRoom] = useState<Room>(room);
  const [gameClient, setGameClient] = useState<Client | null>(null);
  const isHost = username && username.trim().toLowerCase() === currentRoom.host.trim().toLowerCase();

  useEffect(() => {
    // Conectar al lobby para actualizaciones de la sala
    lobbyWebSocketService.connectWebSocket();
    const unsubscribe = lobbyWebSocketService.addRoomsListener((rooms) => {
      const updatedRoom = rooms.find(r => r.roomId === room.roomId);
      if (updatedRoom) {
        setCurrentRoom(updatedRoom);
      }
    });

    // Conectar al tópico de juego para detectar el inicio
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No se puede conectar al juego: no hay token');
      return;
    }

    const WS_URL = import.meta.env.VITE_WS_URL;
    const socket = new SockJS(`${WS_URL}?token=${token}`);

    const client = new Client({
      webSocketFactory: () => socket,
      debug: () => {},
      onConnect: () => {
        console.log('Conectado al tópico de juego');
        
        // Suscribirse a eventos de juego para esta sala
        client.subscribe(`/topic/game/${room.roomId}`, (message) => {
          try {
            const event = JSON.parse(message.body);
            console.log('Evento de juego recibido:', event);
            
            if (event.type === 'START') {
              console.log('Iniciando juego con board:', event.board);
              // Limpiar suscripciones y conexiones
              //client.deactivate();
              //unsubscribe();
              lobbyWebSocketService.disconnect();
              
              // Navegar al juego
              onNavigate('game', { room: currentRoom, board: event.board });
            }
          } catch (error) {
            console.error('Error al procesar evento de juego:', error);
          }
        });
        
        console.log(`Suscrito al tópico de juego: /topic/game/${room.roomId}`);
      },
      onDisconnect: () => {
        console.log('Desconectado del tópico de juego');
      },
      onStompError: (frame) => {
        console.error('Error de STOMP:', frame);
      }
    });

    client.activate();
    setGameClient(client);

    return () => {
      console.log('Limpiando conexiones de WaitingRoomScreen');
      unsubscribe();
      lobbyWebSocketService.disconnect();
      
      if (gameClient) {
        gameClient.deactivate();
        setGameClient(null);
      }
    };
  }, [room.roomId, onNavigate, currentRoom]);

  // Log para depuración
  console.log('currentRoom:', currentRoom);
  console.log('username actual:', username);

  const handleStartGame = () => {
    console.log('Iniciando partida...');
    console.log('Room ID:', currentRoom.roomId);
    lobbyWebSocketService.startGame(currentRoom.roomId);
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
      {isHost && (
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