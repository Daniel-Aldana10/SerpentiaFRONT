import { Client } from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client';
import type { Room } from '../types/types';

type LobbyListener = (rooms: Room[]) => void;
type GameListener = (event: any) => void;

class WebSocketService {
  private client: Client | null = null;
  private connected = false;
  private lobbyListeners: LobbyListener[] = [];
  private rooms: Room[] = [];
  private lobbySubscribed = false;

  // Listeners y suscripciones para el juego
  private gameListeners: { [roomId: string]: GameListener[] } = {};
  private gameSubscriptions: { [roomId: string]: any } = {};

  connect() {
    if (this.client && this.connected) return;
    const token = localStorage.getItem('authToken');
    if (!token) return;
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_WS_URL}?token=${token}`),
      debug: () => {},
      onConnect: () => {
        this.connected = true;
        if (!this.lobbySubscribed) {
          this.client!.subscribe('/topic/lobby', (msg) => {
            const event = JSON.parse(msg.body);
            switch (event.type) {
              case 'CREATED':
                if (!this.rooms.some(room => room.roomId === event.room.roomId)) {
                  this.rooms = [...this.rooms, event.room];
                }
                break;
              case 'UPDATED':
                this.rooms = this.rooms.map(room =>
                  room.roomId === event.room.roomId ? event.room : room
                );
                break;
              case 'DELETED':
                this.rooms = this.rooms.filter(room => room.roomId !== event.room.roomId);
                break;
              case 'CLEARED':
                this.rooms = [];
                break;
            }
            this.lobbyListeners.forEach(listener => listener([...this.rooms]));
          });
          this.lobbySubscribed = true;
        }
        // Suscribir a juegos existentes si hay listeners
        Object.keys(this.gameListeners).forEach(roomId => {
          if (!this.gameSubscriptions[roomId]) {
            this.gameSubscriptions[roomId] = this.client!.subscribe(`/topic/game/${roomId}`, (msg) => {
              const event = JSON.parse(msg.body);
              this.gameListeners[roomId].forEach(l => l(event));
            });
          }
        });
      },
      onDisconnect: () => { this.connected = false; },
      onStompError: (frame) => { console.error('STOMP error:', frame); }
    });
    this.client.activate();
  }

  disconnect() {
    // Desuscribirse de todos los topics
    Object.values(this.gameSubscriptions).forEach(sub => sub.unsubscribe && sub.unsubscribe());
    this.gameSubscriptions = {};
    this.gameListeners = {};
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connected = false;
    }
    this.lobbySubscribed = false;
  }

  addLobbyListener(listener: LobbyListener) {
    this.lobbyListeners.push(listener);
    listener([...this.rooms]);
    return () => {
      this.lobbyListeners = this.lobbyListeners.filter(l => l !== listener);
    };
  }

  addGameListener(roomId: string, listener: GameListener) {
    if (!this.gameListeners[roomId]) {
      this.gameListeners[roomId] = [];
    }
    this.gameListeners[roomId].push(listener);

    const subscribeToGame = () => {
      if (!this.gameSubscriptions[roomId]) {
        this.gameSubscriptions[roomId] = this.client!.subscribe(`/topic/game/${roomId}`, (msg) => {
          const event = JSON.parse(msg.body);
          this.gameListeners[roomId].forEach(l => l(event));
        });
        
      }
    };

    if (this.connected) {
      subscribeToGame();
    } else {
      // Espera a que se conecte y luego suscríbete
      const originalOnConnect = this.client?.onConnect;
      this.client!.onConnect = (frame) => {
        if (originalOnConnect) originalOnConnect(frame);
        subscribeToGame();
      };
    }

    return () => {
      this.gameListeners[roomId] = this.gameListeners[roomId].filter(l => l !== listener);
      if (this.gameListeners[roomId].length === 0 && this.gameSubscriptions[roomId]) {
        this.gameSubscriptions[roomId].unsubscribe();
        delete this.gameSubscriptions[roomId];
        delete this.gameListeners[roomId];
      }
    };
  }
}

const webSocketService = new WebSocketService();
export default webSocketService; 