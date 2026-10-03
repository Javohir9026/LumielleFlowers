"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaXmark } from "react-icons/fa6";
import { getJson } from "../../lib/api";

function LoginForm() {
  const [phone, setPhone] = useState("+998");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const search = useSearchParams();
  const send = async () => { setBusy(true); setError(""); try { await getJson("/auth/request-otp", { method: "POST", body: JSON.stringify({ phone }) }); setSent(true); } catch (e: any) { setError(e.message); } finally { setBusy(false); } };
  const verify = async () => { setBusy(true); setError(""); try { await getJson("/auth/verify-otp", { method: "POST", body: JSON.stringify({ phone, code }) }); router.push(search.get("next") ?? "/"); } catch (e: any) { setError(e.message); } finally { setBusy(false); } };
  return <main className="login-modal-page"><section className="login-modal" aria-labelledby="login-title"><button className="login-close" type="button" onClick={() => router.back()} aria-label="Yopish"><FaXmark /></button><p className="eyebrow">LUMIELLE FLOWERS</p><h1 id="login-title">{sent ? "Kodni tasdiqlang" : "Kirish"}</h1><p>{sent ? `${phone} raqamiga yuborilgan 6 xonali kodni kiriting.` : "Buyurtma berish va profilingizga kirish uchun telefon raqamingizni tasdiqlang."}</p><div className="form-stack"><label>Telefon raqam<input className="field" value={phone} maxLength={13} inputMode="tel" disabled={sent || busy} onChange={event => setPhone(event.target.value.replace(/[^+\d]/g, ""))} /></label>{sent && <label>Tasdiqlash kodi<input className="field" value={code} maxLength={6} inputMode="numeric" placeholder="6 xonali kod" autoFocus onChange={event => setCode(event.target.value.replace(/\D/g, ""))} /></label>}<button className="btn" disabled={busy || (sent && code.length !== 6)} onClick={sent ? verify : send}>{busy ? "Kutilmoqda…" : sent ? "Kodni tasdiqlash" : "Kod yuborish"}</button>{sent && <button className="login-change-phone" type="button" disabled={busy} onClick={() => { setSent(false); setCode(""); setError(""); }}>Raqamni o‘zgartirish</button>}{error && <div className="notice">{error}</div>}</div></section></main>;
}

export default function Login() { return <Suspense fallback={<main className="login-modal-page">Yuklanmoqda…</main>}><LoginForm /></Suspense>; }
