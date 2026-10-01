import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/currentUser";
import { razorpay } from "@/lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Please log in to proceed with payment." }, { status: 401 });
    }

    const body = await request.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Razorpay expects the amount in paise (smallest currency unit), not rupees
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 });
  }
}