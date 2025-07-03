import { Client } from '@stomp/stompjs';
// @ts-ignore
import SockJS from 'sockjs-client';
import type { Room, CreateRoomForms, RoomEvent } from '../types/types';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from './ApiAxios';

interface TokenPayload {
  sub: string;
  iat: number;
}

export const getCurrentUsername = (): string => {
  const token = localStorage.getItem('authToken');
 
  if (!token) {
   
    return '';
  }

  try {
    const decoded = jwtDecode<TokenPayload>(token);
   
    return decoded.sub || '';
  } catch (error) {
    console.error('Error decodificando token:', error);
    return '';
  }
};


const WS_URL = import.meta.env.VITE_WS_URL; 

class LobbyService {
  rooms: Room[] = [];
  listeners: ((rooms: Room[]) => void)[] = [];
  stompClient: Client | null = null;
  connected: boolean = false;

  constructor() {
   
  }

  connectWebSocket() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No se puede conectar WebSocket: no hay token');
      return;
    }

    const socket = new SockJS(`${WS_URL}?token=${token}`); // 💡 token como query param

    this.stompClient = new Client({
      webSocketFactory: () => socket,
      debug: () => {},
      onConnect: () => {
        this.connected = true;
        this.subscribeToEvents();
      },
      onDisconnect: () => {
        this.connected = false;
      },
      onStompError: (frame) => {
        console.error('Error STOMP:', frame);
      }
    });

    this.stompClient.activate();
  }

  subscribeToEvents() {
    if (!this.stompClient) return;

    this.stompClient.subscribe('/topic/lobby', (message) => {
      try {
        const event: RoomEvent = JSON.parse(message.body);
        console.log('Evento recibido del lobby:', event);

        switch (event.type) {
          case 'DELETED':
            this.rooms = this.rooms.filter(room => room.roomId !== event.room.roomId);
            break;
          case 'JOINED':
          case 'LEFT':
          case 'UPDATED':
            this.rooms = this.rooms.map(room =>
              room.roomId === event.room.roomId ? event.room : room
            );
            // Si la sala no existe, la agregamos
            if (!this.rooms.some(room => room.roomId === event.room.roomId)) {
              this.rooms = [...this.rooms, event.room];
            }
            break;
          case 'CREATED':
            // Solo agregar si no existe
            if (!this.rooms.some(room => room.roomId === event.room.roomId)) {
              this.rooms = [...this.rooms, event.room];
            }
            break;
        }

        this.listeners.forEach(listener => listener([...this.rooms]));
      } catch (error) {
        console.error('Error parseando evento del lobby:', error);
      }
    });
  }

  addRoomsListener(listener: (rooms: Room[]) => void) {
    this.listeners.push(listener);
    if (this.rooms.length > 0) listener(this.rooms);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  async fetchRooms() {
    try {
      const response = await axiosInstance.get('/lobby/rooms');
      this.rooms = response.data;
      this.listeners.forEach(listener => listener(this.rooms));
    } catch (error: any) {
      console.error('Error obteniendo salas:', error);
    }
  }

  async createRoom(room: CreateRoomForms) {
    try {
      room.host = getCurrentUsername();
      const response = await axiosInstance.post('/lobby/rooms', room);
      await this.fetchRooms();
      return response.data;
    } catch (error) {
      console.error('Error creando sala:', error);
      throw error;
    }
  }

  async joinRoom(roomId: string) {
    try {
      const response = await axiosInstance.post(`/lobby/rooms/${roomId}/join`);
      await this.fetchRooms();
      return response.data;
    } catch (error) {
      console.error('Error uniéndose a sala:', error);
      throw error;
    }
  }

  async leaveRoom(roomId: string) {
    try {
      await axiosInstance.delete(`/lobby/rooms/${roomId}/leave`);
    } catch (error: any) {
      console.error('Error saliendo de la sala:', error);
    }
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }

  async startGame(roomId: string) {
    try {
      await axiosInstance.post(`/game/start/${roomId}`);
    } catch (error: any) {
      console.error('Error uniendose de la sala:', error);
    }
  }
}

const lobbyService = new LobbyService();
export default lobbyService;
