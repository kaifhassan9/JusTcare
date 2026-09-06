import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const products = [
    {
      id: 1,
      name: "Paracetamol 500mg",
      category: "Medicines",
      price: 25,
      image: "💊",
      requiresPrescription: true,
    },
    {
      id: 2,
      name: "Vitamin C Tablets",
      category: "Vitamins & Supplements",
      price: 120,
      image: "🧴",
      requiresPrescription: true,
    },
    {
      id: 3,
      name: "Digital Thermometer",
      category: "Healthcare Devices",
      price: 250,
      image: "🌡️",
      requiresPrescription: false,
    },
    {
      id: 4,
      name: "First Aid Kit",
      category: "First Aid",
      price: 399,
      image: "🩹",
      requiresPrescription: false,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        id: product.id,
      },
      update: product,
      create: product,
    });
  }

  console.log("✅ Products seeded successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });