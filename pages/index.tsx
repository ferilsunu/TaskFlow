import React from 'react';
import Head from 'next/head';
import { Navbar } from '@/components/Navbar';
import { ViewTabs } from '@/components/ViewTabs';
import { QuickTaskInput } from '@/components/QuickTaskInput';
import { TaskList } from '@/components/TaskList';
import { TaskDrawer } from '@/components/TaskDrawer';
import { AuthModal } from '@/components/AuthModal';

export default function Home() {
  return (
    <>
      <Head>
        <title>TaskFlow</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#ffffff" />
      </Head>

      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 transition-colors selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-900">
        <Navbar />

        <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {/* 1. Core Focus Tabs & Category Filters */}
          <ViewTabs />

          {/* 2. Frictionless Quick Task Adding Input */}
          <QuickTaskInput />

          {/* 3. Tranquil Task List */}
          <TaskList />
        </main>

        {/* Global Task Drawer / Bottom Sheet */}
        <TaskDrawer />

        {/* Auth Modal with Remember Me */}
        <AuthModal />
      </div>
    </>
  );
}
