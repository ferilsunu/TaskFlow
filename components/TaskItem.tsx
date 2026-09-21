import React, { useState } from 'react';
import { 
  Check, 
  Calendar, 
  ChevronDown, 
  ChevronRight, 
  MoreHorizontal, 
  Edit3, 
  Copy, 
  Trash2, 
  Timer, 
  CheckSquare, 
  Plus,
  AlertCircle
} from 'lucide-react';
import { Task, Priority } from '@/types/todo';
import { useTasks } from '@/context/TaskContext';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

interface TaskItemProps {
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

const formatDueDate = (dateStr?: string) => {
  if (!dateStr) return null;
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return { text: 'Today', isUrgent: true, color: 'text-amber-600 dark:text-amber-400' };
    if (isTomorrow(date)) return { text: 'Tomorrow', isUrgent: false, color: 'text-brand-600 dark:text-brand-400' };
    if (isPast(date)) return { text: `Overdue (${format(date, 'MMM d')})`, isUrgent: true, color: 'text-rose-600 dark:text-rose-400 font-bold' };
    return { text: format(date, 'MMM d, yyyy'), isUrgent: false, color: 'text-neutral-500' };
  } catch {
    return { text: dateStr, isUrgent: false, color: 'text-neutral-500' };
  }
};

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { 
    toggleTask, 
    deleteTask, 
    duplicateTask, 
    setEditingTask, 
    setIsTaskModalOpen,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    setActivePomodoroTask,
    setIsPomodoroOpen,
  } = useTasks();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const priorityBadge = getPriorityBadge(task.priority);
  const dueDateInfo = formatDueDate(task.dueDate);

  const completedSubtasksCount = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      addSubtask(task.id, newSubtaskTitle);
      setNewSubtaskTitle('');
    }
  };

  const handleStartPomodoro = () => {
    setActivePomodoroTask(task);
    setIsPomodoroOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <div
      className={`group bg-white dark:bg-neutral-900 border rounded-2xl p-4 transition-all duration-200 shadow-sm hover:shadow-md ${
        task.completed
          ? 'border-neutral-200/60 dark:border-neutral-800/60 opacity-75 bg-neutral-50/50 dark:bg-neutral-900/40'
          : 'border-neutral-200 dark:border-neutral-800'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Checkbox Button */}
        <button
          onClick={() => toggleTask(task.id)}
          aria-label={task.completed ? "Mark as incomplete" : "Mark as completed"}
          className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded-lg border flex items-center justify-center transition-all ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30'
              : 'border-neutral-300 dark:border-neutral-600 hover:border-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-950/30'
          }`}
        >
          {task.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => toggleTask(task.id)}
              className={`text-sm sm:text-base font-semibold leading-snug cursor-pointer transition select-text ${
                task.completed
                  ? 'line-through text-neutral-400 dark:text-neutral-500'
                  : 'text-neutral-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400'
              }`}
            >
              {task.title}
            </h3>

            {/* Actions Menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {isMenuOpen && (
                <div 
                  className="absolute right-0 mt-1 w-44 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg py-1.5 z-20 animate-slide-up"
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
                    <span>Edit task</span>
                  </button>
                  <button
                    onClick={handleStartPomodoro}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-amber-600 dark:text-amber-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
                  >
                    <Timer className="h-3.5 w-3.5" />
                    <span>Focus Pomodoro</span>
                  </button>
                  <button
                    onClick={() => {
                      duplicateTask(task.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Duplicate</span>
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

          {/* Description */}
          {task.description && (
            <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed break-words whitespace-pre-line">
              {task.description}
            </p>
          )}

          {/* Meta Tags, Priority, Due Date */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            {/* Category */}
            <span className="px-2.5 py-0.5 rounded-full font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              {task.category}
            </span>

            {/* Priority Badge */}
            <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${priorityBadge.bg}`}>
              {priorityBadge.label}
            </span>

            {/* Due Date */}
            {dueDateInfo && (
              <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800/80 ${dueDateInfo.color}`}>
                <Calendar className="h-3 w-3" />
                <span>{dueDateInfo.text}</span>
              </div>
            )}

            {/* Pomodoro counter */}
            {task.pomodoroSessions > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-medium">
                <Timer className="h-3 w-3" />
                <span>{task.pomodoroSessions} focus session{task.pomodoroSessions > 1 ? 's' : ''}</span>
              </div>
            )}

            {/* Tags */}
            {task.tags?.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-[11px]"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Subtasks Accordion Toggle */}
          {totalSubtasks > 0 && (
            <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition"
              >
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                <span>
                  Checklist ({completedSubtasksCount}/{totalSubtasks})
                </span>
                <div className="w-20 bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-full overflow-hidden ml-1">
                  <div
                    className="bg-brand-500 h-full rounded-full transition-all"
                    style={{ width: `${(completedSubtasksCount / totalSubtasks) * 100}%` }}
                  />
                </div>
              </button>

              {/* Expanded Subtasks List */}
              {isExpanded && (
                <div className="mt-2 pl-2 space-y-1.5 border-l-2 border-brand-200 dark:border-brand-900 ml-1">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center justify-between group/sub text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={subtask.completed}
                          onChange={() => toggleSubtask(task.id, subtask.id)}
                          className="h-3.5 w-3.5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                        />
                        <span className={subtask.completed ? 'line-through text-neutral-400' : 'text-neutral-700 dark:text-neutral-300'}>
                          {subtask.title}
                        </span>
                      </label>
                      <button
                        onClick={() => deleteSubtask(task.id, subtask.id)}
                        className="opacity-0 group-hover/sub:opacity-100 text-neutral-400 hover:text-rose-500 p-1 transition"
                        title="Delete subtask"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add subtask mini input */}
                  <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add subtask..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="flex-1 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-lg px-2.5 py-1 outline-none text-neutral-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={!newSubtaskTitle.trim()}
                      className="p-1 rounded-lg bg-brand-600 text-white disabled:opacity-40"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
