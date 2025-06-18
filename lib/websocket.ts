// WebSocket server configuration for production
// This file contains the WebSocket server setup and event handlers

import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";

export interface WebSocketMessage {
  id: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  content: string;
  timestamp: Date;
  type: "individual" | "group";
  status: "sending" | "sent" | "delivered" | "read" | "failed";
}

export interface WebSocketUser {
  id: string;
  name: string;
  socketId: string;
  isOnline: boolean;
  lastSeen: Date;
}

export class WebSocketServer {
  private io: SocketIOServer;
  private connectedUsers: Map<string, WebSocketUser> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket: Socket) => {
      console.log(`🔗 User connected: ${socket.id}`);

      // Handle user authentication
      socket.on("authenticate", (userData: { id: string; name: string }) => {
        const user: WebSocketUser = {
          id: userData.id,
          name: userData.name,
          socketId: socket.id,
          isOnline: true,
          lastSeen: new Date(),
        };

        this.connectedUsers.set(userData.id, user);
        socket.data.userId = userData.id;

        // Join user to their personal room
        socket.join(`user:${userData.id}`);

        // Join user to general group chat
        socket.join("group:general");

        // Broadcast user online status
        this.io.emit("user_online", {
          userId: userData.id,
          userName: userData.name,
        });

        // Send current online users to the new user
        const onlineUsers = Array.from(this.connectedUsers.values())
          .filter((u) => u.isOnline)
          .map((u) => ({ id: u.id, name: u.name }));

        socket.emit("online_users", onlineUsers);

        console.log(`✅ User authenticated: ${userData.name} (${userData.id})`);
      });

      // Handle individual messages
      socket.on(
        "send_message",
        (
          messageData: Omit<WebSocketMessage, "id" | "timestamp" | "status">
        ) => {
          const message: WebSocketMessage = {
            ...messageData,
            id: `msg-${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            status: "sent",
          };

          if (message.type === "individual" && message.receiverId) {
            // Send to specific user
            const receiver = this.connectedUsers.get(message.receiverId);
            if (receiver) {
              this.io
                .to(`user:${message.receiverId}`)
                .emit("new_message", message);
              // Update message status to delivered
              setTimeout(() => {
                message.status = "delivered";
                this.io
                  .to(`user:${message.receiverId}`)
                  .emit("message_status_update", {
                    messageId: message.id,
                    status: "delivered",
                  });
              }, 1000);
            }
          } else if (message.type === "group" && message.groupId) {
            // Broadcast to group
            this.io.to(`group:${message.groupId}`).emit("new_message", message);

            // Update message status to delivered for all online users in group
            setTimeout(() => {
              message.status = "delivered";
              this.io
                .to(`group:${message.groupId}`)
                .emit("message_status_update", {
                  messageId: message.id,
                  status: "delivered",
                });
            }, 1000);
          }

          // Send confirmation back to sender
          socket.emit("message_sent", message);
        }
      );

      // Handle typing indicators
      socket.on(
        "typing_start",
        (data: { chatType: "individual" | "group"; targetId?: string }) => {
          const user = this.connectedUsers.get(socket.data.userId);
          if (!user) return;

          if (data.chatType === "individual" && data.targetId) {
            this.io.to(`user:${data.targetId}`).emit("typing_start", {
              userId: user.id,
              userName: user.name,
              chatType: "individual",
            });
          } else if (data.chatType === "group" && data.targetId) {
            this.io.to(`group:${data.targetId}`).emit("typing_start", {
              userId: user.id,
              userName: user.name,
              chatType: "group",
            });
          }
        }
      );

      socket.on(
        "typing_stop",
        (data: { chatType: "individual" | "group"; targetId?: string }) => {
          const user = this.connectedUsers.get(socket.data.userId);
          if (!user) return;

          if (data.chatType === "individual" && data.targetId) {
            this.io.to(`user:${data.targetId}`).emit("typing_stop", {
              userId: user.id,
              chatType: "individual",
            });
          } else if (data.chatType === "group" && data.targetId) {
            this.io.to(`group:${data.targetId}`).emit("typing_stop", {
              userId: user.id,
              chatType: "group",
            });
          }
        }
      );

      // Handle message read receipts
      socket.on(
        "mark_as_read",
        (data: { chatType: "individual" | "group"; chatId?: string }) => {
          const user = this.connectedUsers.get(socket.data.userId);
          if (!user) return;

          if (data.chatType === "individual" && data.chatId) {
            this.io.to(`user:${data.chatId}`).emit("messages_read", {
              readerId: user.id,
              chatType: "individual",
            });
          } else if (data.chatType === "group" && data.chatId) {
            this.io.to(`group:${data.chatId}`).emit("messages_read", {
              readerId: user.id,
              chatType: "group",
            });
          }
        }
      );

      // Handle user joining groups
      socket.on("join_group", (groupId: string) => {
        socket.join(`group:${groupId}`);
        const user = this.connectedUsers.get(socket.data.userId);
        if (user) {
          this.io.to(`group:${groupId}`).emit("user_joined_group", {
            userId: user.id,
            userName: user.name,
            groupId,
          });
        }
      });

      // Handle user leaving groups
      socket.on("leave_group", (groupId: string) => {
        socket.leave(`group:${groupId}`);
        const user = this.connectedUsers.get(socket.data.userId);
        if (user) {
          this.io.to(`group:${groupId}`).emit("user_left_group", {
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
          const user = this.connectedUsers.get(userId);
          if (user) {
            user.isOnline = false;
            user.lastSeen = new Date();
            this.connectedUsers.set(userId, user);

            // Broadcast user offline status
            this.io.emit("user_offline", { userId, userName: user.name });
            console.log(`🔌 User disconnected: ${user.name} (${userId})`);
          }
        }
      });
    });
  }

  // Get all connected users
  public getConnectedUsers(): WebSocketUser[] {
    return Array.from(this.connectedUsers.values());
  }

  // Get specific user
  public getUser(userId: string): WebSocketUser | undefined {
    return this.connectedUsers.get(userId);
  }

  // Broadcast message to all users
  public broadcastMessage(message: WebSocketMessage) {
    this.io.emit("broadcast_message", message);
  }

  // Send message to specific user
  public sendToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Send message to group
  public sendToGroup(groupId: string, event: string, data: any) {
    this.io.to(`group:${groupId}`).emit(event, data);
  }
}

// Export singleton instance
let wsServer: WebSocketServer | null = null;

export function initializeWebSocketServer(server: HTTPServer): WebSocketServer {
  if (!wsServer) {
    wsServer = new WebSocketServer(server);
  }
  return wsServer;
}

export function getWebSocketServer(): WebSocketServer | null {
  return wsServer;
}
