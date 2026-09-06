import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Please log in to upload a prescription." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const orderId = formData.get("orderId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type and size server-side too — never trust client-side
    // validation alone, since a request can be sent directly bypassing the UI
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, or PDF files are allowed." }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File must be smaller than 5MB." }, { status: 400 });
    }

    // Convert the file to a buffer, then upload to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "medicare/prescriptions",
          resource_type: "auto", // handles both images and PDFs
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const prescription = await prisma.prescription.create({
      data: {
        userId: user.id,
        orderId: orderId ? Number(orderId) : null,
        imageUrl: uploadResult.secure_url,
        status: "PENDING",
      },
    });

    return NextResponse.json({ prescription });
  } catch (error) {
    console.error("Prescription upload error:", error);
    return NextResponse.json({ error: "Failed to upload prescription" }, { status: 500 });
  }
}