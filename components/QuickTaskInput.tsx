import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, Calendar, Flag, Folder, ArrowUp } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useTasks } from '@/context/TaskContext';
import { Priority } from '@/types/todo';

export const QuickTaskInput: React.FC = () => {
  const { addTask, activeTab, categories, selectedCategory } = useTasks();
  const [title, setTitle] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<string>(
    selectedCategory !== 'all' ? selectedCategory : 'Inbox'
  );

  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const tomorrowStr = useMemo(() => format(addDays(new Date(), 1), 'yyyy-MM-dd'), []);

  const [dueDate, setDueDate] = useState<string | null>(
    activeTab === 'today' ? todayStr : null
  );

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync selected category when filter changes
  useEffect(() => {
    if (selectedCategory !== 'all') {
      setCategory(selectedCategory);
    } else {
      setCategory('Inbox');
    }
  }, [selectedCategory]);

  // Sync dueDate when activeTab changes
  useEffect(() => {
    if (activeTab === 'today') {
      setDueDate(todayStr);
    } else if (activeTab === 'upcoming') {
      setDueDate(tomorrowStr);
    } else {
      setDueDate(null);
    }
  }, [activeTab, todayStr, tomorrowStr]);

  const handleSubmit = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    const effectiveDueDate = activeTab === 'today' ? (dueDate || todayStr) : dueDate;

    await addTask({
      title: title.trim(),
      priority,
      category: category || (selectedCategory !== 'all' ? selectedCategory : 'Inbox'),
      dueDate: effectiveDueDate,
    });

    setTitle('');
    // reset micro fields
    setPriority('medium');
    setCategory(selectedCategory !== 'all' ? selectedCategory : 'Inbox');
    if (activeTab === 'today') {
      setDueDate(todayStr);
    } else {
      setDueDate(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getPlaceholder = () => {
    if (selectedCategory !== 'all') {
      return `Add a task in ${selectedCategory}... (Press Enter)`;
    }
    if (activeTab === 'today') {
      return "Add a task for today... (Press Enter)";
    }
    return "Add a task... (Press Enter)";
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-2 sm:p-2.5">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex items-center gap-2">
          {/* Subtle Plus Icon */}
          <div className="pl-2 flex-shrink-0 text-neutral-400">
            <Plus className="h-5 w-5" />
          </div>

          {/* Effortless Input Field */}
          <input
            ref={inputRef}
            type="text"
            enterKeyHint="done"
            placeholder={getPlaceholder()}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            className="flex-1 bg-transparent text-sm sm:text-base text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 outline-none py-1.5"
          />

          {/* Hidden submit button to guarantee native mobile keyboard form submission */}
          <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />

          {/* Submit Button (Only visible when title has text on mobile/desktop) */}
          {title.trim() && (
            <button
              type="submit"
              className="flex-shrink-0 h-8 w-8 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center active:scale-95 transition shadow-xs"
              title="Add task"
            >
              <ArrowUp className="h-4 w-4 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Sleek Optional Micro-chips (Visible when focused or text is typed) */}
        {(isFocused || title.trim()) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-neutral-100 dark:border-neutral-800/80 text-xs text-neutral-600 dark:text-neutral-400 animate-fade-in pl-1">
            {/* Quick Due Date Chips */}
            <button
              type="button"
              onClick={() => setDueDate(dueDate === todayStr ? null : todayStr)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition ${
                dueDate === todayStr
                  ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-300 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-bold'
                  : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              <Calendar className="h-3 w-3" />
              <span>Today</span>
            </button>

            <button
              type="button"
              onClick={() => setDueDate(dueDate === tomorrowStr ? null : tomorrowStr)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition ${
                dueDate === tomorrowStr
                  ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-300 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-bold'
                  : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              <span>Tomorrow</span>
            </button>

            {/* Priority Chip Toggle */}
            <div className="relative inline-flex items-center">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="appearance-none bg-transparent border border-neutral-200 dark:border-neutral-800 rounded-lg pl-6 pr-2 py-1 text-[11px] font-medium outline-none cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
              <Flag className="h-3 w-3 absolute left-2 pointer-events-none text-neutral-400" />
            </div>

            {/* Category Selector */}
            <div className="relative inline-flex items-center">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="appearance-none bg-transparent border border-neutral-200 dark:border-neutral-800 rounded-lg pl-6 pr-2 py-1 text-[11px] font-medium outline-none cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <Folder className="h-3 w-3 absolute left-2 pointer-events-none text-neutral-400" />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
