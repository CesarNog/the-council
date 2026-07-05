import { isAdvertisingEnabled } from "./consent.js";

const PUBLISHER_ID = typeof import.meta !== "undefined" ? import.meta.env?.VITE_ADSENSE_PUBLISHER_ID : undefined;

let _adsReady = false;

export function isAdsReady() {
  return _adsReady;
}

export function initAds() {
  if (_adsReady) return;
  if (!isAdvertisingEnabled()) return;
  if (!PUBLISHER_ID) return;
  if (typeof document === "undefined") return;
  if (import.meta.env?.DEV) return; // never load in dev

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUBLISHER_ID}`;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);

  _adsReady = true;
}

// Call after the AdSense script loads. Push a page-level ad slot config.
export function pushAdSlot(config = {}) {
  if (!isAdvertisingEnabled()) return;
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push(config);
  } catch {
    // adsbygoogle not yet loaded — silently skip
  }
}
