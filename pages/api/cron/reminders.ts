import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";
import { sendTaskReminderEmail } from "@/libs/mail";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow GET and POST
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Security check: Verify cron secret or local request
  const cronSecret = process.env.CRON_SECRET || "taskflow_cron_internal_secret_2026";
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim() || req.query.secret;

  const isLocalhost = 
    req.socket.remoteAddress === "127.0.0.1" || 
    req.socket.remoteAddress === "::1" || 
    req.socket.remoteAddress === "::ffff:127.0.0.1";

  if (token !== cronSecret && !isLocalhost) {
    return res.status(401).json({ error: "Unauthorized: Invalid cron secret" });
  }

  try {
    const now = new Date();

    // Find all uncompleted tasks where reminderAt is explicitly set and due
    const pendingReminders = await prisma.task.findMany({
      where: {
        completed: false,
        reminderSent: false,
        reminderAt: {
          not: null,
          lte: now,
        },
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            emailVerified: true,
          },
        },
      },
      take: 50,
    });

    let sentCount = 0;

    for (const task of pendingReminders) {
      // Guard: strictly require a valid reminderAt date
      if (!task.reminderAt) {
        await prisma.task.update({
          where: { id: task.id },
          data: { reminderSent: true },
        });
        continue;
      }

      if (task.user && task.user.email && task.user.emailVerified) {
        try {
          await sendTaskReminderEmail(
            task.user.email,
            task.user.name || "TaskFlow User",
            {
              id: task.id,
              title: task.title,
              notes: task.notes,
              priority: task.priority,
              category: task.category,
              dueDate: task.dueDate,
            }
          );
          sentCount++;
        } catch (mailError) {
          console.error(`Failed to send reminder for task ${task.id}:`, mailError);
        }
      }

      // Mark reminderSent as true so it won't fire repeatedly
      await prisma.task.update({
        where: { id: task.id },
        data: { reminderSent: true },
      });
    }

    return res.status(200).json({
      success: true,
      processed: pendingReminders.length,
      sent: sentCount,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Reminder cron error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
