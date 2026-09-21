import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  X, 
  CheckCircle2, 
  Timer, 
  BarChart2, 
  Download, 
  Sun, 
  Moon,
  Trash2,
  CheckCheck
} from 'lucide-react';
import { useTasks } from '@/context/TaskContext';

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setIsCommandPaletteOpen, 
    tasks, 
    toggleTask, 
    setIsTaskModalOpen, 
    setEditingTask,
    setIsPomodoroOpen,
    setIsAnalyticsOpen,
    theme,
    toggleTheme,
    exportTasksJSON,
    markAllAsCompleted,
    clearCompletedTasks,
    setViewMode,
  } = useTasks();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(query.toLowerCase())) ||
    t.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  const actions = [
    {
      id: 'create-task',
      label: 'Create new task',
      icon: Plus,
      action: () => {
        setEditingTask(null);
        setIsTaskModalOpen(true);
      },
    },
    {
      id: 'open-pomodoro',
      label: 'Open Pomodoro focus timer',
      icon: Timer,
      action: () => setIsPomodoroOpen(true),
    },
    {
      id: 'view-analytics',
      label: 'View Productivity statistics',
      icon: BarChart2,
      action: () => setViewMode('analytics'),
    },
    {
      id: 'toggle-theme',
      label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`,
      icon: theme === 'dark' ? Sun : Moon,
      action: () => toggleTheme(),
    },
    {
      id: 'export-tasks',
      label: 'Export tasks as JSON',
      icon: Download,
      action: () => exportTasksJSON(),
    },
    {
      id: 'mark-all-done',
      label: 'Mark all tasks as completed',
      icon: CheckCheck,
      action: () => markAllAsCompleted(),
    },
  ].filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <Search className="h-5 w-5 text-neutral-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a task name, command, or action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 outline-none"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="text-xs font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-400"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {/* Matching Tasks */}
          {filteredTasks.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Tasks
              </div>
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setEditingTask(t);
                    setIsTaskModalOpen(true);
                    setIsCommandPaletteOpen(false);
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition"
                >
                  <div className="flex items-center gap-2 truncate">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTask(t.id);
                      }}
                      className={`h-4 w-4 rounded border flex items-center justify-center ${
                        t.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-neutral-300 dark:border-neutral-600'
                      }`}
                    >
                      {t.completed && <CheckCircle2 className="h-3 w-3" />}
                    </button>
                    <span className={`truncate font-medium ${t.completed ? 'line-through text-neutral-400' : 'text-neutral-900 dark:text-white'}`}>
                      {t.title}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                    {t.category}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Matching Actions */}
          {actions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Commands & Shortcuts
              </div>
              {actions.map((act) => {
                const Icon = act.icon;
                return (
                  <div
                    key={act.id}
                    onClick={() => {
                      act.action();
                      setIsCommandPaletteOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition"
                  >
                    <Icon className="h-4 w-4 text-brand-500" />
                    <span>{act.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {filteredTasks.length === 0 && actions.length === 0 && (
            <div className="py-8 text-center text-xs text-neutral-400">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
