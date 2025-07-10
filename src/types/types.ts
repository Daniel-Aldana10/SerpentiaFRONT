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
  type: 'CREATED' | 'UPDATED' | 'DELETED' | 'CLEARED';
  room: Room;
  timestamp?: number;
}
export interface Position {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  snake: Position[];
  direction: Direction;
  score: number;
  alive: boolean;
}

export interface GameState {
  roomId: string;
  players: Map<string, Player>;
  food: Position[];
  gridSize: number;
  gameWidth: number;
  gameHeight: number;
  gameStatus: 'WAITING' | 'IN_GAME' | 'ENDED';
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export interface GameInput {
  playerId: string;
  direction: Direction;
  timestamp: number;
}