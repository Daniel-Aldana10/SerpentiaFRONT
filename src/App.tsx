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
  const [rooms, setRooms] = useState<Room[]>([]);

  const handleLogin = (token: string) => {
    setCurrentScreen('rooms');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('welcome');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onNavigate={setCurrentScreen} />;
      case 'login':
        return <LoginScreen onNavigate={setCurrentScreen} onLogin={handleLogin} />;
      case 'register':
        return <RegisterScreen onNavigate={setCurrentScreen} onLogin={handleLogin} />;
      case 'rooms':
        return <RoomScreen onBack={() => setCurrentScreen('welcome')} username={user?.username} />;
      case 'game':
        return <GameScreen user={user} onLogout={handleLogout} />;
      default:
        return <WelcomeScreen onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="centered-container">
      {renderScreen()}
    </div>
  );
}

export default App;