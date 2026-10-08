"use client";

import { useRouter } from "next/navigation";
import { FaHeart, FaRegHeart, FaMinus, FaPlus } from "react-icons/fa6";
import { asset, type Product } from "../lib/api";
import { formatPrice } from "@lumielle/shared";
import { useCart } from "./Cart";
import { useFavourites } from "./Favourites";

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter(); const price = product.discountPrice ?? product.price;
  const { items, add, set } = useCart(); const { ids, toggle } = useFavourites();
  const cartItem = items.find(item => item.productId === product.id); const quantity = cartItem?.quantity ?? 0; const liked = ids.includes(product.id);
  const open = () => router.push(`/products/${product.slug}`);
  const stop = (event: React.MouseEvent, action: () => void) => { event.stopPropagation(); action(); };
  return <article className="card card-clickable" role="link" tabIndex={0} onClick={open} onKeyDown={event => { if (event.key === "Enter") open(); }}>
    <div className="card-media"><img className="card-image" src={asset(product.images[0]?.mdPath)} alt={product.title} loading="lazy" /></div>
    <button aria-label="Sevimlilarga qo‘shish" className={`wish ${liked ? "active" : ""}`} onClick={event => stop(event, () => toggle(product.id))}>{liked ? <FaHeart /> : <FaRegHeart />}</button>
    <div className="card-body"><h3>{product.title}</h3>{product.discountPrice && <div><span className="old-price">{formatPrice(product.price)}</span><span className="sale">AKSIYA</span></div>}<div className="card-action">{quantity ? <div className="card-quantity"><button aria-label="Kamaytirish" onClick={event => stop(event, () => set(product.id, quantity - 1))}><FaMinus /></button><b>{quantity}</b><button aria-label="Ko‘paytirish" onClick={event => stop(event, () => set(product.id, quantity + 1))}><FaPlus /></button></div> : <><span className="card-price">{formatPrice(price)}</span><button className="add-to-cart" onClick={event => stop(event, () => add(product.id, 1))}>Savatga</button></>}</div></div>
  </article>;
}
