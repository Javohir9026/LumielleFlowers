import "dotenv/config";
import { nextOrderStatuses, type OrderStatus } from "@lumielle/shared";
import { prisma } from "./prisma.js";

type OrderForTelegram = { id: string; number: number; customerName: string; customerPhone: string; recipientPhone: string; address: string; note?: string | null; total: number; status: OrderStatus; items: { productTitle: string; quantity: number; lineTotal: number }[] };
type TelegramMessage = { message_id: number; chat: { id: number }; text?: string };
type TelegramUpdate = { update_id: number; message?: TelegramMessage; callback_query?: { id: string; data?: string; from: { id: number }; message?: TelegramMessage } };
type PendingCancellation = { orderId: string; messageId: number; expiresAt: number };

const token = process.env.TELEGRAM_BOT_TOKEN;
const ownerChatId = process.env.TELEGRAM_OWNER_CHAT_ID;
const pendingCancellations = new Map<string, PendingCancellation>();
let updateOffset = 0;
let pollingStarted = false;
let pollingInProgress = false;

const enabled = () => Boolean(token && ownerChatId);
const canPoll = () => Boolean(token);
const html = (value: string | number | null | undefined) => String(value ?? "—").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const sum = (value: number) => new Intl.NumberFormat("ru-RU").format(value) + " so'm";
const statusLabel: Record<OrderStatus, string> = { new: "Yangi", confirmed: "Qabul qilindi", delivering: "Yetkazilmoqda", delivered: "Yetkazib berildi", cancelled: "Bekor qilindi" };
const isOwner = (chatId: number | string) => String(chatId) === String(ownerChatId);

async function telegram(method: string, payload: Record<string, unknown>) {
  if (!token) return null;
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.ok) throw new Error(`Telegram ${method} xatosi: ${body.description ?? response.status}`);
  return body.result;
}

function keyboard(order: Pick<OrderForTelegram, "id" | "status">) {
  if (order.status === "new") return { inline_keyboard: [[{ text: "✅ Qabul qilish", callback_data: `order:confirm:${order.id}` }], [{ text: "❌ Bekor qilish", callback_data: `order:cancel:${order.id}` }]] };
  if (order.status === "confirmed" || order.status === "delivering") return { inline_keyboard: [[{ text: "✅ Yetkazib berildi", callback_data: `order:delivered:${order.id}` }], [{ text: "❌ Bekor qilish", callback_data: `order:cancel:${order.id}` }]] };
  return { inline_keyboard: [] };
}
const backKeyboard = (orderId: string) => ({ inline_keyboard: [[{ text: "⬅️ Orqaga", callback_data: `order:back:${orderId}` }]] });

function messageText(order: OrderForTelegram) {
  const products = order.items.map(item => `• ${html(item.productTitle)} × ${item.quantity} — <b>${sum(item.lineTotal)}</b>`).join("\n");
  return `<b>🌷 Buyurtma #${order.number}</b>\n\n<b>Holati:</b> ${statusLabel[order.status]}\n<b>Mijoz:</b> ${html(order.customerName)}\n<b>Telefon:</b> ${html(order.customerPhone)}\n<b>Qabul qiluvchi:</b> ${html(order.recipientPhone)}\n<b>Manzil:</b> ${html(order.address)}${order.note ? `\n<b>Izoh:</b> ${html(order.note)}` : ""}\n\n<b>Buyurtma tarkibi:</b>\n${products}\n\n<b>Jami:</b> ${sum(order.total)}`;
}

async function getOrder(orderId: string) {
  return prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
}

async function editOrderMessage(chatId: number, messageId: number, orderId: string) {
  const order = await getOrder(orderId);
  if (!order) return;
  await telegram("editMessageText", { chat_id: chatId, message_id: messageId, text: messageText(order), parse_mode: "HTML", reply_markup: keyboard(order) });
}

async function changeStatus(orderId: string, nextStatus: OrderStatus, note?: string) {
  const order = await getOrder(orderId);
  if (!order) throw new Error("Buyurtma topilmadi");
  if (order.status === nextStatus) return order;
  if (order.status === "delivered" && nextStatus === "cancelled") throw new Error("Yetkazib berilgan zakazni bekor qilib bo‘lmaydi.");
  if (!nextOrderStatuses[order.status].includes(nextStatus)) throw new Error("Bu buyurtma holati allaqachon admin panelda o‘zgartirilgan. Iltimos, joriy holatni admin paneldan tekshiring.");
  return prisma.order.update({ where: { id: order.id }, data: { status: nextStatus, history: { create: { status: nextStatus, note: note || undefined } } }, include: { items: true } });
}

