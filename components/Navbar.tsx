import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCircle2, 
  Plus, 
  Search, 
  Sun, 
  Moon, 
  Timer, 
  BarChart2, 
  LayoutList, 
  Kanban, 
  Download, 
  Upload, 
  RotateCcw, 
  MoreVertical,
  CheckCheck,
  Trash2,
  Command
} from 'lucide-react';
import { useTasks } from '@/context/TaskContext';

export const Navbar: React.FC = () => {
  const { 
    filters, 
    setFilters, 
    viewMode, 
    setViewMode, 
    theme, 
    toggleTheme, 
    setIsTaskModalOpen, 
    setEditingTask,
    setIsPomodoroOpen,
    setIsAnalyticsOpen,
    setIsCommandPaletteOpen,
    exportTasksJSON,
    exportTasksCSV,
    importTasksJSON,
    markAllAsCompleted,
    clearCompletedTasks,
    resetToSampleData,
    stats
  } = useTasks();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          importTasksJSON(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-md shadow-brand-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-neutral-900 dark:text-white">
                  Task<span className="text-brand-600 dark:text-brand-400">Flow</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block">Fast, sleek task management</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search tasks, descriptions, tags... (Press ⌘K)"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-12 py-2 text-sm bg-neutral-100 dark:bg-neutral-800/70 border border-transparent focus:border-brand-500 dark:focus:border-brand-500 focus:bg-white dark:focus:bg-neutral-900 rounded-xl outline-none text-neutral-900 dark:text-white placeholder-neutral-400 transition"
              />
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600"
                title="Open Command Palette"
              >
                ⌘K
              </button>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* View Switchers */}
            <div className="hidden sm:flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-neutral-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="List View"
              >
                <LayoutList className="h-3.5 w-3.5" />
                <span>List</span>
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'board'
                    ? 'bg-white dark:bg-neutral-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="Kanban Board View"
              >
                <Kanban className="h-3.5 w-3.5" />
                <span>Board</span>
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'analytics'
                    ? 'bg-white dark:bg-neutral-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="Analytics & Stats"
              >
                <BarChart2 className="h-3.5 w-3.5" />
                <span>Stats</span>
              </button>
            </div>

            {/* Pomodoro Timer Button */}
            <button
              onClick={() => setIsPomodoroOpen(true)}
              className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition relative"
              title="Pomodoro Focus Timer"
            >
              <Timer className="h-5 w-5 text-amber-500" />
              {stats.totalPomodoros > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {stats.totalPomodoros}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-neutral-700" />}
            </button>

            {/* Settings / Extra Options Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                title="More Actions"
              >
                <MoreVertical className="h-5 w-5" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-2 z-50 animate-slide-up">
                  <div className="px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800 text-xs font-semibold text-neutral-400">
                    Data & Export
                  </div>
                  <button
                    onClick={() => {
                      exportTasksJSON();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left"
                  >
                    <Download className="h-4 w-4 text-brand-500" />
                    <span>Export JSON</span>
                  </button>
                  <button
                    onClick={() => {
                      exportTasksCSV();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left"
                  >
                    <Download className="h-4 w-4 text-emerald-500" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left"
                  >
                    <Upload className="h-4 w-4 text-blue-500" />
                    <span>Import JSON</span>
                  </button>

                  <div className="px-3 py-1.5 border-t border-b border-neutral-100 dark:border-neutral-800 text-xs font-semibold text-neutral-400 mt-1">
                    Batch Actions
                  </div>
                  <button
                    onClick={() => {
                      markAllAsCompleted();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left"
                  >
                    <CheckCheck className="h-4 w-4 text-emerald-500" />
                    <span>Mark all completed</span>
                  </button>
                  <button
                    onClick={() => {
                      clearCompletedTasks();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left"
                  >
                    <Trash2 className="h-4 w-4 text-rose-500" />
                    <span>Clear completed</span>
                  </button>
                  <button
                    onClick={() => {
                      resetToSampleData();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-left"
                  >
                    <RotateCcw className="h-4 w-4 text-neutral-400" />
                    <span>Reset to demo data</span>
                  </button>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
            </div>

            {/* Quick Add Button */}
            <button
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
