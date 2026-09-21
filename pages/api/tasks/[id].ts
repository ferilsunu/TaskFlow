import { NextApiRequest, NextApiResponse } from "next";
import { serverAuth } from "@/libs/serverAuth";
import prisma from "@/libs/prismadb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  try {
    const { currentUser } = await serverAuth(req, res);

    const existingTask = await prisma.task.findUnique({
      where: {
        id,
      },
    });

    if (!existingTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    // IDOR protection: only allow the owner to view, edit, or delete
    if (existingTask.userId !== currentUser.id) {
      return res.status(403).json({ error: "Forbidden: You do not own this task" });
    }

    if (req.method === "GET") {
      return res.status(200).json(existingTask);
    }

    if (req.method === "PATCH" || req.method === "PUT") {
      const { title, notes, completed, priority, category, dueDate, reminderAt, subtasks } = req.body;

      const dataToUpdate: any = {};
      if (title !== undefined && typeof title === "string") dataToUpdate.title = title.trim().slice(0, 300);
      if (notes !== undefined) dataToUpdate.notes = typeof notes === "string" ? notes.trim().slice(0, 2000) : null;
      if (completed !== undefined) dataToUpdate.completed = Boolean(completed);
      if (priority !== undefined && typeof priority === "string") dataToUpdate.priority = priority;
      if (category !== undefined && typeof category === "string") dataToUpdate.category = category.trim().slice(0, 50);
      if (dueDate !== undefined) dataToUpdate.dueDate = typeof dueDate === "string" && dueDate ? dueDate.slice(0, 20) : null;
      if (reminderAt !== undefined) {
        dataToUpdate.reminderAt = reminderAt ? new Date(reminderAt) : null;
        dataToUpdate.reminderSent = false;
      }
      if (subtasks !== undefined) dataToUpdate.subtasks = Array.isArray(subtasks) ? subtasks : [];

      const updatedTask = await prisma.task.update({
        where: {
          id,
        },
        data: dataToUpdate,
      });

      return res.status(200).json(updatedTask);
    }

    if (req.method === "DELETE") {
      await prisma.task.delete({
        where: {
          id,
        },
      });

      return res.status(200).json({ message: "Task deleted successfully" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    if (error?.message === "Not signed in" || error?.message === "User not found") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.error("Task detail API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
