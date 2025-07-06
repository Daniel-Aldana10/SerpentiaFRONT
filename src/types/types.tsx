export interface User {
  username: string;
}
export interface AuthRequest {
  username: string;
  password: string;
}
export interface RegisterRequest {
  username: string;
  password: string;
  email: string;  
}
export type GameMode = 'COMPETITIVE' | 'TEAM' | 'COOPERATIVE';  

export interface Room {
  roomId: string;
  host: string;
  gameMode: string;
  maxPlayers: number;
  currentPlayers: string[];
  powerups: boolean;
  isFull?: boolean;
}

export interface CreateRoomForms{
    roomId: string;
    host:string;
    gameMode: string;
    maxPlayers: number;
    targetScore: 100;
    powerups: boolean;
}
export const gameModeLabels: Record<GameMode, string> = {
  COMPETITIVE: 'Competitivo',
  TEAM: 'Equipos',
  COOPERATIVE: 'Colaborativo',
};

export interface RoomEvent {
  type: 'CREATED' | 'UPDATED' | 'DELETED' | 'JOINED' | 'LEFT';
  room: Room;
  timestamp?: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface BoardState {
  roomId: string;
  width: number;
  height: number;
  snakePositions: Record<string, Point[]>;
  snakeDirections: Record<string, string>;
  fruits: Point[];
  status: string;
}

export interface GameEvent {
  type: 'START' | 'UPDATE' | 'FRUIT' | 'COLLISION' | 'END';
  player: string | null;
  board: BoardState;
  message?: string;
}
