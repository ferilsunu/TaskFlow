import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, Calendar, Flag, Folder, ArrowUp, Bell, X, Check } from 'lucide-react';
import { format, addDays, addHours, isToday, isTomorrow } from 'date-fns';
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

  // Email Reminder state
  const [reminderAt, setReminderAt] = useState<string | null>(null);
  const [showReminderPicker, setShowReminderPicker] = useState(false);

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
      reminderAt: reminderAt ? new Date(reminderAt).toISOString() : null,
    });

    setTitle('');
    // reset micro fields
    setPriority('medium');
    setCategory(selectedCategory !== 'all' ? selectedCategory : 'Inbox');
    setReminderAt(null);
    setShowReminderPicker(false);
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

  const formatReminderDisplay = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return 'Reminder';
      if (isToday(d)) {
        return `Today, ${format(d, 'h:mm a')}`;
      }
      if (isTomorrow(d)) {
        return `Tmrw, ${format(d, 'h:mm a')}`;
      }
      return format(d, 'MMM d, h:mm a');
    } catch {
      return 'Reminder';
    }
  };

  const formatForDateTimeInput = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const setPresetReminder = (offsetHours: number) => {
    const d = addHours(new Date(), offsetHours);
    setReminderAt(d.toISOString());
  };

  const setTomorrowMorningReminder = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    setReminderAt(d.toISOString());
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

        {/* Sleek Optional Micro-chips (Visible when focused, text typed, or reminder active) */}
        {(isFocused || title.trim() || reminderAt || showReminderPicker) && (
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

            {/* Email Reminder Chip */}
            {reminderAt ? (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold bg-brand-50 dark:bg-brand-950/60 border-brand-300 dark:border-brand-800 text-brand-700 dark:text-brand-300 transition">
                <Bell className="h-3 w-3 text-brand-600 dark:text-brand-400" />
                <button
                  type="button"
                  onClick={() => setShowReminderPicker((prev) => !prev)}
                  className="hover:underline"
                  title="Click to change reminder time"
                >
                  {formatReminderDisplay(reminderAt)}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReminderAt(null);
                    setShowReminderPicker(false);
                  }}
                  className="ml-1 text-neutral-400 hover:text-rose-500 transition"
                  title="Remove reminder"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowReminderPicker((prev) => !prev)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition ${
                  showReminderPicker
                    ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-300 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-bold'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
                title="Add email reminder"
              >
                <Bell className="h-3 w-3 text-neutral-400" />
                <span>Reminder</span>
              </button>
            )}
          </div>
        )}

        {/* Expandable Reminder Picker Tray */}
        {showReminderPicker && (
          <div className="flex flex-wrap items-center gap-2 pt-2 pb-0.5 border-t border-neutral-100 dark:border-neutral-800/80 text-xs animate-fade-in pl-1">
            <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              <Bell className="h-3.5 w-3.5 text-brand-500" />
              <span>Email Reminder:</span>
            </div>

            {/* Quick Presets */}
            <button
              type="button"
              onClick={() => {
                setPresetReminder(1);
                setShowReminderPicker(false);
              }}
              className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-[11px] font-medium transition"
            >
              In 1 Hour
            </button>

            <button
              type="button"
              onClick={() => {
                setTomorrowMorningReminder();
                setShowReminderPicker(false);
              }}
              className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-[11px] font-medium transition"
            >
              Tomorrow 9 AM
            </button>

            {/* Datetime Local Picker */}
            <input
              type="datetime-local"
              value={reminderAt ? formatForDateTimeInput(new Date(reminderAt)) : ''}
              min={formatForDateTimeInput(new Date())}
              onChange={(e) => {
                if (e.target.value) {
                  setReminderAt(new Date(e.target.value).toISOString());
                } else {
                  setReminderAt(null);
                }
              }}
              className="px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-[11px] outline-none"
            />

            {/* Done Button to close tray */}
            <button
              type="button"
              onClick={() => setShowReminderPicker(false)}
              className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-500 hover:bg-brand-600 text-white text-[11px] font-medium transition"
            >
              <Check className="h-3 w-3" />
              <span>Done</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
