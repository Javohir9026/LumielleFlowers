import "dotenv/config";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { prisma } from "../src/lib/prisma.js";

type CatalogItem = { slug: string; titleUz: string; titleRu: string; descriptionUz: string; descriptionRu: string; price: number; discountPrice: number | null; imageCount: number };
const catalog: CatalogItem[] = [
  { slug: "nozik-quchoqlar", titleUz: "Nozik quchoqlar", titleRu: "Нежные объятия", descriptionUz: "Mayin pushti gullar va dekorativ qutidagi nafis kompozitsiya.", descriptionRu: "Нежная композиция из розовых цветов в декоративной коробке.", price: 800000, discountPrice: 600000, imageCount: 4 },
  { slug: "pushti-atirgullar", titleUz: "Pushti atirgullar", titleRu: "Розовые розы", descriptionUz: "Yangi pushti atirgullardan tayyorlangan bayramona guldasta.", descriptionRu: "Праздничный букет из свежих розовых роз.", price: 650000, discountPrice: 520000, imageCount: 2 },
  { slug: "bahor-nashidasi", titleUz: "Bahor nashidasi", titleRu: "Весенняя мелодия", descriptionUz: "Mavsumiy gullarning yorqin va quvnoq uyg‘unligi.", descriptionRu: "Яркая и радостная композиция из сезонных цветов.", price: 540000, discountPrice: 430000, imageCount: 1 },
  { slug: "qizil-sevgi", titleUz: "Qizil sevgi", titleRu: "Красная любовь", descriptionUz: "Muhim lahzalar uchun tanlangan qizil atirgullar.", descriptionRu: "Красные розы для особенного момента.", price: 750000, discountPrice: 610000, imageCount: 3 },
  { slug: "oq-orzular", titleUz: "Oq orzular", titleRu: "Белые мечты", descriptionUz: "Oq gullar va nozik yashillikdan yengil kompozitsiya.", descriptionRu: "Воздушная композиция из белых цветов и зелени.", price: 620000, discountPrice: 495000, imageCount: 2 },
  { slug: "romantik-kayfiyat", titleUz: "Romantik kayfiyat", titleRu: "Романтическое настроение", descriptionUz: "Atirgul va eustomalardan iliq, romantik sovg‘a.", descriptionRu: "Тёплый романтичный подарок из роз и эустомы.", price: 700000, discountPrice: 560000, imageCount: 6 },
  { slug: "lola-sehri", titleUz: "Lola sehri", titleRu: "Магия тюльпанов", descriptionUz: "Yangi lolalardan tayyorlangan sodda va zamonaviy guldasta.", descriptionRu: "Современный букет из свежих тюльпанов.", price: 460000, discountPrice: 370000, imageCount: 1 },
  { slug: "shirin-tabassum", titleUz: "Shirin tabassum", titleRu: "Нежная улыбка", descriptionUz: "Pushti va oq ranglardagi quvonch ulashadigan kompozitsiya.", descriptionRu: "Композиция в розово-белой гамме, которая дарит радость.", price: 580000, discountPrice: 465000, imageCount: 3 },
  { slug: "gortenziya-lux", titleUz: "Gortenziya lux", titleRu: "Гортензия люкс", descriptionUz: "Hajmli gortenziya va atirgullardan premium buket.", descriptionRu: "Премиальный букет из объёмной гортензии и роз.", price: 900000, discountPrice: 720000, imageCount: 6 },
  { slug: "bayram-gullari", titleUz: "Bayram gullari", titleRu: "Праздничные цветы", descriptionUz: "Tug‘ilgan kun va tabriklar uchun yorqin guldasta.", descriptionRu: "Яркий букет для дня рождения и поздравлений.", price: 500000, discountPrice: 400000, imageCount: 2 },
  { slug: "quyoshli-kun", titleUz: "Quyoshli kun", titleRu: "Солнечный день", descriptionUz: "Yorqin gullardan iliq kayfiyat beradigan guldasta.", descriptionRu: "Солнечный букет из ярких цветов.", price: 480000, discountPrice: null, imageCount: 1 },
  { slug: "malika-guldastasi", titleUz: "Malika guldastasi", titleRu: "Букет для принцессы", descriptionUz: "Nozik ranglarda tuzilgan premium sovg‘a kompozitsiyasi.", descriptionRu: "Премиальная подарочная композиция в нежных оттенках.", price: 870000, discountPrice: null, imageCount: 6 },
  { slug: "elegant-oqshom", titleUz: "Elegant oqshom", titleRu: "Элегантный вечер", descriptionUz: "Kechki tadbir va muhim mehmon uchun zamonaviy tanlov.", descriptionRu: "Стильный выбор для вечернего события и важного гостя.", price: 740000, discountPrice: null, imageCount: 2 },
  { slug: "lavanda-hikoyasi", titleUz: "Lavanda hikoyasi", titleRu: "Лавандовая история", descriptionUz: "Yumshoq binafsha va oq ranglarning nafis uyg‘unligi.", descriptionRu: "Нежное сочетание сиреневых и белых оттенков.", price: 560000, discountPrice: null, imageCount: 3 },
  { slug: "gulzor", titleUz: "Gulzor", titleRu: "Цветочный сад", descriptionUz: "Turli gullardan to‘plangan katta va rang-barang guldasta.", descriptionRu: "Большой и красочный букет из разных цветов.", price: 690000, discountPrice: null, imageCount: 4 },
  { slug: "sokinlik", titleUz: "Sokinlik", titleRu: "Спокойствие", descriptionUz: "Yengil, osoyishta kayfiyat uchun oq va krem gullar.", descriptionRu: "Белые и кремовые цветы для спокойного настроения.", price: 530000, discountPrice: null, imageCount: 1 },
  { slug: "muhabbat-izi", titleUz: "Muhabbat izi", titleRu: "След любви", descriptionUz: "Atirgullar, yashillik va zamonaviy o‘ramdagi nafis sovg‘a.", descriptionRu: "Нежный подарок из роз и зелени в современной упаковке.", price: 780000, discountPrice: null, imageCount: 3 },
  { slug: "tong-shabadasi", titleUz: "Tong shabadasi", titleRu: "Утренний бриз", descriptionUz: "Yangi gullarning tetik va mayin kompozitsiyasi.", descriptionRu: "Свежая и лёгкая композиция из живых цветов.", price: 590000, discountPrice: null, imageCount: 2 },
  { slug: "oltin-lahza", titleUz: "Oltin lahza", titleRu: "Золотой момент", descriptionUz: "Katta bayram va e’tiborli sovg‘a uchun premium guldasta.", descriptionRu: "Премиальный букет для большого праздника и важного подарка.", price: 980000, discountPrice: null, imageCount: 6 },
  { slug: "nazokat", titleUz: "Nazokat", titleRu: "Изящество", descriptionUz: "Mayin rangli gullardan tayyorlangan ixcham, nafis kompozitsiya.", descriptionRu: "Изящная компактная композиция из цветов нежных оттенков.", price: 450000, discountPrice: null, imageCount: 1 }
];

