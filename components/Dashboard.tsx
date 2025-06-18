"use client";

import { useCRMStore } from "@/lib/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  CheckSquare,
  FolderOpen,
  MessageCircle,
  Clock,
  TrendingUp,
  Calendar,
} from "lucide-react";

export function Dashboard() {
  const { users, tasks, projects, currentUser } = useCRMStore();

  const myTasks = tasks.filter((task) => task.assignedTo === currentUser?.id);
  const completedTasks = myTasks.filter((task) => task.status === "completed");
  const pendingTasks = myTasks.filter((task) => task.status === "pending");
  const progressPercentage =
    myTasks.length > 0 ? (completedTasks.length / myTasks.length) * 100 : 0;

  const stats = [
    {
      title: "Team Members",
      value: users.length,
      icon: Users,
      description: "Active users",
      color: "text-blue-500",
    },
    {
      title: "My Tasks",
      value: myTasks.length,
      icon: CheckSquare,
      description: `${pendingTasks.length} pending`,
      color: "text-emerald-500",
    },
    {
      title: "Projects",
      value: projects.length,
      icon: FolderOpen,
      description: "Active projects",
      color: "text-brand-coffee",
    },
    {
      title: "Messages",
      value: 0,
      icon: MessageCircle,
      description: "Unread messages",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 bg-brand-offwhite min-h-screen">
      {/* Welcome Header */}
      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-brand-coffee/10">
        <h1 className="text-2xl lg:text-3xl font-bold text-black">
          Welcome back, {currentUser?.name}!
        </h1>
        <p className="text-black/70 mt-2">
          Here's what's happening with your team today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="hover:shadow-md transition-shadow bg-white border border-brand-coffee/10"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs lg:text-sm font-medium text-black">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold text-black">
                  {stat.value}
                </div>
                <p className="text-xs text-black/60 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Task Progress */}
        <Card className="bg-white border border-brand-coffee/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-black">
              <CheckSquare className="h-5 w-5 text-emerald-500" />
              <span>My Task Progress</span>
            </CardTitle>
            <CardDescription className="text-black/70">
              Your task completion for this period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm text-black">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className="text-emerald-600">
                {completedTasks.length} completed
              </span>
              <span className="text-brand-coffee">
                {pendingTasks.length} pending
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Team Activity */}
        <Card className="bg-white border border-brand-coffee/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-black">
              <Users className="h-5 w-5 text-blue-500" />
              <span>Team Members</span>
            </CardTitle>
            <CardDescription className="text-black/70">
              Active team members and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-brand-offwhite text-black text-xs">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-black/60 hidden sm:block">
                      {user.email}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      user.role === "admin"
                        ? "bg-red-100 text-red-600"
                        : user.role === "sales"
                        ? "bg-blue-100 text-blue-600"
                        : user.role === "design"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-brand-coffee/10 text-brand-coffee"
                    }`}
                  >
                    {user.role}
                  </Badge>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-sm text-black/60">No team members yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      {myTasks.length > 0 && (
        <Card className="bg-white border border-brand-coffee/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-black">
              <Clock className="h-5 w-5 text-brand-coffee" />
              <span>Recent Tasks</span>
            </CardTitle>
            <CardDescription className="text-black/70">
              Your latest assigned tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-brand-offwhite rounded-lg border border-brand-coffee/10 space-y-2 sm:space-y-0"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-black">{task.title}</h4>
                    <p className="text-sm text-black/60 mt-1 overflow-hidden text-ellipsis">
                      {task.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Calendar className="h-3 w-3 text-black/40" />
                      <span className="text-xs text-black/60">
                        Due: {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Badge
                    className={`${
                      task.status === "completed"
                        ? "bg-emerald-100 text-emerald-600"
                        : task.status === "in-progress"
                        ? "bg-blue-100 text-blue-600"
                        : task.status === "overdue"
                        ? "bg-red-100 text-red-600"
                        : "bg-brand-coffee/10 text-brand-coffee"
                    }`}
                  >
                    {task.status.replace("-", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
