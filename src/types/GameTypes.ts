export interface Position {
  x: number;
  y: number;
}

export interface Player {
  id?: string;
  name: string;
  color: string;
  snake: Position[];
  direction: Direction;
  score: number;
  alive: boolean;
  maxScore?: number;
}

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
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export const Direction = {
  UP: 'UP' as const,
  DOWN: 'DOWN' as const,
  LEFT: 'LEFT' as const,
  RIGHT: 'RIGHT' as const
} as const;

export interface GameInput {
  playerId: string;
  direction: Direction;
  timestamp: number;
}

export interface ScoreEvent {
  type: 'SCORE_UPDATE' | 'GAME_END';
  players: Player[];
  playerId?: string;
  pointsGained?: number;
  message?: string;
}

export interface GameEvent {
  type: 'START' | 'UPDATE' | 'END' | 'COLLISION' | 'FRUIT' | 'PLAYER_JOINED' | 'PLAYER_LEFT' | 'FOOD_EATEN' | 'PLAYER_DIED' | 'SCORE_UPDATE' | 'GAME_END';
  gameState?: GameState;
  board?: any;
  playerId?: string;
  playerName?: string;
  score?: number;
  message?: string;
  players?: Player[];
  pointsGained?: number;
} 