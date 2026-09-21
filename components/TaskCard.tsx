import React, { useState } from 'react';
import { 
  Check, 
  Calendar, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  Timer, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Task, TaskStatus, Priority } from '@/types/todo';
import { useTasks } from '@/context/TaskContext';
import { format, isPast, parseISO } from 'date-fns';

interface TaskCardProps {
  task: Task;
}

const getPriorityBadge = (priority: Priority) => {
  switch (priority) {
    case 'urgent':
      return { label: 'Urgent', bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-900' };
    case 'high':
      return { label: 'High', bg: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 border-orange-200 dark:border-orange-900' };
    case 'medium':
      return { label: 'Medium', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-900' };
    case 'low':
      return { label: 'Low', bg: 'bg-neutral-50 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700' };
  }
};

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { 
    setTaskStatus, 
    deleteTask, 
    setEditingTask, 
    setIsTaskModalOpen,
    setActivePomodoroTask,
    setIsPomodoroOpen 
  } = useTasks();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const priorityBadge = getPriorityBadge(task.priority);
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  const handleNextStatus = () => {
    if (task.status === 'todo') setTaskStatus(task.id, 'in_progress');
    else if (task.status === 'in_progress') setTaskStatus(task.id, 'completed');
  };

  const handlePrevStatus = () => {
    if (task.status === 'completed') setTaskStatus(task.id, 'in_progress');
    else if (task.status === 'in_progress') setTaskStatus(task.id, 'todo');
  };

  const isOverdue = !task.completed && task.dueDate && isPast(parseISO(task.dueDate));

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition space-y-3">
      {/* Card Header: Category + Priority + Menu */}
      <div className="flex items-center justify-between gap-1 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-neutral-600 dark:text-neutral-300">
            {task.category}
          </span>
          <span className={`px-2 py-0.5 rounded-full font-bold border text-[10px] ${priorityBadge.bg}`}>
            {priorityBadge.label}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {isMenuOpen && (
            <div 
              className="absolute right-0 mt-1 w-40 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg py-1.5 z-20 animate-slide-up"
              onMouseLeave={() => setIsMenuOpen(false)}
            >
              <button
                onClick={() => {
                  setEditingTask(task);
                  setIsTaskModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  setActivePomodoroTask(task);
                  setIsPomodoroOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-amber-600 dark:text-amber-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
              >
                <Timer className="h-3.5 w-3.5" />
                <span>Focus</span>
              </button>
              <button
                onClick={() => {
                  deleteTask(task.id);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title & Description */}
      <div>
        <h4 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug">
          {task.title}
        </h4>
        {task.description && (
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
            {task.description}
          </p>
        )}
      </div>

      {/* Subtasks Progress */}
      {totalSubtasks > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>Subtasks</span>
            <span>{completedSubtasks}/{totalSubtasks}</span>
          </div>
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-brand-500 h-full rounded-full transition-all"
              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Card Footer: Due date + Movement Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
        {task.dueDate ? (
          <div className={`flex items-center gap-1 ${isOverdue ? 'text-rose-500 font-bold' : 'text-neutral-400'}`}>
            <Calendar className="h-3 w-3" />
            <span className="text-[11px]">{task.dueDate}</span>
          </div>
        ) : (
          <span className="text-[11px] text-neutral-400">No due date</span>
        )}

        {/* Status Shift Buttons */}
        <div className="flex items-center gap-1">
          {task.status !== 'todo' && (
            <button
              onClick={handlePrevStatus}
              title="Move backward"
              className="p-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
            >
              <ArrowLeft className="h-3 w-3" />
            </button>
          )}
          {task.status !== 'completed' && (
            <button
              onClick={handleNextStatus}
              title="Move forward"
              className="p-1 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900 transition font-bold"
            >
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
