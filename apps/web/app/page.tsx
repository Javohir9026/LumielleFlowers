import Link from "next/link";
import { cookies } from "next/headers";
import { HeroCarousel } from "../components/HeroCarousel";
import { ProductCard } from "../components/ProductCard";
import { getJson, type Product } from "../lib/api";
import styles from "./home.module.css";

export const revalidate = 60;

export default async function Home() {
  let products: Product[] = []; let saleProducts: Product[] = [];
  const language = (await cookies()).get("lumielle_language")?.value === "ru" ? "ru" : "uz";
  const copy = language === "ru" ? { allBouquets: "Все букеты", sale: "Акции", bouquets: "Букеты", saleBouquets: "Букеты по акции", all: "Смотреть все →", empty: "Товары скоро появятся." } : { allBouquets: "Barcha guldastalar", sale: "Aksiya", bouquets: "Guldastalar", saleBouquets: "Aksiyadagi guldastalar", all: "Barchasini ko‘rish →", empty: "Mahsulotlar tez orada qo‘shiladi." };
  try { [products, saleProducts] = await Promise.all([getJson<Product[]>(`/products?limit=8&lang=${language}`), getJson<Product[]>(`/products?limit=8&sale=true&lang=${language}`)]); } catch {}
  return <><HeroCarousel /><section className={`container ${styles.promoCards}`} aria-label="Katalog bo‘limlari"><Link href="/catalog" className={styles.promoCard}><strong>{copy.allBouquets}</strong><img className={styles.promoImage} src="/images/promos/all-bouquets.webp" alt="Turli gullardan guldasta" /></Link><Link href="/catalog?sale=true" className={`${styles.promoCard} ${styles.saleCard}`}><strong>{copy.sale}</strong><img className={`${styles.promoImage} ${styles.saleImage}`} src="/images/promos/sale.webp" alt="Aksiya guldastasi" /></Link></section><section className="showcase container"><div className="section-head"><div><p className="eyebrow">LUMIELLE TANLOVI</p><h2>{copy.bouquets}</h2></div><Link href="/catalog" className="all-link">{copy.all}</Link></div>{products.length ? <div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty">{copy.empty}</div>}</section>{saleProducts.length > 0 && <section className="showcase container"><div className="section-head"><div><p className="eyebrow">MAXSUS TAKLIFLAR</p><h2>{copy.saleBouquets}</h2></div><Link href="/catalog?sale=true" className="all-link">{copy.all}</Link></div><div className="product-grid">{saleProducts.map(product => <ProductCard key={product.id} product={product} />)}</div></section>}</>;
}
