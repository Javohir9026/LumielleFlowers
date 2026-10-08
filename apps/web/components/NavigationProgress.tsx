"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function NavigationProgress() {
  const pathname = usePathname(); const search = useSearchParams(); const [progress, setProgress] = useState(0); const [visible, setVisible] = useState(false); const pending = useRef(false); const timer = useRef<number | undefined>(undefined);
  const start = () => { if (pending.current) return; pending.current = true; setVisible(true); setProgress(8); requestAnimationFrame(() => setProgress(30)); };
  const finish = () => { if (!pending.current) return; pending.current = false; setProgress(100); window.clearTimeout(timer.current); timer.current = window.setTimeout(() => { setVisible(false); setProgress(0); }, 260); };
  useEffect(() => { const click = (event: MouseEvent) => { const anchor = (event.target as Element | null)?.closest("a[href]") as HTMLAnchorElement | null; if (!anchor || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || anchor.target === "_blank") return; const url = new URL(anchor.href, location.href); if (url.origin === location.origin && url.href !== location.href) start(); }; document.addEventListener("click", click, true); return () => document.removeEventListener("click", click, true); }, []);
  useEffect(() => { window.scrollTo(0, 0); finish(); }, [pathname, search]);
  return <div className={`navigation-progress ${visible ? "is-visible" : ""}`} aria-hidden="true"><span style={{ transform: `scaleX(${progress / 100})` }} /></div>;
}
