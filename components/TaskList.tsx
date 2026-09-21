import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { TaskItem } from './TaskItem';
import { EmptyState } from './EmptyState';
import { useTasks } from '@/context/TaskContext';

export const TaskList: React.FC = () => {
  const { tasks, activeTab, selectedCategory, searchQuery, isLoading } = useTasks();

  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const filteredTasks = useMemo(() => {
    const list = tasks.filter((task) => {
      // 1. Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchNotes = (task.notes || '').toLowerCase().includes(q);
        const matchCat = task.category.toLowerCase().includes(q);
        if (!matchTitle && !matchNotes && !matchCat) return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }

      // 3. Tab filter
      if (activeTab === 'today') {
        return task.dueDate === todayStr || (!task.completed && task.dueDate && task.dueDate < todayStr);
      }

      if (activeTab === 'upcoming') {
        return task.dueDate && task.dueDate > todayStr;
      }

      // 'all' shows all tasks
      return true;
    });

    // Sort: uncompleted tasks first, completed tasks at the bottom
    return list.sort((a, b) => {
      if (a.completed === b.completed) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return a.completed ? 1 : -1;
    });
  }, [tasks, activeTab, selectedCategory, searchQuery, todayStr]);

  if (isLoading) {
    return (
      <div className="space-y-2.5 py-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 rounded-2xl bg-white/60 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return <EmptyState />;
  }

  const activeTasks = filteredTasks.filter((t) => !t.completed);
  const completedTasks = filteredTasks.filter((t) => t.completed);

  return (
    <div className="space-y-2.5">
      {/* Active Pending Tasks */}
      {activeTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}

      {/* Completed Tasks section within the same tab */}
      {completedTasks.length > 0 && (
        <div className="pt-2 space-y-2.5">
          {activeTasks.length > 0 && (
            <div className="flex items-center gap-2 py-1">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Completed ({completedTasks.length})
              </span>
              <div className="flex-1 border-t border-neutral-200/60 dark:border-neutral-800/80" />
            </div>
          )}
          {completedTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};
