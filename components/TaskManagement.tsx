"use client";

import { useState } from "react";
import { useCRMStore, TaskStatus } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FileUpload, UploadedFile } from "@/components/ui/file-upload";
import { FileDisplay, DisplayFile } from "@/components/ui/file-display";
import {
  Plus,
  Calendar as CalendarIcon,
  CheckSquare,
  Clock,
  User,
  FileText,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const taskStatuses: TaskStatus[] = [
  "pending",
  "in-progress",
  "completed",
  "overdue",
];
const categories = [
  "Sales",
  "Design",
  "Management",
  "Development",
  "Marketing",
  "Support",
];

export function TaskManagement() {
  const { tasks, users, currentUser, addTask, updateTask, deleteTask } =
    useCRMStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    deadline: new Date(),
    category: "",
    status: "pending" as TaskStatus,
  });

  // Filter tasks based on user role
  const filteredTasks =
    currentUser?.role === "admin"
      ? tasks
      : tasks.filter((task) => task.assignedTo === currentUser?.id);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      assignedTo: "",
      deadline: new Date(),
      category: "",
      status: "pending",
    });
    setSelectedDate(undefined);
    setUploadedFiles([]);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding task with data:", formData);

    if (!formData.title || !formData.assignedTo || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Convert uploaded files to string array for storage
    const fileUrls = uploadedFiles.map((file) => file.url);

    addTask({
      title: formData.title,
      description: formData.description,
      assignedTo: formData.assignedTo,
      assignedBy: currentUser?.id || "",
      deadline: formData.deadline,
      category: formData.category,
      status: formData.status,
      files: fileUrls,
    });

    toast.success("Task created successfully!");
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleStatusUpdate = (taskId: string, newStatus: TaskStatus) => {
    console.log("Updating task status:", taskId, newStatus);
    updateTask(taskId, { status: newStatus });
    toast.success("Task status updated!");
  };

  const handleDeleteTask = (taskId: string) => {
    console.log("Deleting task:", taskId);
    deleteTask(taskId);
    toast.success("Task deleted successfully!");
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-600";
      case "in-progress":
        return "bg-blue-100 text-blue-600";
      case "overdue":
        return "bg-red-100 text-red-600";
      default:
        return "bg-brand-coffee/10 text-brand-coffee";
    }
  };

  const getAssignedUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user?.name || "Unknown User";
  };

  const getAssignedUser = (userId: string) => {
    return users.find((u) => u.id === userId);
  };

  // Convert string URLs back to DisplayFile objects for display
  const getTaskFiles = (fileUrls: string[]): DisplayFile[] => {
    return fileUrls.map((url, index) => ({
      id: `task-file-${index}`,
      name: `File ${index + 1}`,
      size: 0, // We don't store size in the current implementation
      type: "application/octet-stream",
      url: url,
      uploadedAt: new Date(),
    }));
  };

  return (
    <div className="p-4 lg:p-8 space-y-4 lg:space-y-6 bg-brand-offwhite min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-brand-coffee/10">
          <h1 className="text-2xl lg:text-3xl font-bold text-black">
            {currentUser?.role === "admin" ? "Task Management" : "My Tasks"}
          </h1>
          <p className="text-black/70 mt-2">
            {currentUser?.role === "admin"
              ? "Manage and assign tasks to team members"
              : "View and manage your assigned tasks"}
          </p>
        </div>

        {currentUser?.role === "admin" && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-coffee hover:bg-brand-coffee-dark text-white font-medium px-4 lg:px-6 py-2 lg:py-3 shadow-lg w-full lg:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white">
              <DialogHeader className="bg-brand-coffee text-white p-4 -m-4 mb-0 rounded-t-lg sticky top-0 z-10">
                <DialogTitle className="text-lg text-white">
                  Create New Task
                </DialogTitle>
                <DialogDescription className="text-white/80">
                  Assign a new task to a team member
                </DialogDescription>
              </DialogHeader>
              <div className="p-4">
                <form onSubmit={handleAddTask} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-black font-medium">
                      Task Title *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Enter task title"
                      required
                      className="bg-white border-brand-coffee/20 focus:border-brand-coffee focus:ring-brand-coffee text-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-black font-medium"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Enter task description"
                      rows={3}
                      className="bg-white border-brand-coffee/20 focus:border-brand-coffee focus:ring-brand-coffee text-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-black font-medium">
                      Assign To *
                    </Label>
                    <Select
                      value={formData.assignedTo}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, assignedTo: value }))
                      }
                    >
                      <SelectTrigger className="bg-white border-brand-coffee/20 focus:border-brand-coffee focus:ring-brand-coffee text-black">
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-brand-coffee/20">
                        {users.map((user) => (
                          <SelectItem
                            key={user.id}
                            value={user.id}
                            className="hover:bg-brand-offwhite"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-black">{user.name}</span>
                              <Badge
                                variant="outline"
                                className="text-xs border-brand-coffee/30 text-brand-coffee"
                              >
                                {user.role}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-black font-medium">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger className="bg-white border-brand-coffee/20 focus:border-brand-coffee focus:ring-brand-coffee text-black">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-brand-coffee/20">
                        {categories.map((category) => (
                          <SelectItem
                            key={category}
                            value={category}
                            className="hover:bg-brand-offwhite text-black"
                          >
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-black font-medium">Deadline</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-white border-brand-coffee/20 text-black hover:bg-brand-offwhite"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate
                            ? format(selectedDate, "PPP")
                            : format(formData.deadline, "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white border-brand-coffee/20">
                        <Calendar
                          mode="single"
                          selected={selectedDate || formData.deadline}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            if (date) {
                              setFormData((prev) => ({
                                ...prev,
                                deadline: date,
                              }));
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* File Upload Section */}
                  <FileUpload
                    files={uploadedFiles}
                    onFilesChange={setUploadedFiles}
                    maxFiles={5}
                    maxSize={10}
                    label="Attach Files"
                  />

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        resetForm();
                      }}
                      className="border-brand-coffee/30 text-brand-coffee hover:bg-brand-coffee/5"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-brand-coffee hover:bg-brand-coffee-dark text-white font-medium px-4"
                    >
                      Create Task
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredTasks.map((task) => {
          const assignedUser = getAssignedUser(task.assignedTo);
          const isOverdue =
            new Date(task.deadline) < new Date() && task.status !== "completed";

          return (
            <Card
              key={task.id}
              className="hover:shadow-md transition-shadow bg-white border border-brand-coffee/10"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base lg:text-lg leading-tight text-black">
                      {task.title}
                    </CardTitle>
                    <CardDescription className="mt-1 text-black/70 overflow-hidden text-ellipsis">
                      {task.description || "No description provided"}
                    </CardDescription>
                  </div>
                  {currentUser?.role === "admin" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Status and Category */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace("-", " ")}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-brand-coffee/30 text-brand-coffee"
                  >
                    {task.category}
                  </Badge>
                </div>

                {/* Assigned User */}
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-black/40" />
                  <span className="text-sm text-black/70">Assigned to:</span>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={assignedUser?.avatar} />
                      <AvatarFallback className="bg-brand-coffee/10 text-brand-coffee text-xs">
                        {assignedUser?.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-black truncate">
                      {getAssignedUserName(task.assignedTo)}
                    </span>
                  </div>
                </div>

                {/* Deadline */}
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-black/40" />
                  <span className="text-sm text-black/70">Due:</span>
                  <span
                    className={`text-sm font-medium ${
                      isOverdue ? "text-red-600" : "text-black"
                    }`}
                  >
                    {format(new Date(task.deadline), "MMM dd, yyyy")}
                  </span>
                  {isOverdue && (
                    <Badge className="bg-red-100 text-red-600 text-xs">
                      Overdue
                    </Badge>
                  )}
                </div>

                {/* Files */}
                {task.files.length > 0 && (
                  <div className="pt-2 border-t border-brand-coffee/10">
                    <FileDisplay
                      files={getTaskFiles(task.files)}
                      maxDisplay={3}
                    />
                  </div>
                )}

                {/* File Upload for Task Assignee */}
                {currentUser?.id === task.assignedTo && (
                  <div className="pt-2 border-t border-brand-coffee/10">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-black">
                        Add Files to Task
                      </Label>
                      <FileUpload
                        files={[]}
                        onFilesChange={(files) => {
                          // Add files to the task
                          files.forEach((file) => {
                            // In a real app, you'd upload to server first
                            const { addTaskFile } = useCRMStore.getState();
                            addTaskFile(task.id, file.url);
                          });
                        }}
                        maxFiles={3}
                        maxSize={10}
                        label=""
                      />
                    </div>
                  </div>
                )}

                {/* Status Update (for task assignee or admin) */}
                {(currentUser?.id === task.assignedTo ||
                  currentUser?.role === "admin") && (
                  <div className="pt-2 border-t border-brand-coffee/10">
                    <Label className="text-sm font-medium text-black mb-2 block">
                      Update Status
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {taskStatuses.map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={
                            task.status === status ? "default" : "outline"
                          }
                          onClick={() => handleStatusUpdate(task.id, status)}
                          className={`text-xs ${
                            task.status === status
                              ? "bg-brand-coffee text-white"
                              : "border-brand-coffee/30 text-brand-coffee hover:bg-brand-coffee/5"
                          }`}
                        >
                          {status.replace("-", " ")}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Created date */}
                <div className="pt-2 border-t border-brand-coffee/10">
                  <div className="flex items-center space-x-2 text-xs text-black/50">
                    <Clock className="h-3 w-3" />
                    <span>
                      Created {format(new Date(task.createdAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <Card className="text-center py-12 bg-white border border-brand-coffee/10">
          <CardContent>
            <CheckSquare className="h-12 w-12 text-brand-coffee/40 mx-auto mb-4" />
            <CardTitle className="text-black mb-2">No tasks yet</CardTitle>
            <CardDescription className="text-black/70">
              {currentUser?.role === "admin"
                ? "Create your first task to get started"
                : "No tasks assigned to you yet"}
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
