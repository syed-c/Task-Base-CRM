"use client";

import { useState, useRef, useEffect } from "react";
import { useCRMStore } from "@/lib/store";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  MessageCircle,
  Users,
  Hash,
  Check,
  CheckCheck,
  Clock,
  MoreHorizontal,
  Reply,
  Edit,
  Trash2,
  Bell,
  BellOff,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export function ChatInterface() {
  const { users, messages, currentUser } = useCRMStore();
  const {
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    typingUsers,
    markAsRead,
    notifications,
    unreadCount,
    setNotifications,
    activeChat,
    setActiveChat,
    getUserById,
    getUnreadCount,
  } = useWebSocket();

  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<(typeof users)[0] | null>(
    null
  );
  const [isTyping, setIsTyping] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      if (activeChat.type === "individual" && activeChat.id) {
        startTyping("individual", activeChat.id);
      } else if (activeChat.type === "group") {
        startTyping("group", activeChat.id);
      }
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    // Clear typing indicator
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const messageData = {
      senderId: currentUser.id,
      receiverId: activeChat.type === "individual" ? activeChat.id : undefined,
      groupId: activeChat.type === "group" ? activeChat.id : undefined,
      content: newMessage.trim(),
      type: activeChat.type,
    };

    sendMessage(messageData);
    setNewMessage("");
  };

  const getFilteredMessages = () => {
    if (activeChat.type === "individual" && activeChat.id) {
      return messages.filter(
        (msg) =>
          msg.type === "individual" &&
          ((msg.senderId === currentUser?.id &&
            msg.receiverId === activeChat.id) ||
            (msg.senderId === activeChat.id &&
              msg.receiverId === currentUser?.id))
      );
    } else if (activeChat.type === "group" && activeChat.id) {
      return messages.filter(
        (msg) => msg.type === "group" && msg.groupId === activeChat.id
      );
    }
    return [];
  };

  const getMessageStatusIcon = (status?: string) => {
    switch (status) {
      case "sending":
        return <Clock className="h-3 w-3 text-gray-400" />;
      case "sent":
        return <Check className="h-3 w-3 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case "read":
        return <CheckCheck className="h-3 w-3 text-green-500" />;
      case "failed":
        return <Clock className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const handleChatSwitch = (type: "individual" | "group", id?: string) => {
    setActiveChat({ type, id });

    // Mark messages as read when switching chats
    if (type === "individual" && id) {
      markAsRead("individual", id);
    } else if (type === "group" && id) {
      markAsRead("group", id);
    }
  };

  const otherUsers = users.filter((user) => user.id !== currentUser?.id);
  const filteredMessages = getFilteredMessages();
  const currentTypingUsers = typingUsers.filter(
    (t) =>
      (activeChat.type === "individual" && t.userId === activeChat.id) ||
      (activeChat.type === "group" && activeChat.id === "general")
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [filteredMessages.length]); // Only depend on the length, not the entire array

  return (
    <div className="flex flex-col h-screen bg-brand-offwhite">
      {/* Header */}
      <div className="bg-white p-4 lg:p-6 border-b border-brand-coffee/10 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-black">
              Team Chat
            </h1>
            <p className="text-black/70 text-sm lg:text-base">
              Real-time communication with your team
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    {notifications.length}
                  </Badge>
                )}
              </Button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-10 w-80 bg-white border border-brand-coffee/20 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-brand-coffee/10">
                    <h3 className="font-semibold text-black">Notifications</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-black/60">
                      No new notifications
                    </div>
                  ) : (
                    <div className="p-2">
                      {notifications.map(
                        (notification: {
                          id: string;
                          message: string;
                          from: string;
                          fromName: string;
                          timestamp: Date;
                          type: "individual" | "group";
                          isRead: boolean;
                        }) => (
                          <div
                            key={notification.id}
                            className="p-2 hover:bg-brand-offwhite rounded-lg"
                          >
                            <div className="flex items-start space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={getUserById(notification.from)?.avatar}
                                />
                                <AvatarFallback className="bg-brand-coffee/10 text-brand-coffee text-xs">
                                  {notification.fromName
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-black">
                                  {notification.fromName}
                                </p>
                                <p className="text-xs text-black/60 truncate">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-black/40">
                                  {format(notification.timestamp, "HH:mm")}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {notification.type}
                              </Badge>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                  <div className="p-2 border-t border-brand-coffee/10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNotifications([])}
                      className="w-full text-xs"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <span className="text-xs text-black/60 hidden sm:inline">
                {isConnected ? "Connected" : "Connecting..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Users List - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block w-80 bg-white border-r border-brand-coffee/10">
          <div className="p-4 border-b border-brand-coffee/10">
            <h2 className="font-semibold text-black mb-3">Chats</h2>

            {/* Group Chat */}
            <div
              className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors mb-2 ${
                activeChat.type === "group" && activeChat.id === "general"
                  ? "bg-brand-coffee text-white"
                  : "hover:bg-brand-offwhite text-black"
              }`}
              onClick={() => handleChatSwitch("group", "general")}
            >
              <div className="relative">
                <Hash className="h-8 w-8" />
                {getUnreadCount("group", "general") > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    {getUnreadCount("group", "general")}
                  </Badge>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">General Team Chat</p>
                <p className="text-xs opacity-70 truncate">All team members</p>
              </div>
            </div>

            {/* Individual Chats */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-black/60 mb-2">
                Direct Messages
              </p>
              {otherUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    activeChat.type === "individual" &&
                    activeChat.id === user.id
                      ? "bg-brand-coffee text-white"
                      : "hover:bg-brand-offwhite text-black"
                  }`}
                  onClick={() => handleChatSwitch("individual", user.id)}
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-brand-coffee/10 text-brand-coffee">
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {getUnreadCount("individual", user.id) > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                        {getUnreadCount("individual", user.id)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.name}</p>
                    <p className="text-xs opacity-70 truncate">{user.email}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      user.role === "admin"
                        ? "border-red-200 text-red-600"
                        : user.role === "sales"
                        ? "border-blue-200 text-blue-600"
                        : user.role === "design"
                        ? "border-purple-200 text-purple-600"
                        : "border-brand-coffee/30 text-brand-coffee"
                    }`}
                  >
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Chat Selector */}
        <div className="lg:hidden bg-white border-b border-brand-coffee/10 p-2">
          <Tabs
            value={activeChat.type}
            onValueChange={(value) => {
              if (value === "group") {
                handleChatSwitch("group", "general");
              } else {
                // For individual, show user selector
                setActiveChat({ type: "individual" });
              }
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="group"
                className="flex items-center space-x-2"
              >
                <Hash className="h-4 w-4" />
                <span>Group</span>
                {getUnreadCount("group", "general") > 0 && (
                  <Badge className="h-4 w-4 rounded-full p-0 text-xs">
                    {getUnreadCount("group", "general")}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="individual"
                className="flex items-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Direct</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {activeChat.type === "individual" && (
            <Select
              value={activeChat.id}
              onValueChange={(userId) => handleChatSwitch("individual", userId)}
            >
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Select team member to chat with" />
              </SelectTrigger>
              <SelectContent>
                {otherUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-brand-coffee/10 text-brand-coffee text-xs">
                          {user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                      {getUnreadCount("individual", user.id) > 0 && (
                        <Badge className="h-4 w-4 rounded-full p-0 text-xs">
                          {getUnreadCount("individual", user.id)}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col bg-white">
          {activeChat.id ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-brand-coffee/10 bg-brand-offwhite">
                <div className="flex items-center space-x-3">
                  {activeChat.type === "individual" ? (
                    <>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={getUserById(activeChat.id)?.avatar} />
                        <AvatarFallback className="bg-brand-coffee/10 text-brand-coffee">
                          {getUserById(activeChat.id)
                            ?.name?.slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-black">
                          {getUserById(activeChat.id)?.name}
                        </h3>
                        <p className="text-sm text-black/60">
                          {getUserById(activeChat.id)?.email}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`ml-auto ${
                          getUserById(activeChat.id)?.role === "admin"
                            ? "border-red-200 text-red-600"
                            : getUserById(activeChat.id)?.role === "sales"
                            ? "border-blue-200 text-blue-600"
                            : getUserById(activeChat.id)?.role === "design"
                            ? "border-purple-200 text-purple-600"
                            : "border-brand-coffee/30 text-brand-coffee"
                        }`}
                      >
                        {getUserById(activeChat.id)?.role}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Hash className="h-10 w-10 text-brand-coffee" />
                      <div>
                        <h3 className="font-semibold text-black">
                          General Team Chat
                        </h3>
                        <p className="text-sm text-black/60">
                          {users.length} members • Real-time group chat
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {filteredMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-brand-coffee/40 mx-auto mb-4" />
                      <p className="text-black/60">
                        {activeChat.type === "individual"
                          ? `Start a conversation with ${
                              getUserById(activeChat.id)?.name
                            }`
                          : "Start the team conversation!"}
                      </p>
                    </div>
                  ) : (
                    filteredMessages.map((message) => {
                      const sender = getUserById(message.senderId);
                      const isOwnMessage = message.senderId === currentUser?.id;

                      return (
                        <div
                          key={message.id}
                          className={`flex ${
                            isOwnMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                              isOwnMessage
                                ? "flex-row-reverse space-x-reverse"
                                : ""
                            }`}
                          >
                            {activeChat.type === "group" && !isOwnMessage && (
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={sender?.avatar} />
                                <AvatarFallback className="bg-brand-coffee/10 text-brand-coffee text-xs">
                                  {sender?.name?.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`rounded-lg px-3 py-2 shadow-sm ${
                                isOwnMessage
                                  ? "bg-brand-coffee text-white"
                                  : "bg-brand-offwhite text-black border border-brand-coffee/20"
                              }`}
                            >
                              {activeChat.type === "group" && !isOwnMessage && (
                                <p className="text-xs font-medium mb-1 opacity-70">
                                  {sender?.name}
                                </p>
                              )}
                              <p className="text-sm">{message.content}</p>
                              <div
                                className={`flex items-center justify-between mt-1 ${
                                  isOwnMessage
                                    ? "text-white/70"
                                    : "text-black/50"
                                }`}
                              >
                                <p className="text-xs">
                                  {format(new Date(message.timestamp), "HH:mm")}
                                </p>
                                {isOwnMessage && (
                                  <div className="flex items-center space-x-1">
                                    {getMessageStatusIcon(message.status)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Typing Indicators */}
                  {currentTypingUsers.length > 0 && (
                    <div className="flex justify-start">
                      <div className="flex items-center space-x-2 bg-brand-offwhite text-black border border-brand-coffee/20 rounded-lg px-3 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-brand-coffee rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-brand-coffee rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-brand-coffee rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-xs">
                          {currentTypingUsers.map((t) => t.userName).join(", ")}{" "}
                          typing...
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-brand-coffee/10 bg-white">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder={
                      activeChat.type === "individual"
                        ? `Message ${getUserById(activeChat.id)?.name}...`
                        : "Type your message to the team..."
                    }
                    className="flex-1 bg-brand-offwhite border-brand-coffee/20 focus:border-brand-coffee focus:ring-brand-coffee text-black"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || !isConnected}
                    className="bg-brand-coffee hover:bg-brand-coffee-dark text-white px-4 lg:px-6"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-brand-coffee/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-black mb-2">
                  Select a chat
                </h3>
                <p className="text-black/60">
                  Choose a team member or join the group chat to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
