"use client";

import { useCRMStore } from "@/lib/store";
import { LoginForm } from "./LoginForm";
import { Sidebar } from "./Sidebar";
import { Dashboard } from "./Dashboard";
import { MemberDashboard } from "./MemberDashboard";
import { UserManagement } from "./UserManagement";
import { TaskManagement } from "./TaskManagement";
import { ProjectManagement } from "./ProjectManagement";
import { ChatInterface } from "./ChatInterface";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Toaster } from "@/components/ui/sonner";
import {
  Building2,
  LogOut,
  LayoutDashboard,
  Users,
  CheckSquare,
  FolderOpen,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function CRMApp() {
  const { currentUser, activeTab, setCurrentUser, setActiveTab } =
    useCRMStore();
  const { isConnected, notifications } = useWebSocket();

  console.log(
    "🔄 CRM App render - User:",
    currentUser?.name,
    "Role:",
    currentUser?.role,
    "Tab:",
    activeTab
  );
  console.log("💬 Real-time chat status:", {
    isConnected,
    notificationCount: notifications.length,
  });

  // Show login form if no user is logged in
  if (!currentUser) {
    return (
      <>
        <LoginForm />
        <Toaster />
      </>
    );
  }

  // Role-based navigation (defined after login check)
  const adminNavigation = [
    { name: "Dashboard", icon: LayoutDashboard, tab: "dashboard" as const },
    { name: "Team Members", icon: Users, tab: "users" as const },
    { name: "Tasks", icon: CheckSquare, tab: "tasks" as const },
    { name: "Projects", icon: FolderOpen, tab: "projects" as const },
    { name: "Chat", icon: MessageCircle, tab: "chat" as const },
  ];

  const memberNavigation = [
    { name: "Dashboard", icon: LayoutDashboard, tab: "dashboard" as const },
    { name: "My Tasks", icon: CheckSquare, tab: "tasks" as const },
    { name: "Projects", icon: FolderOpen, tab: "projects" as const },
    { name: "Chat", icon: MessageCircle, tab: "chat" as const },
  ];

  const navigation =
    currentUser.role === "admin" ? adminNavigation : memberNavigation;

  const renderContent = () => {
    // Role-based content rendering
    switch (activeTab) {
      case "dashboard":
        // Show different dashboards based on user role
        return currentUser.role === "admin" ? (
          <Dashboard />
        ) : (
          <MemberDashboard />
        );
      case "users":
        // Only admins can manage users
        return currentUser.role === "admin" ? (
          <UserManagement />
        ) : (
          <MemberDashboard />
        );
      case "tasks":
        return <TaskManagement />;
      case "projects":
        return <ProjectManagement />;
      case "chat":
        return <ChatInterface />;
      default:
        return currentUser.role === "admin" ? (
          <Dashboard />
        ) : (
          <MemberDashboard />
        );
    }
  };

  // Main CRM interface
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-brand-offwhite">
      {/* Mobile Header */}
      <div className="lg:hidden bg-brand-coffee text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="h-6 w-6 text-white" />
          <h1 className="text-lg font-semibold text-white">H - S Management</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentUser(null)}
          className="text-white hover:bg-white/20"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden bg-white border-b border-brand-coffee/20">
        <div className="flex overflow-x-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.tab)}
                className={`flex-shrink-0 flex flex-col items-center space-y-1 px-4 py-3 text-xs font-medium transition-all duration-200 ${
                  activeTab === item.tab
                    ? "bg-brand-coffee text-white"
                    : "text-black hover:bg-brand-offwhite"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        {renderContent()}

        {/* Real-time Notifications */}
        {notifications.length > 0 && (
          <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-xs">
            {notifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className="bg-brand-coffee text-white p-3 rounded-lg shadow-lg border border-brand-coffee-dark animate-pulse"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">New Message</span>
                </div>
                <p className="text-sm text-white/90 mt-1 truncate">
                  {notification.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Connection Status */}
        <div className="fixed bottom-4 left-4 z-40">
          <div
            className={`flex items-center space-x-2 px-3 py-2 rounded-full text-xs ${
              isConnected
                ? "bg-green-500/20 text-green-700 border border-green-200"
                : "bg-red-500/20 text-red-700 border border-red-200"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="hidden sm:inline">
              {isConnected ? "Connected" : "Connecting..."}
            </span>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
