import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/currentUser"; // adjust path to wherever your helper lives
import { prisma } from "@/lib/prisma";       // adjust path to your Prisma client

export async function GET() {
  try {
    // 1. Get the logged-in user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Check role
    if (user.role !== "PHARMACY_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // 3. Fetch orders (admin sees ALL orders, not just their own)
    const orders = await prisma.order.findMany({
  orderBy: { createdAt: "desc" },
  include: {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    items: {
      include: {
        product: true,
      },
    },
  },
});

    // 4. Return orders
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Admin orders fetch error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}