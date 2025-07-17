import { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import GameScreen from './components/game/GameScreen';
import RoomScreen from './components/room/RoomScreen';
import './App.css';
import type { User, Room } from './types/types';
import WaitingRoomScreen from './components/room/WaitingRoomScreen';
import lobbyWebSocketService from './api/ApiLobby';
import webSocketService from './api/WebSocketService';
import UserStatistics from './components/UserStatistics'; // Nuevo componente
export type Screen = 'welcome' | 'login' | 'register' | 'game' | 'rooms' | 'waitingRoom' | 'profile';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [user, setUser] = useState<User | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentBoard, setCurrentBoard] = useState<any>(null);
  const [rooms, setRooms] = useState<Room[]>([]); // <-- rooms global

  // Navegación centralizada
  const handleNavigate = (screen: string, params?: any) => {
    if (screen === 'waitingRoom' && params?.room) {
      setCurrentRoom(params.room);
    }
    setCurrentScreen(screen as Screen);
    if (params?.room) setCurrentRoom(params.room);
    if (params?.board) setCurrentBoard(params.board);
    if (params?.user) setUser(params.user);
    if (params?.rooms) setRooms(params.rooms);
    if (screen === 'profile') {
      webSocketService.disconnect(); // Desconecta el WebSocket al entrar al perfil
    }
  };

  const handleLogin = (token: string) => {
    setCurrentScreen('rooms');
    // Aquí podrías setear el usuario si lo obtienes del token
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('welcome');
    setCurrentRoom(null);
  };

  const handleLeaveWaitingRoom = async () => {
    if (currentRoom) {
      await lobbyWebSocketService.leaveRoom(currentRoom.roomId);
    }
    setCurrentRoom(null);
    setCurrentScreen('rooms');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onNavigate={handleNavigate} />;
      case 'login':
        return <LoginScreen onNavigate={handleNavigate} onLogin={handleLogin} />;
      case 'register':
        return <RegisterScreen onNavigate={handleNavigate} onLogin={handleLogin} />;
      case 'rooms':
        return (
          <RoomScreen
            onBack={() => setCurrentScreen('welcome')}
            onNavigate={handleNavigate}
            rooms={rooms}
            setRooms={setRooms}
            user={user}
            onProfileClick={() => handleNavigate('profile')}
          />
        );
      case 'game':
        return (
          <GameScreen
            user={user}
            room={currentRoom!}
            board={currentBoard}
            rooms={rooms}
            onNavigate={handleNavigate}
          />
        );
      case 'waitingRoom':
        return currentRoom ? (
          <WaitingRoomScreen
            room={currentRoom}
            rooms={rooms}
            onLeave={handleLeaveWaitingRoom}
            onNavigate={handleNavigate}
          />
        ) : null;
      case 'profile':
        return <UserStatistics onNavigate={handleNavigate} />;
      default:
        return <WelcomeScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="centered-container">
      {renderScreen()}
    </div>
  );
}

export default App;