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

  const categoryList = await prisma.category.findMany();
  const [tacticos, paramedicos, bisuteria, motos, boutique] = categoryList;

  const products = [
    {
      name: "Chaleco Guard Pro",
      slug: "chaleco-guard-pro",
      description: "Chaleco tactico con ajuste ergonomico y alta resistencia.",
      price: 59.9,
      categoryId: tacticos.id
    },
    {
      name: "Botiquin Rescate",
      slug: "botiquin-rescate",
      description: "Kit esencial con insumos de primera respuesta.",
      price: 29.9,
      categoryId: paramedicos.id
    },
    {
      name: "Set Perla Dorada",
      slug: "set-perla-dorada",
      description: "Bisuteria americana con brillo elegante y moderno.",
      price: 49.5,
      categoryId: bisuteria.id
    },
    {
      name: "Casco Urbano",
      slug: "casco-urbano",
      description: "Casco ligero con visera y acabado mate.",
      price: 19.9,
      categoryId: motos.id
    },
    {
      name: "Blusa Serena",
      slug: "blusa-serena",
      description: "Blusa boutique con caida suave y botoneria fina.",
      price: 79.0,
      categoryId: boutique.id
    },
    {
      name: "Guantes Alpha",
      slug: "guantes-alpha",
      description: "Guantes tacticos con agarre reforzado.",
      price: 34.9,
      categoryId: tacticos.id
    },
    {
      name: "Mochila Responder",
      slug: "mochila-responder",
      description: "Mochila paramedica con compartimentos inteligentes.",
      price: 89.0,
      categoryId: paramedicos.id
    },
    {
      name: "Pulsera Aurora",
      slug: "pulsera-aurora",
      description: "Detalle sofisticado para elevar cualquier look.",
      price: 14.5,
      categoryId: bisuteria.id
    },
    {
      name: "Guantes Rider",
      slug: "guantes-rider",
      description: "Guantes para moto con proteccion y confort.",
      price: 95.0,
      categoryId: motos.id
    },
    {
      name: "Vestido Capri",
      slug: "vestido-capri",
      description: "Vestido boutique de corte fluido y elegante.",
      price: 39.0,
      categoryId: boutique.id
    }
  ];

  for (const product of products) {
    const imageUrl =
      product.slug === "vestido-aurora"
        ? "http://localhost:3000/static/green-cube.jpg"
        : "https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_crop,f_auto/sample.jpg";
    await prisma.product.create({
      data: {
        ...product,
        images: {
          create: [
            {
              url: imageUrl,
              isPrimary: true,
              sortOrder: 0
            }
          ]
        },
        variants: {
          create: [
            { name: "Talla", value: "M" },
            { name: "Color", value: "Negro" }
          ]
        }
      }
    });
  }

  console.log(`Seeded ${categories.count} categories and ${products.length} products`);
};

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
