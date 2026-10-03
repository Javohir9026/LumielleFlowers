import type { Product } from "@prisma/client";
import type { Language } from "@lumielle/shared";
export const localizedProduct = <T extends Product & { images?: unknown; category?: unknown }>(product: T, lang: Language) => ({ ...product, title: lang === "ru" ? product.titleRu || product.titleUz : lang === "en" ? product.titleEn || product.titleUz : product.titleUz, description: lang === "ru" ? product.descriptionRu || product.descriptionUz : lang === "en" ? product.descriptionEn || product.descriptionUz : product.descriptionUz });
export const slugify = (text: string) => text.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 70);
