import React, { useState } from 'react';
import type { GameMode, CreateRoomForms } from '../../types/types';
import { useUser } from '../../context/UserContext';

interface Props {
  onCreate: (room: CreateRoomForms) => void;
}

const CreateRoomForm: React.FC<Props> = ({ onCreate }) => {
  const [name, setName] = useState('');
  const [mode, setMode] = useState<GameMode>("COMPETITIVE");
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [targetScore, setTargetScore] = useState(100);
  const [error, setError] = useState('');
  const { username } = useUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !mode || !maxPlayers) return;

    if (mode === "TEAM" && maxPlayers < 4) {
      setError("El modo por equipos requiere al menos 4 jugadores.");
      return;
    }

    const newRoom: CreateRoomForms = {
      roomId: name,
      host: username || '',
      gameMode: mode,
      maxPlayers,
      targetScore,
    };

    onCreate(newRoom);
    setName('');
    setMode("COMPETITIVE");
    setMaxPlayers(2);
    setTargetScore(100);
  };

  // Jugadores válidos dependiendo del modo
  const getValidPlayers = () => {
    if (mode === "TEAM") return [4]; // podrías permitir más si lo decides
    return [2, 3, 4];
  };

  return (
    <section className="create-room-section">
      <h2 className="section-title">Crear Nueva Sala</h2>
      <form onSubmit={handleSubmit} id="createRoomForm">
        <div className="form-group">
          <label htmlFor="roomName">Nombre de la Sala:</label>
          <input id="roomName" value={name} onChange={e => setName(e.target.value)} placeholder="Mi Sala Épica" maxLength={20} required />
        </div>

        <div className="form-group">
          <label htmlFor="gameMode">Modo de Juego:</label>
          <select
            id="gameMode"
            value={mode}
            onChange={e => {
              const newMode = e.target.value as GameMode;
              setMode(newMode);
              // Asegurar valor válido al cambiar a TEAM
              if (newMode === "TEAM" && maxPlayers < 4) setMaxPlayers(4);
            }}
            required
          >
            <option value="">Seleccionar modo</option>
            <option value="COMPETITIVE">Competitivo</option>
            <option value="TEAM">Equipos</option>
            <option value="COOPERATIVE">Colaborativo</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="maxPlayers">Número de Jugadores:</label>
          <select id="maxPlayers" value={maxPlayers} onChange={e => setMaxPlayers(Number(e.target.value))} required>
            <option value="">Seleccionar jugadores</option>
            {getValidPlayers().map(n => (
              <option key={n} value={n}>{n} Jugadores</option>
            ))}
          </select>
        </div>

       <div className="form-group">
        <label htmlFor="targetScore">Puntaje para ganar:</label>
        <select
          id="targetScore"
          value={targetScore}
          onChange={e => setTargetScore(Number(e.target.value))}
          required
        >
          {[...Array(9)].map((_, i) => {
            const score = 100 + i * 50;
            return (
              <option key={score} value={score}>
                {score} puntos
              </option>
            );
          })}
        </select>
      </div>



       

        {error && <p className="error-msg" style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

        <button type="submit" className="btn">🚀 Crear Sala</button>
      </form>
    </section>
  );
};

export default CreateRoomForm;
