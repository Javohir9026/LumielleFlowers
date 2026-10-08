import { z } from "zod";

export const LANGUAGES = ["uz", "ru"] as const;
export type Language = (typeof LANGUAGES)[number];
export const ORDER_STATUSES = ["new", "confirmed", "delivering", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export const MAX_PRICE = 100_000_000;

export const phoneSchema = z.string().regex(/^(?:\+998\d{9}|\+7\d{10})$/, "Telefon raqami +998 yoki +7 formatida bo'lishi kerak");
export const productInputSchema = z.object({
  titleUz: z.string().min(2).max(160), titleRu: z.string().max(160).nullable().optional(),
  descriptionUz: z.string().max(2000).nullable().optional(), descriptionRu: z.string().max(2000).nullable().optional(),
  price: z.number().int().positive().max(MAX_PRICE), discountPrice: z.number().int().positive().max(MAX_PRICE).nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(), isActive: z.boolean().optional()
}).superRefine((value, ctx) => { if (value.discountPrice && value.discountPrice >= value.price) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["discountPrice"], message: "Chegirma narxi asosiy narxdan kichik bo'lishi kerak" }); });
export type ProductInput = z.infer<typeof productInputSchema>;
export const checkoutSchema = z.object({
  customerName: z.string().min(2).max(120), recipientPhone: phoneSchema, address: z.string().min(10).max(300), note: z.string().max(500).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(), longitude: z.number().min(-180).max(180).nullable().optional(),
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1).max(50) })).min(1)
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export const formatPrice = (price: number) => new Intl.NumberFormat("ru-RU").format(price) + " so'm";
export const parseBoolean = (value: unknown): boolean | undefined => { if (value === undefined) return undefined; if (value === "true" || value === "1" || value === true) return true; if (value === "false" || value === "0" || value === false) return false; throw new Error("Boolean qiymat noto'g'ri"); };
export const nextOrderStatuses: Record<OrderStatus, OrderStatus[]> = { new: ["confirmed", "cancelled"], confirmed: ["delivering", "delivered", "cancelled"], delivering: ["delivered", "cancelled"], delivered: [], cancelled: [] };
