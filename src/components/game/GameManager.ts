import Phaser from 'phaser';
import type { GameState, Player, Position, GameInput } from '../../types/types';
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
  
  constructor(scene: Phaser.Scene, localPlayerId: string) {
    this.scene = scene;
    this.localPlayerId = localPlayerId;
    this.gameState = {
      players: new Map(),
      food: [],
      gridSize: 20,
      gameWidth: 800,
      gameHeight: 600,
      gameStatus: 'WAITING',
      roomId: ''
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
    console.log(this.gameState.gameStatus);
    if (this.gameState.gameStatus != 'IN_GAME') {
      //console.log('[FRONT] Juego no está en estado IN_GAME:', this.gameState.gameStatus);
      return;
    }
    
    if (!this.isLocalPlayerAlive()) {
      //console.log('[FRONT] Jugador local no está vivo');
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
      //console.log('[FRONT] Input detectado:', newDirection);
      if (this.isValidMove(newDirection)) {
        //console.log('[FRONT] Enviando movimiento válido:', newDirection);
        this.sendMove(newDirection);
        this.lastMoveTime = currentTime;
        this.lastDirection = newDirection;
      } else {
        //console.log('[FRONT] Movimiento inválido:', newDirection);
      }
    }
  }
  
  private isLocalPlayerAlive(): boolean {
    //console.log('[FRONT] === isLocalPlayerAlive DEBUG ===');
    //console.log('[FRONT] localPlayerId:', this.localPlayerId);
    //console.log('[FRONT] players count:', this.gameState.players.size);
    //console.log('[FRONT] players keys:', Array.from(this.gameState.players.keys()));
    
    const localPlayer = this.gameState.players.get(this.localPlayerId);
    //console.log('[FRONT] localPlayer encontrado:', !!localPlayer);
    
    if (localPlayer) {
      //console.log('[FRONT] localPlayer.alive:', localPlayer.alive);
      //console.log('[FRONT] localPlayer.id:', localPlayer.id);
      //console.log('[FRONT] localPlayer.name:', localPlayer.name);
    }
    
    const result = localPlayer ? localPlayer.alive : false;
    //console.log('[FRONT] isLocalPlayerAlive result:', result);
    //console.log('[FRONT] ==============================');
    
    return result;
  }
  
  private isValidMove(direction: Direction): boolean {
    const localPlayer = this.gameState.players.get(this.localPlayerId);
    if (!localPlayer) {
      //console.log('[FRONT] No se encontró jugador local:', this.localPlayerId);
      return false;
    }
    
    // No permitir movimiento si el jugador no está vivo
    if (!localPlayer.alive) {
      //console.log('[FRONT] Jugador no está vivo');
      return false;
    }
    
    // No permitir movimiento en la dirección opuesta (esto causaría que la serpiente se choque consigo misma)
    if (this.isOppositeDirection(direction, localPlayer.direction)) {
      //console.log('[FRONT] Movimiento en dirección opuesta bloqueado:', direction, 'vs', localPlayer.direction);
      return false;
    }
    
    // Permitir el mismo movimiento si ha pasado suficiente tiempo
    // Esto es más flexible que bloquear completamente el mismo movimiento
    const currentTime = Date.now();
    if (direction === this.lastDirection && (currentTime - this.lastMoveTime) < this.moveDelay) {
      //console.log('[FRONT] Movimiento repetido muy rápido:', direction);
      return false;
    }
    
    //console.log('[FRONT] Movimiento válido:', direction);
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
    //console.log('[FRONT] sendMove llamado con dirección:', direction);
    //console.log('[FRONT] roomId actual:', this.roomId);
    //console.log('[FRONT] localPlayerId:', this.localPlayerId);
    
    if (!this.roomId) {
      //console.error('[FRONT] No hay roomId configurado para enviar movimiento');
      return;
    }
    
    //console.log(`[FRONT] Enviando movimiento: ${direction} para jugador: ${this.localPlayerId}`);
    
    // Convertir Direction enum a string para el backend
    const directionString = this.directionToString(direction);
    //console.log('[FRONT] Dirección convertida a string:', directionString);
    
    try {
      gameService.sendMove(this.roomId, this.localPlayerId, directionString);
      //console.log('[FRONT] sendMove enviado exitosamente');
    } catch (error) {
      //console.error('[FRONT] Error al enviar movimiento:', error);
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
    return {
      x: gridPos.x * this.gameState.gridSize,
      y: gridPos.y * this.gameState.gridSize
    };
  }
  
  // Método para actualizar localPlayerId basándose en los datos del servidor
  private updateLocalPlayerId(serverGameState: GameState): void {
    // Si no hay localPlayerId o no se encuentra en los jugadores del servidor
    if (!this.localPlayerId || !serverGameState.players.has(this.localPlayerId)) {
      //console.log('[FRONT] localPlayerId no encontrado en servidor, buscando coincidencia...');
      
      // Buscar un jugador que coincida por nombre (fallback)
      for (const [playerId, player] of serverGameState.players) {
        if (player.name === this.localPlayerId || player.id === this.localPlayerId) {
          //console.log('[FRONT] Encontrada coincidencia:', playerId, 'para', this.localPlayerId);
          this.localPlayerId = playerId;
          return;
        }
      }
      
      // Si no hay coincidencia, usar el primer jugador disponible
      if (serverGameState.players.size > 0) {
        const firstPlayerId = Array.from(serverGameState.players.keys())[0];
        //console.log('[FRONT] Usando primer jugador disponible:', firstPlayerId);
        this.localPlayerId = firstPlayerId;
      }
    }
  }
  
  // Server reconciliation - MEJORADO
  public updateFromServer(serverGameState: GameState): void {
    //console.log('[FRONT] === updateFromServer DEBUG ===');
    //console.log('[FRONT] localPlayerId actual:', this.localPlayerId);
    //console.log('[FRONT] serverGameState.players count:', serverGameState.players.size);
    //console.log('[FRONT] serverGameState.players keys:', Array.from(serverGameState.players.keys()));
    //console.log('[FRONT] serverGameState.gameStatus:', serverGameState.gameStatus);
    
    // Mostrar detalles de cada jugador
    serverGameState.players.forEach((player, playerId) => {
      console.log(`[FRONT] Player ${playerId}:`, {
        id: player.id,
        name: player.name,
        alive: player.alive,
        score: player.score
      });
    });
    
    // Actualizar localPlayerId si es necesario
    this.updateLocalPlayerId(serverGameState);
    
    // Actualizar el estado directamente sin interpolación problemática
    this.gameState = serverGameState;
    
    // Actualizar visuals inmediatamente
    this.updateVisuals();
    
    //console.log('[FRONT] ==============================');
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
    const { gridSize } = this.gameState;
    const padding = 2;
    
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

      this.playerSprites.set(player.id, sprites);
    });
  }
  
  private renderFood(): void {
    const { gridSize } = this.gameState;
    const padding = 2;
    
    this.gameState.food.forEach(food => {
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
    if (colorString.startsWith('#')) {
      return parseInt(colorString.replace('#', ''), 16);
    }
    return 0x4CAF50; // Color por defecto
  }
  
  // Setter para roomId
  public setRoomId(roomId: string): void {
    //console.log('[FRONT] Configurando roomId:', roomId);
    this.roomId = roomId;
  }
  
  // Setter para localPlayerId
  public setLocalPlayerId(playerId: string): void {
    //console.log('[FRONT] Configurando localPlayerId:', playerId);
    this.localPlayerId = playerId;
  }
  
  // Método para debug del estado
  public debugState(): void {
    //console.log('[FRONT] === DEBUG GAME MANAGER ===');
    //console.log('[FRONT] roomId:', this.roomId);
    //console.log('[FRONT] localPlayerId:', this.localPlayerId);
    //console.log('[FRONT] gameStatus:', this.gameState.gameStatus);
    //console.log('[FRONT] players count:', this.gameState.players.size);
    //console.log('[FRONT] players keys:', Array.from(this.gameState.players.keys()));
    //console.log('[FRONT] local player alive:', this.isLocalPlayerAlive());
    //console.log('[FRONT] lastDirection:', this.lastDirection);
    //console.log('[FRONT] lastMoveTime:', this.lastMoveTime);
    
    // Mostrar detalles del jugador local si existe
    const localPlayer = this.gameState.players.get(this.localPlayerId);
    if (localPlayer) {
      console.log('[FRONT] Local player details:', {
        id: localPlayer.id,
        name: localPlayer.name,
        alive: localPlayer.alive,
        score: localPlayer.score,
        snakeLength: localPlayer.snake.length
      });
    } else {
      //console.log('[FRONT] Local player not found in gameState');
    }
    
    //console.log('[FRONT] ===========================');
  }
  
  // Public methods for React integration
  public getGameState(): GameState {
    return this.gameState;
  }
  
  public getLocalPlayer(): Player | undefined {
    console.log("este es el usuario " + this.localPlayerId);
    return this.gameState.players.get(this.localPlayerId);
  }
  
  public getLeaderboard(): Player[] {
    return Array.from(this.gameState.players.values())
      .sort((a, b) => b.score - a.score);
  }
  
  public destroy(): void {
    // Limpiar event listeners
    this.scene.events.off('update', this.handleInput, this);
    
    // Limpiar visuals
    this.clearVisuals();
  }
}