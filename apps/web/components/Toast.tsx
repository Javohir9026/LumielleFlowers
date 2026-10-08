"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaCheck, FaXmark } from "react-icons/fa6";

type Toast = { message: string; href: string };

export function Toast() {
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    const show = (event: Event) => setToast((event as CustomEvent<Toast>).detail);
    window.addEventListener("lumielle:toast", show);
    return () => window.removeEventListener("lumielle:toast", show);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  if (!toast) return null;

  return <aside className="toast" role="status" aria-live="polite"><FaCheck className="toast-icon" aria-hidden="true" /><span>{toast.message}</span><Link href={toast.href} className="toast-action" onClick={() => setToast(null)}>Ko‘rish</Link><button type="button" className="toast-close" aria-label="Bildirishnomani yopish" onClick={() => setToast(null)}><FaXmark /></button></aside>;
}
