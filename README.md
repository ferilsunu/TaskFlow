# TaskFlow · Psychology-Driven Minimalist Task Management

TaskFlow is a tranquil, psychology-first task management application engineered to reduce cognitive overload and make capturing ideas effortless. Built with Next.js, React, TypeScript, Tailwind CSS, Prisma, MongoDB, and NextAuth.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.js.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Self--Hosted-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

## 🌐 Live Preview

Experience the live application: **[https://todo.ferilsunu.com](https://todo.ferilsunu.com)**

---

## ✨ Key Architectural & UX Highlights

### 🧠 Cognitive Ease & Psychology-First Design
* **Zero Cognitive Clutter**: Free of unnecessary widgets, complex dashboards, and intrusive demo data.
* **Pure Typographic Identity**: Minimalist, distraction-free typographic wordmark without noisy icons.
* **Tranquil Empty State**: Clean and peaceful space that lets users focus on what matters.

### ⚡ 0-Friction Task Capture
* **Instant Inline Input**: Add a task directly by typing and pressing Enter. Adding a task never feels like another chore.
* **Quick Chips**: One-tap toggles for Today, Tomorrow, Priority levels, and Category labels.
* **Global Keyboard Shortcut**: Press `Cmd + K` or `Ctrl + K` anywhere to jump straight to the task adder.

### 📱 Mobile-First Experience
* **Touch-Optimized**: Designed from the ground up for mobile screens and handheld ergonomics.
* **Slide-Over & Bottom-Sheet**: Seamless task drawer for notes, checklist subtasks, and scheduling.
* **Responsive Focus Tabs**: Quick filters for Today, Upcoming, All, and Completed tasks.

### 🔒 Secure Authentication & Cloud Database
* **NextAuth & MongoDB**: Secure user sessions powered by NextAuth Credentials Provider and Prisma ORM.
* **30-Day Remember Me**: Configurable session persistence allowing users to stay securely signed in.
* **Strict IDOR Protection**: Server-side user authorization on every API route (`/api/tasks`, `/api/tasks/[id]`).
* **Optimistic Local Fallback**: Instant local storage support when browsing anonymously.

---

## 🛠️ Tech Stack

* **Framework**: Next.js (Pages Router)
* **Language**: TypeScript
* **Database**: MongoDB
* **ORM**: Prisma 5.22
* **Authentication**: NextAuth.js with bcryptjs
* **Data Fetching**: SWR (Stale-While-Revalidate with optimistic UI updates)
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **Visual Effects**: Canvas Confetti
* **Date Utilities**: date-fns

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js 18.0 or higher and MongoDB installed:

```bash
node -v
npm -v
```

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="mongodb://username:password@127.0.0.1:27017/todoapp?authSource=todoapp"
NEXTAUTH_SECRET="your-secure-nextauth-secret"
NEXTAUTH_JWT_SECRET="your-secure-jwt-secret"
NEXTAUTH_URL="http://localhost:3004"
PORT=3004
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ferilsunu/ToDo-App.git
cd ToDo-App
```

2. Install dependencies:
```bash
npm install
```

3. Generate Prisma client and initialize database schema:
```bash
npx prisma generate
npx prisma db push
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3004](http://localhost:3004) in your browser.

### Production Build

To create and run an optimized production build:

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
ToDo-App/
├── components/            # Clean UI components
│   ├── AuthModal.tsx      # Sign in and sign up modal with Remember Me
│   ├── EmptyState.tsx     # Tranquil, distraction-free empty state
│   ├── Navbar.tsx         # Typographic brand wordmark and user menu
│   ├── QuickTaskInput.tsx # 0-friction inline task adder
│   ├── TaskDrawer.tsx     # Task editor and checklist subtask drawer
│   ├── TaskItem.tsx       # Smooth task item with check animation
│   ├── TaskList.tsx       # Filtered task list container
│   └── ViewTabs.tsx       # Focus view tabs and category filters
├── context/
│   └── TaskContext.tsx    # SWR-backed optimistic task state
├── libs/
│   ├── prismadb.ts        # Prisma client singleton
│   └── serverAuth.ts      # Server-side authentication guard
├── pages/
│   ├── api/
│   │   ├── auth/          # NextAuth and registration endpoints
│   │   ├── tasks/         # Authenticated task CRUD endpoints
│   │   └── user/          # Current user session endpoint
│   ├── _app.tsx           # Global app wrapper with SessionProvider
│   ├── _document.tsx      # Document header and meta tags
│   └── index.tsx          # Main mobile-first application layout
├── prisma/
│   └── schema.prisma      # Prisma MongoDB schema definition
├── styles/
│   └── globals.css        # Tailwind directives and custom styling
├── types/
│   └── todo.ts            # TypeScript interfaces
├── next.config.js         # Next.js configuration
├── package.json           # Dependencies and scripts
└── tailwind.config.js     # Tailwind CSS design tokens
```

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Feril Sunu**
* Website: [https://ferilsunu.com](https://ferilsunu.com)
* GitHub: [@ferilsunu](https://github.com/ferilsunu)
