import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { Navbar } from '@/components/Navbar';
import { ViewTabs } from '@/components/ViewTabs';
import { QuickTaskInput } from '@/components/QuickTaskInput';
import { TaskList } from '@/components/TaskList';
import { CalendarView } from '@/components/CalendarView';
import { TaskDrawer } from '@/components/TaskDrawer';
import { AuthModal } from '@/components/AuthModal';
import { useTasks } from '@/context/TaskContext';

export default function Home() {
  const { activeTab, setIsAuthModalOpen, setAuthMode } = useTasks();
  const router = useRouter();

  useEffect(() => {
    if (router.query.verified === 'true') {
      toast.success('Email verified successfully! You can now sign in.');
      setAuthMode('login');
      setIsAuthModalOpen(true);
      router.replace('/', undefined, { shallow: true });
    } else if (router.query.verified === 'already') {
      toast.success('Email is already verified. Please sign in.');
      setAuthMode('login');
      setIsAuthModalOpen(true);
      router.replace('/', undefined, { shallow: true });
    } else if (router.query.verified === 'false') {
      toast.error('Verification link expired or invalid.');
      router.replace('/', undefined, { shallow: true });
    }
  }, [router.query.verified]);

  return (
    <>
      <Head>
        <title>TaskFlow · Minimalist Task Planner</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#ffffff" />
      </Head>

      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 transition-colors selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-900">
        <Navbar />

        <main className="flex-1 w-full max-w-2xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">
          {/* 1. Core Focus Tabs & Category Filters */}
          <ViewTabs />

          {/* 2. Dynamic View: Google Calendar Planner or Quick-Add & Task List */}
          {activeTab === 'calendar' ? (
            <CalendarView />
          ) : (
            <>
              <QuickTaskInput />
              <TaskList />
            </>
          )}
        </main>

        {/* Global Task Drawer / Bottom Sheet */}
        <TaskDrawer />

        {/* Auth Modal with Remember Me */}
        <AuthModal />
      </div>
    </>
  );
}
