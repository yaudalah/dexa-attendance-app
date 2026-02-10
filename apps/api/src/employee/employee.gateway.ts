import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Employee } from './entities/employee.entity';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173' },
})
export class EmployeeGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('WebSocket Gateway initialized');
  }

  emitProfileUpdated(employee: Employee) {
    this.server.emit('profile-updated', {
      message: 'Real-time Alert',
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        photoUrl: employee.photoUrl,
        position: employee.position,
      },
    });
  }
}
