import React from 'react';
import type { Room, GameMode } from '../../types/types';
import './RoomScreen.css';
import { gameModeLabels } from '../../types/types';

interface Props {
  room: Room;
  onJoin: (id: string) => void;
}

const RoomCard: React.FC<Props> = ({ room, onJoin }) => (
  
  <div className="room-card" onClick={() => onJoin(room.roomId)}>
    <div className="room-header">
      <div className="room-id">{room.roomId}</div>
      <div className="room-status">{"Esperando"}</div>
    </div>
    <h3 style={{ marginBottom: 10, color: '#fff' }}>{room.host}</h3>
    <div className="room-info">
      <div className="room-detail">
        <strong>Modo:</strong> {gameModeLabels[room.gameMode as GameMode]}
        {room.powerups && <span className="powerup-indicator">⚡ Power-ups</span>}
      </div>
      <div className="room-detail">
        <strong>Jugadores:</strong> {room.currentPlayers?.length || 0}/{room.maxPlayers}
      </div>
    </div>
    <button className="btn join-btn">
      {(room.currentPlayers?.length || 0) === room.maxPlayers ? '🎮 En Juego' : '🚀 Unirse'}
    </button>
  </div>
);

export default RoomCard;