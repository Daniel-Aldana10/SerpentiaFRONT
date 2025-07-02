import { GameConfig } from '../types/types';

export const GAME_CONFIG: GameConfig = {
  CELL_SIZE: 20,
  COLORS: {
    BACKGROUND: 0x2d3748,
    GRID: 0x4a5568,
    FRUIT: 0xff6b6b,
    PLAYERS: [0x4ecdc4, 0xffe66d, 0xff8b94, 0x95e1d3]
  }
};

export const WEBSOCKET_CONFIG = {
  URL: 'http://localhost:8080/ws',
  API_BASE: 'http://localhost:8080/api'
};