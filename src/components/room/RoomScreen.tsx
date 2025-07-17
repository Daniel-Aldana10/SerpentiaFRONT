import React, { useEffect } from 'react';
import CreateRoomForm from './CreateRoomForm';
import RoomList from './RoomList';
import type { Room, CreateRoomForms } from '../../types/types';
import '../AuthScreen.css';
import './RoomScreen.css';
import webSocketService from '../../api/WebSocketService';
import lobbyService, { getCurrentUsername } from '../../api/ApiLobby';
import WaitingRoomScreen from './WaitingRoomScreen';
import { useUser } from '../../context/UserContext';

interface RoomScreenProps {
  onBack?: () => void;
  onNavigate: (screen: string, params?: any) => void;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  onProfileClick?: () => void;
}

const RoomScreen: React.FC<RoomScreenProps> = ({ onBack, onNavigate, rooms, setRooms, onProfileClick }) => {
  const [waitingRoom, setWaitingRoom] = React.useState<Room | null>(null);
  const { username } = useUser();

  useEffect(() => {
    webSocketService.connect();
    webSocketService.addLobbyListener(setRooms);
    lobbyService.fetchRooms().then((rooms) => {
      if (rooms && rooms.length > 0) setRooms(rooms);
    });
  }, [username, setRooms]);

  const handleCreateRoom = async (room: CreateRoomForms) => {
    try {
      const createdRoom = await lobbyService.createRoom(room);
      setWaitingRoom(createdRoom);
    } catch (error) {
      console.error('Error creando sala:', error);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    const username = getCurrentUsername();
    console.log('[JOIN ROOM] username:', username);
    if (!username) {
      alert('Debes iniciar sesión para unirte a una sala.');
      return;
    }
    try {
      const joinedRoom = await lobbyService.joinRoom(roomId);
      const updatedRoom = rooms.find(r => r.roomId === roomId) || joinedRoom;
      setWaitingRoom(updatedRoom);
      console.log('[JOIN ROOM] updatedRoom:', updatedRoom);
    } catch (error) {
      console.error('Error uniéndose a sala:', error);
    }
  };

  const handleLeaveRoom = async () => {
    if (!waitingRoom) return;
    try {
      await lobbyService.leaveRoom(waitingRoom.roomId);
      setWaitingRoom(null);
    } catch (error) {
      console.error('Error saliendo de la sala:', error);
    }
  };

  if (waitingRoom) {
    console.log('[RENDER] WaitingRoomScreen con:', waitingRoom);
    return (
      <WaitingRoomScreen
        room={waitingRoom}
        rooms={rooms}
        onLeave={handleLeaveRoom}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div className="container">
      <button className="back-btn" onClick={onBack || (() => window.history.back())}>← Volver</button>
      
      {onProfileClick && (
    <div className="profile-btn-container">
      <button className="btn btn-primary full-width" onClick={onProfileClick}>
        Perfil
      </button>
    </div>
    )}  
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