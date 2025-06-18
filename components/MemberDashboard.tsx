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
import { Button } from "@/components/ui/button";
import {
  CheckSquare,
  FolderOpen,
  MessageCircle,
  Clock,
  Calendar,
  User,
  AlertCircle,
} from "lucide-react";

export function MemberDashboard() {
  const { tasks, projects, messages, currentUser, setActiveTab } =
    useCRMStore();

  // Filter tasks assigned to current member only
  const myTasks = tasks.filter((task) => task.assignedTo === currentUser?.id);
  const completedTasks = myTasks.filter((task) => task.status === "completed");
  const pendingTasks = myTasks.filter((task) => task.status === "pending");
  const inProgressTasks = myTasks.filter(
    (task) => task.status === "in-progress"
  );
  const overdueTasks = myTasks.filter((task) => {
    const isOverdue =
      new Date(task.deadline) < new Date() && task.status !== "completed";
    return isOverdue;
  });

  const progressPercentage =
    myTasks.length > 0 ? (completedTasks.length / myTasks.length) * 100 : 0;

  // Filter projects where member is assigned
  const myProjects = projects.filter((project) =>
    project.assignedMembers.includes(currentUser?.id || "")
  );

  // Filter messages for current user
  const myMessages = messages.filter(
    (msg) =>
      msg.receiverId === currentUser?.id ||
      msg.senderId === currentUser?.id ||
      msg.type === "group"
  );
  const unreadMessages = myMessages.filter(
    (msg) => msg.senderId !== currentUser?.id // Simple unread logic - messages not sent by user
  ).length;

  // Calculate recent activity
  const recentActivity = [
    ...myTasks.slice(0, 3).map((task) => ({
      type: "task" as const,
      title: task.title,
      description: `Task status: ${task.status}`,
      time: new Date(task.updatedAt).toLocaleDateString(),
    })),
    ...myProjects.slice(0, 2).map((project) => ({
      type: "project" as const,
      title: project.name,
      description: `Project status: ${project.status}`,
      time: new Date(project.updatedAt).toLocaleDateString(),
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5);

  const stats = [
    {
      title: "My Tasks",
      value: myTasks.length,
      icon: CheckSquare,
      description: `${pendingTasks.length} pending, ${inProgressTasks.length} in progress`,
      color: "text-brand-coffee",
      bgColor: "bg-brand-coffee/10",
    },
    {
      title: "My Projects",
      value: myProjects.length,
      icon: FolderOpen,
      description: "Assigned projects",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Messages",
      value: unreadMessages,
      icon: MessageCircle,
      description: "New messages",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Overdue",
      value: overdueTasks.length,
      icon: AlertCircle,
      description: "Tasks past deadline",
      color: "text-red-600",
      bgColor: "bg-red-100",
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
          Here's your current workload and recent activity.
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
        {/* My Tasks */}
        <Card className="bg-white border border-brand-coffee/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-black">
              <CheckSquare className="h-5 w-5 text-emerald-500" />
              <span>My Tasks</span>
            </CardTitle>
            <CardDescription className="text-black/70">
              Your assigned tasks and their progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myTasks.slice(0, 5).map((task) => (
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
              {myTasks.length === 0 && (
                <p className="text-sm text-black/60 text-center py-4">
                  No tasks assigned yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* My Projects */}
        <Card className="bg-white border border-brand-coffee/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-black">
              <FolderOpen className="h-5 w-5 text-blue-500" />
              <span>My Projects</span>
            </CardTitle>
            <CardDescription className="text-black/70">
              Projects you're involved in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myProjects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-brand-offwhite rounded-lg border border-brand-coffee/10 space-y-2 sm:space-y-0"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-black">{project.name}</h4>
                    <p className="text-sm text-black/60 mt-1 overflow-hidden text-ellipsis">
                      {project.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Calendar className="h-3 w-3 text-black/40" />
                      <span className="text-xs text-black/60">
                        Due: {new Date(project.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Badge
                    className={`${
                      project.status === "completed"
                        ? "bg-emerald-100 text-emerald-600"
                        : project.status === "active"
                        ? "bg-blue-100 text-blue-600"
                        : project.status === "on-hold"
                        ? "bg-brand-coffee/10 text-brand-coffee"
                        : "bg-brand-coffee/10 text-brand-coffee"
                    }`}
                  >
                    {project.status.replace("-", " ")}
                  </Badge>
                </div>
              ))}
              {myProjects.length === 0 && (
                <p className="text-sm text-black/60 text-center py-4">
                  No projects assigned yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white border border-brand-coffee/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-black">
            <Clock className="h-5 w-5 text-brand-coffee" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription className="text-black/70">
            Your latest task updates and project changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 bg-brand-offwhite rounded-lg border border-brand-coffee/10"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === "task"
                      ? "bg-emerald-500"
                      : activity.type === "project"
                      ? "bg-blue-500"
                      : "bg-brand-coffee"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">
                    {activity.title}
                  </p>
                  <p className="text-xs text-black/60 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-black/40 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-sm text-black/60 text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
