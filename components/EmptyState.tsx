import React from 'react';
import { Check } from 'lucide-react';
import { useTasks } from '@/context/TaskContext';

export const EmptyState: React.FC = () => {
  const { activeTab, searchQuery } = useTasks();

  if (searchQuery) {
    return (
      <div className="py-16 text-center text-neutral-400">
        <p className="text-sm">No tasks matching &ldquo;{searchQuery}&rdquo;</p>
      </div>
    );
  }

  const getMessage = () => {
    switch (activeTab) {
      case 'today':
        return {
          title: "All clear for today",
          subtitle: "You're all caught up. Enjoy your time or plan ahead.",
        };
      case 'upcoming':
        return {
          title: "No upcoming tasks",
          subtitle: "Tasks with future dates will appear here.",
        };
      case 'all':
      default:
        return {
          title: "Your inbox is clear",
          subtitle: "Type above to effortlessly add your first task.",
        };
    }
  };

  const { title, subtitle } = getMessage();

  return (
    <div className="py-16 sm:py-20 flex flex-col items-center justify-center text-center px-4 animate-fade-in">
      <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-center text-neutral-400 dark:text-neutral-500 mb-3.5 shadow-xs">
        <Check className="h-5 w-5 stroke-[2.5]" />
      </div>
      <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
        {title}
      </h3>
      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 max-w-xs leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
};
