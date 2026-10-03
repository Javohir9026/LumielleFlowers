"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@lumielle/shared";
import { useCart } from "../../components/Cart";
import { GoogleMapPicker } from "../../components/GoogleMapPicker";
import { asset, getJson, type Product } from "../../lib/api";

type CheckoutForm = { customerName: string; recipientPhone: string; address: string; note: string; latitude: number | null; longitude: number | null };

export default function Checkout() {
  const { items, clear } = useCart();
  const [me, setMe] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<CheckoutForm>({ customerName: "", recipientPhone: "", address: "", note: "", latitude: null, longitude: null });
  const [mapOpen, setMapOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const key = useMemo(() => crypto.randomUUID(), []);

  useEffect(() => { getJson("/me").then((customer: any) => { setMe(customer); setForm(value => ({ ...value, customerName: customer.name ?? "", recipientPhone: customer.phone })); }).catch(() => router.replace("/login?next=/checkout")); if (items.length) getJson<Product[]>(`/products?ids=${items.map(item => item.productId).join(",")}&limit=48`).then(setProducts); }, [items, router]);
  const total = items.reduce((sum, item) => { const product = products.find(value => value.id === item.productId); return sum + (product ? (product.discountPrice ?? product.price) * item.quantity : 0); }, 0);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setBusy(true); setError(""); try { const order: any = await getJson("/orders", { method: "POST", headers: { "Idempotency-Key": key }, body: JSON.stringify({ ...form, note: form.note || null, items }) }); clear(); router.push(`/orders/${order.id}?success=1`); } catch (requestError: any) { setError(requestError.message); } finally { setBusy(false); } };

  return <main className="container section"><h1>Buyurtma berish</h1><div className="checkout"><form className="form-stack" onSubmit={submit}><label>Ism familiya<input required className="field" value={form.customerName} onChange={event => setForm({ ...form, customerName: event.target.value })} /></label><label>Buyurtmachi telefoni<input className="field" value={me?.phone ?? ""} readOnly /></label><label>Qabul qiluvchi telefoni<input required className="field" value={form.recipientPhone} onChange={event => setForm({ ...form, recipientPhone: event.target.value })} /></label><label>Yetkazish manzili<textarea required minLength={10} className="field textarea" value={form.address} onChange={event => setForm({ ...form, address: event.target.value })} /></label><button type="button" className="map-picker-button" onClick={() => setMapOpen(true)}>Google Maps orqali tanlash{form.latitude !== null && <span>✓ Tanlandi</span>}</button>{form.latitude !== null && <small className="map-coordinates">Koordinata: {form.latitude.toFixed(6)}, {form.longitude?.toFixed(6)}</small>}<label>Izoh (ixtiyoriy)<textarea className="field textarea" value={form.note} onChange={event => setForm({ ...form, note: event.target.value })} /></label>{error && <div className="notice">{error}</div>}<button className="btn" disabled={busy || !items.length}>Tasdiqlash</button></form><aside className="checkout-sidebar"><section className="panel"><h3>Buyurtma xulosasi</h3><p>{items.length} mahsulot</p><p>Yetkazish: Bepul</p><p>To‘lov: Naqd, yetkazilganda</p><h2>{formatPrice(total)}</h2></section><section className="panel checkout-products"><h3>Tanlangan mahsulotlar</h3>{items.map(item => { const product = products.find(value => value.id === item.productId); if (!product) return null; const unitPrice = product.discountPrice ?? product.price; return <Link key={item.productId} href={`/products/${product.slug}`} className="checkout-product"><img src={asset(product.images[0]?.smPath)} alt={product.title} /><div><strong>{product.title}</strong><span>{item.quantity} dona</span><b>{formatPrice(unitPrice * item.quantity)}</b></div></Link>; })}</section></aside></div>{mapOpen && <GoogleMapPicker onClose={() => setMapOpen(false)} onSelect={selection => { setForm({ ...form, address: selection.address, latitude: selection.latitude, longitude: selection.longitude }); setMapOpen(false); }} />}</main>;
}
