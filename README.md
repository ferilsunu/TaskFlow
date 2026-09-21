# TaskFlow · Modern Productivity & Task Management

TaskFlow is a modern, high-performance task and workflow management application built with Next.js, React, TypeScript, and Tailwind CSS. It empowers developers and professionals to organize tasks, manage subtask checklists, track focus sessions with an integrated Pomodoro timer, and visualize productivity analytics.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.js.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

## 🌐 Live Preview

Experience the live application: **[https://todo.ferilsunu.com](https://todo.ferilsunu.com)**

---

## ✨ Key Features

### 📋 Multi-View Task Management
* **List View**: Grouped sections for Overdue, Due Today, Upcoming, and Completed tasks with dynamic sorting by due date, priority, or creation date.
* **Kanban Board View**: Three-column interactive workflow (To Do, In Progress, Completed) with quick status shifting.
* **Analytics Dashboard**: Real-time KPI cards for completion rate percentage, overdue alerts, category distribution, and priority breakdown.

### ⏱️ Integrated Pomodoro Focus Mode
* Customizable focus timer (25 min Focus, 5 min Short Break, 15 min Long Break).
* Web Audio API synthesized alert chimes with zero external audio assets.
* Links focus sessions directly to specific tasks and automatically logs focus metrics.

### ⚡ Rapid Productivity & Keyboard Shortcuts
* **Global Command Palette**: Quick access via `Cmd + K` or `Ctrl + K` to search tasks and execute instant actions.
* **New Task Shortcut**: Press `Cmd + N` or `Ctrl + N` from anywhere to create a task immediately.
* **Checklist Subtasks**: Interactive nested subtask checklists with progress indicator bars.

### 🎨 Design & Accessibility
* **Theme Switching**: Dark mode and light mode with persistent system preference detection.
* **Color-Coded Priorities**: Urgent, High, Medium, and Low visual indicators.
* **Celebration Effects**: Confetti bursts upon completing tasks.
* **Responsive Layout**: Optimized for mobile, tablet, and widescreen desktop experiences.

### 💾 Data Portability
* Local-first persistence with instant offline support.
* One-click JSON backup export and import.
* CSV export support for spreadsheets and reporting.

---

## 🛠️ Tech Stack

* **Framework**: Next.js (Pages Router with Turbopack)
* **Language**: TypeScript
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **State & Persistence**: React Context API + LocalStorage + REST API routes
* **Visual Effects**: Canvas Confetti
* **Date Utilities**: date-fns
* **Notifications**: React Hot Toast

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js 18.0 or higher installed:

```bash
node -v
npm -v
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ferilsunu/ToDo-App.git
cd ToDo-App
```

2. Install project dependencies:
```bash
npm install
```

3. Start the local development server:
```bash
npm run dev
```

4. Open [http://localhost:3004](http://localhost:3004) in your browser.

### Production Build

To create an optimized production build:

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
ToDo-App/
├── components/            # Reusable UI components
│   ├── AnalyticsView.tsx  # KPI charts and productivity metrics
│   ├── BoardView.tsx      # 3-column Kanban workflow
│   ├── CommandPalette.tsx # Global Cmd+K quick launcher
│   ├── EmptyState.tsx     # Polished empty state cards
│   ├── ListView.tsx       # Grouped task list container
│   ├── Navbar.tsx         # Navigation header and tools
│   ├── PomodoroModal.tsx  # Focus timer modal with audio synthesizer
│   ├── Sidebar.tsx        # Timeline, category, and priority filters
│   ├── TaskCard.tsx       # Kanban card item
│   ├── TaskItem.tsx       # List row item with subtask checklist
│   └── TaskModal.tsx      # Task creation and editing modal
├── context/
│   └── TaskContext.tsx    # State management, filters, and persistence
├── libs/
│   └── initialData.ts     # Default demo tasks and category configs
├── pages/
│   ├── api/
│   │   └── tasks/         # REST API endpoints
│   ├── _app.tsx           # Global app wrapper with providers
│   ├── _document.tsx      # Document header, fonts, and meta tags
│   └── index.tsx          # Main application page
├── public/
│   └── favicon.svg        # Modern vector application icon
├── styles/
│   └── globals.css        # Global CSS and custom scrollbars
├── types/
│   └── todo.ts            # TypeScript interfaces and types
├── next.config.js         # Next.js configuration and security headers
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS theme configuration
└── tsconfig.json          # TypeScript compiler options
```

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Feril Sunu**
* Portfolio: [https://ferilsunu.com](https://ferilsunu.com)
* GitHub: [@ferilsunu](https://github.com/ferilsunu)
