import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';
import { Task, ViewTab, Priority, Subtask, User } from '@/types/todo';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categories: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Auth
  currentUser: User | null;
  isUserLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  logout: () => void;
  
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Task Operations
  addTask: (data: { title: string; notes?: string; priority?: Priority; category?: string; dueDate?: string | null }) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  // Subtask Operations
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  
  // Drawer / Details
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  
  // Stats
  counts: {
    today: number;
    upcoming: number;
    all: number;
    completed: number;
  };
}

const LOCAL_STORAGE_KEY = 'taskflow_offline_tasks_v3';
const THEME_STORAGE_KEY = 'taskflow_theme_v3';

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ViewTab>('today');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Auth Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Theme
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load User from SWR
  const { data: currentUser, error: userError, isLoading: isUserLoading, mutate: mutateUser } = useSWR<User>(
    '/api/user/current',
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  // Load Tasks from API when logged in
  const { data: serverTasks, error: tasksError, isLoading: isTasksLoading, mutate: mutateTasks } = useSWR<Task[]>(
    currentUser ? '/api/tasks' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
    }
  );

  // Local Offline Tasks (when not logged in)
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);

  // Theme initialization (default to light mode)
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null;
      if (savedTheme === 'dark') {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      } else {
        setTheme('light');
        document.documentElement.classList.remove('dark');
      }

      const savedLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedLocal) {
        setLocalTasks(JSON.parse(savedLocal));
      }
    } catch {
      // ignore
    } finally {
      setIsLocalLoaded(true);
    }
  }, []);

  // Save local tasks when modified (only if guest)
  useEffect(() => {
    if (isLocalLoaded && !currentUser) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localTasks));
      } catch {
        // ignore
      }
    }
  }, [localTasks, isLocalLoaded, currentUser]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_STORAGE_KEY, next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  }, []);

  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#3b82f6'],
      });
    } catch {
      // ignore
    }
  }, []);

  // Active tasks pool (from server or local)
  const tasks: Task[] = useMemo(() => {
    if (currentUser) {
      return Array.isArray(serverTasks) ? serverTasks : [];
    }
    return localTasks;
  }, [currentUser, serverTasks, localTasks]);

  // Keep selectedTask in sync with tasks state
  useEffect(() => {
    if (selectedTask) {
      const fresh = tasks.find((t) => t.id === selectedTask.id);
      if (fresh) setSelectedTask(fresh);
    }
  }, [tasks]);

  // Dynamic Categories
  const categories = useMemo(() => {
    const set = new Set(['Inbox', 'Work', 'Personal', 'Shopping']);
    tasks.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tasks]);

  // Add Task
  const addTask = useCallback(
    async (data: { title: string; notes?: string; priority?: Priority; category?: string; dueDate?: string | null }) => {
      const title = data.title.trim();
      if (!title) return;

      const now = new Date().toISOString();
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title,
        notes: data.notes || '',
        completed: false,
        priority: data.priority || 'medium',
        category: data.category || 'Inbox',
        dueDate: data.dueDate !== undefined ? data.dueDate : (activeTab === 'today' ? now.split('T')[0] : null),
        subtasks: [],
        createdAt: now,
        updatedAt: now,
      };

      if (currentUser) {
        // Optimistic UI update for SWR
        mutate('/api/tasks', (current: Task[] = []) => [newTask, ...current], false);
        try {
          const res = await axios.post('/api/tasks', {
            title: newTask.title,
            notes: newTask.notes,
            completed: false,
            priority: newTask.priority,
            category: newTask.category,
            dueDate: newTask.dueDate,
            subtasks: [],
          });
          // Update SWR cache with server created object containing true ObjectId
          mutate('/api/tasks', (current: Task[] = []) =>
            current.map((t) => (t.id === newTask.id ? res.data : t)),
            false
          );
        } catch {
          mutate('/api/tasks');
          toast.error('Could not save task to database');
        }
      } else {
        setLocalTasks((prev) => [newTask, ...prev]);
      }
    },
    [currentUser, activeTab]
  );

  // Update Task
  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      if (currentUser) {
        mutate(
          '/api/tasks',
          (current: Task[] = []) =>
            current.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)),
          false
        );
        try {
          await axios.patch(`/api/tasks/${id}`, updates);
        } catch {
          mutate('/api/tasks');
          toast.error('Could not update task');
        }
      } else {
        setLocalTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
        );
      }
    },
    [currentUser]
  );

  // Toggle Task Completion
  const toggleTask = useCallback(
    async (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const willComplete = !task.completed;
      if (willComplete) triggerConfetti();

      await updateTask(id, { completed: willComplete });
    },
    [tasks, updateTask, triggerConfetti]
  );

  // Delete Task
  const deleteTask = useCallback(
    async (id: string) => {
      if (selectedTask?.id === id) setSelectedTask(null);

      if (currentUser) {
        mutate('/api/tasks', (current: Task[] = []) => current.filter((t) => t.id !== id), false);
        try {
          await axios.delete(`/api/tasks/${id}`);
          toast.success('Task deleted');
        } catch {
          mutate('/api/tasks');
          toast.error('Could not delete task');
        }
      } else {
        setLocalTasks((prev) => prev.filter((t) => t.id !== id));
        toast.success('Task deleted');
      }
    },
    [currentUser, selectedTask]
  );

  // Subtask operations
  const toggleSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      const currentSubtasks = task.subtasks || [];
      const updated = currentSubtasks.map((st) => (st.id === subtaskId ? { ...st, completed: !st.completed } : st));
      await updateTask(taskId, { subtasks: updated });
    },
    [tasks, updateTask]
  );

  const addSubtask = useCallback(
    async (taskId: string, title: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || !title.trim()) return;
      const newSub: Subtask = {
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: title.trim(),
        completed: false,
      };
      const updated = [...(task.subtasks || []), newSub];
      await updateTask(taskId, { subtasks: updated });
    },
    [tasks, updateTask]
  );

  const deleteSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      const updated = (task.subtasks || []).filter((st) => st.id !== subtaskId);
      await updateTask(taskId, { subtasks: updated });
    },
    [tasks, updateTask]
  );

  const logout = useCallback(async () => {
    try {
      const { signOut } = await import('next-auth/react');
      await signOut({ redirect: false });
      mutate('/api/user/current', null, false);
      mutate('/api/tasks', [], false);
      toast.success('Signed out');
    } catch {
      // ignore
    }
  }, []);

  // Counts for tabs
  const counts = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const pending = tasks.filter((t) => !t.completed);
    const today = pending.filter((t) => t.dueDate === todayStr).length;
    const upcoming = pending.filter((t) => t.dueDate && t.dueDate > todayStr).length;
    const all = pending.length;
    const completed = tasks.filter((t) => t.completed).length;

    return { today, upcoming, all, completed };
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading: currentUser ? isTasksLoading : !isLocalLoaded,
        activeTab,
        setActiveTab,
        selectedCategory,
        setSelectedCategory,
        categories,
        searchQuery,
        setSearchQuery,
        currentUser: currentUser || null,
        isUserLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        logout,
        theme,
        toggleTheme,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        toggleSubtask,
        addSubtask,
        deleteSubtask,
        selectedTask,
        setSelectedTask,
        counts,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
