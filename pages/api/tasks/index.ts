import { NextApiRequest, NextApiResponse } from "next";
import { serverAuth } from "@/libs/serverAuth";
import prisma from "@/libs/prismadb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { currentUser } = await serverAuth(req, res);

    if (req.method === "GET") {
      res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");

      const tasks = await prisma.task.findMany({
        where: {
          userId: currentUser.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json(tasks);
    }

    if (req.method === "POST") {
      const { title, notes, completed, priority, category, dueDate, reminderAt, subtasks } = req.body;

      if (!title || typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ error: "Task title is required" });
      }

      const hasReminder = Boolean(reminderAt && !isNaN(new Date(reminderAt).getTime()));

      const task = await prisma.task.create({
        data: {
          title: title.trim().slice(0, 300),
          notes: typeof notes === "string" ? notes.trim().slice(0, 2000) : null,
          completed: Boolean(completed),
          priority: typeof priority === "string" ? priority : "medium",
          category: typeof category === "string" && category.trim() ? category.trim().slice(0, 50) : "Inbox",
          dueDate: typeof dueDate === "string" && dueDate ? dueDate.slice(0, 20) : null,
          reminderAt: hasReminder ? new Date(reminderAt) : null,
          reminderSent: !hasReminder,
          subtasks: Array.isArray(subtasks) ? subtasks : [],
          userId: currentUser.id,
        },
      });

      return res.status(201).json(task);
    }
  } catch (error: any) {
    if (error?.message === "Not signed in" || error?.message === "User not found") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.error("Tasks API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
