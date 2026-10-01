// lib/auth.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const secretKey = process.env.AUTH_SECRET;

if (!secretKey) {
  throw new Error("AUTH_SECRET is not defined in .env");
}

const secret = new TextEncoder().encode(secretKey);

export async function createToken(userId: number) {
  return await new SignJWT({
    userId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);

    return payload as {
      userId: number;
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    console.log("🔍 Checking auth_token cookie:", token ? "EXISTS" : "MISSING");

    if (!token) return null;

    const payload = await verifyToken(token);
    console.log("🔍 Decoded JWT Payload:", payload);

    if (!payload?.userId) return null;

    // Ensure type compatibility (convert to Number or String according to your Prisma schema)
    const userId = Number(payload.userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    console.log("🔍 Database User Found:", user ? user.email : "NOT FOUND IN DB");

    return user;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}