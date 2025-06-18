"use client";

import { useCRMStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Building2,
  LayoutDashboard,
  Users,
  CheckSquare,
  FolderOpen,
  MessageCircle,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Sidebar() {
  const { activeTab, setActiveTab, currentUser, setCurrentUser } =
    useCRMStore();

  // Role-based navigation
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
    currentUser?.role === "admin" ? adminNavigation : memberNavigation;

  const handleLogout = () => {
    console.log("User logging out");
    setCurrentUser(null);
  };

  return (
    <div className="w-64 bg-white border-r border-brand-coffee/20 flex flex-col h-screen shadow-lg">
      {/* Header */}
      <div className="p-6 bg-brand-coffee text-white">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-white" />
          <h1 className="text-xl font-semibold text-white">H - S Management</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 bg-brand-offwhite">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.tab)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === item.tab
                  ? "bg-brand-coffee text-white shadow-md"
                  : "text-black hover:bg-white hover:shadow-sm"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 bg-white border-t border-brand-coffee/20">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-10 w-10 border-2 border-brand-coffee/20">
            <AvatarImage src={currentUser?.avatar} />
            <AvatarFallback className="bg-brand-coffee text-white text-sm font-medium">
              {currentUser?.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-black truncate">
              {currentUser?.name}
            </p>
            <p className="text-xs text-brand-coffee capitalize">
              {currentUser?.role}
            </p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="w-full border-brand-coffee/30 text-brand-coffee hover:bg-brand-coffee hover:text-white"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
