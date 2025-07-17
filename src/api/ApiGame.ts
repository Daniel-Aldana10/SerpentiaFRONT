import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client';

const WS_URL = import.meta.env.VITE_WS_URL;

class GameService {
  private client: Client | null = null;
  private subscription: any = null;

  connect(roomId: string, token: string, onGameEvent: (event: any) => void) {
    const socket = new SockJS(`${WS_URL}?token=${token}`);
    this.client = new Client({
      webSocketFactory: () => socket,
      debug: () => {},
      onConnect: () => {
        console.log('[FRONT] WebSocket conectado correctamente');
        this.subscription = this.client!.subscribe(`/topic/game/${roomId}`, (msg: IMessage) => {
          const event = JSON.parse(msg.body);
          console.log("[FRONT] Evento recibido del backend:", event);
          onGameEvent(event);
        });
      },
      onDisconnect: () => {
        console.log('[FRONT] WebSocket desconectado');
      },
      onStompError: (frame) => {
        console.error('Error STOMP:', frame);
      }
    });
    this.client.activate();
  }

  sendMove(roomId: string, player: string, direction: string) {
    console.log("se intenta");
    if (!this.client || !this.client.connected) {
      console.error('[FRONT] Cliente WebSocket no conectado');
      return;
    }
    this.client.publish({
      destination: `/app/room/${roomId}/move`,
      body: JSON.stringify({ player, direction })
    });
  }

  disconnect() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    console.log('[FRONT] Servicio de juego desconectado');
  }
}

const gameService = new GameService();
export default gameService;