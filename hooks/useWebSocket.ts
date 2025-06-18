"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useCRMStore } from "@/lib/store";

// WebSocket event types
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
  isOnline: boolean;
  lastSeen: Date;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Date;
}

export function useWebSocket() {
  const { currentUser, addMessage, updateMessage, users } = useCRMStore();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<WebSocketUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      message: string;
      from: string;
      fromName: string;
      timestamp: Date;
      type: "individual" | "group";
      isRead: boolean;
    }>
  >([]);
  const [unreadCount, setUnreadCount] = useState<Record<string, number>>({});
  const [activeChat, setActiveChat] = useState<{
    type: "individual" | "group";
    id?: string;
  }>({ type: "group", id: "general" });

  const socketRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Check if we're in static export mode
  const isStaticExport =
    typeof window !== "undefined" &&
    window.location.hostname === "localhost" &&
    !process.env.NEXT_PUBLIC_WS_URL;

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    if (!currentUser) return;

    try {
      if (isStaticExport) {
        // Simulation mode for static export
        console.log(
          "🔗 Simulating WebSocket connection (static export mode)..."
        );

        setTimeout(() => {
          setIsConnected(true);
          console.log("✅ WebSocket connected (simulated)");

          // Simulate online users
          setOnlineUsers([
            {
              id: "admin-1",
              name: "Admin User",
              isOnline: true,
              lastSeen: new Date(),
            },
            {
              id: "user-1",
              name: "Sarah Wilson",
              isOnline: true,
              lastSeen: new Date(),
            },
            {
              id: "user-2",
              name: "Mike Johnson",
              isOnline: false,
              lastSeen: new Date(Date.now() - 1000 * 60 * 30),
            },
          ]);
        }, 1000);
      } else {
        // Real WebSocket connection for Vercel
        console.log("🔗 Connecting to real WebSocket server...");

        // Dynamic import for Socket.IO client
        import("socket.io-client")
          .then((socketIO) => {
            const wsUrl =
              process.env.NEXT_PUBLIC_WS_URL || window.location.origin;
            const socket = socketIO.default(wsUrl, {
              transports: ["websocket", "polling"],
              timeout: 20000,
              reconnection: true,
              reconnectionAttempts: maxReconnectAttempts,
              reconnectionDelay: 1000,
              reconnectionDelayMax: 5000,
            });

            socketRef.current = socket;

            socket.on("connect", () => {
              console.log("✅ WebSocket connected to server");
              setIsConnected(true);
              reconnectAttemptsRef.current = 0;

              // Authenticate user
              if (currentUser) {
                socket.emit("authenticate", {
                  id: currentUser.id,
                  name: currentUser.name,
                });
              }
            });

            socket.on("disconnect", () => {
              console.log("🔌 WebSocket disconnected");
              setIsConnected(false);
            });

            socket.on("connect_error", (error: any) => {
              console.error("❌ WebSocket connection error:", error);
              setIsConnected(false);
            });

            socket.on("online_users", (users: any[]) => {
              setOnlineUsers(
                users.map((user: any) => ({
                  ...user,
                  lastSeen: new Date(),
                }))
              );
            });

            socket.on("new_message", (message: any) => {
              addMessage(message);
            });

            socket.on("typing_start", (typingData: any) => {
              setTypingUsers((prev) => {
                const filtered = prev.filter(
                  (t) => t.userId !== typingData.userId
                );
                return [...filtered, typingData];
              });
            });

            socket.on("typing_stop", (typingData: any) => {
              setTypingUsers((prev) =>
                prev.filter((t) => t.userId !== typingData.userId)
              );
            });

            socket.on("user_online", (userData: any) => {
              setOnlineUsers((prev) => {
                const existing = prev.find((u) => u.id === userData.userId);
                if (existing) {
                  return prev.map((u) =>
                    u.id === userData.userId ? { ...u, isOnline: true } : u
                  );
                }
                return [
                  ...prev,
                  {
                    id: userData.userId,
                    name: userData.userName,
                    isOnline: true,
                    lastSeen: new Date(),
                  },
                ];
              });
            });

            socket.on("user_offline", (userData: any) => {
              setOnlineUsers((prev) =>
                prev.map((u) =>
                  u.id === userData.userId
                    ? { ...u, isOnline: false, lastSeen: new Date() }
                    : u
                )
              );
            });
          })
          .catch((error: any) => {
            console.error("❌ Failed to load Socket.IO client:", error);
            // Fallback to simulation mode
            setIsConnected(true);
          });
      }
    } catch (error) {
      console.error("❌ Failed to initialize WebSocket:", error);
      setIsConnected(false);
    }
  }, [currentUser?.id, currentUser?.name, isStaticExport, addMessage]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    console.log("🔌 Disconnecting WebSocket...");

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnected(false);
    setOnlineUsers([]);
    setTypingUsers([]);
    reconnectAttemptsRef.current = 0;
  }, []);

  // Send message
  const sendMessage = useCallback(
    (messageData: Omit<WebSocketMessage, "id" | "timestamp" | "status">) => {
      if (!isConnected) {
        console.warn("⚠️ Cannot send message: WebSocket not connected");
        return false;
      }

      if (isStaticExport) {
        // Simulation mode
        console.log("📤 Sending message (simulated):", messageData);

        const message: WebSocketMessage = {
          ...messageData,
          id: `msg-${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          status: "sending",
        };

        addMessage(message);

        setTimeout(() => {
          updateMessage(message.id, { status: "sent" });

          setTimeout(() => {
            updateMessage(message.id, { status: "delivered" });
          }, 1000);
        }, 500);

        return true;
      } else {
        // Real WebSocket mode
        if (socketRef.current) {
          console.log("📤 Sending message via WebSocket:", messageData);
          socketRef.current.emit("send_message", messageData);
          return true;
        }
        return false;
      }
    },
    [isConnected, isStaticExport, addMessage, updateMessage]
  );

  // Start typing indicator
  const startTyping = useCallback(
    (chatType: "individual" | "group", targetId?: string) => {
      if (!isConnected || !currentUser) return;

      if (isStaticExport) {
        // Simulation mode
        console.log("⌨️ Starting typing indicator (simulated):", {
          chatType,
          targetId,
        });

        const typingIndicator: TypingIndicator = {
          userId: currentUser.id,
          userName: currentUser.name,
          isTyping: true,
          timestamp: new Date(),
        };

        setTypingUsers((prev) => {
          const filtered = prev.filter((t) => t.userId !== currentUser.id);
          return [...filtered, typingIndicator];
        });

        setTimeout(() => {
          setTypingUsers((prev) =>
            prev.filter((t) => t.userId !== currentUser.id)
          );
        }, 3000);
      } else {
        // Real WebSocket mode
        if (socketRef.current) {
          socketRef.current.emit("typing_start", {
            type: chatType,
            receiverId: targetId,
            groupId: targetId,
          });
        }
      }
    },
    [isConnected, currentUser?.id, currentUser?.name, isStaticExport]
  );

  // Stop typing indicator
  const stopTyping = useCallback(
    (chatType: "individual" | "group", targetId?: string) => {
      if (!isConnected || !currentUser) return;

      if (isStaticExport) {
        console.log("⌨️ Stopping typing indicator (simulated):", {
          chatType,
          targetId,
        });
        setTypingUsers((prev) =>
          prev.filter((t) => t.userId !== currentUser.id)
        );
      } else {
        if (socketRef.current) {
          socketRef.current.emit("typing_stop", {
            type: chatType,
            receiverId: targetId,
            groupId: targetId,
          });
        }
      }
    },
    [isConnected, currentUser?.id, isStaticExport]
  );

  // Mark messages as read
  const markAsRead = useCallback(
    (chatType: "individual" | "group", chatId?: string) => {
      if (!isConnected) return;

      if (isStaticExport) {
        // Simulation mode - just update local state
        console.log("📖 Marking messages as read (simulated):", {
          chatType,
          chatId,
        });
      } else {
        // Real WebSocket mode
        if (socketRef.current) {
          socketRef.current.emit("mark_as_read", { type: chatType, chatId });
        }
      }
    },
    [isConnected, isStaticExport]
  );

  // Join group
  const joinGroup = useCallback(
    (groupId: string) => {
      if (!isConnected || !currentUser) return;

      if (isStaticExport) {
        console.log("👥 Joining group (simulated):", groupId);
      } else {
        if (socketRef.current) {
          socketRef.current.emit("join_group", { groupId });
        }
      }
    },
    [isConnected, currentUser?.id, isStaticExport]
  );

  // Leave group
  const leaveGroup = useCallback(
    (groupId: string) => {
      if (!isConnected || !currentUser) return;

      if (isStaticExport) {
        console.log("👋 Leaving group (simulated):", groupId);
      } else {
        if (socketRef.current) {
          socketRef.current.emit("leave_group", { groupId });
        }
      }
    },
    [isConnected, currentUser?.id, isStaticExport]
  );

  // Connect on mount and when user changes
  useEffect(() => {
    if (currentUser) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [currentUser?.id, connect, disconnect]);

  return {
    // Connection status
    isConnected,
    onlineUsers,

    // Chat functionality
    sendMessage,
    startTyping,
    stopTyping,
    typingUsers,
    markAsRead,

    // Group functionality
    joinGroup,
    leaveGroup,

    // Notifications and chat management
    notifications,
    unreadCount,
    setNotifications,
    activeChat,
    setActiveChat,

    // Utility functions
    getOnlineUser: (userId: string) => onlineUsers.find((u) => u.id === userId),
    isUserOnline: (userId: string) =>
      onlineUsers.find((u) => u.id === userId)?.isOnline || false,
    getUserById: (id: string) => users.find((u) => u.id === id),
    getUnreadCount: (chatType: "individual" | "group", chatId?: string) => {
      const key = `${chatType}-${chatId}`;
      return unreadCount[key] || 0;
    },
  };
}
