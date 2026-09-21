import React from 'react';
import { Check, Calendar, CheckSquare, Trash2, Bell } from 'lucide-react';
import { Task, Priority } from '@/types/todo';
import { useTasks } from '@/context/TaskContext';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

interface TaskItemProps {
  task: Task;
}

const getPriorityDot = (priority: Priority) => {
  switch (priority) {
    case 'urgent':
      return 'bg-rose-500';
    case 'high':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-blue-500';
    case 'low':
      return 'bg-neutral-300 dark:bg-neutral-600';
  }
};

const formatDueDate = (dateStr?: string | null) => {
  if (!dateStr) return null;
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return { text: 'Today', isOverdue: false, color: 'text-brand-600 dark:text-brand-400 font-medium' };
    if (isTomorrow(date)) return { text: 'Tomorrow', isOverdue: false, color: 'text-neutral-500 dark:text-neutral-400' };
    if (isPast(date)) return { text: format(date, 'MMM d'), isOverdue: true, color: 'text-rose-600 dark:text-rose-400 font-bold' };
    return { text: format(date, 'MMM d'), isOverdue: false, color: 'text-neutral-500 dark:text-neutral-400' };
  } catch {
    return { text: dateStr, isOverdue: false, color: 'text-neutral-500' };
  }
};

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleTask, setSelectedTask, deleteTask } = useTasks();

  const priorityDot = getPriorityDot(task.priority);
  const dueInfo = formatDueDate(task.dueDate);

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;

  return (
    <div
      onClick={() => setSelectedTask(task)}
      className={`group flex items-center justify-between gap-3 px-3.5 py-3 rounded-2xl bg-white dark:bg-neutral-900 border transition-all duration-150 cursor-pointer ${
        task.completed
          ? 'border-neutral-200/60 dark:border-neutral-800/60 opacity-60 bg-neutral-50/50 dark:bg-neutral-900/40'
          : 'border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-xs'
      }`}
    >
      {/* Left: Checkbox + Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleTask(task.id);
          }}
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
          className={`flex-shrink-0 h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs hover:bg-emerald-600'
              : 'border-neutral-300 dark:border-neutral-600 hover:border-brand-500 hover:scale-105'
          }`}
        >
          {task.completed && <Check className="h-3 w-3 stroke-[3]" />}
        </button>

        {/* Task Title & Notes Snippet */}
        <div className="flex flex-col min-w-0 flex-1">
          <span
            className={`text-sm sm:text-[14.5px] leading-snug truncate transition select-text ${
              task.completed
                ? 'line-through text-neutral-400 dark:text-neutral-500'
                : 'text-neutral-900 dark:text-neutral-100 font-medium'
            }`}
          >
            {task.title}
          </span>

          {task.notes && !task.completed && (
            <span className="text-xs text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
              {task.notes}
            </span>
          )}
        </div>
      </div>

      {/* Right: Meta Indicators (Reminder, Subtasks, Due date, Category, Priority Dot) */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 text-xs">
        {/* Reminder Active Indicator */}
        {task.reminderAt && !task.completed && (
          <span className="text-brand-500 dark:text-brand-400" title={`Reminder: ${new Date(task.reminderAt).toLocaleString()}`}>
            <Bell className="h-3.5 w-3.5" />
          </span>
        )}

        {/* Checklist Count */}
        {subtasks.length > 0 && (
          <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 hidden sm:inline-flex items-center gap-1">
            <CheckSquare className="h-3 w-3" />
            <span>{completedSubtasks}/{subtasks.length}</span>
          </span>
        )}

        {/* Due Date Badge */}
        {dueInfo && (
          <div className={`flex items-center gap-1 text-[11px] ${dueInfo.color}`}>
            <Calendar className="h-3 w-3" />
            <span>{dueInfo.text}</span>
          </div>
        )}

        {/* Category Pill */}
        {task.category && task.category !== 'Inbox' && (
          <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-medium text-neutral-500 dark:text-neutral-400 hidden sm:inline-block">
            {task.category}
          </span>
        )}

        {/* Priority Dot */}
        <span
          className={`h-2 w-2 rounded-full ${priorityDot}`}
          title={`Priority: ${task.priority}`}
        />

        {/* Delete Icon for both completed & pending tasks */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            deleteTask(task.id);
          }}
          className="p-1 sm:p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-95 transition flex items-center justify-center"
          title="Delete task"
          aria-label="Delete task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
