import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import prisma from "@/libs/prismadb";
import { sendVerificationEmail } from "@/libs/mail";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "Email is already verified. Please sign in." });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: `${verificationCode}:${verificationToken}`,
        verificationExpires,
      },
    });

    try {
      await sendVerificationEmail(user.name || "there", cleanEmail, verificationCode, verificationToken);
    } catch (mailError) {
      console.error("Failed to resend verification email:", mailError);
      return res.status(500).json({ error: "Failed to send email. Please try again later." });
    }

    return res.status(200).json({
      success: true,
      message: "A new verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("Resend error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
