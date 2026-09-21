import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { X, Lock, Mail, User, CheckSquare, Square } from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { mutate } from 'swr';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, authMode, setAuthMode } = useTasks();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter your email and password');
      return;
    }

    try {
      setIsLoading(true);

      if (authMode === 'register') {
        // 1. Create account
        await axios.post('/api/auth/register', {
          name: name.trim(),
          email: email.trim(),
          password,
        });
        toast.success('Account created successfully');
      }

      // 2. Sign in with Remember Me
      const res = await signIn('credentials', {
        email: email.trim(),
        password,
        rememberMe: rememberMe ? 'true' : 'false',
        redirect: false,
      });

      if (res?.error) {
        toast.error(res.error || 'Invalid credentials');
      } else {
        toast.success('Signed in');
        handleClose();
        // Invalidate current user and tasks
        await mutate('/api/user/current');
        mutate('/api/tasks');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Tabs */}
        <div className="text-center mt-2 mb-6">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            {authMode === 'login'
              ? 'Sign in to sync your tasks across devices'
              : 'Start organizing your tasks in seconds'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
              authMode === 'login'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
              authMode === 'register'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authMode === 'register' && (
            <div>
              <label className="text-[11px] font-semibold text-neutral-500 block mb-1">
                Name
              </label>
              <div className="flex items-center px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs">
                <User className="h-4 w-4 text-neutral-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent text-neutral-900 dark:text-white outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-neutral-500 block mb-1">
              Email
            </label>
            <div className="flex items-center px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs">
              <Mail className="h-4 w-4 text-neutral-400 mr-2 flex-shrink-0" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-neutral-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-500 block mb-1">
              Password
            </label>
            <div className="flex items-center px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs">
              <Lock className="h-4 w-4 text-neutral-400 mr-2 flex-shrink-0" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-neutral-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-neutral-600 dark:text-neutral-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded text-neutral-900 focus:ring-0 cursor-pointer accent-neutral-900 dark:accent-white"
              />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs hover:opacity-90 active:scale-98 transition mt-2 shadow-xs disabled:opacity-50"
          >
            {isLoading
              ? 'Please wait...'
              : authMode === 'login'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
