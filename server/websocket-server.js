// WebSocket Server for H - S Management CRM
// This is a standalone WebSocket server that can be run alongside the Next.js app

const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Create HTTP server
const httpServer = createServer();

// Create Socket.IO server with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store connected users
const connectedUsers = new Map();

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

  // Handle individual messages
  socket.on("send_message", (messageData) => {
    const message = {
      ...messageData,
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      status: "sent",
    };

    if (message.type === "individual" && message.receiverId) {
      // Send to specific user
      const receiver = connectedUsers.get(message.receiverId);
      if (receiver) {
        io.to(`user:${message.receiverId}`).emit("new_message", message);
        // Update message status to delivered
        setTimeout(() => {
          message.status = "delivered";
          io.to(`user:${message.receiverId}`).emit("message_status_update", {
            messageId: message.id,
            status: "delivered",
          });
        }, 1000);
      }
    } else if (message.type === "group" && message.groupId) {
      // Broadcast to group
      io.to(`group:${message.groupId}`).emit("new_message", message);

      // Update message status to delivered for all online users in group
      setTimeout(() => {
        message.status = "delivered";
        io.to(`group:${message.groupId}`).emit("message_status_update", {
          messageId: message.id,
          status: "delivered",
        });
      }, 1000);
    }

    // Send confirmation back to sender
    socket.emit("message_sent", message);
  });

  // Handle typing indicators
  socket.on("typing_start", (data) => {
    const user = connectedUsers.get(socket.data.userId);
    if (!user) return;

    if (data.chatType === "individual" && data.targetId) {
      io.to(`user:${data.targetId}`).emit("typing_start", {
        userId: user.id,
        userName: user.name,
        chatType: "individual",
      });
    } else if (data.chatType === "group" && data.targetId) {
      io.to(`group:${data.targetId}`).emit("typing_start", {
        userId: user.id,
        userName: user.name,
        chatType: "group",
      });
    }
  });

  socket.on("typing_stop", (data) => {
    const user = connectedUsers.get(socket.data.userId);
    if (!user) return;

    if (data.chatType === "individual" && data.targetId) {
      io.to(`user:${data.targetId}`).emit("typing_stop", {
        userId: user.id,
        chatType: "individual",
      });
    } else if (data.chatType === "group" && data.targetId) {
      io.to(`group:${data.targetId}`).emit("typing_stop", {
        userId: user.id,
        chatType: "group",
      });
    }
  });

  // Handle message read receipts
  socket.on("mark_as_read", (data) => {
    const user = connectedUsers.get(socket.data.userId);
    if (!user) return;

    if (data.chatType === "individual" && data.chatId) {
      io.to(`user:${data.chatId}`).emit("messages_read", {
        readerId: user.id,
        chatType: "individual",
      });
    } else if (data.chatType === "group" && data.chatId) {
      io.to(`group:${data.chatId}`).emit("messages_read", {
        readerId: user.id,
        chatType: "group",
      });
    }
  });

  // Handle user joining groups
  socket.on("join_group", (groupId) => {
    socket.join(`group:${groupId}`);
    const user = connectedUsers.get(socket.data.userId);
    if (user) {
      io.to(`group:${groupId}`).emit("user_joined_group", {
        userId: user.id,
        userName: user.name,
        groupId,
      });
    }
  });

  // Handle user leaving groups
  socket.on("leave_group", (groupId) => {
    socket.leave(`group:${groupId}`);
    const user = connectedUsers.get(socket.data.userId);
    if (user) {
      io.to(`group:${groupId}`).emit("user_left_group", {
        userId: user.id,
        userName: user.name,
        groupId,
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const userId = socket.data.userId;
    if (userId) {
      const user = connectedUsers.get(userId);
      if (user) {
        user.isOnline = false;
        user.lastSeen = new Date();
        connectedUsers.set(userId, user);

        // Broadcast user offline status
        io.emit("user_offline", { userId, userName: user.name });
        console.log(`🔌 User disconnected: ${user.name} (${userId})`);
      }
    }
  });
});

// Start server
const PORT = process.env.WS_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on port ${PORT}`);
  console.log(`📡 Ready to handle real-time chat connections`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Shutting down WebSocket server...");
  httpServer.close(() => {
    console.log("✅ WebSocket server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("🛑 Shutting down WebSocket server...");
  httpServer.close(() => {
    console.log("✅ WebSocket server closed");
    process.exit(0);
  });
});
