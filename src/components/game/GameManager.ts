import Phaser from 'phaser';
import type { GameState, Player, Position } from '../../types/types';
import { Direction } from '../../types/types';
import gameService from '../../api/ApiGame';
import { getCurrentUsername } from '../../api/ApiLobby';

export class GameManager {
  private scene: Phaser.Scene;
  private gameState: GameState;
  private localPlayerId: string = getCurrentUsername();
  private roomId: string | null = null;
  
  // Visual elements
  private playerSprites: Map<string, Phaser.GameObjects.Graphics[]> = new Map();
  private foodSprites: Phaser.GameObjects.Graphics[] = [];
  
  // Input system
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys?: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private lastMoveTime: number = 0;
  private moveDelay: number = 150; // Delay mínimo entre movimientos (ms)
  private lastDirection: Direction | null = null;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.localPlayerId = getCurrentUsername();
    
    this.gameState = {
      roomId: '',
      width: 40,
      height: 30,
      players: [],
      fruits: [],
      status: 'WAITING'
    };
    this.setupInputHandlers();
  }
  
  private setupInputHandlers(): void {
    // Configurar teclas de cursor (flechas)
    this.cursors = this.scene.input.keyboard?.createCursorKeys();
    
    // Configurar teclas WASD
    if (this.scene.input.keyboard) {
      this.wasdKeys = {
        W: this.scene.input.keyboard.addKey('W'),
        A: this.scene.input.keyboard.addKey('A'),
        S: this.scene.input.keyboard.addKey('S'),
        D: this.scene.input.keyboard.addKey('D')
      };
    }
    
    // Configurar el update loop para detectar input
    this.scene.events.on('update', this.handleInput, this);
  }
  
  private handleInput(): void {
    // Solo procesar input si el juego está activo y el jugador está vivo
    if (this.gameState.status !== 'IN_GAME') {
      return;
    }
    
    if (!this.isLocalPlayerAlive()) {
      return;
    }
    
    // Verificar delay entre movimientos
    const currentTime = Date.now();
    if (currentTime - this.lastMoveTime < this.moveDelay) {
      return;
    }
    
    let newDirection: Direction | null = null;
    
    // Detectar input de las flechas
    if (this.cursors) {
      if (this.cursors.up.isDown) {
        newDirection = Direction.UP;
      } else if (this.cursors.down.isDown) {
        newDirection = Direction.DOWN;
      } else if (this.cursors.left.isDown) {
        newDirection = Direction.LEFT;
      } else if (this.cursors.right.isDown) {
        newDirection = Direction.RIGHT;
      }
    }
    
    // Detectar input de WASD (solo si no se detectó input de flechas)
    if (!newDirection && this.wasdKeys) {
      if (this.wasdKeys.W.isDown) {
        newDirection = Direction.UP;
      } else if (this.wasdKeys.S.isDown) {
        newDirection = Direction.DOWN;
      } else if (this.wasdKeys.A.isDown) {
        newDirection = Direction.LEFT;
      } else if (this.wasdKeys.D.isDown) {
        newDirection = Direction.RIGHT;
      }
    }
    
    // Procesar el movimiento si se detectó una dirección válida
    if (newDirection) {
      if (this.isValidMove(newDirection)) {
        this.sendMove(newDirection);
        this.lastMoveTime = currentTime;
        this.lastDirection = newDirection;
      }
    }
  }
  
  private isLocalPlayerAlive(): boolean {
    const localPlayer = this.getLocalPlayer();
    
    return localPlayer !== undefined && localPlayer.alive;
  }
  
  private isValidMove(direction: Direction): boolean {
    const localPlayer = this.getLocalPlayer();
    if (!localPlayer) {
      return false;
    }
    
    // No permitir movimiento si el jugador no está vivo
    if (!localPlayer.alive) {
      return false;
    }
    
    // No permitir movimiento en la dirección opuesta
    if (this.isOppositeDirection(direction, localPlayer.direction)) {
      return false;
    }
    
    // Permitir el mismo movimiento si ha pasado suficiente tiempo
    const currentTime = Date.now();
    if (direction === this.lastDirection && (currentTime - this.lastMoveTime) < this.moveDelay) {
      return false;
    }
    
    return true;
  }
  
  private isOppositeDirection(newDirection: Direction, currentDirection: Direction): boolean {
    const opposites = {
      [Direction.UP]: Direction.DOWN,
      [Direction.DOWN]: Direction.UP,
      [Direction.LEFT]: Direction.RIGHT,
      [Direction.RIGHT]: Direction.LEFT
    };
    
    return opposites[newDirection] === currentDirection;
  }
  
  private sendMove(direction: Direction): void {
    if (!this.roomId) {
      return;
    }
    
    const directionString = this.directionToString(direction);
    
    try {
      gameService.sendMove(this.roomId, this.localPlayerId, directionString);
    } catch (error) {
      console.error('[FRONT] Error al enviar movimiento:', error);
    }
  }
  
  private directionToString(direction: Direction): string {
    switch (direction) {
      case Direction.UP:
        return 'UP';
      case Direction.DOWN:
        return 'DOWN';
      case Direction.LEFT:
        return 'LEFT';
      case Direction.RIGHT:
        return 'RIGHT';
      default:
        return 'UP';
    }
  }
  
  // Función para convertir coordenadas de grilla a píxeles
  private gridToPixel(gridPos: Position): Position {
    const gridSize = this.gameState.gridSize || 20;
    return {
      x: gridPos.x * gridSize,
      y: gridPos.y * gridSize
    };
  }
  
  // Método para actualizar localPlayerId basándose en los datos del servidor
  private updateLocalPlayerId(serverGameState: GameState): void {
    // Si no hay localPlayerId o no se encuentra en los jugadores del servidor
    if (!this.localPlayerId || !Array.isArray(serverGameState.players) || !serverGameState.players.find(p => p.name === this.localPlayerId || p.id === this.localPlayerId)) {
      // Buscar un jugador que coincida por nombre (fallback)
      if (Array.isArray(serverGameState.players)) {
        for (const player of serverGameState.players) {
          if (player.name === this.localPlayerId || player.id === this.localPlayerId) {
            this.localPlayerId = player.name;
            return;
          }
        }
      }
    }
  }
  
  // Server reconciliation - MEJORADO
  public updateFromServer(serverGameState: GameState): void {
    
    // Actualizar localPlayerId si es necesario
    this.updateLocalPlayerId(serverGameState);
    
    // Actualizar el estado directamente
    this.gameState = serverGameState;
    
    // Actualizar visuals inmediatamente
    this.updateVisuals();
    
  }
  
  // Función de actualización visual MEJORADA
  private updateVisuals(): void {
    this.clearVisuals();
    this.renderPlayers();
    this.renderFood();
  }
  
  private clearVisuals(): void {
    // Limpiar sprites de jugadores
    this.playerSprites.forEach(sprites => {
      sprites.forEach(sprite => {
        if (sprite) {
          sprite.destroy();
        }
      });
    });
    this.playerSprites.clear();
    
    // Limpiar sprites de comida
    this.foodSprites.forEach(sprite => {
      if (sprite) {
        sprite.destroy();
      }
    });
    this.foodSprites = [];
  }
  
  private renderPlayers(): void {
    const gridSize = this.gameState.gridSize || 20;
    const padding = 2;
    
    if (!Array.isArray(this.gameState.players)) {
      return;
    }
    
    this.gameState.players.forEach((player) => {
      if (!player.alive) return;
      
      const sprites: Phaser.GameObjects.Graphics[] = [];

      player.snake.forEach((segment, index) => {
        const graphics = this.scene.add.graphics();
        
        // Convertir coordenadas de grilla a píxeles
        const pixelPos = this.gridToPixel(segment);
        
        // Determinar el color según el jugador
        const color = this.getPlayerColor(player.color);
        
        if (index === 0) {
          // Cabeza de la serpiente
          graphics.fillStyle(color);
          graphics.fillRoundedRect(
            padding, 
            padding, 
            gridSize - 2 * padding, 
            gridSize - 2 * padding, 
            3
          );
        } else {
          // Cuerpo de la serpiente
          graphics.fillStyle(color, 0.8);
          graphics.fillRect(
            padding, 
            padding, 
            gridSize - 2 * padding, 
            gridSize - 2 * padding
          );
        }

        // Posicionar el sprite en las coordenadas de píxel
        graphics.setPosition(pixelPos.x, pixelPos.y);
        sprites.push(graphics);
      });

      this.playerSprites.set(player.name, sprites);
    });
  }
  
  private renderFood(): void {
    const gridSize = this.gameState.gridSize || 20;
    const padding = 2;
    
    if (!Array.isArray(this.gameState.fruits)) {
      return;
    }
    
    this.gameState.fruits.forEach(food => {
      const graphics = this.scene.add.graphics();
      
      // Convertir coordenadas de grilla a píxeles
      const pixelPos = this.gridToPixel(food);
      
      // Dibujar comida como círculo rojo
      graphics.fillStyle(0xff0000);
      graphics.fillCircle(
        gridSize / 2, 
        gridSize / 2, 
        (gridSize / 2) - padding
      );
      
      // Posicionar en coordenadas de píxel
      graphics.setPosition(pixelPos.x, pixelPos.y);
      this.foodSprites.push(graphics);
    });
  }
  
  // Función helper para obtener color del jugador
  private getPlayerColor(colorString: string): number {
    let color: number;
    if (colorString.startsWith('#')) {
      color = Number('0x' + colorString.slice(1));
    } else if (/^[0-9A-Fa-f]{6}$/.test(colorString)) {
      color = Number('0x' + colorString);
    } else {
      color = 0x4CAF50;
    }
    // Depuración: muestra el color recibido y el valor convertido
    console.log('Color recibido:', colorString, 'Color usado:', color);
    return color;
  }
  
  // Setter para roomId
  public setRoomId(roomId: string): void {
    this.roomId = roomId;
  }
  
  // Setter para localPlayerId
  public setLocalPlayerId(playerId: string): void {
    this.localPlayerId = playerId;
  }
  
  // Método para debug del estado
  public debugState(): void {
    const localPlayer = this.getLocalPlayer();
    if (localPlayer) {
      console.log('[FRONT] Local player details:', {
        id: localPlayer.id,
        name: localPlayer.name,
        alive: localPlayer.alive,
        score: localPlayer.score,
        snakeLength: localPlayer.snake.length
      });
    } else {
      console.log('[FRONT] Local player not found in gameState');
    }
    
  }
  
  // Public methods for React integration
  public getGameState(): GameState {
    return this.gameState;
  }
  
  public getLocalPlayer(): Player | undefined {
    
    if (!Array.isArray(this.gameState.players)) {
      return undefined;
    }
    
    const foundPlayer = this.gameState.players.find(p => {
      const nameMatch = p.name === this.localPlayerId;
      const idMatch = p.id === this.localPlayerId;
      return nameMatch || idMatch;
    });
    
    return foundPlayer;
  }
  
  public getLeaderboard(): Player[] {
    return Array.isArray(this.gameState.players) 
      ? [...this.gameState.players].sort((a, b) => b.score - a.score)
      : [];
  }
  
  public destroy(): void {
    // Limpiar event listeners
    this.scene.events.off('update', this.handleInput, this);
    
    // Limpiar visuals
    this.clearVisuals();
  }
}