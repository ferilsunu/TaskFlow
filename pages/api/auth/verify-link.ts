import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/libs/prismadb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token, email } = req.query;

    if (!token || !email || typeof token !== "string" || typeof email !== "string") {
      return res.redirect("/?verified=false&reason=invalid_params");
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return res.redirect("/?verified=false&reason=user_not_found");
    }

    if (user.emailVerified) {
      return res.redirect("/?verified=already");
    }

    if (!user.verificationCode || !user.verificationExpires) {
      return res.redirect("/?verified=false&reason=expired");
    }

    if (new Date() > new Date(user.verificationExpires)) {
      return res.redirect("/?verified=false&reason=expired");
    }

    const [, storedToken] = user.verificationCode.split(":");
    if (storedToken !== token) {
      return res.redirect("/?verified=false&reason=invalid_token");
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

    return res.redirect("/?verified=true");
  } catch (error) {
    console.error("Verify link error:", error);
    return res.redirect("/?verified=false&reason=server_error");
  }
}
