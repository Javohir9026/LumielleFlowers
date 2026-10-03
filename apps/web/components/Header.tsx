"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaBagShopping, FaHeart, FaLocationDot, FaUser } from "react-icons/fa6";
import { useCart } from "./Cart";
import { useFavourites } from "./Favourites";
import { getJson } from "../lib/api";

const languages = [
  { code: "uz", label: "O'zbekcha", flag: "/flags/uz.svg" },
  { code: "ru", label: "Rus tili", flag: "/flags/ru.svg" },
  { code: "en", label: "Inglizcha", flag: "/flags/en.svg" },
];

export function Header() {
  const { items } = useCart();
  const { ids } = useFavourites();
  const [language, setLanguage] = useState("uz");
  const [open, setOpen] = useState(false);
  const [openingAccount, setOpeningAccount] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setLanguage(localStorage.getItem("lumielle_language") ?? "uz");
    const close = (event: MouseEvent) => {
      if (!menu.current?.contains(event.target as Node)) setOpen(false);
    };
    addEventListener("mousedown", close);
    return () => removeEventListener("mousedown", close);
  }, []);

  const selected = languages.find((item) => item.code === language) ?? languages[0];
  const choose = (code: string) => {
    setLanguage(code);
    localStorage.setItem("lumielle_language", code);
    setOpen(false);
  };
  const total = items.reduce((sum, item) => sum + item.quantity, 0);
  const openAccount = async () => {
    if (openingAccount) return;
    setOpeningAccount(true);
    try {
      await getJson("/me");
      router.push("/me");
    } catch {
      router.push("/login");
    } finally {
      setOpeningAccount(false);
    }
  };

  return <header className="site-header">
    <div className="utility"><div className="container utility-inner"><span><FaLocationDot /> Toshkent · Yetkazish bepul</span><div><Link href="/orders">Buyurtmalarim</Link></div></div></div>
    <nav className="container nav">
      <Link href="/" className="brand">LUMI<em>ELLE</em><small>FLOWERS</small></Link>
      <div className="nav-links"><Link href="/catalog">Katalog</Link><Link href="/catalog?sale=true">Aksiyalar</Link><Link href="/contacts">Aloqa</Link></div>
      <div className="nav-actions">
        <button className="account-trigger" type="button" onClick={openAccount} aria-label="Profil"><FaUser /></button>
        <div className="language" ref={menu}>
          <button className="language-current" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Tilni tanlash">
            <img className="language-flag" src={selected.flag} alt="" />
          </button>
          {open && <div className="language-menu">{languages.map((item) => <button key={item.code} className={item.code === language ? "selected" : ""} onClick={() => choose(item.code)}>
            <img className="language-flag" src={item.flag} alt="" />{item.label}
          </button>)}</div>}
        </div>
        <Link href="/favourites" aria-label="Sevimlilar" className="bag"><FaHeart />{ids.length > 0 && <span className="count">{ids.length}</span>}</Link>
        <Link href="/cart" aria-label="Savat" className="bag"><FaBagShopping />{total > 0 && <span className="count">{total}</span>}</Link>
      </div>
    </nav>
  </header>;
}
