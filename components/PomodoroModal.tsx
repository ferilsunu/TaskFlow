import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Flame,
  Target
} from 'lucide-react';
import { useTasks } from '@/context/TaskContext';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const MODE_TIMES: Record<TimerMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const PomodoroModal: React.FC = () => {
  const { 
    isPomodoroOpen, 
    setIsPomodoroOpen, 
    activePomodoroTask, 
    setActivePomodoroTask, 
    tasks, 
    incrementPomodoro 
  } = useTasks();

  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_TIMES.focus);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [completedCycles, setCompletedCycles] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTimeLeft(MODE_TIMES[mode]);
    setIsRunning(false);
  }, [mode]);

  // Audio Beep using Web Audio API (Zero external assets dependency!)
  const playAlertSound = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            setIsRunning(false);
            playAlertSound();

            if (mode === 'focus') {
              setCompletedCycles((c) => c + 1);
              if (activePomodoroTask) {
                incrementPomodoro(activePomodoroTask.id);
              }
              setMode('shortBreak');
            } else {
              setMode('focus');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, activePomodoroTask, soundEnabled]);

  if (!isPomodoroOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalTime = MODE_TIMES[mode];
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(MODE_TIMES[mode]);
  };

  const handleSkip = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      setMode('shortBreak');
    } else {
      setMode('focus');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-500" />
            <h2 className="font-bold text-base text-neutral-900 dark:text-white">
              Focus Timer
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsPomodoroOpen(false)}
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center justify-center gap-2 my-6">
          <button
            onClick={() => setMode('focus')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              mode === 'focus'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            Focus (25m)
          </button>
          <button
            onClick={() => setMode('shortBreak')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              mode === 'shortBreak'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => setMode('longBreak')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              mode === 'longBreak'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Active Task Selector */}
        <div className="mb-6 bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1 font-semibold">
            <Target className="h-3.5 w-3.5 text-brand-500" />
            <span>Working on:</span>
          </div>
          <select
            value={activePomodoroTask?.id || ''}
            onChange={(e) => {
              const t = tasks.find((item) => item.id === e.target.value);
              setActivePomodoroTask(t || null);
            }}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-1.5 text-xs font-bold text-neutral-900 dark:text-white outline-none"
          >
            <option value="">(No specific task selected)</option>
            {tasks.filter((t) => !t.completed).map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Timer Display Gauge */}
        <div className="flex flex-col items-center justify-center my-6">
          <div className="relative flex items-center justify-center w-52 h-52">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="104"
                cy="104"
                r="90"
                className="stroke-neutral-100 dark:stroke-neutral-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="104"
                cy="104"
                r="90"
                className={`${
                  mode === 'focus' ? 'stroke-amber-500' : mode === 'shortBreak' ? 'stroke-emerald-500' : 'stroke-blue-500'
                } transition-all duration-500`}
                strokeWidth="10"
                strokeDasharray={565.48}
                strokeDashoffset={565.48 - (565.48 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white font-mono">
                {timeFormatted}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mt-1 capitalize">
                {mode === 'focus' ? 'Deep Focus' : 'Relax & Recharge'}
              </span>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={handleReset}
            className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
            title="Reset"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-8 py-3.5 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition flex items-center gap-2 ${
              isRunning
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                : 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="h-5 w-5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={handleSkip}
            className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
            title="Skip to next session"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-neutral-400">
          <span>Completed sessions today: </span>
          <span className="font-bold text-neutral-900 dark:text-white">{completedCycles}</span>
        </div>
      </div>
    </div>
  );
};
