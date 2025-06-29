import React from 'react';
import type { Screen } from '../App';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onNavigate: (screen: Screen) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNavigate }) => {
  return (
    <div className="welcome-screen">
      <div className="welcome-container">
        <div className="game-logo">
         <h1 className="game-title">
            <span className="serpent-icon"></span>
            SERPENTIA
          </h1>
          <p className="game-subtitle">El juego de la serpiente definitivo</p>
        </div>

        <div className="welcome-content">
          <div className="game-description">
            <p>
              Sumérgete en la experiencia clásica de la serpiente con gráficos modernos,
              power-ups únicos y desafíos emocionantes. ¡Compite por el mejor puntaje!
            </p>
          </div>

          <div className="action-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => onNavigate('login')}
            >
              Iniciar Sesión
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={() => onNavigate('register')}
            >
              Registrarse
            </button>
          </div>

          
        </div>

      </div>
    </div>
  );
};

export default WelcomeScreen;