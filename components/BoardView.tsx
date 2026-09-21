import React from 'react';
import { TaskCard } from './TaskCard';
import { useTasks } from '@/context/TaskContext';
import { Circle, Clock, CheckCircle2, Plus } from 'lucide-react';
import { TaskStatus } from '@/types/todo';

export const BoardView: React.FC = () => {
  const { filteredTasks, setIsTaskModalOpen, setEditingTask } = useTasks();

  const columns: { id: TaskStatus; label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }[] = [
    { id: 'todo', label: 'To Do', icon: Circle, color: 'text-neutral-400', bg: 'bg-neutral-100 dark:bg-neutral-800' },
    { id: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-950/50' },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((col) => {
        const colTasks = filteredTasks.filter((t) => t.status === col.id);
        const Icon = col.icon;

        return (
          <div
            key={col.id}
            className="flex flex-col bg-neutral-50/70 dark:bg-neutral-900/50 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-4 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200/60 dark:border-neutral-800/60">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${col.color}`} />
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                  {col.label}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 shadow-xs">
                  {colTasks.length}
                </span>
              </div>

              {col.id === 'todo' && (
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="p-1 rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 transition"
                  title="Add Task to To Do"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Task Cards Column Body */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {colTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}

              {colTasks.length === 0 && (
                <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-xs text-neutral-400">
                  <span>No tasks here</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
