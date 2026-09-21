import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { X, Lock, Mail, User, ShieldCheck, RefreshCw } from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { mutate } from 'swr';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, authMode, setAuthMode } = useTasks();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setName('');
    setEmail('');
    setPassword('');
    setVerificationCode('');
    setAuthMode('login');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter your email and password');
      return;
    }

    try {
      setIsLoading(true);
      await axios.post('/api/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      toast.success('Verification code sent to your email!');
      setAuthMode('verify' as any);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    try {
      setIsLoading(true);
      await axios.post('/api/auth/verify', {
        email: email.trim(),
        code: verificationCode.trim(),
      });

      toast.success('Email verified! Signing you in...');

      // Auto sign-in
      const res = await signIn('credentials', {
        email: email.trim(),
        password,
        rememberMe: rememberMe ? 'true' : 'false',
        redirect: false,
      });

      if (res?.error) {
        toast.error(res.error || 'Please sign in with your credentials');
        setAuthMode('login');
      } else {
        toast.success('Welcome to TaskFlow!');
        handleClose();
        await mutate('/api/user/current');
        mutate('/api/tasks');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email.trim()) return;
    try {
      setIsResending(true);
      const res = await axios.post('/api/auth/resend-code', {
        email: email.trim(),
      });
      toast.success(res.data?.message || 'New verification code sent!');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter your email and password');
      return;
    }

    try {
      setIsLoading(true);
      const res = await signIn('credentials', {
        email: email.trim(),
        password,
        rememberMe: rememberMe ? 'true' : 'false',
        redirect: false,
      });

      if (res?.error) {
        if (res.error.includes('verify your email')) {
          toast.error(res.error);
          setAuthMode('verify' as any);
        } else {
          toast.error(res.error || 'Invalid email or password');
        }
      } else {
        toast.success('Signed in');
        handleClose();
        await mutate('/api/user/current');
        mutate('/api/tasks');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Authentication failed');
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
            {authMode === 'login' 
              ? 'Welcome Back' 
              : authMode === 'register' 
              ? 'Create Account' 
              : 'Verify Your Email'}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            {authMode === 'login'
              ? 'Sign in to sync your tasks across devices'
              : authMode === 'register'
              ? 'Start organizing your tasks in seconds'
              : `Enter the 6-digit code sent to ${email || 'your email'}`}
          </p>
        </div>

        {/* Tab Switcher (Only in login / register modes) */}
        {authMode !== ('verify' as any) && (
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
        )}

        {/* Verification Form */}
        {authMode === ('verify' as any) ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-neutral-500 block mb-1 text-center">
                6-Digit Verification Code
              </label>
              <div className="flex items-center justify-center">
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[8px] text-2xl font-black py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none border border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs hover:opacity-90 active:scale-98 transition shadow-xs disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Confirm & Sign In'}
            </button>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className="flex items-center gap-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-[11px] font-medium"
              >
                <RefreshCw className={`h-3 w-3 ${isResending ? 'animate-spin' : ''}`} />
                <span>Resend code</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-[11px] font-medium"
              >
                Back to sign in
              </button>
            </div>
          </form>
        ) : (
          /* Login & Register Form */
          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-3.5">
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
                : 'Create Account & Send Code'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
