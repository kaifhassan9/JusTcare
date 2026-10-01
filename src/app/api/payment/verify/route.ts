import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";

type OrderItemInput = { productId: number; quantity: number };

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      // order details, same as your existing COD order creation
      name, phone, email, address, city, state, pincode, items,
    }: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      name: string; phone: string; email?: string;
      address: string; city: string; state: string; pincode: string;
      items: OrderItemInput[];
    } = body;

    // THE critical security check — verify this payment genuinely came from
    // Razorpay and wasn't forged/tampered with by the client. Never trust
    // "payment succeeded" from the frontend alone.
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // Signature verified — now safely create the real order, same logic
    // as your existing COD flow (server-side prices, stock check, etc.)
    if (!name || !phone || !address || !city || !state || !pincode) {
      return NextResponse.json({ error: "Missing delivery details" }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    if (products.length !== items.length) {
      return NextResponse.json({ error: "One or more products are no longer available." }, { status: 400 });
    }

    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error("Product not found");
      if (item.quantity <= 0) throw new Error("Invalid quantity");
      if (product.stockCount < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Only ${product.stockCount} left.`);
      }
      return { productId: product.id, quantity: item.quantity, price: product.price };
    });

    const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const orderNumber = `MED${Date.now()}`;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          customerName: name,
          customerPhone: phone,
          customerEmail: email || null,
          address, city, state, pincode,
          totalAmount,
          status: "PENDING",
          paymentMethod: "ONLINE",
          paymentStatus: "PAID",
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          items: { create: orderItems },
        },
        include: { items: { include: { product: true } } },
      });

      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockCount: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      order: { id: order.id, orderNumber: order.orderNumber, totalAmount: order.totalAmount, status: order.status },
    });
  } catch (error) {
    console.error("Payment verification/order creation error:", error);

    if (error instanceof Error && (error.message.includes("stock") || error.message.includes("quantity"))) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to complete order" }, { status: 500 });
  }
}