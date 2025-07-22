// types/types.ts

// Basic geometry and movement
export interface Position {
  x: number;
  y: number;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export const Direction = {
  UP: 'UP' as const,
  DOWN: 'DOWN' as const,
  LEFT: 'LEFT' as const,
  RIGHT: 'RIGHT' as const
} as const;

// Game modes
export type GameMode = 'COMPETITIVE' | 'TEAM' | 'COOPERATIVE';

export const gameModeLabels: Record<GameMode, string> = {
  COMPETITIVE: 'Competitivo',
  TEAM: 'Equipos',
  COOPERATIVE: 'Colaborativo',
};

// User and authentication
export interface User {
  id?: string;
  username: string;
  email?: string;
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

// Team management
export interface TeamInfo {
  name: string;
  color: string;
  members: string[];
}

// Player definition
export interface Player {
  id?: string;
  name: string;
  color: string;
  snake: Position[];
  direction: Direction;
  score: number;
  alive: boolean;
  maxScore?: number;
  survivalTime?: number;
}

// Room management
export interface Room {
  roomId: string;
  roomName?: string;
  host: string;
  gameMode: GameMode;
  maxPlayers: number;
  currentPlayers: string[];
  targetScore?: number;
  powerups: boolean;
  status: 'WAITING' | 'IN_GAME' | 'FINISHED';
  teams?: { [teamName: string]: TeamInfo };
  playerToTeam?: { [playerName: string]: string };
  isFull?: boolean;
}

export interface CreateRoomForms {
  roomId: string;
  host: string;
  gameMode: GameMode;
  maxPlayers: number;
  targetScore: number;
}

// Game state
export interface GameState {
  roomId: string;
  width: number;
  height: number;
  players: Player[];
  fruits: Position[];
  status: 'WAITING' | 'IN_GAME' | 'FINISHED';
  gridSize?: number;
  gameWidth?: number;
  gameHeight?: number;
  gameMode?: GameMode;
  teams?: { [teamName: string]: TeamInfo };
  playerToTeam?: { [playerName: string]: string };
  targetScore?: number;
}

// Game input
export interface GameInput {
  playerId: string;
  direction: Direction;
  timestamp: number;
}

// Events
export interface GameEvent {
  type: 'START' | 'UPDATE' | 'END' | 'COLLISION' | 'FRUIT' | 'FINISHED' | 'SCORE_UPDATE' | 'GAME_END' | 'PLAYER_JOIN' | 'PLAYER_LEAVE';
  gameState?: GameState;
  board?: any;
  playerId?: string;
  playerName?: string;
  score?: number;
  message?: string;
  players?: Player[];
  pointsGained?: number;
}

export interface ScoreEvent {
  type: 'SCORE_UPDATE' | 'GAME_END';
  players: Player[];
  playerId?: string;
  pointsGained?: number;
  message?: string;
}

export interface RoomEvent {
  type: 'CREATED' | 'UPDATED' | 'DELETED' | 'CLEARED';
  room: Room;
  timestamp?: number;
}