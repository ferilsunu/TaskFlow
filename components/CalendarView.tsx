import React, { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  addDays,
  isToday, 
  isPast,
  parseISO 
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Check, 
  ArrowUp, 
  Clock, 
  Flag, 
  Folder,
  AlertCircle,
  ArrowRight,
  ListFilter
} from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { Task, Priority } from '@/types/todo';
import { TaskItem } from './TaskItem';

export const CalendarView: React.FC = () => {
  const { tasks, addTask, updateTask, categories, selectedCategory, setSelectedTask } = useTasks();

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<Priority>('medium');
  const [quickCategory, setQuickCategory] = useState(
    selectedCategory !== 'all' ? selectedCategory : 'Inbox'
  );
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  React.useEffect(() => {
    if (selectedCategory !== 'all') {
      setQuickCategory(selectedCategory);
    } else {
      setQuickCategory('Inbox');
    }
  }, [selectedCategory]);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Group tasks by dueDate (YYYY-MM-DD)
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((task) => {
      if (task.dueDate) {
        const list = map.get(task.dueDate) || [];
        list.push(task);
        map.set(task.dueDate, list);
      }
    });
    return map;
  }, [tasks]);

  // Overdue tasks
  const overdueTasks = useMemo(() => {
    return tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStr);
  }, [tasks, todayStr]);

  // Tasks for currently selected date
  const selectedDayTasks = useMemo(() => {
    return tasksByDate.get(selectedDateStr) || [];
  }, [tasksByDate, selectedDateStr]);

  // Calendar matrix days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  // Agenda days for next 14 days
  const agendaDays = useMemo(() => {
    const days: Date[] = [];
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      days.push(addDays(now, i));
    }
    return days;
  }, []);

  const handlePrevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));
  const handleGoToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const handleAddDayTask = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!quickTitle.trim()) return;

    await addTask({
      title: quickTitle.trim(),
      priority: quickPriority,
      category: quickCategory,
      dueDate: selectedDateStr,
    });

    setQuickTitle('');
    setQuickPriority('medium');
    setQuickCategory(selectedCategory !== 'all' ? selectedCategory : 'Inbox');
  };

  const handleRescheduleOverdue = async (task: Task) => {
    await updateTask(task.id, { dueDate: selectedDateStr });
  };

  const getPriorityBg = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return 'bg-rose-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-neutral-400 dark:bg-neutral-600';
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 1. Google Calendar Style Navigation Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white tracking-tight">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={handleGoToday}
              className="px-2.5 py-1 rounded-xl text-xs font-bold border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* View Mode Toggle (Month vs Agenda) */}
            <div className="flex bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-xl text-xs mr-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  viewMode === 'month'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  viewMode === 'agenda'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Agenda
              </button>
            </div>

            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 2. Month View Mode Matrix */}
        {viewMode === 'month' ? (
          <div>
            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-neutral-400 mb-1">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <div key={idx} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const isSelected = isSameDay(day, selectedDate);
                const isCurrMonth = isSameMonth(day, currentMonth);
                const isDayToday = isToday(day);
                const dayTasks = tasksByDate.get(dateKey) || [];
                const pendingTasks = dayTasks.filter((t) => !t.completed);
                const hasTasks = dayTasks.length > 0;

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(day)}
                    className={`min-h-[44px] sm:min-h-[52px] p-1 rounded-2xl flex flex-col items-center justify-between border transition relative ${
                      isSelected
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm'
                        : isDayToday
                        ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300'
                        : isCurrMonth
                        ? 'bg-neutral-50/70 dark:bg-neutral-800/40 border-neutral-200/50 dark:border-neutral-800/60 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        : 'bg-transparent border-transparent text-neutral-400/50 dark:text-neutral-600'
                    }`}
                  >
                    {/* Day Number */}
                    <span className={`text-xs font-bold leading-none ${isDayToday && !isSelected ? 'text-brand-600 dark:text-brand-400 font-extrabold' : ''}`}>
                      {format(day, 'd')}
                    </span>

                    {/* Task Indicators (Dots / Micro Pills) */}
                    {hasTasks && (
                      <div className="flex items-center justify-center gap-0.5 mt-1 flex-wrap max-w-full px-0.5">
                        {dayTasks.slice(0, 3).map((t) => (
                          <span
                            key={t.id}
                            className={`h-1.5 w-1.5 rounded-full ${
                              isSelected
                                ? 'bg-white/80 dark:bg-neutral-900'
                                : t.completed
                                ? 'bg-emerald-500'
                                : getPriorityBg(t.priority)
                            }`}
                          />
                        ))}
                        {dayTasks.length > 3 && (
                          <span className={`text-[8px] font-bold leading-none ${isSelected ? 'text-white' : 'text-neutral-400'}`}>
                            +{dayTasks.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* 3. Agenda Timeline View Mode (Google Calendar Mobile Agenda) */
          <div className="space-y-3 pt-1">
            {agendaDays.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayTasks = tasksByDate.get(dateKey) || [];
              const isDayToday = isToday(day);

              return (
                <div
                  key={dateKey}
                  className={`p-3 rounded-2xl border transition ${
                    isDayToday
                      ? 'bg-brand-50/40 dark:bg-brand-950/30 border-brand-200 dark:border-brand-800/80'
                      : 'bg-neutral-50/50 dark:bg-neutral-800/30 border-neutral-100 dark:border-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${isDayToday ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-900 dark:text-white'}`}>
                        {format(day, 'EEEE, MMM d')}
                      </span>
                      {isDayToday && (
                        <span className="px-1.5 py-0.5 rounded-md bg-brand-500 text-white text-[10px] font-bold">
                          Today
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  </div>

                  {dayTasks.length > 0 ? (
                    <div className="space-y-1.5">
                      {dayTasks.map((t) => (
                        <TaskItem key={t.id} task={t} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400 italic py-1">No tasks planned</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Overdue Tasks Reschedule Banner (If Any) */}
      {overdueTasks.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold">
              <AlertCircle className="h-4 w-4" />
              <span>{overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''}</span>
            </div>
            <span className="text-[11px] text-amber-700/80 dark:text-amber-400">
              Reschedule to {format(selectedDate, 'MMM d')}
            </span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {overdueTasks.map((ot) => (
              <div
                key={ot.id}
                className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-900 border border-amber-200/60 dark:border-amber-900/40 text-xs"
              >
                <span className="truncate flex-1 font-medium text-neutral-800 dark:text-neutral-200 pr-2">
                  {ot.title}
                </span>
                <button
                  onClick={() => handleRescheduleOverdue(ot)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold text-[11px] hover:bg-amber-600 active:scale-95 transition flex-shrink-0"
                >
                  <span>Plan for {format(selectedDate, 'MMM d')}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Day Planner Detail Section (Tasks Scheduled for Selected Day) */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Selected Day Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
              {isToday(selectedDate) && (
                <span className="px-2 py-0.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[10px] font-bold">
                  Today
                </span>
              )}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {selectedDayTasks.length} {selectedDayTasks.length === 1 ? 'task scheduled' : 'tasks scheduled'}
            </p>
          </div>
        </div>

        {/* Quick Inline Task Adder for This Day */}
        <form onSubmit={handleAddDayTask} className="space-y-2">
          <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 rounded-2xl p-1.5 pl-3">
            <Plus className="h-4 w-4 text-neutral-400 flex-shrink-0" />
            <input
              type="text"
              enterKeyHint="done"
              placeholder={`Add task for ${format(selectedDate, 'MMM d')}... (Press Enter)`}
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.keyCode === 13) {
                  e.preventDefault();
                  handleAddDayTask(e);
                }
              }}
              className="flex-1 bg-transparent text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 outline-none py-1"
            />
            <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
            {quickTitle.trim() && (
              <button
                type="submit"
                className="h-7 w-7 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center active:scale-95 transition shadow-xs flex-shrink-0"
              >
                <ArrowUp className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
            )}
          </div>

          {quickTitle.trim() && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs animate-fade-in pl-1">
              <select
                value={quickPriority}
                onChange={(e) => setQuickPriority(e.target.value as Priority)}
                className="bg-transparent border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1 text-[11px] font-medium outline-none text-neutral-700 dark:text-neutral-300"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>

              <select
                value={quickCategory}
                onChange={(e) => setQuickCategory(e.target.value)}
                className="bg-transparent border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1 text-[11px] font-medium outline-none text-neutral-700 dark:text-neutral-300"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
        </form>

        {/* List of Tasks for Selected Day */}
        <div className="space-y-2 pt-1">
          {selectedDayTasks.length > 0 ? (
            selectedDayTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))
          ) : (
            <div className="text-center py-8 px-4 rounded-2xl bg-neutral-50/50 dark:bg-neutral-800/20 border border-dashed border-neutral-200 dark:border-neutral-800">
              <CalendarIcon className="h-8 w-8 mx-auto text-neutral-300 dark:text-neutral-600 mb-2" />
              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                No tasks scheduled for {format(selectedDate, 'MMMM d')}
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Enjoy your free time or add a task above to plan ahead.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
