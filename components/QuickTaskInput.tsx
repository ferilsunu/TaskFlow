import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, Calendar, Flag, Folder, ArrowUp, Bell, X, Check, Sparkles } from 'lucide-react';
import { format, addDays, addHours, isToday, isTomorrow } from 'date-fns';
import { useTasks } from '@/context/TaskContext';
import { Priority } from '@/types/todo';
import { parseQuickTask } from '@/libs/nlpTaskParser';

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

  // Parse natural language from current title in real time
  const parsed = useMemo(() => {
    return parseQuickTask(title, categories);
  }, [title, categories]);

  // Track previous parsed entity values to know when to sync or revert
  const prevParsedPriorityRef = useRef<Priority | null>(null);
  const prevParsedCategoryRef = useRef<string | null>(null);
  const prevParsedDueDateRef = useRef<string | null>(null);
  const prevParsedReminderRef = useRef<string | null>(null);

  // Dynamic syncing of parsed Priority
  useEffect(() => {
    if (parsed.priority && parsed.priority !== prevParsedPriorityRef.current) {
      setPriority(parsed.priority);
    } else if (!parsed.priority && prevParsedPriorityRef.current) {
      setPriority('medium');
    }
    prevParsedPriorityRef.current = parsed.priority;
  }, [parsed.priority]);

  // Dynamic syncing of parsed Category
  useEffect(() => {
    if (parsed.category && parsed.category !== prevParsedCategoryRef.current) {
      setCategory(parsed.category);
    } else if (!parsed.category && prevParsedCategoryRef.current) {
      setCategory(selectedCategory !== 'all' ? selectedCategory : 'Inbox');
    }
    prevParsedCategoryRef.current = parsed.category;
  }, [parsed.category, selectedCategory]);

  // Dynamic syncing of parsed Due Date
  useEffect(() => {
    if (parsed.dueDate && parsed.dueDate !== prevParsedDueDateRef.current) {
      setDueDate(parsed.dueDate);
    } else if (!parsed.dueDate && prevParsedDueDateRef.current) {
      setDueDate(activeTab === 'today' ? todayStr : (activeTab === 'upcoming' ? tomorrowStr : null));
    }
    prevParsedDueDateRef.current = parsed.dueDate;
  }, [parsed.dueDate, activeTab, todayStr, tomorrowStr]);

  // Dynamic syncing of parsed Reminder time
  useEffect(() => {
    if (parsed.reminderAt && parsed.reminderAt !== prevParsedReminderRef.current) {
      setReminderAt(parsed.reminderAt);
    } else if (!parsed.reminderAt && prevParsedReminderRef.current) {
      setReminderAt(null);
    }
    prevParsedReminderRef.current = parsed.reminderAt;
  }, [parsed.reminderAt]);

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

  // Ensure options include any dynamically parsed category
  const displayCategories = useMemo(() => {
    if (category && !categories.includes(category)) {
      return [...categories, category];
    }
    return categories;
  }, [categories, category]);

  const handleSubmit = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    // Use cleaned title from NLP parsing (with dates, priority, and category stripped)
    const taskTitle = parsed.cleanTitle || title.trim();
    if (!taskTitle) return;

    const finalPriority = parsed.priority || priority;
    const finalCategory = parsed.category || category || (selectedCategory !== 'all' ? selectedCategory : 'Inbox');
    const effectiveDueDate = activeTab === 'today' ? (dueDate || todayStr) : dueDate;
    const finalDueDate = parsed.dueDate || effectiveDueDate;
    const finalReminderAt = parsed.reminderAt || (reminderAt ? new Date(reminderAt).toISOString() : null);

    await addTask({
      title: taskTitle,
      priority: finalPriority,
      category: finalCategory,
      dueDate: finalDueDate,
      reminderAt: finalReminderAt,
    });

    // Reset tracking refs
    prevParsedPriorityRef.current = null;
    prevParsedCategoryRef.current = null;
    prevParsedDueDateRef.current = null;
    prevParsedReminderRef.current = null;

    // Reset inputs
    setTitle('');
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
      return `Add in ${selectedCategory}... (e.g. 'Review deck tomorrow at 5pm !urgent')`;
    }
    if (activeTab === 'today') {
      return "Add task for today... (e.g. 'Team sync at 3pm !high #Work')";
    }
    return "Add task... e.g. 'Finish report tomorrow at 5pm !urgent #Work'";
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

  const formatCustomDateDisplay = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      return format(new Date(y, m - 1, d), 'EEE, MMM d');
    } catch {
      return dateStr;
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

        {/* Live NLP Preview Banner */}
        {parsed.hasMatch && (
          <div className="flex items-center flex-wrap gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-50/90 to-purple-50/70 dark:from-brand-950/40 dark:to-neutral-900 border border-brand-200/80 dark:border-brand-800/60 text-xs text-brand-800 dark:text-brand-200 animate-fade-in shadow-xs">
            <div className="flex items-center gap-1 font-semibold text-[11px] text-brand-600 dark:text-brand-400">
              <Sparkles className="h-3.5 w-3.5 flex-shrink-0 animate-pulse" />
              <span>Quick Add:</span>
            </div>
            <span className="font-medium text-[11px] text-neutral-800 dark:text-neutral-200 truncate max-w-[180px] sm:max-w-[280px]">
              &ldquo;{parsed.cleanTitle}&rdquo;
            </span>
            <div className="flex items-center gap-1 text-[10px] ml-auto">
              {parsed.extractedTags.dateText && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-brand-200 dark:border-neutral-700 font-medium text-brand-700 dark:text-brand-300">
                  📅 {parsed.extractedTags.dateText}
                </span>
              )}
              {parsed.priority && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-brand-200 dark:border-neutral-700 font-medium text-brand-700 dark:text-brand-300 capitalize">
                  🚩 {parsed.priority}
                </span>
              )}
              {parsed.category && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-brand-200 dark:border-neutral-700 font-medium text-brand-700 dark:text-brand-300">
                  📁 #{parsed.category}
                </span>
              )}
            </div>
          </div>
        )}

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

            {/* Custom Date Chip (Shown when date from NLP is not Today or Tomorrow) */}
            {dueDate && dueDate !== todayStr && dueDate !== tomorrowStr && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold bg-brand-50 dark:bg-brand-950/60 border-brand-300 dark:border-brand-800 text-brand-700 dark:text-brand-300 transition">
                <Calendar className="h-3 w-3 text-brand-600 dark:text-brand-400" />
                <span>{formatCustomDateDisplay(dueDate)}</span>
                <button
                  type="button"
                  onClick={() => setDueDate(null)}
                  className="ml-0.5 text-neutral-400 hover:text-rose-500 transition"
                  title="Remove due date"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Priority Chip Toggle */}
            <div className="relative inline-flex items-center">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className={`appearance-none bg-transparent border rounded-lg pl-6 pr-2 py-1 text-[11px] font-medium outline-none cursor-pointer transition ${
                  priority !== 'medium'
                    ? 'border-brand-300 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
              <Flag className={`h-3 w-3 absolute left-2 pointer-events-none ${
                priority === 'urgent' ? 'text-rose-500' :
                priority === 'high' ? 'text-amber-500' :
                priority === 'medium' ? 'text-blue-500' : 'text-neutral-400'
              }`} />
            </div>

            {/* Category Selector */}
            <div className="relative inline-flex items-center">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`appearance-none bg-transparent border rounded-lg pl-6 pr-2 py-1 text-[11px] font-medium outline-none cursor-pointer transition ${
                  category !== 'Inbox' && category !== selectedCategory
                    ? 'border-brand-300 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {displayCategories.map((c) => (
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

        {/* Helpful Natural Language Quick Tips (Visible when focused and input is empty) */}
        {isFocused && !title.trim() && (
          <div className="flex items-center gap-2 pt-1 pb-0.5 text-[10.5px] text-neutral-400 dark:text-neutral-500 pl-1 border-t border-neutral-100/60 dark:border-neutral-800/40">
            <span className="font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-brand-500" />
              Quick Add:
            </span>
            <span>Dates like <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-neutral-600 dark:text-neutral-300 font-mono text-[9.5px]">tomorrow at 5pm</code></span>
            <span>•</span>
            <span>Priority <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-neutral-600 dark:text-neutral-300 font-mono text-[9.5px]">!urgent</code></span>
            <span>•</span>
            <span>Category <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-neutral-600 dark:text-neutral-300 font-mono text-[9.5px]">#Work</code></span>
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
