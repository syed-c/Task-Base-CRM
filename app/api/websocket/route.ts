import { NextRequest, NextResponse } from "next/server";
import { Server as SocketIOServer } from "socket.io";

// Store connected users
const connectedUsers = new Map();

// WebSocket handler for Vercel
export async function GET(req: NextRequest) {
  // This will be handled by Socket.IO middleware
  return NextResponse.json({ message: "WebSocket endpoint" });
}

// Initialize WebSocket server
export function initializeWebSocket(server: any) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket.IO connection handler
  io.on("connection", (socket) => {
    console.log(`🔗 User connected: ${socket.id}`);

    // Handle user authentication
    socket.on("authenticate", (userData) => {
      const user = {
        id: userData.id,
        name: userData.name,
        socketId: socket.id,
        isOnline: true,
        lastSeen: new Date(),
      };

      connectedUsers.set(userData.id, user);
      socket.data.userId = userData.id;

      // Join user to their personal room
      socket.join(`user:${userData.id}`);

      // Join user to general group chat
      socket.join("group:general");

      // Broadcast user online status
      io.emit("user_online", { userId: userData.id, userName: userData.name });

      // Send current online users to the new user
      const onlineUsers = Array.from(connectedUsers.values())
        .filter((u) => u.isOnline)
        .map((u) => ({ id: u.id, name: u.name }));

      socket.emit("online_users", onlineUsers);

      console.log(`✅ User authenticated: ${userData.name} (${userData.id})`);
    });

    // Handle message sending
    socket.on("send_message", (messageData) => {
      console.log("📤 Message received:", messageData);

      const message = {
        id: `msg-${Date.now()}-${Math.random()}`,
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
        groupId: messageData.groupId,
        content: messageData.content,
        timestamp: new Date(),
        type: messageData.type,
        status: "sent",
      };

      // Send message to appropriate recipients
      if (messageData.type === "individual" && messageData.receiverId) {
        // Send to specific user
        io.to(`user:${messageData.receiverId}`).emit("new_message", message);
        io.to(`user:${messageData.senderId}`).emit("new_message", message);
      } else if (messageData.type === "group" && messageData.groupId) {
        // Send to group
        io.to(`group:${messageData.groupId}`).emit("new_message", message);
      }

      // Confirm message sent
      socket.emit("message_sent", { messageId: message.id, status: "sent" });
    });

    // Handle typing indicators
    socket.on("typing_start", (data) => {
      const typingData = {
        userId: socket.data.userId,
        userName: connectedUsers.get(socket.data.userId)?.name || "Unknown",
        isTyping: true,
        timestamp: new Date(),
      };

      if (data.type === "individual" && data.receiverId) {
        io.to(`user:${data.receiverId}`).emit("typing_start", typingData);
      } else if (data.type === "group" && data.groupId) {
        io.to(`group:${data.groupId}`).emit("typing_start", typingData);
      }
    });

    socket.on("typing_stop", (data) => {
      const typingData = {
        userId: socket.data.userId,
        userName: connectedUsers.get(socket.data.userId)?.name || "Unknown",
        isTyping: false,
        timestamp: new Date(),
      };

      if (data.type === "individual" && data.receiverId) {
        io.to(`user:${data.receiverId}`).emit("typing_stop", typingData);
      } else if (data.type === "group" && data.groupId) {
        io.to(`group:${data.groupId}`).emit("typing_stop", typingData);
      }
    });

    // Handle message read status
    socket.on("mark_as_read", (data) => {
      if (data.type === "individual" && data.senderId) {
        io.to(`user:${data.senderId}`).emit("messages_read", {
          readerId: socket.data.userId,
          chatType: data.type,
          chatId: data.chatId,
        });
      } else if (data.type === "group" && data.groupId) {
        io.to(`group:${data.groupId}`).emit("messages_read", {
          readerId: socket.data.userId,
          chatType: data.type,
          chatId: data.groupId,
        });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${socket.id}`);

      if (socket.data.userId) {
        const user = connectedUsers.get(socket.data.userId);
        if (user) {
          user.isOnline = false;
          user.lastSeen = new Date();
          connectedUsers.set(socket.data.userId, user);

          // Broadcast user offline status
          io.emit("user_offline", {
            userId: socket.data.userId,
            userName: user.name,
          });
        }
      }
    });
  });

  return io;
}

// Export for use in other parts of the app
export { connectedUsers };
