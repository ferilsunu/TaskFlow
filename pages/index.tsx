import React from 'react';
import Head from 'next/head';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { ListView } from '@/components/ListView';
import { BoardView } from '@/components/BoardView';
import { AnalyticsView } from '@/components/AnalyticsView';
import { TaskModal } from '@/components/TaskModal';
import { PomodoroModal } from '@/components/PomodoroModal';
import { CommandPalette } from '@/components/CommandPalette';
import { useTasks } from '@/context/TaskContext';

export default function Home() {
  const { viewMode } = useTasks();

  return (
    <>
      <Head>
        <title>TaskFlow · Modern Productivity & Task Management</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen flex flex-col bg-neutral-100/60 dark:bg-neutral-950 transition-colors">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Sidebar Filter Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 w-full min-w-0">
              {viewMode === 'list' && <ListView />}
              {viewMode === 'board' && <BoardView />}
              {viewMode === 'analytics' && <AnalyticsView />}
            </div>
          </div>
        </main>

        {/* Global Footer */}
        <footer className="border-t border-neutral-200/80 dark:border-neutral-800/80 py-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© 2026 TaskFlow by Feril Sunu. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="https://ferilsunu.com" target="_blank" rel="noopener noreferrer" className="hover:underline text-brand-600 dark:text-brand-400">
                Portfolio
              </a>
              <span>·</span>
              <a href="https://github.com/ferilsunu/ToDo-App" target="_blank" rel="noopener noreferrer" className="hover:underline text-brand-600 dark:text-brand-400">
                GitHub
              </a>
              <span>·</span>
              <span>Press ⌘K for actions</span>
            </div>
          </div>
        </footer>

        {/* Global Modals */}
        <TaskModal />
        <PomodoroModal />
        <CommandPalette />
      </div>
    </>
  );
}
