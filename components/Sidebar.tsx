import React from 'react';
import { 
  Inbox, 
  Calendar, 
  CalendarDays, 
  AlertCircle, 
  CheckCircle2, 
  Tag, 
  Flame, 
  FolderPlus,
  Briefcase,
  User,
  BookOpen,
  Heart,
  DollarSign,
  Code,
  Layers
} from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { TimelineFilter, Priority } from '@/types/todo';

const getCategoryIcon = (name: string) => {
  switch (name.toLowerCase()) {
    case 'work': return Briefcase;
    case 'personal': return User;
    case 'study': return BookOpen;
    case 'health': return Heart;
    case 'finance': return DollarSign;
    case 'projects': return Code;
    default: return Tag;
  }
};

export const Sidebar: React.FC = () => {
  const { 
    tasks, 
    filters, 
    setFilters, 
    categories, 
    stats 
  } = useTasks();

  const timelineItems: { id: TimelineFilter; label: string; icon: React.ComponentType<{ className?: string }>; count: number; color?: string }[] = [
    { id: 'all', label: 'All Tasks', icon: Inbox, count: stats.total },
    { id: 'today', label: 'Today', icon: Calendar, count: stats.todayDue, color: 'text-brand-500' },
    { id: 'upcoming', label: 'Upcoming', icon: CalendarDays, count: tasks.filter((t) => !t.completed && t.dueDate && t.dueDate > new Date().toISOString().split('T')[0]).length },
    { id: 'overdue', label: 'Overdue', icon: AlertCircle, count: stats.overdue, color: stats.overdue > 0 ? 'text-rose-500 font-bold' : '' },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, count: stats.completed, color: 'text-emerald-500' },
  ];

  const priorities: { id: Priority | 'all'; label: string; dotColor: string }[] = [
    { id: 'all', label: 'All Priorities', dotColor: 'bg-neutral-400' },
    { id: 'urgent', label: 'Urgent', dotColor: 'bg-rose-500' },
    { id: 'high', label: 'High', dotColor: 'bg-orange-500' },
    { id: 'medium', label: 'Medium', dotColor: 'bg-blue-500' },
    { id: 'low', label: 'Low', dotColor: 'bg-neutral-400' },
  ];

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
      {/* Timeline Section */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-3 border border-neutral-200/80 dark:border-neutral-800 shadow-sm transition-colors">
        <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
          Filters
        </div>
        <nav className="space-y-1 mt-1">
          {timelineItems.map((item) => {
            const Icon = item.icon;
            const isActive = filters.timeline === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setFilters((prev) => ({ ...prev, timeline: item.id }))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-semibold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${item.color || ''}`} />
                  <span>{item.label}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive 
                    ? 'bg-brand-200/60 dark:bg-brand-900 text-brand-800 dark:text-brand-300 font-bold' 
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                }`}>
                  {item.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Categories Section */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-3 border border-neutral-200/80 dark:border-neutral-800 shadow-sm transition-colors">
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Categories
          </span>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, category: 'all' }))}
            className={`text-xs ${filters.category === 'all' ? 'text-brand-600 font-bold' : 'text-neutral-400 hover:text-neutral-600'}`}
          >
            All
          </button>
        </div>

        <nav className="space-y-1 mt-1">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat);
            const count = tasks.filter((t) => t.category === cat && !t.completed).length;
            const isActive = filters.category === cat;

            return (
              <button
                key={cat}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    category: prev.category === cat ? 'all' : cat,
                  }))
                }
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-semibold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-neutral-400" />
                  <span className="truncate">{cat}</span>
                </div>
                {count > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Priority Filter */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-3 border border-neutral-200/80 dark:border-neutral-800 shadow-sm transition-colors">
        <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
          Priority
        </div>
        <div className="grid grid-cols-2 gap-1.5 mt-1">
          {priorities.map((p) => {
            const isActive = filters.priority === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setFilters((prev) => ({ ...prev, priority: p.id }))}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold border border-brand-200 dark:border-brand-800'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${p.dotColor}`} />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Productivity Mini Progress Card */}
      <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-2xl p-4 text-white shadow-md shadow-brand-600/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Flame className="h-5 w-5 text-amber-300 animate-bounce-subtle" />
            <span className="font-bold text-sm">Productivity</span>
          </div>
          <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {stats.completed}/{stats.total}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden mb-2">
          <div
            className="bg-white h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-white/80">
          <span>Completion Rate</span>
          <span className="font-bold text-white">{stats.completionRate}%</span>
        </div>
      </div>
    </aside>
  );
};
