import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";

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

    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    let canReview = false;
    const user = await getCurrentUser();

    if (user) {
      const alreadyReviewed = reviews.some((r) => r.userId === user.id);
      canReview = !alreadyReviewed;
    }

    return NextResponse.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      canReview,
    });
  } catch (error) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Please log in to leave a review." }, { status: 401 });
    }

    const { id } = await params;
    const productId = Number(id);

    if (!Number.isInteger(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Single review check using your Prisma schema's unique constraint compound key
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });

    if (existing) {
      return NextResponse.json({ error: "You've already reviewed this product." }, { status: 409 });
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        productId,
        rating: Number(rating),
        comment: comment?.trim() || null,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Please log in to delete a review." }, { status: 401 });
    }

    const { id } = await params;
    const productId = Number(id);

    if (!Number.isInteger(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const body = await request.json();
    const { reviewId } = body;

    if (!reviewId) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    const existingReview = await prisma.review.findUnique({
      where: { id: Number(reviewId) },
    });

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Ensure the user owns the review before deleting
    if (existingReview.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized to delete this review" }, { status: 403 });
    }

    await prisma.review.delete({
      where: { id: Number(reviewId) },
    });

    return NextResponse.json({ message: "Review deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}