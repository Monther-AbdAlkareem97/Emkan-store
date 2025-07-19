import { Server } from "socket.io";

let ioInstance = null;

export function setupSocket(server) {
  ioInstance = new Server(server, {
    cors: {
      origin: [
        "http://localhost:8080",
        "https://emkan-store.ly",
        "https://www.emkan-store.ly",
      ],
      credentials: true,
    },
  });

  ioInstance.on("connection", (socket) => {
    // يمكن تخصيص الأحداث هنا
    socket.on("disconnect", () => {});
  });
}

export function emitAdminNotification(data) {
  if (ioInstance) {
    ioInstance.emit("admin_notification", data);
  }
}
