import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';
import { Task, TaskStatus, FilterState, ViewMode, Priority, Subtask } from '@/types/todo';
import { getInitialTasks, DEFAULT_CATEGORIES } from '@/libs/initialData';

interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  categories: string[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Task operations
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'pomodoroSessions' | 'completed' | 'status'> & { status?: TaskStatus; completed?: boolean }) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  duplicateTask: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  
  // Subtask operations
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  
  // Pomodoro
  incrementPomodoro: (taskId: string) => void;
  activePomodoroTask: Task | null;
  setActivePomodoroTask: (task: Task | null) => void;

  // Batch operations
  clearCompletedTasks: () => void;
  markAllAsCompleted: () => void;
  resetToSampleData: () => void;
  exportTasksJSON: () => void;
  exportTasksCSV: () => void;
  importTasksJSON: (jsonString: string) => boolean;

  // Modals & UI
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (open: boolean) => void;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  isPomodoroOpen: boolean;
  setIsPomodoroOpen: (open: boolean) => void;
  isAnalyticsOpen: boolean;
  setIsAnalyticsOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  
  // Stats
  stats: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    overdue: number;
    todayDue: number;
    completionRate: number;
    totalPomodoros: number;
  };
}

const STORAGE_KEY = 'taskflow_todos_v2';
const THEME_KEY = 'taskflow_theme_v2';

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [activePomodoroTask, setActivePomodoroTask] = useState<Task | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    priority: 'all',
    timeline: 'all',
    status: 'all',
    sortBy: 'dueDate',
    sortOrder: 'asc',
  });

  // Load theme and tasks from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initial = prefersDark ? 'dark' : 'light';
        setTheme(initial);
        if (initial === 'dark') document.documentElement.classList.add('dark');
      }

      const savedTasks = localStorage.getItem(STORAGE_KEY);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        const initial = getInitialTasks();
        setTasks(initial);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      }
    } catch (e) {
      console.error('Failed to load tasks from storage:', e);
      setTasks(getInitialTasks());
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save tasks to localStorage when modified
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (e) {
        console.error('Failed to persist tasks:', e);
      }
    }
  }, [tasks, isLoaded]);

  // Global keyboard shortcuts (Cmd+K, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setEditingTask(null);
        setIsTaskModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem(THEME_KEY, next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  }, []);

  // Trigger celebration confetti
  const triggerCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
      });
    } catch {
      // ignore
    }
  }, []);

  // Add Task
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'pomodoroSessions' | 'completed' | 'status'> & { status?: TaskStatus; completed?: boolean }) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      completed: taskData.completed ?? false,
      status: taskData.status ?? (taskData.completed ? 'completed' : 'todo'),
      createdAt: now,
      updatedAt: now,
      pomodoroSessions: 0,
      subtasks: taskData.subtasks || [],
      tags: taskData.tags || [],
    };

    setTasks((prev) => [newTask, ...prev]);
    toast.success('Task created');
  }, []);

  // Update Task
  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        const updated = {
          ...task,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        // sync status and completed flag
        if (updates.completed !== undefined && updates.status === undefined) {
          updated.status = updates.completed ? 'completed' : 'todo';
        } else if (updates.status !== undefined && updates.completed === undefined) {
          updated.completed = updates.status === 'completed';
        }
        return updated;
      })
    );
    toast.success('Task updated');
  }, []);

  // Toggle Task Completion
  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        const willComplete = !task.completed;
        if (willComplete) {
          triggerCelebration();
        }
        return {
          ...task,
          completed: willComplete,
          status: willComplete ? 'completed' : 'todo',
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, [triggerCelebration]);

  // Set Task Status (for Board Drag/Move)
  const setTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        const isCompleted = status === 'completed';
        if (isCompleted && !task.completed) {
          triggerCelebration();
        }
        return {
          ...task,
          status,
          completed: isCompleted,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, [triggerCelebration]);

  // Delete Task
  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    toast.success('Task deleted');
  }, []);

  // Duplicate Task
  const duplicateTask = useCallback((id: string) => {
    setTasks((prev) => {
      const existing = prev.find((t) => t.id === id);
      if (!existing) return prev;
      const clone: Task = {
        ...existing,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: `${existing.title} (Copy)`,
        completed: false,
        status: 'todo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pomodoroSessions: 0,
        subtasks: existing.subtasks.map((s) => ({ ...s, id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, completed: false })),
      };
      return [clone, ...prev];
    });
    toast.success('Task duplicated');
  }, []);

  // Subtask operations
  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const updatedSubtasks = task.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);
        return {
          ...task,
          subtasks: updatedSubtasks,
          completed: allCompleted ? true : task.completed,
          status: allCompleted ? 'completed' : task.status,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const addSubtask = useCallback((taskId: string, title: string) => {
    if (!title.trim()) return;
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const newSubtask: Subtask = {
          id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title: title.trim(),
          completed: false,
        };
        return {
          ...task,
          subtasks: [...task.subtasks, newSubtask],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          subtasks: task.subtasks.filter((st) => st.id !== subtaskId),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  // Pomodoro
  const incrementPomodoro = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          pomodoroSessions: (task.pomodoroSessions || 0) + 1,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    toast.success('Focus session logged!');
  }, []);

  // Batch operations
  const clearCompletedTasks = useCallback(() => {
    setTasks((prev) => prev.filter((t) => !t.completed));
    toast.success('Completed tasks cleared');
  }, []);

  const markAllAsCompleted = useCallback(() => {
    setTasks((prev) =>
      prev.map((t) => ({
        ...t,
        completed: true,
        status: 'completed',
        subtasks: t.subtasks.map((s) => ({ ...s, completed: true })),
        updatedAt: new Date().toISOString(),
      }))
    );
    triggerCelebration();
    toast.success('All tasks marked as completed');
  }, [triggerCelebration]);

  const resetToSampleData = useCallback(() => {
    const samples = getInitialTasks();
    setTasks(samples);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
    toast.success('Reset to sample data');
  }, []);

  // Export / Import
  const exportTasksJSON = useCallback(() => {
    const jsonStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Tasks exported as JSON');
  }, [tasks]);

  const exportTasksCSV = useCallback(() => {
    const headers = ['Title', 'Description', 'Status', 'Priority', 'Category', 'Due Date', 'Tags', 'Created At'];
    const rows = tasks.map((t) => [
      `"${t.title.replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      t.category,
      t.dueDate || '',
      `"${t.tags.join(', ')}"`,
      t.createdAt,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Tasks exported as CSV');
  }, [tasks]);

  const importTasksJSON = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) throw new Error('Invalid format');
      setTasks(parsed);
      toast.success(`Imported ${parsed.length} tasks successfully`);
      return true;
    } catch {
      toast.error('Invalid JSON file format');
      return false;
    }
  }, []);

  // Dynamic Categories list from existing tasks + defaults
  const categories = useMemo(() => {
    const set = new Set(DEFAULT_CATEGORIES.map((c) => c.name));
    tasks.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tasks]);

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return tasks.filter((task) => {
      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = (task.description || '').toLowerCase().includes(q);
        const matchTag = task.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTag) return false;
      }

      // Category
      if (filters.category !== 'all' && task.category !== filters.category) {
        return false;
      }

      // Priority
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }

      // Status
      if (filters.status !== 'all' && task.status !== filters.status) {
        return false;
      }

      // Timeline Filter
      if (filters.timeline === 'today') {
        if (task.dueDate !== todayStr) return false;
      } else if (filters.timeline === 'upcoming') {
        if (!task.dueDate || task.dueDate <= todayStr) return false;
      } else if (filters.timeline === 'overdue') {
        if (!task.dueDate || task.dueDate >= todayStr || task.completed) return false;
      } else if (filters.timeline === 'completed') {
        if (!task.completed) return false;
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (filters.sortBy === 'dueDate') {
        const dateA = a.dueDate || '9999-99-99';
        const dateB = b.dueDate || '9999-99-99';
        comparison = dateA.localeCompare(dateB);
      } else if (filters.sortBy === 'priority') {
        const priorityOrder: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        comparison = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      } else if (filters.sortBy === 'createdAt') {
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (filters.sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [tasks, filters]);

  // Statistics calculation
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const pending = tasks.filter((t) => !t.completed).length;
    const overdue = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStr).length;
    const todayDue = tasks.filter((t) => t.dueDate === todayStr).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalPomodoros = tasks.reduce((acc, t) => acc + (t.pomodoroSessions || 0), 0);

    return {
      total,
      completed,
      pending,
      inProgress,
      overdue,
      todayDue,
      completionRate,
      totalPomodoros,
    };
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        filters,
        setFilters,
        viewMode,
        setViewMode,
        categories,
        theme,
        toggleTheme,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        duplicateTask,
        setTaskStatus,
        toggleSubtask,
        addSubtask,
        deleteSubtask,
        incrementPomodoro,
        activePomodoroTask,
        setActivePomodoroTask,
        clearCompletedTasks,
        markAllAsCompleted,
        resetToSampleData,
        exportTasksJSON,
        exportTasksCSV,
        importTasksJSON,
        isTaskModalOpen,
        setIsTaskModalOpen,
        editingTask,
        setEditingTask,
        isPomodoroOpen,
        setIsPomodoroOpen,
        isAnalyticsOpen,
        setIsAnalyticsOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        stats,
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
