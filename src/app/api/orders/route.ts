import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";

type OrderItemInput = {
  productId: number;
  quantity: number;
};

export async function POST(request: Request) {
  console.log("🔥 POST /api/orders CALLED");
  try {
    // Check logged-in customer
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login before placing an order.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      name,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      items,
    }: {
      name: string;
      phone: string;
      email?: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
      items: OrderItemInput[];
    } = body;

    // Basic server-side validation
    if (
      !name ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !pincode
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide all required delivery details.",
        },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart is empty.",
        },
        { status: 400 }
      );
    }

    // Get products from PostgreSQL
    const productIds = items.map((item) => item.productId);

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    // Make sure every product still exists
    if (products.length !== items.length) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more products are no longer available.",
        },
        { status: 400 }
      );
    }

    // Create order items using prices from DATABASE
    const orderItems = items.map((item) => {
      const product = products.find(
        (product) => product.id === item.productId
      );

      if (!product) {
        throw new Error("Product not found");
      }

      if (item.quantity <= 0) {
        throw new Error("Invalid product quantity");
      }

      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      };
    });

    // Calculate total using database prices
    const totalAmount = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // 🛡️ DUPLICATE ORDER GUARD (Check if identical order was created in last 5 seconds)
    const recentOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        customerPhone: phone,
        totalAmount,
        createdAt: {
          gte: new Date(Date.now() - 5000), // Within last 5 seconds
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (recentOrder) {
      // console.log("🛑 DUPLICATE ORDER BLOCKED IN DB:", recentOrder.orderNumber);
      return NextResponse.json(
        {
          success: true,
          message: "Order placed successfully.",
          order: {
            id: recentOrder.id,
            orderNumber: recentOrder.orderNumber,
            totalAmount: recentOrder.totalAmount,
            status: recentOrder.status,
            items: recentOrder.items,
          },
        },
        { status: 200 }
      );
    }

    // Generate unique order number
    const orderNumber = `MED${Date.now()}`;
    // console.log("🔥 ABOUT TO CREATE ORDER:", orderNumber);

    // Create Order + OrderItems together
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,

        customerName: name,
        customerPhone: phone,
        customerEmail: email || null,

        address,
        city,
        state,
        pincode,

        totalAmount,

        status: "PENDING",
        paymentMethod: "COD",

        items: {
          create: orderItems,
        },
      },

      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    // console.log("✅ ORDER CREATED:", order.id, order.orderNumber);

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully.",
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          status: order.status,
          items: order.items,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to place order.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      orders,
    });
  } catch (error) {
    console.error("User orders fetch error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while fetching orders",
      },
      {
        status: 500,
      }
    );
  }
}