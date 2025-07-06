import { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import GameScreen from './components/GameScreen';
import RoomScreen from './components/RoomScreen';
import './App.css';
import type { User, Room } from './types/types';
export type Screen = 'welcome' | 'login' | 'register' | 'game' | 'rooms';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [user, setUser] = useState<User | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  // Navegación centralizada
  const handleNavigate = (screen: Screen, params?: any) => {
    setCurrentScreen(screen);
    if (params?.room) setCurrentRoom(params.room);
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

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onNavigate={handleNavigate} />;
      case 'login':
        return <LoginScreen onNavigate={handleNavigate} onLogin={handleLogin} />;
      case 'register':
        return <RegisterScreen onNavigate={handleNavigate} onLogin={handleLogin} />;
      case 'rooms':
        return <RoomScreen onBack={() => setCurrentScreen('welcome')} onNavigate={handleNavigate} />;
      case 'game':
        return (
          <GameScreen
            user={user}
            room={currentRoom!}
            onLogout={handleLogout}
          />
        );
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