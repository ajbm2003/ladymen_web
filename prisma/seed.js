import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seed = async () => {
  await prisma.productImage.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const categories = await prisma.category.createMany({
    data: [
      { name: "Tacticos", slug: "tacticos" },
      { name: "Paramedicos", slug: "paramedicos" },
      { name: "Bisuteria Americana", slug: "bisuteria-americana" },
      { name: "Motos", slug: "motos" },
      { name: "Boutique", slug: "boutique" }
    ]
  });

  console.log(`Seeded ${categories.count} categories`);
};

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
