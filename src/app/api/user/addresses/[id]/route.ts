import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params before accessing params.id in Next.js 15+
    const resolvedParams = await params;
    const addressId = parseInt(resolvedParams.id, 10);

    if (isNaN(addressId)) {
      return NextResponse.json({ error: "Invalid address ID" }, { status: 400 });
    }

    // Confirm address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: user.id,
      },
    });

    if (!address) {
      return NextResponse.json(
        { error: "Address not found or unauthorized" },
        { status: 404 }
      );
    }

    // Permanently delete address
    await prisma.address.delete({
      where: { id: addressId },
    });

    return NextResponse.json({
      success: true,
      message: "Address permanently deleted.",
    });
  } catch (error) {
    console.error("Delete address error:", error);
    return NextResponse.json(
      { error: "Failed to delete address." },
      { status: 500 }
    );
  }
}