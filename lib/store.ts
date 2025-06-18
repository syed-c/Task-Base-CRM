import { create } from "zustand";
import { persist } from "zustand/middleware";

// Simple password hashing simulation (in production, use bcrypt on server)
const hashPassword = (password: string): string => {
  // Simple base64 encoding for demo purposes
  // In production, use proper hashing like bcrypt
  return btoa(password + "salt-crm-system");
};

const verifyPassword = (password: string, hashedPassword: string): boolean => {
  try {
    const decoded = atob(hashedPassword);
    return decoded === password + "salt-crm-system";
  } catch {
    return false;
  }
};

export type UserRole = "admin" | "sales" | "design" | "management";
export type TaskStatus = "pending" | "in-progress" | "completed" | "overdue";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Stored encrypted password
  role: UserRole;
  categories: string[];
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  deadline: Date;
  status: TaskStatus;
  category: string;
  files: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  deadline: Date;
  assignedMembers: string[];
  category: string;
  status: "planning" | "active" | "completed" | "on-hold";
  files: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  content: string;
  timestamp: Date;
  type: "individual" | "group";
  status?: "sending" | "sent" | "delivered" | "read" | "failed";
  isEdited?: boolean;
  editedAt?: Date;
  replyTo?: string;
}

interface CRMState {
  // Current user
  currentUser: User | null;

  // Users
  users: User[];

  // Tasks
  tasks: Task[];

  // Projects
  projects: Project[];

  // Messages
  messages: Message[];

  // UI State
  activeTab: "dashboard" | "users" | "tasks" | "projects" | "chat";

  // Actions
  setCurrentUser: (user: User | null) => void;
  addUser: (user: Omit<User, "id" | "isOnline" | "lastSeen">) => void;
  authenticateUser: (email: string, password: string) => User | null;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addTaskFile: (taskId: string, fileUrl: string) => void;
  removeTaskFile: (taskId: string, fileUrl: string) => void;

