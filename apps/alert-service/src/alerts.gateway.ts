import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class AlertsGateway {
  @WebSocketServer()
  server: Server;

  emitPriceChange(payload: {
    player: string;
    oldPrice: number;
    newPrice: number;
  }) {
    this.server.emit('price-change', payload);
  }
}
