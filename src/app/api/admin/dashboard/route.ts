import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Check logged-in user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Check admin role
    if (user.role !== "PHARMACY_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // 3. Get order statistics
    const [
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      outForDeliveryOrders,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
    ] = await Promise.all([
      prisma.order.count(),

      prisma.order.count({
        where: {
          status: {
            in: [
              "PENDING",
              "VERIFYING_PRESCRIPTION",
            ],
          },
        },
      }),

      prisma.order.count({
        where: {
          status: "DELIVERED",
        },
      }),

      prisma.order.count({
        where: {
          status: "CANCELLED",
        },
      }),

      prisma.order.count({
        where: {
          status: "OUT_FOR_DELIVERY",
        },
      }),

      prisma.product.count(),

      prisma.product.count({
        where: {
          stockCount: {
            gt: 0,
            lte: 5,
          },
        },
      }),

      prisma.product.count({
        where: {
          stockCount: 0,
        },
      }),
    ]);

    // 4. Calculate total sales
    const salesResult = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        status: {
          not: "CANCELLED",
        },
      },
    });

    const totalSales = salesResult._sum.totalAmount ?? 0;

    // 5. Get recent orders
    const recentOrders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        totalAmount: true,
        status: true,
        createdAt: true,
      },
    });

    // 6. Return dashboard data
    return NextResponse.json({
      stats: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        outForDeliveryOrders,
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalSales,
      },

      recentOrders,
    });
  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error
    );

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}