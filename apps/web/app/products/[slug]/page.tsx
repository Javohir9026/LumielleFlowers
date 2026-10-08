"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getJson, asset, type Product } from "../../../lib/api";
import { useCart } from "../../../components/Cart";
import { ProductCard } from "../../../components/ProductCard";
import { formatPrice } from "@lumielle/shared";

function ProductStrip({ title, eyebrow, items, sale = false }: { title: string; eyebrow: string; items: Product[]; sale?: boolean }) {
  if (!items.length) return null;
  return <section className="detail-showcase"><div className="section-head"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><Link href={sale ? "/catalog?sale=true" : "/catalog"} className="all-link">Barchasini ko‘rish →</Link></div><div className="product-grid">{items.map(item => <ProductCard key={item.id} product={item} />)}</div></section>;
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params); const [product, setProduct] = useState<Product | null>(null); const [selected, setSelected] = useState(0); const [quantity, setQuantity] = useState(1); const [bouquets, setBouquets] = useState<Product[]>([]); const [saleItems, setSaleItems] = useState<Product[]>([]); const { add } = useCart();
  useEffect(() => { getJson<Product>(`/products/${slug}`).then(setProduct).catch(() => setProduct(null)); }, [slug]);
  useEffect(() => { if (!product) return; Promise.all([getJson<Product[]>("/products?limit=6"), getJson<Product[]>("/products?limit=6&sale=true")]).then(([all, sale]) => { setBouquets(all.filter(item => item.id !== product.id).slice(0, 5)); setSaleItems(sale.filter(item => item.id !== product.id).slice(0, 5)); }).catch(() => {}); }, [product]);
  if (!product) return <main className="container section"><div className="empty">Mahsulot topilmadi yoki yuklanmoqda.</div></main>;
  const price = product.discountPrice ?? product.price; const currentImage = product.images[selected] ?? product.images[0];
  return <main className="container product-detail-page"><section className="product-page"><div className="gallery"><img src={asset(currentImage?.lgPath)} alt={product.title} />{product.images.length > 1 && <div className="gallery-thumbnails">{product.images.map((image, index) => <button key={image.lgPath} type="button" className={selected === index ? "selected" : ""} onClick={() => setSelected(index)}><img src={asset(image.smPath)} alt={`${product.title} ${index + 1}`} /></button>)}</div>}</div><div className="detail"><p className="eyebrow">LUMIELLE FLOWERS</p><h1>{product.title}</h1><div className="detail-line" />{product.discountPrice && <span className="old-price">{formatPrice(product.price)}</span>}<div className="price detail-price">{formatPrice(price)}</div>{product.description && <section className="description"><h2>Tavsif</h2><p>{product.description}</p></section>}<div className="quantity" aria-label="Miqdor"><button type="button" aria-label="Kamaytirish" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><strong>{quantity}</strong><button type="button" aria-label="Ko‘paytirish" onClick={() => setQuantity(Math.min(50, quantity + 1))}>+</button></div>{product.isActive ? <button className="btn sticky-mobile" onClick={() => add(product.id, quantity)}>Savatga qo‘shish</button> : <Link href="/catalog" className="btn secondary">Katalogga qaytish</Link>}</div></section><ProductStrip eyebrow="LUMIELLE TANLOVI" title="Barcha guldastalar" items={bouquets} /><ProductStrip eyebrow="MAXSUS TAKLIFLAR" title="Aksiyadagi guldastalar" items={saleItems} sale /></main>;
}
