import { NextApiRequest, NextApiResponse } from "next";
import { serverAuth } from "@/libs/serverAuth";
import prisma from "@/libs/prismadb";

const MAX_CATEGORIES = 7;
const DEFAULT_CATEGORIES = ["Inbox", "Work", "Personal"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { currentUser } = await serverAuth(req, res);

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { id: true, categories: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentCategories: string[] = 
      Array.isArray(user.categories) && user.categories.length > 0 
        ? user.categories 
        : DEFAULT_CATEGORIES;

    // GET /api/user/categories
    if (req.method === "GET") {
      return res.status(200).json(currentCategories);
    }

    // POST /api/user/categories - Add new category
    if (req.method === "POST") {
      const { name } = req.body;

      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ error: "Category name is required" });
      }

      const cleanName = name.trim().slice(0, 25);

      if (currentCategories.length >= MAX_CATEGORIES) {
        return res.status(400).json({ 
          error: `Category limit reached. You can create up to ${MAX_CATEGORIES} categories.` 
        });
      }

      const isDuplicate = currentCategories.some(
        (c) => c.toLowerCase() === cleanName.toLowerCase()
      );

      if (isDuplicate) {
        return res.status(400).json({ error: "Category with this name already exists" });
      }

      const updatedCategories = [...currentCategories, cleanName];

      await prisma.user.update({
        where: { id: user.id },
        data: { categories: updatedCategories },
      });

      return res.status(201).json(updatedCategories);
    }

    // PATCH /api/user/categories - Rename category
    if (req.method === "PATCH") {
      const { oldName, newName } = req.body;

      if (!oldName || !newName || typeof oldName !== "string" || typeof newName !== "string") {
        return res.status(400).json({ error: "Old and new category names are required" });
      }

      const cleanOld = oldName.trim();
      const cleanNew = newName.trim().slice(0, 25);

      if (!cleanNew) {
        return res.status(400).json({ error: "New category name cannot be empty" });
      }

      if (cleanOld.toLowerCase() === "inbox") {
        return res.status(400).json({ error: "The default Inbox category cannot be renamed" });
      }

      const isDuplicate = currentCategories.some(
        (c) => c.toLowerCase() === cleanNew.toLowerCase() && c.toLowerCase() !== cleanOld.toLowerCase()
      );

      if (isDuplicate) {
        return res.status(400).json({ error: "Another category with this name already exists" });
      }

      const updatedCategories = currentCategories.map((c) => (c === cleanOld ? cleanNew : c));

      // Update User categories & update all matching tasks
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { categories: updatedCategories },
        }),
        prisma.task.updateMany({
          where: { userId: user.id, category: cleanOld },
          data: { category: cleanNew },
        }),
      ]);

      return res.status(200).json(updatedCategories);
    }

    // DELETE /api/user/categories - Delete category
    if (req.method === "DELETE") {
      const { name } = req.body;

      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Category name is required" });
      }

      const cleanName = name.trim();

      if (cleanName.toLowerCase() === "inbox") {
        return res.status(400).json({ error: "The default Inbox category cannot be deleted" });
      }

      const updatedCategories = currentCategories.filter((c) => c !== cleanName);

      // Update User categories & move tasks from deleted category back to 'Inbox'
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { categories: updatedCategories },
        }),
        prisma.task.updateMany({
          where: { userId: user.id, category: cleanName },
          data: { category: "Inbox" },
        }),
      ]);

      return res.status(200).json(updatedCategories);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    if (error?.message === "Not signed in" || error?.message === "User not found") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.error("Categories API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
