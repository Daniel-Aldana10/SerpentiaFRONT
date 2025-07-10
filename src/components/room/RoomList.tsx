import React from 'react';
import type { Room } from '../../types/types';
import RoomCard from './RoomCard';


interface Props {
  rooms: Room[];
  onJoin: (id: string) => void;
}

const RoomList: React.FC<Props> = ({ rooms, onJoin }) => (
  
  <div className="container">
    <header className="header">
      <h1>Salas Activas</h1>
    </header>
    <div className="rooms-list-section">
      <div className ="rooms-grid" >
        <section className="rooms-list-section">
          <div className="rooms-card" id="roomsList">
            {rooms.length === 0 ? (
              <div className="no-rooms">No hay salas activas en este momento</div>
            ) : rooms.map(room => (
              <RoomCard key={room.roomId} room={room} onJoin={onJoin} />
            ))}
          </div>
        </section>
      </div>
    </div>
  </div>
 
);

export default RoomList;
