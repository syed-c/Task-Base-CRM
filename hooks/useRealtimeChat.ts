"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useCRMStore } from "@/lib/store";

// Message status types
export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

// Enhanced message interface
export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  content: string;
  timestamp: Date;
  type: "individual" | "group";
  status: MessageStatus;
  isEdited?: boolean;
  editedAt?: Date;
  replyTo?: string;
}

// Notification interface
export interface ChatNotification {
  id: string;
  message: string;
  from: string;
  fromName: string;
  timestamp: Date;
  type: "individual" | "group";
  isRead: boolean;
}

// Typing indicator interface
export interface TypingIndicator {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Date;
}

// WebSocket event types
type WebSocketEvent =
  | "message"
  | "typing_start"
  | "typing_stop"
  | "user_online"
  | "user_offline"
  | "message_status_update"
  | "group_message"
  | "user_joined_group"
  | "user_left_group";

// Enhanced real-time chat functionality with WebSocket simulation
export function useRealtimeChat() {
  const { messages, addMessage, currentUser, users, updateMessage } =
    useCRMStore();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<Record<string, number>>({});
  const [activeChat, setActiveChat] = useState<{
    type: "individual" | "group";
    id?: string;
  }>({ type: "group", id: "general" });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (!currentUser) return;

    try {
      // In production, this would be your actual WebSocket server URL
      // For now, we'll simulate WebSocket behavior
      console.log("🔗 Connecting to WebSocket server...");

      // Simulate WebSocket connection
      setTimeout(() => {
        setIsConnected(true);
        console.log("✅ WebSocket connected");

        // Simulate online users
        const onlineUserIds = users
          .map((user) => user.id)
          .filter((id) => id !== currentUser.id);
        setOnlineUsers(onlineUserIds);

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          // Send heartbeat to keep connection alive
          console.log("💓 Heartbeat sent");
        }, 30000); // Every 30 seconds
      }, 1000);
    } catch (error) {
      console.error("❌ WebSocket connection failed:", error);
      setIsConnected(false);

      // Attempt to reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 5000);
    }
  }, [currentUser, users]);

  const disconnectWebSocket = useCallback(() => {
    console.log("🔌 Disconnecting WebSocket...");
    setIsConnected(false);

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Send message via WebSocket
  const sendMessage = useCallback(
    (message: Omit<ChatMessage, "id" | "timestamp" | "status">) => {
      if (!isConnected || !currentUser) return;

      const newMessage: ChatMessage = {
        ...message,
        id: `msg-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        status: "sending",
      };

      // Add message to local store immediately
      addMessage(newMessage);

      // Simulate WebSocket send
      setTimeout(() => {
        // Simulate message delivery
        updateMessage(newMessage.id, { status: "sent" });

        // Simulate message being delivered to recipient(s)
        setTimeout(() => {
          updateMessage(newMessage.id, { status: "delivered" });
        }, 1000);

        // Simulate real-time message broadcast
        if (message.type === "group") {
          // Broadcast to all online users in group
          console.log(`📢 Group message broadcast: ${message.content}`);
        } else if (message.receiverId) {
          // Send to specific user
          console.log(
            `📤 Direct message sent to ${message.receiverId}: ${message.content}`
          );
        }
      }, 500);
    },
    [isConnected, currentUser, addMessage, updateMessage]
  );

  // Start typing indicator
  const startTyping = useCallback(
    (chatType: "individual" | "group", targetId?: string) => {
      if (!currentUser || !isConnected) return;

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

      // Simulate typing broadcast
      console.log(`⌨️ ${currentUser.name} is typing...`);

      // Remove typing indicator after 3 seconds
      setTimeout(() => {
        setTypingUsers((prev) =>
          prev.filter((t) => t.userId !== currentUser.id)
        );
      }, 3000);
    },
    [currentUser, isConnected]
  );

  // Mark messages as read
  const markAsRead = useCallback(
    (chatType: "individual" | "group", chatId?: string) => {
      if (!currentUser) return;

      const messagesToMark = messages.filter((msg) => {
        if (msg.senderId === currentUser.id) return false; // Don't mark own messages

        if (chatType === "individual" && chatId) {
          return (
            msg.type === "individual" &&
            ((msg.senderId === chatId && msg.receiverId === currentUser.id) ||
              (msg.senderId === currentUser.id && msg.receiverId === chatId))
          );
        } else if (chatType === "group") {
          return msg.type === "group" && msg.groupId === chatId;
        }
        return false;
      });

      messagesToMark.forEach((msg) => {
        updateMessage(msg.id, { status: "read" });
      });

      // Clear unread count for this chat
      setUnreadCount((prev) => ({
        ...prev,
        [`${chatType}-${chatId}`]: 0,
      }));

      // Clear notifications for this chat
      setNotifications((prev) =>
        prev.filter((n) => {
          if (chatType === "individual" && chatId) {
            return !(n.type === "individual" && n.from === chatId);
          } else if (chatType === "group") {
            return !(n.type === "group");
          }
          return true;
        })
      );
    },
    [currentUser, messages, updateMessage]
  );

  // Handle incoming messages
  const handleIncomingMessage = useCallback(
    (message: ChatMessage) => {
      if (message.senderId === currentUser?.id) return; // Don't process own messages

      // Add message to store
      addMessage(message);

      // Create notification if user is not in the active chat
      const isInActiveChat =
        (activeChat.type === "individual" &&
          message.type === "individual" &&
          ((message.senderId === activeChat.id &&
            message.receiverId === currentUser?.id) ||
            (message.receiverId === activeChat.id &&
              message.senderId === currentUser?.id))) ||
        (activeChat.type === "group" &&
          message.type === "group" &&
          message.groupId === activeChat.id);

      if (!isInActiveChat) {
        const sender = users.find((u) => u.id === message.senderId);
        const notification: ChatNotification = {
          id: `notif-${Date.now()}-${Math.random()}`,
          message: message.content,
          from: message.senderId,
          fromName: sender?.name || "Unknown User",
          timestamp: message.timestamp,
          type: message.type,
          isRead: false,
        };

        setNotifications((prev) => [...prev, notification]);

        // Update unread count
        const chatKey =
          message.type === "individual"
            ? `individual-${message.senderId}`
            : `group-${message.groupId}`;

        setUnreadCount((prev) => ({
          ...prev,
          [chatKey]: (prev[chatKey] || 0) + 1,
        }));

        // Auto-remove notification after 10 seconds
        setTimeout(() => {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== notification.id)
          );
        }, 10000);
      }
    },
    [currentUser, users, activeChat, addMessage]
  );

  // Simulate incoming messages for demo
  useEffect(() => {
    if (!isConnected || !currentUser) return;

    const messageInterval = setInterval(() => {
      // Simulate occasional messages from other users
      if (Math.random() > 0.97) {
        const demoMessages = [
          "Great work on the recent project! 🎉",
          "Can you review the latest design updates?",
          "Meeting scheduled for tomorrow at 2 PM 📅",
          "Please update your task status",
          "Welcome to the team! 👋",
          "The new feature is ready for testing",
          "Anyone available for a quick call?",
          "Documentation has been updated",
          "Happy Friday everyone! 🎊",
          "Don't forget the team lunch next week",
        ];

        const randomMessage =
          demoMessages[Math.floor(Math.random() * demoMessages.length)];
        const randomUser = users.find((u) => u.id !== currentUser.id);

        if (randomUser) {
          const isGroupMessage = Math.random() > 0.5;

          const incomingMessage: ChatMessage = {
            id: `demo-${Date.now()}-${Math.random()}`,
            senderId: randomUser.id,
            receiverId: isGroupMessage ? undefined : currentUser.id,
            groupId: isGroupMessage ? "general" : undefined,
            content: randomMessage,
            timestamp: new Date(),
            type: isGroupMessage ? "group" : "individual",
            status: "delivered",
          };

          handleIncomingMessage(incomingMessage);
        }
      }
    }, 20000); // Every 20 seconds

    return () => clearInterval(messageInterval);
  }, [isConnected, currentUser, users, handleIncomingMessage]);

  // Connection management
  useEffect(() => {
    if (currentUser) {
      connectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [currentUser, connectWebSocket, disconnectWebSocket]);

  // Mark messages as read when chat becomes active
  useEffect(() => {
    if (activeChat.type === "individual" && activeChat.id) {
      markAsRead("individual", activeChat.id);
    } else if (activeChat.type === "group") {
      markAsRead("group", activeChat.id);
    }
  }, [activeChat, markAsRead]);

  return {
    // Connection status
    isConnected,
    onlineUsers,

    // Chat functionality
    sendMessage,
    startTyping,
    typingUsers,
    markAsRead,

    // Notifications
    notifications,
    unreadCount,
    setNotifications,

    // Active chat management
    activeChat,
    setActiveChat,

    // Utility functions
    getUserById: (id: string) => users.find((u) => u.id === id),
    getUnreadCount: (chatType: "individual" | "group", chatId?: string) => {
      const key = `${chatType}-${chatId}`;
      return unreadCount[key] || 0;
    },
  };
}
