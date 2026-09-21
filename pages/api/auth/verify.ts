import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, code } = req.body;

    if (!email || !code || typeof email !== "string" || typeof code !== "string") {
      return res.status(400).json({ error: "Email and verification code are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(200).json({ success: true, message: "Email is already verified" });
    }

    if (!user.verificationCode || !user.verificationExpires) {
      return res.status(400).json({ error: "No pending verification code found. Please request a new one." });
    }

    if (new Date() > new Date(user.verificationExpires)) {
      return res.status(400).json({ error: "Verification code has expired. Please request a new code." });
    }

    const [storedOtp] = user.verificationCode.split(":");
    if (storedOtp !== cleanCode) {
      return res.status(400).json({ error: "Invalid verification code. Please check your code." });
    }

    // Successfully verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationCode: null,
        verificationExpires: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now sign in.",
    });
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
