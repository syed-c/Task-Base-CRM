"use client";

import { useState } from "react";
import { useCRMStore } from "@/lib/store";
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
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload, UploadedFile } from "@/components/ui/file-upload";
import { FileDisplay, DisplayFile } from "@/components/ui/file-display";
import {
  Plus,
  Calendar as CalendarIcon,
  FolderOpen,
  Users,
  Clock,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const projectStatuses = ["planning", "active", "completed", "on-hold"] as const;
const categories = [
  "Sales",
  "Design",
  "Management",
  "Development",
  "Marketing",
  "Support",
];

export function ProjectManagement() {
  const {
    projects,
    users,
    currentUser,
    addProject,
    updateProject,
    deleteProject,
  } = useCRMStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    deadline: new Date(),
    assignedMembers: [] as string[],
    category: "",
    status: "planning" as (typeof projectStatuses)[number],
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      deadline: new Date(),
      assignedMembers: [],
      category: "",
      status: "planning",
    });
    setSelectedDate(undefined);
    setUploadedFiles([]);
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding project with data:", formData);

    if (!formData.name || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Convert uploaded files to string array for storage
    const fileUrls = uploadedFiles.map((file) => file.url);

    addProject({
      name: formData.name,
      description: formData.description,
      deadline: formData.deadline,
      assignedMembers: formData.assignedMembers,
      category: formData.category,
      status: formData.status,
      files: fileUrls,
    });

    toast.success("Project created successfully!");
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleStatusUpdate = (
    projectId: string,
    newStatus: (typeof projectStatuses)[number]
  ) => {
    console.log("Updating project status:", projectId, newStatus);
    updateProject(projectId, { status: newStatus });
    toast.success("Project status updated!");
  };

  const handleDeleteProject = (projectId: string) => {
    console.log("Deleting project:", projectId);
    deleteProject(projectId);
    toast.success("Project deleted successfully!");
  };

  const handleMemberToggle = (userId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      assignedMembers: checked
        ? [...prev.assignedMembers, userId]
        : prev.assignedMembers.filter((id) => id !== userId),
    }));
  };

  const getStatusColor = (status: (typeof projectStatuses)[number]) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-600";
      case "active":
        return "bg-blue-100 text-blue-600";
      case "on-hold":
        return "bg-brand-coffee/10 text-brand-coffee";
      default:
        return "bg-brand-coffee/10 text-brand-coffee";
    }
  };

  const getAssignedUsers = (userIds: string[]) => {
    return users.filter((user) => userIds.includes(user.id));
  };

  // Convert string URLs back to DisplayFile objects for display
  const getProjectFiles = (fileUrls: string[]): DisplayFile[] => {
    if (!fileUrls || !Array.isArray(fileUrls)) {
      return [];
    }
    return fileUrls.map((url, index) => ({
      id: `project-file-${index}`,
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
            Project Management
          </h1>
          <p className="text-black/70 mt-2">
            Manage your projects and track their progress
          </p>
        </div>

        {currentUser?.role === "admin" && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-coffee hover:bg-brand-coffee-dark text-white font-medium px-4 lg:px-6 py-2 lg:py-3 shadow-lg w-full lg:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white">
              <DialogHeader className="bg-brand-coffee text-white p-4 -m-4 mb-0 rounded-t-lg sticky top-0 z-10">
                <DialogTitle className="text-lg text-white">
                  Create New Project
                </DialogTitle>
                <DialogDescription className="text-white/80">
                  Create a new project and assign team members
                </DialogDescription>
              </DialogHeader>

              <div className="p-4">
                <form onSubmit={handleAddProject} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-black font-medium">
                      Project Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter project name"
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
                      placeholder="Enter project description"
                      rows={3}
                      className="bg-white border-brand-coffee/20 focus:border-brand-coffee focus:ring-brand-coffee text-black"
                    />
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
                    <Label className="text-black font-medium">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(
                        value: (typeof projectStatuses)[number]
                      ) => setFormData((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="bg-white border-brand-coffee/20 focus:border-brand-coffee focus:ring-brand-coffee text-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-brand-coffee/20">
                        {projectStatuses.map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="hover:bg-brand-offwhite text-black"
                          >
                            <span className="capitalize">
                              {status.replace("-", " ")}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-black font-medium">
                      Assign Team Members
                    </Label>
                    <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto bg-brand-offwhite p-3 rounded-lg border border-brand-coffee/10">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={user.id}
                            checked={formData.assignedMembers.includes(user.id)}
                            onCheckedChange={(checked) =>
                              handleMemberToggle(user.id, checked as boolean)
                            }
                          />
                          <Label
                            htmlFor={user.id}
                            className="flex items-center space-x-2 flex-1 cursor-pointer"
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="bg-brand-coffee/10 text-brand-coffee text-xs">
                                {user.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-black truncate">
                              {user.name}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-xs ml-auto border-brand-coffee/30 text-brand-coffee"
                            >
                              {user.role}
                            </Badge>
                          </Label>
                        </div>
                      ))}
                    </div>
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
                    maxFiles={10}
                    maxSize={10}
                    label="Attach Project Files"
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
                      Create Project
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {projects.map((project) => {
          const assignedUsers = getAssignedUsers(project.assignedMembers);
          const isOverdue =
            new Date(project.deadline) < new Date() &&
            project.status !== "completed";

          return (
            <Card
              key={project.id}
              className="hover:shadow-md transition-shadow bg-white border border-brand-coffee/10"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base lg:text-lg leading-tight text-black">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="mt-1 text-black/70 overflow-hidden text-ellipsis">
                      {project.description || "No description provided"}
                    </CardDescription>
                  </div>
                  {currentUser?.role === "admin" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteProject(project.id)}
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
                  <Badge className={getStatusColor(project.status)}>
                    {project.status.replace("-", " ")}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-brand-coffee/30 text-brand-coffee"
                  >
                    {project.category}
                  </Badge>
                </div>

                {/* Assigned Members */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-black/40" />
                    <span className="text-sm text-black/70">Team Members:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {assignedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-1"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-brand-coffee/10 text-brand-coffee text-xs">
                            {user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-black truncate">
                          {user.name}
                        </span>
                      </div>
                    ))}
                    {assignedUsers.length === 0 && (
                      <span className="text-xs text-black/50">
                        No members assigned
                      </span>
                    )}
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
                    {format(new Date(project.deadline), "MMM dd, yyyy")}
                  </span>
                  {isOverdue && (
                    <Badge className="bg-red-100 text-red-600 text-xs">
                      Overdue
                    </Badge>
                  )}
                </div>

                {/* Files */}
                {project.files && project.files.length > 0 && (
                  <div className="pt-2 border-t border-brand-coffee/10">
                    <FileDisplay
                      files={getProjectFiles(project.files)}
                      maxDisplay={3}
                    />
                  </div>
                )}

                {/* Status Update (for admin) */}
                {currentUser?.role === "admin" && (
                  <div className="pt-2 border-t border-brand-coffee/10">
                    <Label className="text-sm font-medium text-black mb-2 block">
                      Update Status
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {projectStatuses.map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={
                            project.status === status ? "default" : "outline"
                          }
                          onClick={() => handleStatusUpdate(project.id, status)}
                          className={`text-xs ${
                            project.status === status
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
                      Created{" "}
                      {format(new Date(project.createdAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {projects.length === 0 && (
        <Card className="text-center py-12 bg-white border border-brand-coffee/10">
          <CardContent>
            <FolderOpen className="h-12 w-12 text-brand-coffee/40 mx-auto mb-4" />
            <CardTitle className="text-black mb-2">No projects yet</CardTitle>
            <CardDescription className="text-black/70">
              {currentUser?.role === "admin"
                ? "Create your first project to get started"
                : "No projects available yet"}
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
