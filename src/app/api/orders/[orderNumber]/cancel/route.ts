import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";

const CUSTOMER_CANCELLABLE_STATUSES = [
  "PENDING",
  "VERIFYING_PRESCRIPTION",
  "PREPARING",
];

interface RouteParams {
  params: Promise<{ orderNumber: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // 1. Must be logged in
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get orderNumber from URL (string, not a number this time)
    const { orderNumber } = await params;

    // 3. Fetch the order by orderNumber
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: { id: true, userId: true, status: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 4. Ownership check
    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 5. Status check
    if (!CUSTOMER_CANCELLABLE_STATUSES.includes(order.status)) {
      return NextResponse.json(
        {
          error: `Order cannot be cancelled once it is ${order.status.replace(/_/g, " ").toLowerCase()}.`,
        },
        { status: 400 }
      );
    }

    // 6. Cancel — update using the numeric id we got from the lookup above,
    // since Prisma's `where` for update needs the unique id, not orderNumber again
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}