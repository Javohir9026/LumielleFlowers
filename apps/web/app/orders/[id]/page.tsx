"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getJson } from "../../../lib/api";
import { formatPrice } from "@lumielle/shared";

function OrderContent() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const success = useSearchParams().get("success");
  useEffect(() => { getJson(`/orders/${id}`).then(setOrder); }, [id]);
  if (!order) return <main className="container section">Yuklanmoqda…</main>;
  return <main className="container section"><h1>Buyurtma #{order.number}</h1>{success && <div className="notice">Buyurtmangiz qabul qilindi. Tez orada siz bilan bog‘lanamiz.</div>}<p>Holat: <strong>{order.status}</strong></p>{order.items.map((item: any) => <p key={item.id}>{item.productTitle} × {item.quantity} — {formatPrice(item.lineTotal)}</p>)}<h2>{formatPrice(order.total)}</h2><p>{order.address}</p></main>;
}

export default function Order() {
  return <Suspense fallback={<main className="container section">Yuklanmoqda…</main>}><OrderContent /></Suspense>;
}
