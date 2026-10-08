import "./globals.css";
import "./fonts.css";
import "./footer.css";
import "./header.css";
import { Montserrat } from "next/font/google";
import { FaApple, FaFacebookF, FaGooglePlay, FaInstagram, FaTelegramPlane } from "react-icons/fa";
import { FaPhone } from "react-icons/fa6";
import { Header } from "../components/Header";
import { CartProvider } from "../components/Cart";
import { FavouritesProvider } from "../components/Favourites";
import { RuntimeTranslation } from "../components/RuntimeTranslation";

const montserrat = Montserrat({ subsets: ["latin", "cyrillic"], variable: "--font-montserrat", display: "swap" });
const paths: Record<string, string> = { "Yetkazib berish": "/delivery", "Shaxsiy kabinet": "/orders", Kontaktlar: "/contacts", "Buyurtmalar tarixi": "/orders", "Biz haqimizda": "/about", Maxfiylik: "/privacy", "Ommaviy oferta": "/offer" };

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return <div className="footer-column"><h3>{title}</h3>{links.map(link => <a href={paths[link] ?? "#"} key={link}>{link}</a>)}</div>;
}

function PaymentColumn() {
  return <div className="footer-column"><h3>To‘lov</h3><span>Naqd pul</span><span className="payment-unavailable">Bank o‘tkazmasi</span><span className="payment-unavailable">Visa</span><span className="payment-unavailable">Mastercard</span></div>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="uz"><body className={montserrat.variable}><RuntimeTranslation><FavouritesProvider><CartProvider><Header />{children}<footer className="footer"><div className="footer-main"><div className="container footer-grid"><section className="footer-brand"><p>Har bir lahzaga munosib gullar.</p><a className="footer-phone" href="tel:+998971234567">+998 97 123 45 67</a><div className="socials"><span><FaFacebookF /></span><a href="tel:+998971234567" aria-label="Telefon qilish"><FaPhone /></a><a href="#"><FaTelegramPlane /></a><a href="#"><FaInstagram /></a></div></section><FooterColumn title="Ma’lumot" links={["Yetkazib berish", "Shaxsiy kabinet", "Kontaktlar", "Buyurtmalar tarixi"]} /><FooterColumn title="Kompaniya" links={["Biz haqimizda", "Maxfiylik", "Ommaviy oferta", "Vakansiyalar"]} /><PaymentColumn /><section className="footer-app"><h2>Ilovani yuklab oling</h2><p>Gullar har doim yoningizda</p><div className="store-badge"><span className="soon">SOON</span><b><FaApple /></b><div><small>tez orada</small><strong>App Store</strong></div></div><div className="store-badge"><span className="soon">SOON</span><b><FaGooglePlay /></b><div><small>tez orada</small><strong>Google Play</strong></div></div></section></div></div><div className="footer-bottom"><div className="container">© {new Date().getFullYear()} Lumielle Flowers. Barcha huquqlar himoyalangan.</div></div></footer></CartProvider></FavouritesProvider></RuntimeTranslation></body></html>;
}
