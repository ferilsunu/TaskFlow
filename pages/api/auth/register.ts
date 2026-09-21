import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "@/libs/prismadb";
import { sendVerificationEmail } from "@/libs/mail";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, password } = req.body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (typeof name === "string" ? name.trim() : "") || cleanEmail.split("@")[0];

    if (cleanEmail.length > 100 || !cleanEmail.includes("@")) {
      return res.status(400).json({ error: "Please provide a valid email address" });
    }

    if (password.length < 6 || password.length > 100) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: cleanEmail,
      },
    });

    // If user exists and is already verified
    if (existingUser && existingUser.emailVerified) {
      return res.status(422).json({ error: "An account with this email already exists. Please sign in." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    // 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    if (existingUser && !existingUser.emailVerified) {
      // Update pending unverified account
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: cleanName,
          hashedPassword,
          verificationCode: `${verificationCode}:${verificationToken}`,
          verificationExpires,
        },
      });
    } else {
      // Create new unverified account
      await prisma.user.create({
        data: {
          email: cleanEmail,
          name: cleanName,
          hashedPassword,
          emailVerified: null,
          verificationCode: `${verificationCode}:${verificationToken}`,
          verificationExpires,
        },
      });
    }

    // Send verification email
    try {
      await sendVerificationEmail(cleanName, cleanEmail, verificationCode, verificationToken);
    } catch (mailError) {
      console.error("Failed to send verification email:", mailError);
      return res.status(500).json({ error: "Failed to send verification email. Please check your email configuration." });
    }

    return res.status(200).json({
      status: "pending_verification",
      email: cleanEmail,
      message: "Verification code sent to your email address.",
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
