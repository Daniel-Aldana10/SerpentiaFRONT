import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client';
import type { GameEvent } from '../types/types';

const WS_URL = import.meta.env.VITE_WS_URL;

class GameService {
  private client: Client | null = null;
  private subscription: any = null;

  connect(roomId: string, token: string, onGameEvent: (event: GameEvent) => void) {
    const socket = new SockJS(`${WS_URL}?token=${token}`);
    this.client = new Client({
      webSocketFactory: () => socket,
      debug: () => {},
      onConnect: () => {
        this.subscription = this.client!.subscribe(`/topic/game/${roomId}`, (msg: IMessage) => {
          onGameEvent(JSON.parse(msg.body));
        });
      },
      onDisconnect: () => {},
      onStompError: (frame) => {
        console.error('Error STOMP:', frame);
      }
    });
    this.client.activate();
  }

  sendMove(roomId: string, player: string, direction: string) {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination: `/app/game/room/${roomId}/move`,
        body: JSON.stringify({ player, direction })
      });
    }
  }

  disconnect() {
    if (this.subscription) this.subscription.unsubscribe();
    if (this.client) this.client.deactivate();
    this.client = null;
    this.subscription = null;
  }
}

const gameService = new GameService();
export default gameService; 