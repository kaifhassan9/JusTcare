import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";

// GET - Fetch all products
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "PHARMACY_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      products,
    });
  } catch (error) {
    console.error("Admin products fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}


// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "PHARMACY_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      name,
      category,
      price,
      image,
      requiresPrescription,
      stockCount,
      description,
    } = body;

    // Required fields
    if (
      !name ||
      !category ||
      price === undefined ||
      !image
    ) {
      return NextResponse.json(
        {
          error:
            "Name, category, price and image are required",
        },
        { status: 400 }
      );
    }

    // Validate price
    if (Number(price) < 0) {
      return NextResponse.json(
        { error: "Price cannot be negative" },
        { status: 400 }
      );
    }

    // Validate stock
    if (Number(stockCount ?? 0) < 0) {
      return NextResponse.json(
        { error: "Stock cannot be negative" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: String(name).trim(),
        category: String(category).trim(),
        price: Number(price),
        image: String(image).trim(),
        requiresPrescription:
          Boolean(requiresPrescription),
        stockCount: Number(stockCount ?? 0),
        description:
          description?.trim() || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}