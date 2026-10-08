import Link from "next/link";

export default function NotFound() {
  return <main className="container section"><div className="empty"><h1>Sahifa topilmadi</h1><p>So‘ralgan sahifa mavjud emas yoki boshqa manzilga ko‘chirilgan.</p><Link className="btn" href="/">Bosh sahifaga qaytish</Link></div></main>;
}
