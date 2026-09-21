import React, { useMemo } from 'react';
import { TaskItem } from './TaskItem';
import { EmptyState } from './EmptyState';
import { useTasks } from '@/context/TaskContext';
import { AlertCircle, Calendar, CalendarDays, CheckCircle2, ListFilter, ArrowUpDown } from 'lucide-react';
import { SortBy } from '@/types/todo';

export const ListView: React.FC = () => {
  const { filteredTasks, filters, setFilters, stats } = useTasks();

  const todayStr = new Date().toISOString().split('T')[0];

  // Group tasks into sections if no specific timeline filter is chosen
  const groupedTasks = useMemo(() => {
    if (filters.timeline !== 'all') {
      return { singleList: filteredTasks };
    }

    const overdue = filteredTasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStr);
    const today = filteredTasks.filter((t) => !t.completed && t.dueDate === todayStr);
    const upcoming = filteredTasks.filter((t) => !t.completed && (!t.dueDate || t.dueDate > todayStr));
    const completed = filteredTasks.filter((t) => t.completed);

    return { overdue, today, upcoming, completed };
  }, [filteredTasks, filters.timeline, todayStr]);

  const handleSortChange = (sortBy: SortBy) => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  if (filteredTasks.length === 0) {
    return (
      <EmptyState
        title={filters.search ? `No matches for "${filters.search}"` : 'No tasks in this view'}
        description="Try changing your filters or create a new task to get started."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar: Sort, Status Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-3 shadow-sm transition-colors text-xs">
        <div className="flex items-center gap-1.5 text-neutral-500">
          <ListFilter className="h-4 w-4" />
          <span className="font-semibold text-neutral-900 dark:text-white">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </span>
          {filters.category !== 'all' && (
            <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              in {filters.category}
            </span>
          )}
        </div>

        {/* Sort Actions */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-400">Sort by:</span>
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-xl">
            <button
              onClick={() => handleSortChange('dueDate')}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                filters.sortBy === 'dueDate'
                  ? 'bg-white dark:bg-neutral-900 text-brand-600 dark:text-brand-400 shadow-xs font-bold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Due Date {filters.sortBy === 'dueDate' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('priority')}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                filters.sortBy === 'priority'
                  ? 'bg-white dark:bg-neutral-900 text-brand-600 dark:text-brand-400 shadow-xs font-bold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Priority {filters.sortBy === 'priority' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('createdAt')}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                filters.sortBy === 'createdAt'
                  ? 'bg-white dark:bg-neutral-900 text-brand-600 dark:text-brand-400 shadow-xs font-bold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Newest
            </button>
          </div>
        </div>
      </div>

      {/* When viewing a filtered timeline (e.g. today / overdue), show direct flat list */}
      {'singleList' in groupedTasks && groupedTasks.singleList ? (
        <div className="space-y-3">
          {groupedTasks.singleList.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      ) : (
        /* Multi-section Grouped View */
        <div className="space-y-8">
          {/* Overdue Section */}
          {groupedTasks.overdue && groupedTasks.overdue.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <AlertCircle className="h-4 w-4 text-rose-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Overdue ({groupedTasks.overdue.length})
                </h3>
              </div>
              <div className="space-y-3">
                {groupedTasks.overdue.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}

          {/* Today Section */}
          {groupedTasks.today && groupedTasks.today.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Calendar className="h-4 w-4 text-brand-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                  Due Today ({groupedTasks.today.length})
                </h3>
              </div>
              <div className="space-y-3">
                {groupedTasks.today.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Section */}
          {groupedTasks.upcoming && groupedTasks.upcoming.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <CalendarDays className="h-4 w-4 text-indigo-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                  Upcoming & Others ({groupedTasks.upcoming.length})
                </h3>
              </div>
              <div className="space-y-3">
                {groupedTasks.upcoming.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}

          {/* Completed Section */}
          {groupedTasks.completed && groupedTasks.completed.length > 0 && (
            <section className="space-y-3 pt-2">
              <div className="flex items-center gap-2 px-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Completed ({groupedTasks.completed.length})
                </h3>
              </div>
              <div className="space-y-3">
                {groupedTasks.completed.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
