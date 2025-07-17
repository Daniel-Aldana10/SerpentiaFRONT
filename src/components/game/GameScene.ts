import Phaser from 'phaser';
import { GameManager } from './GameManager';

export class GameScene extends Phaser.Scene {
  private gameManager?: GameManager;
  private localPlayerId: string;
  
  constructor() {
    super({ key: 'GameScene' });
    this.localPlayerId = ''; // This would be set from your auth system
  }
  
  public setLocalPlayerId(playerId: string): void {
    this.localPlayerId = playerId;
  }
  
  create(): void {
    console.log('[FRONT] GameScene.create() llamado');
    
    // Inicializar el GameManager
    this.gameManager = new GameManager(this);
    console.log('[FRONT] GameManager creado con playerId:', this.localPlayerId);
    
    // Setup camera
    this.cameras.main.setViewport(0, 0, 800, 600);
    this.cameras.main.setBackgroundColor('#ffffff');
    
    // Grid background
    this.add.grid(400, 300, 800, 600, 20, 20, 0x333333, 0.3);
    
    // Asegurar que el input esté habilitado
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      console.log('[FRONT] Tecla presionada:', event.code);
      // Prevenir comportamiento por defecto de las teclas de navegación
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
        event.preventDefault();
      }
    });
    
    console.log('[FRONT] GameScene setup completado');
  }
  
  update(): void {
    // El GameManager maneja su propio update loop a través del evento 'update'
    // No es necesario llamar nada aquí específicamente para el input
  }
  
  public getGameManager(): GameManager | undefined {
    return this.gameManager;
  }
  
  destroy(): void {
    this.gameManager?.destroy();
  }
}