import React from 'react';
import { useTasks } from '@/context/TaskContext';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Timer, 
  Flame, 
  BarChart, 
  PieChart, 
  Layers,
  Award,
  Zap
} from 'lucide-react';
import { Priority } from '@/types/todo';

export const AnalyticsView: React.FC = () => {
  const { tasks, categories, stats } = useTasks();

  const priorityCounts: Record<Priority, number> = {
    urgent: tasks.filter((t) => t.priority === 'urgent').length,
    high: tasks.filter((t) => t.priority === 'high').length,
    medium: tasks.filter((t) => t.priority === 'medium').length,
    low: tasks.filter((t) => t.priority === 'low').length,
  };

  const categoryStats = categories.map((cat) => {
    const total = tasks.filter((t) => t.category === cat).length;
    const completed = tasks.filter((t) => t.category === cat && t.completed).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { name: cat, total, completed, pct };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tasks</span>
            <Layers className="h-4 w-4 text-brand-500" />
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white">
            {stats.total}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500">
            <span>{stats.pending} pending tasks</span>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completion Rate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats.completionRate}%
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500">
            <span>{stats.completed} of {stats.total} finished</span>
          </div>
        </div>

        {/* Pomodoro Focus Sessions */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Focus Sessions</span>
            <Timer className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-500">
            {stats.totalPomodoros}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500">
            <span>~{stats.totalPomodoros * 25} minutes logged</span>
          </div>
        </div>

        {/* Overdue Alerts */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue</span>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </div>
          <div className={`text-3xl font-extrabold ${stats.overdue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-900 dark:text-white'}`}>
            {stats.overdue}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500">
            <span>{stats.todayDue} tasks due today</span>
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart className="h-5 w-5 text-brand-500" />
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Category Performance
            </h3>
          </div>

          <div className="space-y-4">
            {categoryStats.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                    {item.name}
                  </span>
                  <span className="text-neutral-400">
                    {item.completed}/{item.total} tasks ({item.pct}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-brand-500" />
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Priority Distribution
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400">Urgent</span>
              <div className="text-2xl font-black text-rose-800 dark:text-rose-300 mt-1">
                {priorityCounts.urgent}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/60">
              <span className="text-xs font-bold text-orange-700 dark:text-orange-400">High</span>
              <div className="text-2xl font-black text-orange-800 dark:text-orange-300 mt-1">
                {priorityCounts.high}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">Medium</span>
              <div className="text-2xl font-black text-blue-800 dark:text-blue-300 mt-1">
                {priorityCounts.medium}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">Low</span>
              <div className="text-2xl font-black text-neutral-800 dark:text-neutral-200 mt-1">
                {priorityCounts.low}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/50 flex items-center gap-3">
            <Award className="h-6 w-6 text-brand-600 dark:text-brand-400 flex-shrink-0" />
            <p className="text-xs text-brand-900 dark:text-brand-200 leading-relaxed">
              <strong>Tip:</strong> Tackle your <strong>Urgent</strong> and <strong>High</strong> priority items during your peak morning energy block.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
