import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "PHARMACY_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "No products provided" }, { status: 400 });
    }

    // Validate every row before inserting anything — all-or-nothing,
    // so a bad row doesn't leave you with half-imported data
    const errors: string[] = [];

    const validated = products.map((p, index) => {
      const rowNum = index + 2; // +2 because row 1 is the CSV header

      if (!p.name?.trim()) errors.push(`Row ${rowNum}: missing name`);
      if (!p.category?.trim()) errors.push(`Row ${rowNum}: missing category`);
      if (p.price === undefined || isNaN(Number(p.price)) || Number(p.price) < 0) {
        errors.push(`Row ${rowNum}: invalid price`);
      }
      if (p.stockCount !== undefined && (isNaN(Number(p.stockCount)) || Number(p.stockCount) < 0)) {
        errors.push(`Row ${rowNum}: invalid stock count`);
      }

      return {
        name: String(p.name || "").trim(),
        category: String(p.category || "").trim(),
        price: Number(p.price) || 0,
        image: String(p.image || "💊").trim(),
        requiresPrescription:
          String(p.requiresPrescription).toLowerCase() === "true" ||
          String(p.requiresPrescription).toLowerCase() === "yes",
        stockCount: Number(p.stockCount) || 0,
        description: p.description?.trim() || null,
      };
    });

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const result = await prisma.product.createMany({
      data: validated,
    });

    return NextResponse.json({
      message: `${result.count} products imported successfully`,
      count: result.count,
    });
  } catch (error) {
    console.error("Bulk product import error:", error);
    return NextResponse.json({ error: "Failed to import products" }, { status: 500 });
  }
}