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
  players: Map<string, Player>;
  food: Position[];
  gridSize: number;
  gameWidth: number;
  gameHeight: number;
  gameStatus: 'WAITING' | 'IN_GAME' | 'ENDED';
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

export interface GameEvent {
  type: 'START' | 'UPDATE' | 'END' | 'COLLISION' | 'FRUIT' | 'PLAYER_JOINED' | 'PLAYER_LEFT' | 'FOOD_EATEN' | 'PLAYER_DIED';
  gameState?: GameState;
  playerId?: string;
  playerName?: string;
  score?: number;
  message?: string;
} 