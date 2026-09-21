import React from 'react';
import { Calendar, Clock, Inbox, CheckCircle2 } from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { ViewTab } from '@/types/todo';

export const ViewTabs: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    counts, 
    categories, 
    selectedCategory, 
    setSelectedCategory 
  } = useTasks();

  const tabs: { id: ViewTab; label: string; icon: React.ComponentType<{ className?: string }>; count: number }[] = [
    { id: 'today', label: 'Today', icon: Calendar, count: counts.today },
    { id: 'upcoming', label: 'Upcoming', icon: Clock, count: counts.upcoming },
    { id: 'all', label: 'All', icon: Inbox, count: counts.all },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, count: counts.completed },
  ];

  return (
    <div className="space-y-3">
      {/* 4 Core Focus Tabs */}
      <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 bg-neutral-200/50 dark:bg-neutral-900/60 p-1 rounded-2xl border border-neutral-200/60 dark:border-neutral-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`} />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
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
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition flex-shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
              : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          All Categories
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition flex-shrink-0 ${
              selectedCategory === cat
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold'
                : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};
