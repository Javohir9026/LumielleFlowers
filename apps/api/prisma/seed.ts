import "dotenv/config";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { prisma } from "../src/lib/prisma.js";

const samples = [
  ["Bahor nafasi", 180000, 150000, "#f7c7cf", "#b73b61"],
  ["Nafis atirgullar", 220000, null, "#f3d7dd", "#c83f67"],
  ["Qizil sevgi", 260000, 225000, "#f0c8c9", "#a82243"],
  ["Oq orzu", 200000, null, "#f5e9e3", "#d39b9b"]
] as const;
const uploadsRoot = path.resolve(process.env.UPLOADS_DIR ?? "./uploads");

for (const [index, [titleUz, price, discountPrice, background, flower]] of samples.entries()) {
  const product = await prisma.product.upsert({ where: { slug: `sample-${index + 1}` }, update: { titleUz, price, discountPrice, isActive: true }, create: { slug: `sample-${index + 1}`, titleUz, titleRu: titleUz, titleEn: titleUz, price, discountPrice, isActive: true } });
  const imageCount = await prisma.productImage.count({ where: { productId: product.id } });
  if (!imageCount) {
    const id = crypto.randomUUID(); const folder = path.join(uploadsRoot, product.id); await fs.mkdir(folder, { recursive: true });
    const svg = `<svg width="1000" height="1250" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${background}"/><g transform="translate(500 570)"><circle r="170" fill="${flower}"/><circle cx="-120" cy="-85" r="125" fill="${flower}"/><circle cx="120" cy="-85" r="125" fill="${flower}"/><circle cx="-120" cy="85" r="125" fill="${flower}"/><circle cx="120" cy="85" r="125" fill="${flower}"/><circle r="70" fill="#f8dca2"/></g><path d="M500 710v360" stroke="#66856b" stroke-width="36"/><text x="500" y="1130" text-anchor="middle" font-family="Arial" font-size="44" fill="#18223a">Lumielle Flowers</text></svg>`;
    for (const [name, width] of [["sm", 480], ["md", 800], ["lg", 1400]] as const) await sharp(Buffer.from(svg)).resize({ width }).webp({ quality: 85 }).toFile(path.join(folder, `${id}-${name}.webp`));
    await prisma.productImage.create({ data: { productId: product.id, originalPath: `/uploads/${product.id}/${id}-lg.webp`, smPath: `/uploads/${product.id}/${id}-sm.webp`, mdPath: `/uploads/${product.id}/${id}-md.webp`, lgPath: `/uploads/${product.id}/${id}-lg.webp` } });
  }
}
console.log("Namunaviy mahsulotlar va lokal placeholder rasmlar yaratildi.");
await prisma.$disconnect();