  addProject: (
    project: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addProjectFile: (projectId: string, fileUrl: string) => void;
  removeProjectFile: (projectId: string, fileUrl: string) => void;

  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;

  setActiveTab: (
    tab: "dashboard" | "users" | "tasks" | "projects" | "chat"
  ) => void;
}

export const useCRMStore = create<CRMState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [
        // Demo admin user
        {
          id: "admin-1",
          name: "Admin User",
          email: "admin@crm.com",
          password: hashPassword("admin123"), // Demo encrypted password
          role: "admin",
          categories: ["Management"],
          isOnline: true,
          lastSeen: new Date(),
        },
        // Demo team members
        {
          id: "user-1",
          name: "Sarah Wilson",
          email: "sarah@crm.com",
          password: hashPassword("sarah123"),
          role: "design",
          categories: ["Design", "Marketing"],
          isOnline: false,
          lastSeen: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        },
        {
          id: "user-2",
          name: "Mike Johnson",
          email: "mike@crm.com",
          password: hashPassword("mike123"),
          role: "sales",
          categories: ["Sales", "Support"],
          isOnline: true,
          lastSeen: new Date(),
        },
      ],
      tasks: [
        // Demo tasks
        {
          id: "task-1",
          title: "Design New Landing Page",
          description:
            "Create a modern, responsive landing page for our new product launch",
          assignedTo: "user-1",
          assignedBy: "admin-1",
          deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
          status: "in-progress",
          category: "Design",
          files: [],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          updatedAt: new Date(),
        },
        {
          id: "task-2",
          title: "Contact Potential Clients",
          description:
            "Reach out to 10 potential clients from the new leads list",
          assignedTo: "user-2",
          assignedBy: "admin-1",
          deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
          status: "pending",
          category: "Sales",
          files: [],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          updatedAt: new Date(),
        },
        {
          id: "task-3",
          title: "Update Documentation",
          description:
            "Review and update the project documentation for the new features",
          assignedTo: "user-1",
          assignedBy: "admin-1",
          deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 days from now
          status: "completed",
          category: "Management",
          files: [],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          updatedAt: new Date(),
        },
      ],
      projects: [
        // Demo projects
        {
          id: "project-1",
          name: "Website Redesign",
          description:
            "Complete redesign of the company website with modern UI/UX",
          deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
          assignedMembers: ["user-1", "user-2"],
          category: "Design",
          status: "active",
          files: [],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
          updatedAt: new Date(),
        },
        {
          id: "project-2",
          name: "Sales Campaign Q1",
          description: "Launch comprehensive sales campaign for Q1 targets",
          deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45), // 45 days from now
          assignedMembers: ["user-2"],
          category: "Sales",
          status: "planning",
          files: [],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          updatedAt: new Date(),
        },
      ],
      messages: [],
      activeTab: "dashboard",

      setCurrentUser: (user) => {
        console.log("Setting current user:", user);
        set({ currentUser: user });
      },

      addUser: (userData) => {
        console.log("Adding new user:", userData);
        const newUser: User = {
          ...userData,
          id: `user-${Date.now()}`,
          password: userData.password
            ? hashPassword(userData.password)
            : undefined,
          isOnline: false,
          lastSeen: new Date(),
        };
        set((state) => ({ users: [...state.users, newUser] }));
      },

      authenticateUser: (email, password) => {
        console.log("Authenticating user:", email);
        const { users } = get();
        const user = users.find((u) => u.email === email);
        if (user && user.password && verifyPassword(password, user.password)) {
          console.log("Authentication successful for:", email);
          return user;
        }
        console.log("Authentication failed for:", email);
        return null;
      },

      updateUser: (id, updates) => {
        console.log("Updating user:", id, updates);
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...updates } : user
          ),
        }));
      },

      deleteUser: (id) => {
        console.log("Deleting user:", id);
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
        }));
      },

      addTask: (taskData) => {
        console.log("Adding new task:", taskData);
        const newTask: Task = {
          ...taskData,
          id: `task-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      updateTask: (id, updates) => {
        console.log("Updating task:", id, updates);
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          ),
        }));
      },

      deleteTask: (id) => {
        console.log("Deleting task:", id);
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      addTaskFile: (taskId, fileUrl) => {
        console.log("Adding new file to task:", taskId, fileUrl);
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, files: [...task.files, fileUrl] }
              : task
          ),
        }));
      },

      removeTaskFile: (taskId, fileUrl) => {
        console.log("Removing file from task:", taskId, fileUrl);
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, files: task.files.filter((f) => f !== fileUrl) }
              : task
          ),
        }));
      },

      addProject: (projectData) => {
        console.log("Adding new project:", projectData);
        const newProject: Project = {
          ...projectData,
          id: `project-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
      },

      updateProject: (id, updates) => {
        console.log("Updating project:", id, updates);
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? { ...project, ...updates, updatedAt: new Date() }
              : project
          ),
        }));
      },

      deleteProject: (id) => {
        console.log("Deleting project:", id);
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
        }));
      },

      addProjectFile: (projectId, fileUrl) => {
        console.log("Adding new file to project:", projectId, fileUrl);
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? { ...project, files: [...project.files, fileUrl] }
              : project
          ),
        }));
      },

      removeProjectFile: (projectId, fileUrl) => {
        console.log("Removing file from project:", projectId, fileUrl);
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  files: project.files.filter((f) => f !== fileUrl),
                }
              : project
          ),
        }));
      },

      addMessage: (messageData) => {
        console.log("Adding new message:", messageData);
        const newMessage: Message = {
          ...messageData,
          id: `message-${Date.now()}`,
          timestamp: new Date(),
        };
        set((state) => ({ messages: [...state.messages, newMessage] }));
      },

      updateMessage: (id, updates) => {
        console.log("Updating message:", id, updates);
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === id ? { ...message, ...updates } : message
          ),
        }));
      },

      setActiveTab: (tab) => {
        console.log("Setting active tab:", tab);
        set({ activeTab: tab });
      },
    }),
    {
      name: "crm-storage",
    }
  )
);
