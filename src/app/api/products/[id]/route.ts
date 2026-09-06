import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
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

     // Similar products: same category, excluding this one, capped at 4
   const similarProducts = await prisma.product.findMany({
  where: {
    category: { equals: product.category.trim(), mode: "insensitive" },
    id: { not: product.id },
  },
  take: 4,
  orderBy: { createdAt: "desc" },
});
    return NextResponse.json({ product, similarProducts });
  } catch (error) {
    console.error("Fetch product error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}