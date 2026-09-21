import React from 'react';
import { CheckCircle2, Plus, Sparkles } from 'lucide-react';
import { useTasks } from '@/context/TaskContext';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No tasks found',
  description = 'You are all caught up! Create a new task or adjust your filters.',
}) => {
  const { setIsTaskModalOpen, setEditingTask, resetToSampleData } = useTasks();

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 mb-4 shadow-inner">
        <Sparkles className="h-8 w-8" />
      </div>

      <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Task</span>
        </button>
        <button
          onClick={resetToSampleData}
          className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium transition"
        >
          Load Demo Tasks
        </button>
      </div>
    </div>
  );
};