const uploadsRoot = path.resolve(process.env.UPLOADS_DIR ?? "./uploads");
const sourceImages = (await fs.readdir(uploadsRoot, { recursive: true })).filter((entry): entry is string => typeof entry === "string" && entry.endsWith("-lg.webp")).map(entry => path.join(uploadsRoot, entry));
if (!sourceImages.length) throw new Error("Katalog seed uchun yuklangan rasmlar topilmadi");

for (const [index, item] of catalog.entries()) {
  const { imageCount, ...productData } = item;
  const product = await prisma.product.upsert({ where: { slug: item.slug }, update: { ...productData, isActive: true }, create: { ...productData, isActive: true } });
  if (await prisma.productImage.count({ where: { productId: product.id } })) continue;
  const folder = path.join(uploadsRoot, product.id); await fs.mkdir(folder, { recursive: true });
  for (let imageIndex = 0; imageIndex < imageCount; imageIndex++) {
    const id = crypto.randomUUID(); const source = sourceImages[(index * 3 + imageIndex) % sourceImages.length]; const base = path.join(folder, id);
    await Promise.all(([ ["sm", 480], ["md", 800], ["lg", 1400] ] as const).map(async ([name, width]) => sharp(source).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 86 }).toFile(`${base}-${name}.webp`)));
    await prisma.productImage.create({ data: { productId: product.id, sortOrder: imageIndex, originalPath: `/uploads/${product.id}/${id}-lg.webp`, smPath: `/uploads/${product.id}/${id}-sm.webp`, mdPath: `/uploads/${product.id}/${id}-md.webp`, lgPath: `/uploads/${product.id}/${id}-lg.webp` } });
  }
}
console.log("20 ta katalog mahsuloti: 10 aksiya va 10 oddiy mahsulot rasmlari bilan tayyorlandi.");
await prisma.$disconnect();
