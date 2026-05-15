import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: { origin: "*" },
    path: "/api/socketio",
  });

  // Track online users per project
  const projectUsers = new Map();

  io.on("connection", (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    socket.on("join-project", ({ projectId, userId, userName }) => {
      socket.join(`project:${projectId}`);
      
      if (!projectUsers.has(projectId)) {
        projectUsers.set(projectId, new Map());
      }
      projectUsers.get(projectId).set(socket.id, { userId, userName });
      
      // Broadcast updated presence
      const users = Array.from(projectUsers.get(projectId).values());
      io.to(`project:${projectId}`).emit("presence-update", { users });
      
      console.log(`👤 User ${userName} joined project ${projectId}`);
    });

    socket.on("leave-project", ({ projectId }) => {
      socket.leave(`project:${projectId}`);
      if (projectUsers.has(projectId)) {
        projectUsers.get(projectId).delete(socket.id);
        const users = Array.from(projectUsers.get(projectId).values());
        io.to(`project:${projectId}`).emit("presence-update", { users });
      }
    });

    socket.on("task-moved", ({ projectId, taskId, fromColumnId, toColumnId, newPosition }) => {
      socket.to(`project:${projectId}`).emit("task-moved", {
        taskId, fromColumnId, toColumnId, newPosition,
      });
    });

    socket.on("task-created", ({ projectId, task }) => {
      socket.to(`project:${projectId}`).emit("task-created", { task });
    });

    socket.on("task-updated", ({ projectId, task }) => {
      socket.to(`project:${projectId}`).emit("task-updated", { task });
    });

    socket.on("task-deleted", ({ projectId, taskId }) => {
      socket.to(`project:${projectId}`).emit("task-deleted", { taskId });
    });

    socket.on("comment-added", ({ projectId, taskId, comment }) => {
      socket.to(`project:${projectId}`).emit("comment-added", { taskId, comment });
    });

    socket.on("column-created", ({ projectId, column }) => {
      socket.to(`project:${projectId}`).emit("column-created", { column });
    });

    socket.on("send-notification", ({ userId, notification }) => {
      io.emit(`notification:${userId}`, notification);
    });

    socket.on("disconnect", () => {
      // Clean up presence from all projects
      for (const [projectId, users] of projectUsers.entries()) {
        if (users.has(socket.id)) {
          users.delete(socket.id);
          const remaining = Array.from(users.values());
          io.to(`project:${projectId}`).emit("presence-update", { users: remaining });
        }
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`\n🚀 FlowBoard ready at http://${hostname}:${port}\n`);
  });
});
