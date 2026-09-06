import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch a single product (used to pre-fill the edit form)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "PHARMACY_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const productId = Number(id);

    if (!Number.isInteger(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Fetch single product error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// PATCH - Update a product
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "PHARMACY_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const productId = Number(id);

    if (!Number.isInteger(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
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

    // Same validation approach as your POST route — reject bad values,
    // don't just silently accept whatever the client sends
    if (!name || !category || price === undefined || !image) {
      return NextResponse.json(
        { error: "Name, category, price and image are required" },
        { status: 400 }
      );
    }

    if (Number(price) < 0) {
      return NextResponse.json({ error: "Price cannot be negative" }, { status: 400 });
    }

    if (Number(stockCount ?? 0) < 0) {
      return NextResponse.json({ error: "Stock cannot be negative" }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: String(name).trim(),
        category: String(category).trim(),
        price: Number(price),
        image: String(image).trim(),
        requiresPrescription: Boolean(requiresPrescription),
        stockCount: Number(stockCount ?? 0),
        description: description?.trim() || null,
      },
    });

    return NextResponse.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE - Remove a product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "PHARMACY_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const productId = Number(id);

    if (!Number.isInteger(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Important: if this product is referenced by any OrderItem, deleting it
    // outright would break historical orders (or fail, depending on your FK
    // constraint). Your schema doesn't set onDelete on Product -> OrderItem,
    // so Prisma will throw a foreign key error here rather than silently
    // corrupting past orders — which is the safe default. We catch that
    // below and return a clear message instead of a raw 500.
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {

    console.error("Delete product error:", error);


    // Prisma foreign key constraint violation

    const isForeignKeyError =
    error?.code === "P2003" ||
    error?.code === "P2039" ||
    error?.message?.includes("foreign key constraint");
    if (isForeignKeyError) {
      return NextResponse.json(
        {
          error:
            "This product can't be deleted because it's part of existing orders. Consider setting its stock to 0 instead.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}