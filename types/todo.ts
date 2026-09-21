export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  status: TaskStatus;
  priority: Priority;
  category: string;
  dueDate?: string; // YYYY-MM-DD
  subtasks: Subtask[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  pomodoroSessions: number;
}

export type ViewMode = 'list' | 'board' | 'analytics';

export type TimelineFilter = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';

export type SortBy = 'dueDate' | 'priority' | 'createdAt' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  search: string;
  category: string; // 'all' or specific
  priority: string; // 'all' or specific
  timeline: TimelineFilter;
  status: string; // 'all' or specific
  sortBy: SortBy;
  sortOrder: SortOrder;
}

export interface CategoryInfo {
  name: string;
  icon: string;
  color: string;
}
