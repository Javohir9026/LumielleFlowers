"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FaChevronDown, FaTag, FaXmark } from "react-icons/fa6";
import { ProductCard } from "../../components/ProductCard";
import { CatalogGridSkeleton } from "../../components/PageSkeleton";
import { getJson, type Product } from "../../lib/api";
import styles from "./catalog.module.css";

const sorting = [{ value: "created_desc", label: "Oxirgi qo‘shilgan" }, { value: "title_asc", label: "Nomi (A – Z)" }, { value: "title_desc", label: "Nomi (Z – A)" }, { value: "price_asc", label: "Avval arzonlari" }, { value: "price_desc", label: "Avval qimmatlari" }];

function CatalogContent() {
  const searchParams = useSearchParams();
  const saleFromUrl = searchParams.get("sale") === "true";
  const [items, setItems] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [sale, setSale] = useState(saleFromUrl);
  const [sort, setSort] = useState("created_desc");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [appliedPrice, setAppliedPrice] = useState({ from: "", to: "" });
  const [priceOpen, setPriceOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => setSale(saleFromUrl), [saleFromUrl]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      const query = new URLSearchParams({ limit: "48", search, sale: String(sale), sort });
      if (appliedPrice.from) query.set("priceFrom", appliedPrice.from);
      if (appliedPrice.to) query.set("priceTo", appliedPrice.to);
      getJson<Product[]>(`/products?${query}`).then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search, sale, sort, appliedPrice]);

  const selectedSort = sorting.find(option => option.value === sort)?.label ?? sorting[0].label;
  const applyPrice = () => { setAppliedPrice({ from: priceFrom, to: priceTo }); setPriceOpen(false); };

  return <main className="container section"><div className="eyebrow">Lumielle katalogi</div><h1>Gullar</h1><div className={styles.controls}>
    <input className={`field ${styles.search}`} placeholder="Gul qidirish" value={search} onChange={event => setSearch(event.target.value)} />
    <div className={styles.control}><button className={`${styles.trigger} ${priceOpen ? styles.triggerOpen : ""}`} type="button" onClick={() => { setPriceOpen(value => !value); setSortOpen(false); }}>Narx <FaChevronDown /></button>{priceOpen && <><button type="button" className={styles.priceBackdrop} aria-label="Narx filtrini yopish" onClick={() => setPriceOpen(false)} /><section className={`${styles.menu} ${styles.priceMenu}`} role="dialog" aria-modal="true" aria-label="Narx bo‘yicha filtr"><header className={styles.priceHeading}><strong>Narx bo‘yicha filtr</strong><button type="button" aria-label="Yopish" onClick={() => setPriceOpen(false)}><FaXmark /></button></header><div className={styles.priceFields}><input inputMode="numeric" min="0" placeholder="Dan" value={priceFrom} onChange={event => setPriceFrom(event.target.value.replace(/\D/g, ""))} /><input inputMode="numeric" min="0" placeholder="Gacha" value={priceTo} onChange={event => setPriceTo(event.target.value.replace(/\D/g, ""))} /></div><button className={styles.apply} type="button" onClick={applyPrice}>Qo‘llash</button></section></>}</div>
    <div className={styles.control}><button className={`${styles.trigger} ${sortOpen ? styles.triggerOpen : ""}`} type="button" onClick={() => { setSortOpen(value => !value); setPriceOpen(false); }}>{selectedSort} <FaChevronDown /></button>{sortOpen && <div className={styles.menu}>{sorting.map(option => <button type="button" className={option.value === sort ? styles.selected : ""} key={option.value} onClick={() => { setSort(option.value); setSortOpen(false); }}>{option.label}</button>)}</div>}</div>
    <div className={styles.sale}><FaTag color="#b31343" /><label htmlFor="sale-filter">Faqat aksiya</label><button id="sale-filter" className={`${styles.switch} ${sale ? styles.switchActive : ""}`} type="button" role="switch" aria-checked={sale} onClick={() => setSale(value => !value)}><span /></button></div>
  </div>
  {loading ? <CatalogGridSkeleton /> : items.length ? <div className="product-grid">{items.map(product => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty">Hech narsa topilmadi.</div>}</main>;
}

export default function Catalog() {
  return <Suspense fallback={<div className="container section"><div className="notice">Yuklanmoqda…</div></div>}><CatalogContent /></Suspense>;
}
