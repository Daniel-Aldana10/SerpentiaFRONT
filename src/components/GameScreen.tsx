import React, { useEffect, useRef } from 'react';
import type { User } from '../types/types';
import './GameScreen.css';

interface GameScreenProps {
  user: User | null;
  onLogout: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ user, onLogout }) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Aquí inicializarías Phaser cuando el componente se monte
    const initGame = async () => {
      if (gameContainerRef.current) {
        // Placeholder para la inicialización de Phaser
        console.log('Inicializando juego Phaser...');
        
        // Ejemplo de configuración básica de Phaser (comentado para evitar errores)
        /*
        const config = {
          type: Phaser.AUTO,
          width: 800,
          height: 600,
          parent: gameContainerRef.current,
          backgroundColor: '#2c3e50',
          scene: {
            preload: preload,
            create: create,
            update: update
          }
        };
        
        const game = new Phaser.Game(config);
        */
      }
    };

    initGame();

    // Cleanup cuando el componente se desmonte
    return () => {
      console.log('Limpiando juego...');
    };
  }, []);

  return (
    <div className="game-screen">
      <div className="game-header">
        <div className="game-info">
          <h2 className="game-logo">🐍 SERPENTIA</h2>
          {user && (
            <div className="user-info">
              <span>¡Hola, {user.username}!</span>
            </div>
          )}
        </div>
        
        <div className="game-controls">
          <div className="score-display">
            <span>Puntuación: <strong>0</strong></span>
          </div>
          <button className="btn btn-small" onClick={onLogout}>
            {user ? 'Cerrar Sesión' : 'Volver al Inicio'}
          </button>
        </div>
      </div>

      <div className="game-container" ref={gameContainerRef}>
        {/* Aquí se renderizará el juego de Phaser */}
        <div className="game-placeholder">
          <div className="placeholder-content">
            <h3>🐍 Juego Serpentia</h3>
            <p>Aquí se cargará el juego con Phaser</p>
            <div className="game-instructions">
              <h4>Controles:</h4>
              <p>• Usa las flechas del teclado para mover la serpiente</p>
              <p>• Come las frutas para crecer y ganar puntos</p>
              <p>• Evita chocar con las paredes y contigo mismo</p>
            </div>
            <button className="btn btn-primary">
              Iniciar Juego
            </button>
          </div>
        </div>
      </div>

      <div className="game-sidebar">
        <div className="stats-panel">
          <h4>Estadísticas</h4>
          <div className="stat-item">
            <span>Mejor Puntuación:</span>
            <strong>0</strong>
          </div>
          <div className="stat-item">
            <span>Partidas Jugadas:</span>
            <strong>0</strong>
          </div>
          <div className="stat-item">
            <span>Tiempo de Juego:</span>
            <strong>0:00</strong>
          </div>
        </div>

        <div className="leaderboard-panel">
          <h4>Tabla de Líderes</h4>
          <div className="leaderboard-list">
            <div className="leader-item">
              <span className="rank">1.</span>
              <span className="name">Jugador1</span>
              <span className="score">1250</span>
            </div>
            <div className="leader-item">
              <span className="rank">2.</span>
              <span className="name">Jugador2</span>
              <span className="score">980</span>
            </div>
            <div className="leader-item">
              <span className="rank">3.</span>
              <span className="name">Jugador3</span>
              <span className="score">750</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;