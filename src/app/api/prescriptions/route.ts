import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prescriptions = await prisma.prescription.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ prescriptions });
  } catch (error) {
    console.error("Fetch user prescriptions error:", error);
    return NextResponse.json({ error: "Failed to fetch prescriptions" }, { status: 500 });
  }
}