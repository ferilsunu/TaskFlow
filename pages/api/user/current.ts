import { NextApiRequest, NextApiResponse } from "next";
import { serverAuth } from "@/libs/serverAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { currentUser } = await serverAuth(req, res);
    res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");
    return res.status(200).json(currentUser);
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
