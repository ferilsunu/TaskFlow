import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { TaskProvider } from '@/context/TaskContext';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TaskProvider>
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: '!bg-white dark:!bg-neutral-900 !text-neutral-900 dark:!text-white !border !border-neutral-200 dark:!border-neutral-800 !rounded-2xl !shadow-xl !text-xs !font-medium',
          duration: 2500,
        }}
      />
      <Component {...pageProps} />
    </TaskProvider>
  );
}
