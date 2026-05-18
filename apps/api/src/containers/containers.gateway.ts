import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({ namespace: "containers", cors: true })
export class ContainersGateway {
  @WebSocketServer()
  server!: Server;

  emitUpdateProgress(containerId: string, status: string, detail?: string) {
    this.server.emit("update-progress", { containerId, status, detail });
  }

  emitLayerProgress(containerId: string, layerId: string, status: string, progress?: string) {
    this.server.emit("update-layer-progress", { containerId, layerId, status, progress });
  }
}