async function handleCallback(update: NonNullable<TelegramUpdate["callback_query"]>) {
  const chatId = update.message?.chat.id;
  if (!chatId || !isOwner(update.from.id) || !isOwner(chatId)) return;
  const [, action, orderId] = (update.data ?? "").split(":");
  if (!orderId || !["confirm", "delivered", "cancel", "back"].includes(action)) return;
  await telegram("answerCallbackQuery", { callback_query_id: update.id });
  try {
    if (action === "back") {
      pendingCancellations.delete(String(chatId));
      await telegram("deleteMessage", { chat_id: chatId, message_id: update.message!.message_id });
      await telegram("sendMessage", { chat_id: chatId, text: "Bekor qilish jarayoni to‘xtatildi." });
      return;
    }
    if (action === "cancel") {
      pendingCancellations.set(String(chatId), { orderId, messageId: update.message!.message_id, expiresAt: Date.now() + 10 * 60_000 });
      await telegram("sendMessage", { chat_id: chatId, text: "Bekor qilish sababini yuboring (kamida 3 belgi).", reply_to_message_id: update.message!.message_id, reply_markup: backKeyboard(orderId) });
      return;
    }
    await changeStatus(orderId, action === "confirm" ? "confirmed" : "delivered");
    await editOrderMessage(chatId, update.message!.message_id, orderId);
  } catch (error) {
    await telegram("sendMessage", { chat_id: chatId, text: error instanceof Error ? error.message : "Xatolik yuz berdi" });
  }
}

async function handleMessage(message: TelegramMessage) {
  if (!ownerChatId) { if (message.text?.trim().startsWith("/start")) await telegram("sendMessage", { chat_id: message.chat.id, text: `Sizning chat ID: ${message.chat.id}\nUni TELEGRAM_OWNER_CHAT_ID sifatida .env fayliga yozing va API'ni qayta ishga tushiring.` }); return; }
  if (!isOwner(message.chat.id)) return;
  const pending = pendingCancellations.get(String(message.chat.id));
  if (!pending) return;
  if (pending.expiresAt < Date.now()) { pendingCancellations.delete(String(message.chat.id)); await telegram("sendMessage", { chat_id: message.chat.id, text: "Bekor qilish so‘rovi eskirdi. Buyurtmadagi tugmani qayta bosing." }); return; }
  const reason = message.text?.trim() ?? "";
  if (reason.length < 3) { await telegram("sendMessage", { chat_id: message.chat.id, text: "Sabab kamida 3 belgidan iborat bo‘lsin.", reply_markup: backKeyboard(pending.orderId) }); return; }
  try { await changeStatus(pending.orderId, "cancelled", reason); pendingCancellations.delete(String(message.chat.id)); await editOrderMessage(message.chat.id, pending.messageId, pending.orderId); await telegram("sendMessage", { chat_id: message.chat.id, text: "Buyurtma bekor qilindi." }); } catch (error) { await telegram("sendMessage", { chat_id: message.chat.id, text: error instanceof Error ? error.message : "Xatolik yuz berdi" }); }
}

async function poll() {
  if (!canPoll() || pollingInProgress) return;
  pollingInProgress = true;
  try {
    const updates = await telegram("getUpdates", { offset: updateOffset, timeout: 0, allowed_updates: ["message", "callback_query"] }) as TelegramUpdate[];
    for (const update of updates) { updateOffset = update.update_id + 1; if (update.callback_query) await handleCallback(update.callback_query); if (update.message) await handleMessage(update.message); }
  } catch (error) { console.error("Telegram bot polling xatosi", error instanceof Error ? error.message : error); }
  finally { pollingInProgress = false; }
}

export async function notifyNewOrder(order: OrderForTelegram) {
  if (!enabled()) return;
  try { await telegram("sendMessage", { chat_id: ownerChatId, text: messageText(order), parse_mode: "HTML", reply_markup: keyboard(order) }); } catch (error) { console.error("Telegram buyurtma xabari yuborilmadi", error instanceof Error ? error.message : error); }
}

export function startTelegramBot() {
  if (!canPoll() || pollingStarted) return;
  pollingStarted = true;
  void poll();
  setInterval(() => void poll(), 1_500).unref();
  console.log(ownerChatId ? "Telegram buyurtma boti ishga tushdi" : "Telegram bot chat ID olish rejimida ishga tushdi");
}
