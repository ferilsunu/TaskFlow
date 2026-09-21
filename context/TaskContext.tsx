import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { signOut } from 'next-auth/react';
import { Task, ViewTab, Priority, Subtask, User } from '@/types/todo';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const MAX_CATEGORIES = 7;
const DEFAULT_CATEGORIES = ['Inbox', 'Work', 'Personal'];

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
  
  // Category Operations
  isCategoryModalOpen: boolean;
  setIsCategoryModalOpen: (open: boolean) => void;
  addCategory: (name: string) => Promise<void>;
  editCategory: (oldName: string, newName: string) => Promise<void>;
  deleteCategory: (name: string) => Promise<void>;

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
  addTask: (data: { title: string; notes?: string; priority?: Priority; category?: string; dueDate?: string | null; reminderAt?: string | null }) => Promise<void>;
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
const LOCAL_CATEGORIES_KEY = 'taskflow_categories_v3';
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

  // Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

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

  // Load Categories from API when logged in
  const { data: serverCategories, mutate: mutateCategories } = useSWR<string[]>(
    currentUser ? '/api/user/categories' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
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

  // Local Offline Tasks & Categories (when not logged in)
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [localCategories, setLocalCategories] = useState<string[]>(DEFAULT_CATEGORIES);
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

      const savedCats = localStorage.getItem(LOCAL_CATEGORIES_KEY);
      if (savedCats) {
        setLocalCategories(JSON.parse(savedCats));
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

  // Save local categories when modified (only if guest)
  useEffect(() => {
    if (isLocalLoaded && !currentUser) {
      try {
        localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(localCategories));
      } catch {
        // ignore
      }
    }
  }, [localCategories, isLocalLoaded, currentUser]);

  // Toggle Theme
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // ignore
      }
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

  // Active Categories list (capped at MAX_CATEGORIES)
  const categories: string[] = useMemo(() => {
    if (currentUser && Array.isArray(serverCategories) && serverCategories.length > 0) {
      return serverCategories.slice(0, MAX_CATEGORIES);
    }
    return localCategories.slice(0, MAX_CATEGORIES);
  }, [currentUser, serverCategories, localCategories]);

  // Category Operations: Add Category
  const addCategory = useCallback(
    async (name: string) => {
      const cleanName = name.trim().slice(0, 25);
      if (!cleanName) return;

      if (categories.length >= MAX_CATEGORIES) {
        toast.error(`Category limit reached. Maximum ${MAX_CATEGORIES} categories allowed.`);
        return;
      }

      if (categories.some((c) => c.toLowerCase() === cleanName.toLowerCase())) {
        toast.error('Category already exists');
        return;
      }

      if (currentUser) {
        try {
          const res = await axios.post('/api/user/categories', { name: cleanName });
          mutate('/api/user/categories', res.data, false);
          toast.success(`Category "${cleanName}" created`);
        } catch (err: any) {
          toast.error(err?.response?.data?.error || 'Failed to create category');
        }
      } else {
        const next = [...localCategories, cleanName];
        setLocalCategories(next);
        toast.success(`Category "${cleanName}" created`);
      }
    },
    [categories, currentUser, localCategories]
  );

  // Category Operations: Edit Category
  const editCategory = useCallback(
    async (oldName: string, newName: string) => {
      const cleanOld = oldName.trim();
      const cleanNew = newName.trim().slice(0, 25);
      if (!cleanNew || cleanOld === cleanNew) return;

      if (cleanOld.toLowerCase() === 'inbox') {
        toast.error('Default Inbox category cannot be renamed');
        return;
      }

      if (currentUser) {
        try {
          const res = await axios.patch('/api/user/categories', { oldName: cleanOld, newName: cleanNew });
          mutate('/api/user/categories', res.data, false);
          mutate('/api/tasks');
          if (selectedCategory === cleanOld) {
            setSelectedCategory(cleanNew);
          }
          toast.success('Category renamed');
        } catch (err: any) {
          toast.error(err?.response?.data?.error || 'Failed to rename category');
        }
      } else {
        const nextCats = localCategories.map((c) => (c === cleanOld ? cleanNew : c));
        setLocalCategories(nextCats);
        setLocalTasks((prev) =>
          prev.map((t) => (t.category === cleanOld ? { ...t, category: cleanNew } : t))
        );
        if (selectedCategory === cleanOld) {
          setSelectedCategory(cleanNew);
        }
        toast.success('Category renamed');
      }
    },
    [currentUser, localCategories, selectedCategory]
  );

  // Category Operations: Delete Category
  const deleteCategory = useCallback(
    async (name: string) => {
      const cleanName = name.trim();
      if (cleanName.toLowerCase() === 'inbox') {
        toast.error('Default Inbox category cannot be deleted');
        return;
      }

      if (currentUser) {
        try {
          const res = await axios.delete('/api/user/categories', { data: { name: cleanName } });
          mutate('/api/user/categories', res.data, false);
          mutate('/api/tasks');
          if (selectedCategory === cleanName) {
            setSelectedCategory('all');
          }
          toast.success(`Category "${cleanName}" removed`);
        } catch (err: any) {
          toast.error(err?.response?.data?.error || 'Failed to delete category');
        }
      } else {
        const nextCats = localCategories.filter((c) => c !== cleanName);
        setLocalCategories(nextCats);
        setLocalTasks((prev) =>
          prev.map((t) => (t.category === cleanName ? { ...t, category: 'Inbox' } : t))
        );
        if (selectedCategory === cleanName) {
          setSelectedCategory('all');
        }
        toast.success(`Category "${cleanName}" removed`);
      }
    },
    [currentUser, localCategories, selectedCategory]
  );

  // Keep selectedTask in sync with tasks state
  useEffect(() => {
    if (selectedTask) {
      const fresh = tasks.find((t) => t.id === selectedTask.id);
      if (fresh) setSelectedTask(fresh);
    }
  }, [tasks]);

  // Add Task (No emails sent on create - emails are only sent when reminderAt time is triggered)
  const addTask = useCallback(
    async (data: { title: string; notes?: string; priority?: Priority; category?: string; dueDate?: string | null; reminderAt?: string | null }) => {
      const title = data.title.trim();
      if (!title) return;

      const now = new Date().toISOString();
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const resolvedDueDate = (activeTab === 'today' && !data.dueDate) 
        ? todayStr 
        : (data.dueDate !== undefined ? data.dueDate : null);

      const newTask: Task = {
        id: `task-${Date.now()}`,
        title,
        notes: data.notes || '',
        completed: false,
        priority: data.priority || 'medium',
        category: data.category || (selectedCategory !== 'all' ? selectedCategory : 'Inbox'),
        dueDate: resolvedDueDate,
        reminderAt: data.reminderAt || null,
        reminderSent: false,
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
            reminderAt: newTask.reminderAt,
          });
          // Replace temp task with confirmed server task
          mutate(
            '/api/tasks',
            (current: Task[] = []) =>
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
    [currentUser, activeTab, selectedCategory]
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
      const target = tasks.find((t) => t.id === id);
      if (!target) return;
      const nextCompleted = !target.completed;

      if (nextCompleted) {
        triggerConfetti();
      }

      await updateTask(id, { completed: nextCompleted });
    },
    [tasks, updateTask, triggerConfetti]
  );

  // Delete Task
  const deleteTask = useCallback(
    async (id: string) => {
      if (selectedTask?.id === id) {
        setSelectedTask(null);
      }

      if (currentUser) {
        mutate(
          '/api/tasks',
          (current: Task[] = []) => current.filter((t) => t.id !== id),
          false
        );
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

  // Subtask: Toggle Subtask
  const toggleSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || !task.subtasks) return;

      const updatedSubtasks = task.subtasks.map((st) =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );

      await updateTask(taskId, { subtasks: updatedSubtasks });
    },
    [tasks, updateTask]
  );

  // Subtask: Add Subtask
  const addSubtask = useCallback(
    async (taskId: string, title: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const newSubtask: Subtask = {
        id: `subtask-${Date.now()}`,
        title: title.trim(),
        completed: false,
      };

      const currentSubtasks = task.subtasks || [];
      const updatedSubtasks = [...currentSubtasks, newSubtask];

      await updateTask(taskId, { subtasks: updatedSubtasks });
    },
    [tasks, updateTask]
  );

  // Subtask: Delete Subtask
  const deleteSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || !task.subtasks) return;

      const updatedSubtasks = task.subtasks.filter((st) => st.id !== subtaskId);
      await updateTask(taskId, { subtasks: updatedSubtasks });
    },
    [tasks, updateTask]
  );

  // Logout
  const logout = useCallback(async () => {
    try {
      await signOut({ redirect: false });
      mutate('/api/user/current', null, false);
      mutate('/api/tasks', [], false);
      mutate('/api/user/categories', null, false);
      toast.success('Signed out');
    } catch {
      // ignore
    }
  }, []);

  // Counts for tabs
  const counts = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const pending = tasks.filter((t) => !t.completed);
    const today = pending.filter((t) => t.dueDate === todayStr || (t.dueDate && t.dueDate < todayStr)).length;
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
        isCategoryModalOpen,
        setIsCategoryModalOpen,
        addCategory,
        editCategory,
        deleteCategory,
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
