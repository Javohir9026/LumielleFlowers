"use client";

import { useEffect, useState } from "react";
import styles from "./HeroCarousel.module.css";

const slides = {
  uz: [
    "/images/hero/uz/lumielle-hero-1-peach-uz.webp",
    "/images/hero/uz/lumielle-hero-2-roses-uz.webp",
    "/images/hero/uz/lumielle-hero-3-white-uz.webp",
    "/images/hero/uz/lumielle-hero-4-pink-uz.webp"
  ],
  ru: [
    "/images/hero/ru/lumielle-hero-1-peach_ru.webp",
    "/images/hero/ru/lumielle-hero-2-roses_ru.webp",
    "/images/hero/ru/lumielle-hero-3-white_ru.webp",
    "/images/hero/ru/lumielle-hero-4-pink_ru.webp"
  ]
} as const;

export function HeroCarousel() {
  const [language, setLanguage] = useState<keyof typeof slides>("uz");
  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);

  useEffect(() => {
    setLanguage(localStorage.getItem("lumielle_language") === "ru" ? "ru" : "uz");
  }, []);

  useEffect(() => {
    setCurrent(0);
    setPrevious(null);
    const interval = window.setInterval(() => setCurrent(index => {
      setPrevious(index);
      return (index + 1) % slides[language].length;
    }), 3000);
    return () => window.clearInterval(interval);
  }, [language]);

  useEffect(() => {
    if (previous === null) return;
    const timeout = window.setTimeout(() => setPrevious(null), 500);
    return () => window.clearTimeout(timeout);
  }, [previous]);

  return <section className={styles.carousel} aria-label="Lumielle Flowers">
    {previous !== null && <img key={`${language}-${previous}-out`} className={`${styles.slide} ${styles.outgoing}`} src={slides[language][previous]} alt="" aria-hidden="true" />}
    <img key={`${language}-${current}`} className={`${styles.slide} ${styles.incoming}`} src={slides[language][current]} alt="" fetchPriority={current === 0 ? "high" : "auto"} />
  </section>;
}
