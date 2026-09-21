import React, { useMemo } from 'react';
import { TaskItem } from './TaskItem';
import { EmptyState } from './EmptyState';
import { useTasks } from '@/context/TaskContext';

export const TaskList: React.FC = () => {
  const { tasks, activeTab, selectedCategory, searchQuery, isLoading } = useTasks();

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
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
      if (activeTab === 'completed') {
        return task.completed;
      }

      // If viewing active tabs (today, upcoming, all), only show pending tasks
      if (task.completed) {
        return false;
      }

      if (activeTab === 'today') {
        return task.dueDate === todayStr;
      }

      if (activeTab === 'upcoming') {
        return task.dueDate && task.dueDate > todayStr;
      }

      // 'all' shows all pending tasks
      return true;
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

  return (
    <div className="space-y-2.5">
      {filteredTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};
