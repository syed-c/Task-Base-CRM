"use client";

import { useState } from "react";
import { useCRMStore, UserRole } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Mail, Trash2, Edit, Users, Plus, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const categories = [
  "Sales",
  "Design",
  "Management",
  "Development",
  "Marketing",
  "Support",
];
const roles: UserRole[] = ["admin", "sales", "design", "management"];

export function UserManagement() {
  const { users, addUser, updateUser, deleteUser, currentUser } = useCRMStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "" as UserRole,
    categories: [] as string[],
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "" as UserRole,
      categories: [],
    });
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding user with data:", formData);

    if (
      !formData.name ||
      !formData.email ||
      !formData.role ||
      !formData.password
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if email already exists
    const existingUser = users.find((u) => u.email === formData.email);
    if (existingUser) {
      toast.error("A user with this email already exists");
      return;
    }

    addUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      categories: formData.categories,
    });

    toast.success(
      `Team member added successfully! They can now log in with email: ${formData.email}`
    );
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    console.log("Updating user:", editingUser, formData);

    updateUser(editingUser, {
      name: formData.name,
      email: formData.email,
      password: formData.password || undefined,
      role: formData.role,
      categories: formData.categories,
    });

    toast.success("Team member updated successfully!");
    resetForm();
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error("You cannot delete your own account");
      return;
    }

    console.log("Deleting user:", userId);
    deleteUser(userId);
    toast.success("Team member deleted successfully!");
  };

  const openEditDialog = (user: any) => {
    console.log("Opening edit dialog for user:", user);
    setEditingUser(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Don't populate password for security
      role: user.role,
      categories: user.categories,
    });
    setIsEditDialogOpen(true);
  };

  const handleCategoryToggle = (category: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      categories: checked
        ? [...prev.categories, category]
        : prev.categories.filter((c) => c !== category),
    }));
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-600";
      case "sales":
        return "bg-blue-100 text-blue-600";
      case "design":
        return "bg-purple-100 text-purple-600";
      case "management":
        return "bg-brand-coffee/10 text-brand-coffee";
      default:
        return "bg-brand-coffee/10 text-brand-coffee";
    }
  };

  const UserForm = ({
    onSubmit,
    isEdit = false,
  }: {
    onSubmit: (e: React.FormEvent) => void;
    isEdit?: boolean;
  }) => {
    // Use local state for form to prevent focus loss
    const [localFormData, setLocalFormData] = useState(formData);

    // Update local state when formData changes (for edit mode)
    useState(() => {
      setLocalFormData(formData);
    });

    const handleSubmit = (e: React.FormEvent) => {
      setFormData(localFormData);
      onSubmit(e);
    };

    return (
      <div className="bg-brand-offwhite p-6 rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-black font-medium">
              Full Name *
            </Label>
            <Input
              id="name"
              value={localFormData.name}
              onChange={(e) =>
                setLocalFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter full name"
              required
              className="bg-white border-brand-coffee/20 focus:border-brand-coffee focus:ring-brand-coffee text-black placeholder:text-black/50"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-black font-medium">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={localFormData.email}
              onChange={(e) =>
                setLocalFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Enter email address"
              required
              className="bg-white border-brand-coffee/20 focus:border-brand-coffee focus:ring-brand-coffee text-black placeholder:text-black/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-black font-medium">
              {isEdit
                ? "New Password (leave blank to keep current)"
                : "Password *"}
            </Label>
            <Input
              id="password"
              type="password"
              value={localFormData.password}
              onChange={(e) =>
                setLocalFormData((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              placeholder={
                isEdit
                  ? "Enter new password (optional)"
                  : "Create a secure password"
              }
              required={!isEdit}
              className="bg-white border-brand-coffee/20 focus:border-brand-coffee focus:ring-brand-coffee text-black placeholder:text-black/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-black font-medium">
              Role *
            </Label>
            <Select
              value={localFormData.role}
              onValueChange={(value: UserRole) =>
                setLocalFormData((prev) => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger className="bg-white border-brand-coffee/20 focus:border-brand-coffee focus:ring-brand-coffee text-black">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="bg-white border-brand-coffee/20">
                {roles.map((role) => (
                  <SelectItem
                    key={role}
                    value={role}
                    className="text-black hover:bg-brand-offwhite"
                  >
                    <span className="capitalize">{role}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-black font-medium">Categories</Label>
            <div className="grid grid-cols-2 gap-3 p-4 bg-white rounded-lg border border-brand-coffee/10">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={localFormData.categories.includes(category)}
                    onCheckedChange={(checked) => {
                      setLocalFormData((prev) => ({
                        ...prev,
                        categories: checked
                          ? [...prev.categories, category]
                          : prev.categories.filter((c) => c !== category),
                      }));
                    }}
                    className="border-brand-coffee data-[state=checked]:bg-brand-coffee data-[state=checked]:border-brand-coffee"
                  />
                  <Label
                    htmlFor={category}
                    className="text-sm text-black cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (isEdit) {
                  setIsEditDialogOpen(false);
                  setEditingUser(null);
                } else {
                  setIsAddDialogOpen(false);
                }
                resetForm();
              }}
              className="border-brand-coffee/30 text-brand-coffee hover:bg-brand-coffee/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-brand-coffee hover:bg-brand-coffee-dark text-white font-medium px-6"
            >
              {isEdit ? "Update" : "Add"} Member
            </Button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-8 space-y-4 lg:space-y-6 bg-brand-offwhite min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-brand-coffee/10">
          <h1 className="text-2xl lg:text-3xl font-bold text-black">
            User Management
          </h1>
          <p className="text-black/70 mt-2">
            Manage team members and their roles
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-coffee hover:bg-brand-coffee-dark text-white font-medium px-4 lg:px-6 py-2 lg:py-3 shadow-lg w-full lg:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader className="bg-brand-coffee text-white p-4 -m-4 mb-0 rounded-t-lg sticky top-0 z-10">
              <DialogTitle className="text-lg text-white">
                Add New User
              </DialogTitle>
              <DialogDescription className="text-white/80">
                Create a new team member account
              </DialogDescription>
            </DialogHeader>

            <div className="p-4">
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-black font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter full name"
                    required
                    className="bg-white border-brand-coffee/20 focus:border-brand-coffee focus:ring-brand-coffee text-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black font-medium">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Enter email address"
                    required
                    className="bg-white border-brand-coffee/20 focus:border-brand-coffee focus:ring-brand-coffee text-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-black font-medium">
                    Password *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Enter password"
                    required
                    className="bg-white border-brand-coffee/20 focus:border-brand-coffee focus:ring-brand-coffee text-black"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-black font-medium">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: (typeof roles)[number]) =>
                      setFormData((prev) => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger className="bg-white border-brand-coffee/20 focus:border-brand-coffee focus:ring-brand-coffee text-black">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-brand-coffee/20">
                      {roles.map((role) => (
                        <SelectItem
                          key={role}
                          value={role}
                          className="hover:bg-brand-offwhite text-black"
                        >
                          <span className="capitalize">{role}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                    Add User
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {users.map((user) => (
          <Card
            key={user.id}
            className="hover:shadow-md transition-shadow bg-white border border-brand-coffee/10"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-brand-coffee/10 text-brand-coffee">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base lg:text-lg leading-tight text-black truncate">
                      {user.name}
                    </CardTitle>
                    <CardDescription className="text-black/70 truncate">
                      {user.email}
                    </CardDescription>
                  </div>
                </div>
                {currentUser?.id !== user.id && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge
                  className={`${
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
                {currentUser?.id === user.id && (
                  <Badge className="bg-brand-coffee text-white text-xs">
                    You
                  </Badge>
                )}
              </div>

              <div className="pt-2 border-t border-brand-coffee/10">
                <div className="flex items-center space-x-2 text-xs text-black/50">
                  <Clock className="h-3 w-3" />
                  <span>
                    Last seen {format(new Date(user.lastSeen), "MMM dd, yyyy")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card className="text-center py-12 bg-white border border-brand-coffee/10">
          <CardContent>
            <Users className="h-12 w-12 text-brand-coffee/40 mx-auto mb-4" />
            <CardTitle className="text-black mb-2">No users yet</CardTitle>
            <CardDescription className="text-black/70">
              Add your first team member to get started
            </CardDescription>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader className="bg-brand-coffee text-white p-6 -m-6 mb-0 rounded-t-lg">
            <DialogTitle className="text-xl text-white">
              Edit Team Member
            </DialogTitle>
            <DialogDescription className="text-white/80">
              Update team member information and security settings
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <UserForm onSubmit={handleEditUser} isEdit />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
