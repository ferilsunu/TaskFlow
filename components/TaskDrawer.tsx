import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Calendar, 
  Flag, 
  Folder, 
  Check, 
  Plus, 
  CheckSquare 
} from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { Priority, Subtask } from '@/types/todo';

export const TaskDrawer: React.FC = () => {
  const { 
    selectedTask, 
    setSelectedTask, 
    updateTask, 
    deleteTask, 
    categories,
    toggleSubtask,
    addSubtask,
    deleteSubtask 
  } = useTasks();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('Inbox');
  const [dueDate, setDueDate] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title);
      setNotes(selectedTask.notes || '');
      setPriority(selectedTask.priority);
      setCategory(selectedTask.category);
      setDueDate(selectedTask.dueDate || '');
      setNewSubtaskTitle('');
    }
  }, [selectedTask]);

  if (!selectedTask) return null;

  const handleTitleBlur = () => {
    if (title.trim() && title !== selectedTask.title) {
      updateTask(selectedTask.id, { title: title.trim() });
    }
  };

  const handleNotesBlur = () => {
    if (notes !== selectedTask.notes) {
      updateTask(selectedTask.id, { notes: notes.trim() });
    }
  };

  const handlePriorityChange = (newP: Priority) => {
    setPriority(newP);
    updateTask(selectedTask.id, { priority: newP });
  };

  const handleCategoryChange = (newC: string) => {
    setCategory(newC);
    updateTask(selectedTask.id, { category: newC });
  };

  const handleDateChange = (newD: string) => {
    setDueDate(newD);
    updateTask(selectedTask.id, { dueDate: newD || null });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      addSubtask(selectedTask.id, newSubtaskTitle);
      setNewSubtaskTitle('');
    }
  };

  const subtasks: Subtask[] = selectedTask.subtasks || [];

  return (
    <div 
      onClick={() => setSelectedTask(null)}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end bg-black/40 backdrop-blur-xs animate-fade-in"
    >
      <div 
        className="w-full sm:max-w-md h-[88vh] sm:h-full bg-white dark:bg-neutral-900 border-t sm:border-t-0 sm:border-l border-neutral-200 dark:border-neutral-800 rounded-t-3xl sm:rounded-none shadow-2xl flex flex-col z-50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700 mx-auto mt-2.5 sm:hidden" />

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-3 sm:py-3.5 border-b border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span>Task Details</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => deleteTask(selectedTask.id)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              title="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setSelectedTask(null)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-5 pb-8 sm:pb-5">
          {/* Editable Title */}
          <div>
            <textarea
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Task title..."
              className="w-full text-base sm:text-lg font-bold text-neutral-900 dark:text-white bg-transparent outline-none resize-none placeholder-neutral-400"
            />
          </div>

          {/* Quick Properties Matrix */}
          <div className="grid grid-cols-2 gap-3 py-2 border-y border-neutral-100 dark:border-neutral-800/80 text-xs">
            {/* Due Date */}
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority Pill Selector */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 block mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePriorityChange(p)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold capitalize transition ${
                    priority === p
                      ? p === 'urgent'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : p === 'high'
                        ? 'bg-orange-500 text-white shadow-xs'
                        : p === 'medium'
                        ? 'bg-blue-500 text-white shadow-xs'
                        : 'bg-neutral-700 text-white dark:bg-neutral-300 dark:text-neutral-900'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Checklist Subtasks */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-neutral-400">
                Checklist Subtasks
              </label>
            </div>

            <div className="space-y-1.5">
              {subtasks.map((st) => (
                <div key={st.id} className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 pr-2">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => toggleSubtask(selectedTask.id, st.id)}
                      className="h-3.5 w-3.5 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                    <span className={`truncate ${st.completed ? 'line-through text-neutral-400' : 'text-neutral-800 dark:text-neutral-200'}`}>
                      {st.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => deleteSubtask(selectedTask.id, st.id)}
                    className="text-neutral-400 hover:text-rose-500 p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add item..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white outline-none"
                />
                <button
                  type="submit"
                  disabled={!newSubtaskTitle.trim()}
                  className="p-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Notes / Description */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 block mb-1.5">
              Notes
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Add additional details, links, or notes..."
              className="w-full p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
