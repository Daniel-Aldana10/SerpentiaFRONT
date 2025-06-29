import React, { useState, useEffect } from 'react';
import CreateRoomForm from './CreateRoomForm';
import RoomList from './RoomList';
import type { Room, CreateRoomForms, GameMode} from '../types/types';
import  {gameModeLabels} from '../types/types';
import './RoomList.css';
import './RoomScreen.css';
import lobbyWebSocketService from '../api/ApiLobby';
import WaitingRoomScreen from './WaitingRoomScreen';
import { useUser } from '../context/UserContext';

interface RoomScreenProps {
  onBack?: () => void;
}

const RoomScreen: React.FC<RoomScreenProps> = ({ onBack }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [waitingRoom, setWaitingRoom] = useState<Room | null>(null);
  const { username } = useUser();

  useEffect(() => {
    // Conectar WebSocket al entrar
    lobbyWebSocketService.connectWebSocket();
    // Suscribirse a los cambios de salas en tiempo real
    const unsubscribe = lobbyWebSocketService.addRoomsListener((rooms) => {
      setRooms(rooms);
    });
    // Cargar salas inicialmente
    lobbyWebSocketService.fetchRooms();
    return () => {
      unsubscribe();
      lobbyWebSocketService.disconnect();
    };
  }, []);

  const handleCreateRoom = async (room: CreateRoomForms) => {
    console.log(gameModeLabels[room.gameMode as GameMode] + "fincionaaaaaaa");
    const createdRoom = await lobbyWebSocketService.createRoom(room);
    // Buscar la sala recién creada en la lista actualizada
    const updatedRoom = rooms.find(r => r.roomId === room.roomId) || createdRoom;
    setWaitingRoom(updatedRoom);
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!username) {
      alert('Debes iniciar sesión para unirte a una sala.');
      return;
    }
    const joinedRoom = await lobbyWebSocketService.joinRoom(roomId);
    // Buscar la sala a la que se unió en la lista actualizada
    const updatedRoom = rooms.find(r => r.roomId === roomId) || joinedRoom;
    setWaitingRoom(updatedRoom);
  };

 const handleLeaveRoom = async () => {
  if (!waitingRoom) return;
  await lobbyWebSocketService.leaveRoom(waitingRoom.roomId);
  setWaitingRoom(null);
  await lobbyWebSocketService.fetchRooms(); // Recarga explícita de salas
};

  if (waitingRoom) {
    return (
      <WaitingRoomScreen
        room={waitingRoom}
        onLeave={handleLeaveRoom}
      />
    );
  }

  return (
    <div className="container">
      <button className="back-btn" onClick={onBack || (() => window.history.back())}>← Volver</button>
      <div className="header">
        <h1>🐍 SERPENTIA</h1>
        <p>Crear y Unirse a Salas de Juego</p>
      </div>
      <div className="main-content">
        <CreateRoomForm onCreate={handleCreateRoom} />
        <RoomList rooms={rooms} onJoin={handleJoinRoom} />
      </div>
    </div>
  );
};

export default RoomScreen; 