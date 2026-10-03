"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@lumielle/shared";
import { useCart } from "../../components/Cart";
import { asset, getJson, type Product } from "../../lib/api";

export default function CartPage() {
  const { items, set, remove } = useCart();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [checkingLogin, setCheckingLogin] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    if (!items.length) { setProducts([]); return; }
    getJson<Product[]>(`/products?ids=${items.map((item) => item.productId).join(",")}&limit=48`)
      .then(setProducts).catch(() => setProducts([]));
  }, [items]);

  const continueToCheckout = async () => {
    setCheckingLogin(true);
    setCheckoutError("");
    try {
      await getJson("/me");
      router.push("/checkout");
    } catch (error: any) {
      if (error.status === 401 || error.status === 403) {
        router.push("/login?next=%2Fcheckout");
        return;
      }
      setCheckoutError(error.message ?? "Tizim holatini tekshirib bo‘lmadi.");
      setCheckingLogin(false);
    }
  };

  const rows = items.map((item) => ({ item, product: products.find((product) => product.id === item.productId) }));
  const total = rows.reduce((sum, row) => sum + (row.product?.isActive ? (row.product.discountPrice ?? row.product.price) * row.item.quantity : 0), 0);
  const unavailable = rows.some((row) => !row.product?.isActive);

  return <main className="container section"><h1>Savat</h1>
    {!items.length ? <div className="empty">Savatingiz bo‘sh. <Link href="/catalog">Gullarni tanlang</Link></div> : <>
      <div>{rows.map(({ item, product }) => <div className="cart-row" key={item.productId}>
        <img src={asset(product?.images[0]?.smPath)} alt="" />
        <div><strong>{product?.title ?? "Mahsulot topilmadi"}</strong>{!product?.isActive && <div className="sale">Mavjud emas</div>}
          <div className="price">{product && formatPrice((product.discountPrice ?? product.price) * item.quantity)}</div>
          <div className="quantity"><button onClick={() => set(item.productId, item.quantity - 1)}>−</button><strong>{item.quantity}</strong><button onClick={() => set(item.productId, item.quantity + 1)}>+</button></div>
        </div>
        <button className="btn secondary" onClick={() => remove(item.productId)}>O‘chirish</button>
      </div>)}</div>
      <div className="panel"><div style={{ display: "flex", justifyContent: "space-between" }}><strong>Jami</strong><strong>{formatPrice(total)}</strong></div>
        <p>Yetkazish: Bepul</p>
        {unavailable ? <div className="notice">Mavjud bo‘lmagan mahsulotni olib tashlang.</div> : <button className="btn" type="button" disabled={checkingLogin} onClick={continueToCheckout}>{checkingLogin ? "Tekshirilmoqda…" : "Buyurtma berish"}</button>}
        {checkoutError && <div className="notice" style={{ marginTop: 12 }}>{checkoutError}</div>}
      </div>
    </>}
  </main>;
}
