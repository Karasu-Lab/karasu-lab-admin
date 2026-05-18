import { io } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

let refCount = 0;
export const socket = io(`${API_URL}/containers`, { autoConnect: false });

export function connectSocket() {
  if (refCount === 0) socket.connect();
  refCount++;
}

export function disconnectSocket() {
  refCount--;
  if (refCount <= 0) {
    refCount = 0;
    socket.disconnect();
  }
}
