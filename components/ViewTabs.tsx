import React from 'react';
import { Calendar, Clock, CalendarDays, Inbox, Settings2 } from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { ViewTab } from '@/types/todo';

export const ViewTabs: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    counts, 
    categories, 
    selectedCategory, 
    setSelectedCategory,
    setIsCategoryModalOpen
  } = useTasks();

  const tabs: { id: ViewTab; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { id: 'today', label: 'Today', icon: Calendar, count: counts.today },
    { id: 'upcoming', label: 'Upcoming', icon: Clock, count: counts.upcoming },
    { id: 'calendar', label: 'Planner', icon: CalendarDays },
    { id: 'all', label: 'All', icon: Inbox, count: counts.all },
  ];

  return (
    <div className="space-y-2.5">
      {/* 4 Core Focus & Planner Tabs */}
      <div className="grid grid-cols-4 gap-1 sm:gap-1.5 bg-neutral-200/60 dark:bg-neutral-900/60 p-1 rounded-2xl border border-neutral-200/70 dark:border-neutral-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-xl text-[11px] sm:text-xs font-semibold transition ${
                isActive
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`} />
              <span className="truncate">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full hidden xs:inline-block sm:inline-block ${
                  isActive
                    ? 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold'
                    : 'text-neutral-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Categories Filter Pills */}
      {categories.length > 0 && activeTab !== 'calendar' && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs pt-0.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium transition ${
              selectedCategory === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            All
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-2 py-1 rounded-full border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-500 text-[11px] font-medium flex items-center gap-1 transition"
            title="Manage categories"
          >
            <Settings2 className="h-3 w-3" />
            <span>Edit</span>
          </button>
        </div>
      )}
    </div>
  );
};
