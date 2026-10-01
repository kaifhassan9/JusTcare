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

    // Validate every row before inserting/updating
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

    // Fetch existing products to determine duplicates by name (case-insensitive)
    const existingProducts = await prisma.product.findMany({
      select: { id: true, name: true },
    });

    const existingMap = new Map<string, any>();
    for (const p of existingProducts) {
      existingMap.set(p.name.trim().toLowerCase(), p.id);
    }

    let createdCount = 0;
    let updatedCount = 0;

    // Use Prisma transaction to perform updates for duplicates and inserts for new items
    await prisma.$transaction(async (tx) => {
      for (const item of validated) {
        const lowerName = item.name.toLowerCase();
        const existingId = existingMap.get(lowerName);

        if (existingId !== undefined) {
          // Product exists -> Update fields
          await tx.product.update({
            where: { id: existingId },
            data: {
              category: item.category,
              price: item.price,
              image: item.image,
              requiresPrescription: item.requiresPrescription,
              stockCount: item.stockCount,
              description: item.description,
            },
          });
          updatedCount++;
        } else {
          // Product does not exist -> Create new record
          await tx.product.create({
            data: item,
          });
          createdCount++;
        }
      }
    });

    return NextResponse.json({
      message: `Import complete: ${createdCount} created, ${updatedCount} updated.`,
      count: createdCount + updatedCount,
      createdCount,
      updatedCount,
    });
  } catch (error) {
    console.error("Bulk product import error:", error);
    return NextResponse.json({ error: "Failed to import products" }, { status: 500 });
  }
}