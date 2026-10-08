"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaChevronDown } from "react-icons/fa6";
import { formatPrice } from "@lumielle/shared";
import { useCart } from "../../components/Cart";
import { asset, getJson, type Product } from "../../lib/api";

type Prefix = "+998" | "+7";
type CheckoutForm = { customerName: string; address: string; note: string; latitude: number | null; longitude: number | null };
const digitsFor: Record<Prefix, number> = { "+998": 9, "+7": 10 };
const maskPhone = (prefix: Prefix, raw: string) => { const digits = raw.replace(/\D/g, "").slice(0, digitsFor[prefix]); const groups = prefix === "+998" ? [2, 3, 2, 2] : [3, 3, 2, 2]; let cursor = 0; return groups.map(size => { const group = digits.slice(cursor, cursor + size); cursor += size; return group; }).filter(Boolean).join(" "); };

export default function Checkout() {
  const { items, clear } = useCart();
  const [me, setMe] = useState<any>(null); const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<CheckoutForm>({ customerName: "", address: "", note: "", latitude: null, longitude: null });
  const [recipientPrefix, setRecipientPrefix] = useState<Prefix>("+998"); const [recipientNumber, setRecipientNumber] = useState(""); const [prefixOpen, setPrefixOpen] = useState(false);
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const router = useRouter(); const key = useMemo(() => crypto.randomUUID(), []);
  const recipientPhone = `${recipientPrefix}${recipientNumber}`; const phoneValid = recipientNumber.length === digitsFor[recipientPrefix];

  useEffect(() => {
    getJson("/me").then((customer: any) => {
      setMe(customer); setForm(value => ({ ...value, customerName: customer.name ?? "" }));
      const prefix: Prefix = customer.phone?.startsWith("+7") ? "+7" : "+998";
      setRecipientPrefix(prefix); setRecipientNumber((customer.phone ?? "").replace(prefix, "").replace(/\D/g, "").slice(0, digitsFor[prefix]));
    }).catch(() => router.replace("/login?next=/checkout"));
    if (items.length) getJson<Product[]>(`/products?ids=${items.map(item => item.productId).join(",")}&limit=48`).then(setProducts);
  }, [items, router]);

  const total = items.reduce((sum, item) => { const product = products.find(value => value.id === item.productId); return sum + (product ? (product.discountPrice ?? product.price) * item.quantity : 0); }, 0);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setBusy(true); setError(""); try { const order: any = await getJson("/orders", { method: "POST", headers: { "Idempotency-Key": key }, body: JSON.stringify({ ...form, recipientPhone, note: form.note || null, items }) }); clear(); router.push(`/orders/${order.id}?success=1`); } catch (requestError: any) { setError(requestError.message); } finally { setBusy(false); } };
  const choosePrefix = (prefix: Prefix) => { setRecipientPrefix(prefix); setRecipientNumber(""); setPrefixOpen(false); };

  return <main className="container section"><h1>Buyurtma berish</h1><div className="checkout"><form className="form-stack" onSubmit={submit}>
    <label>Ism familiya<input required className="field" value={form.customerName} onChange={event => setForm({ ...form, customerName: event.target.value })} /></label>
    <label>Buyurtmachi telefoni<input className="field" value={me?.phone ?? ""} readOnly /></label>
    <label>Qabul qiluvchi telefoni<div className="phone-input"><div className="phone-prefix"><button type="button" disabled={busy} onClick={() => setPrefixOpen(value => !value)}>{recipientPrefix}<FaChevronDown /></button>{prefixOpen && <div className="prefix-menu"><button type="button" onClick={() => choosePrefix("+998")}>+998</button><button type="button" onClick={() => choosePrefix("+7")}>+7</button></div>}</div><input required className="field" value={maskPhone(recipientPrefix, recipientNumber)} maxLength={recipientPrefix === "+998" ? 12 : 13} inputMode="tel" placeholder={recipientPrefix === "+998" ? "97 123 45 67" : "912 345 67 89"} disabled={busy} onChange={event => setRecipientNumber(event.target.value.replace(/\D/g, "").slice(0, digitsFor[recipientPrefix]))} /></div></label>
    <label>Yetkazish manzili<textarea required minLength={10} className="field textarea fixed-textarea" value={form.address} placeholder="Masalan: Chilonzor 5-mavze, 12-uy, 45-xonadon" onChange={event => setForm({ ...form, address: event.target.value })} /></label><p className="address-hint">Manzilni iloji boricha aniq yozing: tuman, ko‘cha yoki mavze, uy raqami, xonadon va kerak bo‘lsa mo‘ljalni kiriting. Bu kuryer buyurtmani tez va xatosiz yetkazishi uchun kerak.</p><button type="button" className="map-picker-button map-picker-soon" disabled>Google Maps orqali tanlash <span>Tez orada</span></button><label>Izoh (ixtiyoriy)<textarea className="field textarea fixed-textarea" value={form.note} placeholder="Qo‘shimcha istaklaringiz bo‘lsa yozing" onChange={event => setForm({ ...form, note: event.target.value })} /></label>{error && <div className="notice">{error}</div>}<button className="btn" disabled={busy || !items.length || !phoneValid}>Tasdiqlash</button>
  </form><aside className="checkout-sidebar"><section className="panel"><h3>Buyurtma xulosasi</h3><p>{items.length} mahsulot</p><p>Yetkazish: Bepul</p><p>To‘lov: Naqd, yetkazilganda</p><h2>{formatPrice(total)}</h2></section><section className="panel checkout-products"><h3>Tanlangan mahsulotlar</h3>{items.map(item => { const product = products.find(value => value.id === item.productId); if (!product) return null; const unitPrice = product.discountPrice ?? product.price; return <Link key={item.productId} href={`/products/${product.slug}`} className="checkout-product"><img src={asset(product.images[0]?.smPath)} alt={product.title} /><div><strong>{product.title}</strong><span>{item.quantity} dona</span><b>{formatPrice(unitPrice * item.quantity)}</b></div></Link>; })}</section></aside></div></main>;
}
