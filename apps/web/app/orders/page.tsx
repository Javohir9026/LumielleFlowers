"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaArrowRight, FaBoxOpen, FaCalendarDays, FaLocationDot } from "react-icons/fa6";
import { formatPrice, type OrderStatus } from "@lumielle/shared";
import { asset, getJson } from "../../lib/api";
import styles from "./orders.module.css";

type OrderItem = { id: string; productTitle: string; quantity: number; lineTotal: number; product?: { titleUz: string; titleRu?: string | null; images: { smPath: string }[] } | null };
type Order = { id: string; number: number; total: number; status: OrderStatus; address: string; createdAt: string; items: OrderItem[] };

const copy = {
  uz: { eyebrow: "BUYURTMALAR TARIXI", title: "Buyurtmalarim", count: "ta buyurtma", empty: "Hali buyurtmalar yo‘q", emptyText: "Siz tanlagan gullar bu yerda ko‘rinadi.", catalog: "Katalogga o‘tish", details: "Batafsil", delivery: "Yetkazib berish manzili" },
  ru: { eyebrow: "ИСТОРИЯ ЗАКАЗОВ", title: "Мои заказы", count: "заказов", empty: "Заказов пока нет", emptyText: "Выбранные вами цветы появятся здесь.", catalog: "Перейти в каталог", details: "Подробнее", delivery: "Адрес доставки" },
};

const statuses: Record<"uz" | "ru", Record<OrderStatus, string>> = {
  uz: { new: "Qabul qilindi", confirmed: "Tasdiqlandi", delivering: "Yetkazilmoqda", delivered: "Yetkazildi", cancelled: "Bekor qilindi" },
  ru: { new: "Принят", confirmed: "Подтверждён", delivering: "В пути", delivered: "Доставлен", cancelled: "Отменён" },
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"uz" | "ru">("uz");

  useEffect(() => {
    setLanguage(localStorage.getItem("lumielle_language") === "ru" ? "ru" : "uz");
    getJson<Order[]>("/orders").then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false));
  }, []);

  const text = copy[language];
  const dateLocale = language === "ru" ? "ru-RU" : "uz-UZ";

  return <main className={`container section ${styles.orders}`}>
    <header className={styles.heading}><div><p className="eyebrow">{text.eyebrow}</p><h1>{text.title}</h1><p>{orders.length} {text.count}</p></div></header>
    {loading ? <div className={styles.loading}>{language === "ru" ? "Загрузка заказов…" : "Buyurtmalar yuklanmoqda…"}</div> : orders.length ? <div className={styles.list}>{orders.map(order => <Link className={styles.order} key={order.id} href={`/orders/${order.id}`}>
      <div className={styles.orderTop}><div><span className={styles.number}>#{order.number}</span><time><FaCalendarDays /> {new Intl.DateTimeFormat(dateLocale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(order.createdAt))}</time></div><span className={`${styles.status} ${styles[order.status]}`}>{statuses[language][order.status]}</span></div>
      <div className={styles.items}>{order.items.slice(0, 4).map(item => <div className={styles.item} key={item.id}>{item.product?.images[0]?.smPath ? <img src={asset(item.product.images[0].smPath)} alt={item.product?.[language === "ru" ? "titleRu" : "titleUz"] || item.productTitle} /> : <div className={styles.placeholder}><FaBoxOpen /></div>}<div><strong>{language === "ru" ? item.product?.titleRu || item.productTitle : item.product?.titleUz || item.productTitle}</strong><span>{item.quantity} × {formatPrice(item.lineTotal / item.quantity)}</span></div></div>)}{order.items.length > 4 && <span className={styles.more}>+{order.items.length - 4}</span>}</div>
      <footer className={styles.orderFooter}><span className={styles.address}><FaLocationDot /> {order.address}</span><strong>{formatPrice(order.total)}</strong><span className={styles.details}>{text.details} <FaArrowRight /></span></footer>
    </Link>)}</div> : <section className={styles.empty}><div><FaBoxOpen /></div><h2>{text.empty}</h2><p>{text.emptyText}</p><Link href="/catalog" className="btn">{text.catalog}</Link></section>}
  </main>;
}
