import { Task, CategoryInfo } from '@/types/todo';

export const DEFAULT_CATEGORIES: CategoryInfo[] = [
  { name: 'Work', icon: 'Briefcase', color: 'bg-indigo-500 text-indigo-500' },
  { name: 'Personal', icon: 'User', color: 'bg-emerald-500 text-emerald-500' },
  { name: 'Study', icon: 'BookOpen', color: 'bg-blue-500 text-blue-500' },
  { name: 'Health', icon: 'Heart', color: 'bg-rose-500 text-rose-500' },
  { name: 'Finance', icon: 'DollarSign', color: 'bg-amber-500 text-amber-500' },
  { name: 'Projects', icon: 'Code', color: 'bg-purple-500 text-purple-500' },
];

export const getInitialTasks = (): Task[] => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  return [
    {
      id: 'task-1',
      title: 'Complete architecture review for production deployment',
      description: 'Review system dependencies, environment configs, and SSL termination on the cloud instance.',
      completed: false,
      status: 'in_progress',
      priority: 'urgent',
      category: 'Work',
      dueDate: today,
      subtasks: [
        { id: 'sub-1-1', title: 'Verify Nginx reverse proxy rules', completed: true },
        { id: 'sub-1-2', title: 'Check SSL cert validity via Certbot', completed: true },
        { id: 'sub-1-3', title: 'Audit PM2 process restart policies', completed: false },
      ],
      tags: ['DevOps', 'Deployment', 'Security'],
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updatedAt: new Date().toISOString(),
      pomodoroSessions: 2,
    },
    {
      id: 'task-2',
      title: 'Refactor TaskFlow state management and local persistence',
      description: 'Implement optimistic updates, instant filters, and JSON export/import utilities.',
      completed: false,
      status: 'in_progress',
      priority: 'high',
      category: 'Projects',
      dueDate: today,
      subtasks: [
        { id: 'sub-2-1', title: 'Design responsive layout with Tailwind CSS', completed: true },
        { id: 'sub-2-2', title: 'Add dark and light mode toggle', completed: true },
        { id: 'sub-2-3', title: 'Create Pomodoro timer integration', completed: false },
      ],
      tags: ['Frontend', 'React', 'Tailwind'],
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date().toISOString(),
      pomodoroSessions: 3,
    },
    {
      id: 'task-3',
      title: 'Practice Data Structures and Algorithms questions',
      description: 'Solve 2 graph traversal and 1 dynamic programming problem on LeetCode.',
      completed: false,
      status: 'todo',
      priority: 'medium',
      category: 'Study',
      dueDate: tomorrow,
      subtasks: [
        { id: 'sub-3-1', title: 'BFS & DFS graph shortest path', completed: false },
        { id: 'sub-3-2', title: 'Coin change memoization problem', completed: false },
      ],
      tags: ['Algorithms', 'InterviewPrep'],
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      updatedAt: new Date().toISOString(),
      pomodoroSessions: 0,
    },
    {
      id: 'task-4',
      title: 'Weekly grocery shopping and meal prep',
      description: 'Pick up fresh fruits, vegetables, oat milk, and high-protein essentials for the week.',
      completed: false,
      status: 'todo',
      priority: 'low',
      category: 'Personal',
      dueDate: nextWeek,
      subtasks: [
        { id: 'sub-4-1', title: 'Bananas and blueberries', completed: false },
        { id: 'sub-4-2', title: 'Oatmeal and almond butter', completed: false },
        { id: 'sub-4-3', title: 'Greek yogurt', completed: false },
      ],
      tags: ['Health', 'Routine'],
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date().toISOString(),
      pomodoroSessions: 0,
    },
    {
      id: 'task-5',
      title: 'Review monthly cloud server subscription billing',
      description: 'Verify Oracle cloud instance metrics, storage usage, and cost limits.',
      completed: true,
      status: 'completed',
      priority: 'medium',
      category: 'Finance',
      dueDate: yesterday,
      subtasks: [
        { id: 'sub-5-1', title: 'Download invoice PDF', completed: true },
        { id: 'sub-5-2', title: 'Verify credit balance', completed: true },
      ],
      tags: ['Finance', 'Cloud'],
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      updatedAt: new Date().toISOString(),
      pomodoroSessions: 1,
    },
    {
      id: 'task-6',
      title: 'Morning workout and 5km jog',
      description: 'Warmup stretches followed by 5km outdoor cardio run.',
      completed: true,
      status: 'completed',
      priority: 'high',
      category: 'Health',
      dueDate: today,
      subtasks: [
        { id: 'sub-6-1', title: '5km jog completed', completed: true },
        { id: 'sub-6-2', title: 'Post-run hydration & stretching', completed: true },
      ],
      tags: ['Fitness', 'Cardio'],
      createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
      updatedAt: new Date().toISOString(),
      pomodoroSessions: 1,
    },
  ];
};
