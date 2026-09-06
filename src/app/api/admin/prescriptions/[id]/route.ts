import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";

interface RouteParams {
  params: Promise<{ id: string }>;
}

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
    const prescriptionId = Number(id);

    if (!Number.isInteger(prescriptionId)) {
      return NextResponse.json({ error: "Invalid prescription id" }, { status: 400 });
    }

    const body = await request.json();
    const { status, reviewNote } = body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Status must be APPROVED or REJECTED" }, { status: 400 });
    }

    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
    });

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    const updated = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: { status, reviewNote: reviewNote || null },
    });

    return NextResponse.json({ prescription: updated });
  } catch (error) {
    console.error("Prescription review error:", error);
    return NextResponse.json({ error: "Failed to update prescription" }, { status: 500 });
  }
}