"use client";

import { useEffect, useRef, useState } from "react";

declare global { interface Window { google?: any; } }

type Selection = { address: string; latitude: number; longitude: number };
const tashkent = { lat: 41.3111, lng: 69.2797 };

export function GoogleMapPicker({ onSelect, onClose }: { onSelect: (selection: Selection) => void; onClose: () => void }) {
  const mapElement = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Selection | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) { setError("Google Maps API kaliti kiritilmagan."); return; }
    const start = () => {
      if (!mapElement.current || !window.google) return;
      const map = new window.google.maps.Map(mapElement.current, { center: tashkent, zoom: 12, streetViewControl: false, mapTypeControl: false });
      const marker = new window.google.maps.Marker({ map, position: tashkent, draggable: true });
      const geocoder = new window.google.maps.Geocoder();
      const choose = (position: any) => {
        const latitude = position.lat(), longitude = position.lng();
        marker.setPosition(position);
        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results: any[], status: string) => setSelected({ latitude, longitude, address: status === "OK" && results?.[0]?.formatted_address ? results[0].formatted_address : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
      };
      map.addListener("click", (event: any) => choose(event.latLng));
      marker.addListener("dragend", (event: any) => choose(event.latLng));
      setReady(true);
    };
    if (window.google?.maps) { start(); return; }
    const existing = document.querySelector<HTMLScriptElement>("script[data-google-maps]");
    if (existing) { existing.addEventListener("load", start); return () => existing.removeEventListener("load", start); }
    const script = document.createElement("script"); script.dataset.googleMaps = "true"; script.async = true; script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&language=uz`; script.onload = start; script.onerror = () => setError("Google Maps yuklanmadi. API kalit va Maps JavaScript API sozlamasini tekshiring."); document.head.appendChild(script);
  }, []);

  return <div className="map-modal-backdrop"><section className="map-modal"><div className="top"><div><h2>Xaritadan manzilni tanlang</h2><small>Xaritaga bosing yoki markerni sudrang.</small></div><button className="btn secondary" type="button" onClick={onClose}>Yopish</button></div>{error ? <div className="notice">{error}</div> : <><div ref={mapElement} className="google-map" />{!ready && <p>Google Maps yuklanmoqda…</p>}{selected && <p className="selected-map-address">{selected.address}</p>}<div className="modal-actions"><button className="btn secondary" type="button" onClick={onClose}>Bekor qilish</button><button className="btn" type="button" disabled={!selected} onClick={() => selected && onSelect(selected)}>Manzilni tasdiqlash</button></div></>}</section></div>;
}
