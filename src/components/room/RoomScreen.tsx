import React, { useState, useEffect } from 'react';
import CreateRoomForm from './CreateRoomForm';
import RoomList from './RoomList';
import type { Room, CreateRoomForms} from '../../types/types';
import '../AuthScreen.css';

import './RoomScreen.css';
import lobbyWebSocketService, { getCurrentUsername } from '../../api/ApiLobby';
import WaitingRoomScreen from './WaitingRoomScreen';
import { useUser } from '../../context/UserContext';

interface RoomScreenProps {
  onBack?: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

const RoomScreen: React.FC<RoomScreenProps> = ({ onBack, onNavigate }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [waitingRoom, setWaitingRoom] = useState<Room | null>(null);
  const { username } = useUser();

  useEffect(() => {

    lobbyWebSocketService.connectWebSocket();
    const unsubscribe = lobbyWebSocketService.addRoomsListener((rooms) => {
      setRooms(rooms);
    });
    lobbyWebSocketService.fetchRooms();
    return () => {
      unsubscribe();
      lobbyWebSocketService.disconnect();
    };
  }, [username]);

  const handleCreateRoom = async (room: CreateRoomForms) => {

    const createdRoom = await lobbyWebSocketService.createRoom(room);
    
    const updatedRoom = rooms.find(r => r.roomId === room.roomId) || createdRoom;
    setWaitingRoom(updatedRoom);
  };

  const handleJoinRoom = async (roomId: string) => {
    const username = getCurrentUsername();
    console.log(username);
    if (!username) {
      alert('Debes iniciar sesión para unirte a una sala.');
      return;
    }
    const joinedRoom = await lobbyWebSocketService.joinRoom(roomId);

    const updatedRoom = rooms.find(r => r.roomId === roomId) || joinedRoom;
    setWaitingRoom(updatedRoom);
  };

 const handleLeaveRoom = async () => {
  if (!waitingRoom) return;
  await lobbyWebSocketService.leaveRoom(waitingRoom.roomId);
  setWaitingRoom(null);
  await lobbyWebSocketService.fetchRooms(); 
};

  if (waitingRoom) {
    return (
      <WaitingRoomScreen
        room={waitingRoom}
        onLeave={handleLeaveRoom}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div className="container">
      <button className="back-btn" onClick={onBack || (() => window.history.back())}>← Volver</button>
      <div className="header">
        <h1> SERPENTIA</h1>
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