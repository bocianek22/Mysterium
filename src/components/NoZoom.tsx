"use client";
import { useEffect } from "react";

// Blokada powiększania na urządzeniach mobilnych (zwłaszcza iOS Safari,
// gdzie meta user-scalable=no jest ignorowane). Blokuje pinch-zoom oraz
// double-tap zoom, zachowując normalne przewijanie i klikanie.
export default function NoZoom() {
  useEffect(() => {
    const stop = (e: Event) => e.preventDefault();
    // Safari (iOS) — gesty pinch
    document.addEventListener("gesturestart", stop, { passive: false });
    document.addEventListener("gesturechange", stop, { passive: false });
    document.addEventListener("gestureend", stop, { passive: false });

    // pinch przez wielodotyk
    const onMove = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener("touchmove", onMove, { passive: false });

    // double-tap zoom (z wyjątkiem elementów interaktywnych)
    let last = 0;
    const onEnd = (e: TouchEvent) => {
      const now = Date.now();
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest?.("a,button,input,select,textarea,label,[role=button]");
      if (now - last < 320 && !interactive) e.preventDefault();
      last = now;
    };
    document.addEventListener("touchend", onEnd, { passive: false });

    return () => {
      document.removeEventListener("gesturestart", stop);
      document.removeEventListener("gesturechange", stop);
      document.removeEventListener("gestureend", stop);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
    };
  }, []);
  return null;
}
