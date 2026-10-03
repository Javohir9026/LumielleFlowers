"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowRightFromBracket, FaClockRotateLeft, FaPen, FaRegUser, FaXmark } from "react-icons/fa6";
import { getJson } from "../../lib/api";

type Customer = { id: string; name: string | null; phone: string; createdAt: string };

export default function MePage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { getJson<Customer>("/me").then(setCustomer).catch(() => router.replace("/login?next=%2Fme")).finally(() => setLoading(false)); }, [router]);
  const logout = async () => { setLoggingOut(true); try { await getJson("/auth/logout", { method: "POST" }); } finally { router.push("/"); router.refresh(); } };
  const openEditor = () => { setName(customer?.name ?? ""); setError(""); setEditing(true); };
  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    try { const updated = await getJson<Customer>("/me", { method: "PATCH", body: JSON.stringify({ name }) }); setCustomer(updated); setEditing(false); }
    catch (requestError: any) { setError(requestError.message ?? "Ma’lumotni saqlab bo‘lmadi."); }
    finally { setSaving(false); }
  };

  if (loading) return <main className="container account-page">Yuklanmoqda…</main>;
  if (!customer) return null;
  const displayName = customer.name?.trim() || "Ism kiritilmagan";

  return <main className="account-layout">
    <aside className="account-sidebar"><div><h2>Akkaunt</h2><Link className="active" href="/me"><FaRegUser /> Mening profilim</Link><Link href="/orders"><FaClockRotateLeft /> Buyurtmalar tarixi</Link></div><button type="button" onClick={logout} disabled={loggingOut}><FaArrowRightFromBracket /> {loggingOut ? "Chiqilmoqda…" : "Chiqish"}</button></aside>
    <section className="account-page"><h1>Mening profilim</h1><div className="account-cards"><article className="account-card profile-card"><div className="profile-avatar"><FaRegUser /></div><div><strong>{displayName}</strong><p>Telefon raqam: {customer.phone}</p></div><button type="button" onClick={openEditor} aria-label="Profilni tahrirlash"><FaPen /></button></article></div></section>
    {editing && <div className="profile-modal-backdrop" role="presentation" onMouseDown={() => !saving && setEditing(false)}><form className="profile-modal" onSubmit={saveProfile} onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" type="button" disabled={saving} onClick={() => setEditing(false)} aria-label="Yopish"><FaXmark /></button><h2>Profilni tahrirlash</h2><p>Telefon raqami o‘zgartirilmaydi.</p><label>Ism familiya<input className="field" required maxLength={120} autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Ism familiyangiz" /></label><label>Telefon raqam<input className="field" value={customer.phone} readOnly /></label>{error && <div className="notice">{error}</div>}<div className="modal-actions"><button type="button" className="btn secondary" disabled={saving} onClick={() => setEditing(false)}>Bekor qilish</button><button className="btn" disabled={saving}>{saving ? "Saqlanmoqda…" : "Saqlash"}</button></div></form></div>}
  </main>;
}
