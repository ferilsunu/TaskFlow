export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  notes?: string | null;
  completed: boolean;
  priority: Priority;
  category: string;
  dueDate?: string | null; // YYYY-MM-DD
  subtasks?: Subtask[] | null;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ViewTab = 'today' | 'upcoming' | 'calendar' | 'all' | 'completed';

export interface User {
  id: string;
  name?: string | null;
  email: string;
  createdAt: string;
}
