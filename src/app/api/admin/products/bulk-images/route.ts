import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

// Normalize a string for fuzzy matching: lowercase, strip punctuation/extra spaces
function normalize(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "PHARMACY_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const allProducts = await prisma.product.findMany({
      select: { id: true, name: true, image: true },
    });

    const results: {
      fileName: string;
      matched: boolean;
      productId: number | null;
      productName: string | null;
      imageUrl: string | null;
      error: string | null;
    }[] = [];

    for (const file of files) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      if (!allowedTypes.includes(file.type)) {
        results.push({
          fileName: file.name,
          matched: false,
          productId: null,
          productName: null,
          imageUrl: null,
          error: "Unsupported file type",
        });
        continue;
      }

      // Match filename (without extension) against product names
      const fileBaseName = file.name.replace(/\.[^/.]+$/, "");
      const normalizedFileName = normalize(fileBaseName);

      const matchedProduct = allProducts.find(
        (p) => normalize(p.name) === normalizedFileName
      );

      // Upload every file to Cloudinary regardless of match, so an admin
      // can manually assign unmatched ones afterward without re-uploading
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      try {
        const uploadResult = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "medicare/products", resource_type: "image" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(buffer);
        });

        if (matchedProduct) {
          await prisma.product.update({
            where: { id: matchedProduct.id },
            data: { image: uploadResult.secure_url },
          });
        }

        results.push({
          fileName: file.name,
          matched: !!matchedProduct,
          productId: matchedProduct?.id || null,
          productName: matchedProduct?.name || null,
          imageUrl: uploadResult.secure_url,
          error: null,
        });
      } catch (uploadError) {
        console.error("Upload error for file:", file.name, uploadError);
        results.push({
          fileName: file.name,
          matched: false,
          productId: null,
          productName: null,
          imageUrl: null,
          error: "Upload failed",
        });
      }
    }

    return NextResponse.json({ results, allProducts });
  } catch (error) {
    console.error("Bulk image upload error:", error);
    return NextResponse.json({ error: "Failed to process bulk upload" }, { status: 500 });
  }
}