"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaChevronDown, FaXmark } from "react-icons/fa6";
import { getJson } from "../../lib/api";

type Prefix = "+998" | "+7";
const digitsFor: Record<Prefix, number> = { "+998": 9, "+7": 10 };
function maskPhone(prefix: Prefix, raw: string) { const digits = raw.replace(/\D/g, "").slice(0, digitsFor[prefix]); const groups = prefix === "+998" ? [2, 3, 2, 2] : [3, 3, 2, 2]; let cursor = 0; return groups.map(size => { const group = digits.slice(cursor, cursor + size); cursor += size; return group; }).filter(Boolean).join(" "); }

function LoginForm() {
  const [prefix, setPrefix] = useState<Prefix>("+998"); const [number, setNumber] = useState(""); const [prefixOpen, setPrefixOpen] = useState(false); const [code, setCode] = useState(""); const [sent, setSent] = useState(false); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const router = useRouter(); const search = useSearchParams(); const phone = `${prefix}${number}`; const phoneValid = number.length === digitsFor[prefix];
  const send = async () => { if (!phoneValid) return; setBusy(true); setError(""); try { await getJson("/auth/request-otp", { method: "POST", body: JSON.stringify({ phone }) }); setSent(true); } catch (e: any) { setError(e.message); } finally { setBusy(false); } };
  const verify = async () => { setBusy(true); setError(""); try { await getJson("/auth/verify-otp", { method: "POST", body: JSON.stringify({ phone, code }) }); router.push(search.get("next") ?? "/"); } catch (e: any) { setError(e.message); } finally { setBusy(false); } };
  const choosePrefix = (value: Prefix) => { setPrefix(value); setNumber(""); setPrefixOpen(false); };
  return <main className="login-modal-page"><section className="login-modal" aria-labelledby="login-title"><button className="login-close" type="button" onClick={() => router.back()} aria-label="Yopish"><FaXmark /></button><p className="eyebrow">LUMIELLE FLOWERS</p><h1 id="login-title">{sent ? "Kodni tasdiqlang" : "Kirish"}</h1><p>{sent ? `${prefix} ${maskPhone(prefix, number)} raqamiga yuborilgan 6 xonali kodni kiriting.` : "Buyurtma berish va profilingizga kirish uchun telefon raqamingizni tasdiqlang."}</p><div className="form-stack"><label>Telefon raqam<div className="phone-input"><div className="phone-prefix"><button type="button" disabled={sent || busy} onClick={() => setPrefixOpen(value => !value)}>{prefix}<FaChevronDown /></button>{prefixOpen && <div className="prefix-menu"><button type="button" onClick={() => choosePrefix("+998")}>+998</button><button type="button" onClick={() => choosePrefix("+7")}>+7</button></div>}</div><input className="field" value={maskPhone(prefix, number)} maxLength={prefix === "+998" ? 12 : 13} inputMode="tel" placeholder={prefix === "+998" ? "97 123 45 67" : "912 345 67 89"} disabled={sent || busy} onChange={event => setNumber(event.target.value.replace(/\D/g, "").slice(0, digitsFor[prefix]))} /></div></label>{sent && <label>Tasdiqlash kodi<input className="field" value={code} maxLength={6} inputMode="numeric" placeholder="6 xonali kod" autoFocus onChange={event => setCode(event.target.value.replace(/\D/g, ""))} /></label>}<button className="btn" disabled={busy || (!sent && !phoneValid) || (sent && code.length !== 6)} onClick={sent ? verify : send}>{busy ? "Kutilmoqda…" : sent ? "Kodni tasdiqlash" : "Kod yuborish"}</button>{sent && <button className="login-change-phone" type="button" disabled={busy} onClick={() => { setSent(false); setCode(""); setError(""); }}>Raqamni o‘zgartirish</button>}{error && <div className="notice">{error}</div>}</div></section></main>;
}

export default function Login() { return <Suspense fallback={<main className="login-modal-page">Yuklanmoqda…</main>}><LoginForm /></Suspense>; }
