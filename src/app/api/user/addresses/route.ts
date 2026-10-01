import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";

// GET: Fetch all saved addresses for current user
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error("Fetch addresses error:", error);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

// POST: Save a new address
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, address, city, state, pincode, isDefault } = body;

    if (!name || !phone || !address || !city || !state || !pincode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // If setting as default, un-default other addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: user.id,
        name,
        phone,
        address,
        city,
        state,
        pincode,
        isDefault: isDefault ?? false,
      },
    });

    return NextResponse.json({ success: true, address: newAddress }, { status: 201 });
  } catch (error) {
    console.error("Save address error:", error);
    return NextResponse.json({ error: "Failed to save address" }, { status: 500 });
  }
}