"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ParsedProduct = {
  name: string;
  category: string;
  price: string;
  stockCount: string;
  requiresPrescription: string;
  description: string;
  image: string;
};

function parseCSV(text: string): ParsedProduct[] {
  // Normalize line endings and filter out empty lines
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  // Auto-detect tab (\t) or comma (,) delimiter
  const firstLine = lines[0];
  const delimiter = firstLine.includes("\t") ? "\t" : ",";

  const headers = firstLine.split(delimiter).map((h) => h.trim().toLowerCase());

  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    // Create normalized object map
    const rowMap: Record<string, string> = {};
    headers.forEach((header, i) => {
      rowMap[header] = values[i] || "";
    });

    // Flexible column matching for variable header names
    const name = rowMap["name"] || rowMap["product"] || rowMap["title"] || "";
    const category = rowMap["category"] || rowMap["cat"] || "";
    const price = rowMap["price"] || rowMap["cost"] || "0";

    // Handle stock/stockCount/quantity variations
    const stockCount =
      rowMap["stockcount"] ||
      rowMap["stock"] ||
      rowMap["stock_count"] ||
      rowMap["qty"] ||
      rowMap["quantity"] ||
      "0";

    // Handle prescription / rx variations
    const rawRx =
      rowMap["requiresprescription"] ||
      rowMap["prescription"] ||
      rowMap["rx"] ||
      rowMap["rx?"] ||
      "false";

    const description = rowMap["description"] || rowMap["desc"] || "";
    const image = rowMap["image"] || rowMap["img"] || "💊";

    return {
      name,
      category,
      price,
      stockCount,
      requiresPrescription: rawRx,
      description,
      image,
    };
  });
}

export default function BulkUploadPage() {
  const router = useRouter();
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState<string[]>([]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setMessage("");
    setErrorDetails([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const parsed = parseCSV(text);
        // Filter out records missing a product name
        const validParsed = parsed.filter((p) => p.name.length > 0);
        setParsedProducts(validParsed);
      } catch (err) {
        console.error("CSV parse error:", err);
        setMessage("Failed to parse CSV file. Check the format.");
      }
    };
    reader.readAsText(file);
  }

  async function handleUpload() {
    setUploading(true);
    setMessage("");
    setErrorDetails([]);

    try {
      const response = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: parsedProducts }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Import failed.");
        if (data.details) setErrorDetails(data.details);
        return;
      }

      setMessage(data.message);
      setParsedProducts([]);
      setFileName("");

      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
    } catch (err) {
      console.error("Bulk upload error:", err);
      setMessage("Something went wrong during import.");
    } finally {
      setUploading(false);
    }
  }

  function downloadTemplate() {
    const template = `name,category,price,stockCount,requiresPrescription,description,image
Paracetamol 500mg,Medicines,25,100,false,Pain and fever relief,💊
Vitamin C Tablets,Vitamins & Supplements,150,50,false,Immunity booster,💊`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#F7F5EF] text-[#3D3A2E]">
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <Link href="/admin/products" className="text-sm font-semibold text-[#6B7256] hover:underline">
          ← Back to Products
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold">Bulk Upload Products</h1>
        <p className="mt-1 text-sm text-[#6B6650]">
          Upload a CSV file to add many products at once.
        </p>

        <div className="mt-8 rounded-2xl border border-[#DDD3BC] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Step 1 — Get the template</h2>
          <p className="mt-1 text-sm text-[#6B6650]">
            Download this CSV, fill in your products, then upload it below.
          </p>
          <button
            onClick={downloadTemplate}
            className="mt-4 rounded-full bg-[#6B7256] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#5a6047] transition"
          >
            Download Template CSV
          </button>

          <div className="mt-6 rounded-xl bg-[#F7F5EF] border border-[#DDD3BC] p-4 text-xs text-[#6B6650]">
            <p className="font-bold mb-2">Column reference:</p>
            <ul className="space-y-1">
              <li><b>name</b> — product name (required)</li>
              <li><b>category</b> — e.g. Medicines, Skin Care, Baby Care (required)</li>
              <li><b>price</b> — number, no ₹ symbol (required)</li>
              <li><b>stockCount</b> — number of units in stock</li>
              <li><b>requiresPrescription</b> — true or false</li>
              <li><b>description</b> — short product description</li>
              <li><b>image</b> — emoji (💊) or a real image URL (https://...)</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#DDD3BC] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Step 2 — Upload your filled CSV</h2>

          <input
            type="file"
            accept=".csv, .tsv, .txt"
            onChange={handleFileChange}
            className="mt-4 block w-full rounded-xl border border-[#DDD3BC] bg-[#F7F5EF] px-3.5 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#6B7256]/15 file:px-4 file:py-2 file:text-xs file:font-bold file:text-[#6B7256] hover:file:bg-[#6B7256]/25 cursor-pointer"
          />

          {message && (
            <div className={`mt-4 rounded-xl p-4 text-sm font-semibold ${
              errorDetails.length > 0 ? "bg-red-50 text-red-700" : "bg-[#6B7256]/10 text-[#6B7256]"
            }`}>
              <p>{message}</p>
              {errorDetails.length > 0 && (
                <ul className="mt-2 list-disc list-inside text-xs space-y-0.5">
                  {errorDetails.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              )}
            </div>
          )}

          {parsedProducts.length > 0 && (
            <>
              <h3 className="mt-6 text-sm font-bold text-[#6B6650]">
                Preview — {parsedProducts.length} products found in {fileName}
              </h3>

              <div className="mt-3 overflow-x-auto rounded-xl border border-[#DDD3BC]">
                <table className="w-full text-xs">
                  <thead className="bg-[#EDE6D6]">
                    <tr>
                      <th className="px-3 py-2 text-left font-bold">Name</th>
                      <th className="px-3 py-2 text-left font-bold">Category</th>
                      <th className="px-3 py-2 text-left font-bold">Price</th>
                      <th className="px-3 py-2 text-left font-bold">Stock</th>
                      <th className="px-3 py-2 text-left font-bold">Rx?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedProducts.slice(0, 10).map((p, i) => {
                      const isRx =
                        p.requiresPrescription.toLowerCase() === "true"
                          ? "Yes"
                          : "No";

                      return (
                        <tr key={i} className="border-t border-[#EDE6D6]">
                          <td className="px-3 py-2 font-medium">{p.name}</td>
                          <td className="px-3 py-2">{p.category}</td>
                          <td className="px-3 py-2">₹{p.price}</td>
                          <td className="px-3 py-2">{p.stockCount || "0"}</td>
                          <td className="px-3 py-2">{isRx}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {parsedProducts.length > 10 && (
                  <p className="p-2 text-center text-[#8B8570] text-xs">
                    ...and {parsedProducts.length - 10} more
                  </p>
                )}
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="mt-5 rounded-full bg-[#8B7355] px-6 py-3 text-sm font-bold text-white hover:bg-[#7a6549] disabled:opacity-50 transition"
              >
                {uploading ? "Importing..." : `Import ${parsedProducts.length} Products`}
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}