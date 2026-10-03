"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getJson, asset, type Product } from "../../../lib/api";
import { useCart } from "../../../components/Cart";
import { formatPrice } from "@lumielle/shared";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params); const [product, setProduct] = useState<Product | null>(null); const [quantity, setQuantity] = useState(1); const { add } = useCart();
  useEffect(() => { getJson<Product>(`/products/${slug}`).then(setProduct).catch(() => setProduct(null)); }, [slug]);
  if (!product) return <main className="container section"><div className="empty">Mahsulot topilmadi yoki yuklanmoqda.</div></main>;
  const price = product.discountPrice ?? product.price;
  return <main className="container product-page"><div className="gallery"><img src={asset(product.images[0]?.lgPath)} alt={product.title} /></div><div className="detail"><div className="eyebrow">Lumielle Flowers</div><h1>{product.title}</h1>{product.discountPrice && <span className="old-price">{formatPrice(product.price)}</span>}<div className="price" style={{ fontSize: 24 }}>{formatPrice(price)}</div>{product.description && <p>{product.description}</p>}<div className="quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><strong>{quantity}</strong><button onClick={() => setQuantity(Math.min(50, quantity + 1))}>+</button></div>{product.isActive ? <button className="btn sticky-mobile" onClick={() => add(product.id, quantity)}>Savatga qo‘shish</button> : <Link href="/catalog" className="btn secondary">Katalogga qaytish</Link>}</div></main>;
}
