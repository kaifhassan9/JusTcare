import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCategoriesInGroup } from "@/lib/categoryGroups";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    const categoryList = category ? getCategoriesInGroup(category) : null;

    let categoryFilter = {};

    if (categoryList && categoryList.length > 0) {
      // Create case-insensitive OR array for every entry in the list
      categoryFilter = {
        OR: categoryList.map((cat) => ({
          category: { equals: cat, mode: "insensitive" },
        })),
      };
    } else if (category) {
      // Fallback for direct category searches
      categoryFilter = {
        category: { equals: category, mode: "insensitive" },
      };
    }

    const products = await prisma.product.findMany({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { category: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...categoryFilter,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}