import React, { useState } from 'react';
import type { GameMode, CreateRoomForms } from '../types/types';
import { useUser } from '../context/UserContext';

interface Props {
  onCreate: (room: CreateRoomForms) => void;
}

const CreateRoomForm: React.FC<Props> = ({ onCreate }) => {
  const [name, setName] = useState('');
  const [mode, setMode] = useState<GameMode>("COMPETITIVE");
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [powerups, setPowerups] = useState(false);
  const { username } = useUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mode || !maxPlayers) return;
    const newRoom: CreateRoomForms = {
      roomId: name,
      host: username || '',
      gameMode:mode,
      maxPlayers,
      targetScore: 100,
      powerups,
    };
    console.log(mode);
    console.log('Sala creada:', newRoom);
    onCreate(newRoom);
    setName(''); setMode("COMPETITIVE"); setMaxPlayers(2); setPowerups(false);
    // alert(`¡Sala "${newRoom.name}" creada exitosamente!\nID: ${newRoom.id}`);
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
          <select id="gameMode" value={mode} onChange={e => setMode(e.target.value as GameMode)} required>
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
            {[2,3,4].map(n => <option key={n} value={n}>{n} Jugadores</option>)}
          </select>
        </div>
        <div className="form-group">
          <div className="checkbox-group">
            <input id="powerupsEnabled" type="checkbox" checked={powerups} onChange={e => setPowerups(e.target.checked)} />
            <label htmlFor="powerupsEnabled">Habilitar Power-ups</label>
          </div>
        </div>
        <button type="submit" className="btn">🚀 Crear Sala</button>
      </form>
    </section>
  );
};

export default CreateRoomForm;