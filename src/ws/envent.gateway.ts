import {
    ConnectedSocket,
    MessageBody,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

type UserStatus = 'online' | 'busy' | 'away' | 'offline';

const validStatuses: UserStatus[] = ['online', 'busy', 'away', 'offline'];

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class EventsGateway implements OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private clientUsers = new Map<string, string>();
    private userStatuses = new Map<string, UserStatus>();

    @SubscribeMessage('events')
    chufashijian(
        @MessageBody() data: string,
    ): string {
        return data;
    }

    @SubscribeMessage('connection')
    joinRoom(
        @MessageBody() data: {
            username: string,
            status?: UserStatus,
        },
        @ConnectedSocket() client: Socket,
    ): WsResponse<unknown> {
        if (data?.username) {
            client.join(data.username);
            this.clientUsers.set(client.id, data.username);
            this.userStatuses.set(data.username, this.normalizeStatus(data.status, 'online'));
            this.broadcastPresence();
        }

        return { event: 'join', data: { username: data?.username } };
    }

    @SubscribeMessage('presence:update')
    updatePresence(
        @MessageBody() data: {
            username: string,
            status: UserStatus,
        },
        @ConnectedSocket() client: Socket,
    ): WsResponse<unknown> {
        if (data?.username) {
            client.join(data.username);
            this.clientUsers.set(client.id, data.username);
            this.userStatuses.set(data.username, this.normalizeStatus(data.status, 'online'));
            this.broadcastPresence();
        }

        return { event: 'presence:list', data: this.getPresencePayload() };
    }

    @SubscribeMessage('presence:request')
    requestPresence(
        @ConnectedSocket() client: Socket,
    ): WsResponse<unknown> {
        client.emit('presence:list', this.getPresencePayload());
        return { event: 'presence:list', data: this.getPresencePayload() };
    }

    @SubscribeMessage('rtc')
    connection(): WsResponse<unknown> {
        return;
    }

    @SubscribeMessage('sendMessage')
    sendMessage(
        @MessageBody() data: {
            to: string,
            from?: string,
        },
        @ConnectedSocket() client: Socket,
    ): WsResponse<unknown> {
        if (data?.to) {
            client.to(data.to).emit('showMessage', data);
        }
        return;
    }

    async handleDisconnect(client: Socket) {
        const username = this.clientUsers.get(client.id);
        this.clientUsers.delete(client.id);

        if (!username) {
            return;
        }

        const userSockets = await this.server.in(username).allSockets();
        if (userSockets.size === 0) {
            this.userStatuses.set(username, 'offline');
            this.broadcastPresence();
        }
    }

    private normalizeStatus(status: UserStatus | undefined, fallback: UserStatus): UserStatus {
        return status && validStatuses.includes(status) ? status : fallback;
    }

    private getPresencePayload() {
        return Object.fromEntries(this.userStatuses.entries());
    }

    private broadcastPresence() {
        this.server.emit('presence:list', this.getPresencePayload());
    }
}
