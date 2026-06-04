"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/* Pasek postępu przewijania na górze strony */
function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? h.scrollTop / max : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${p})`;
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return <div ref={ref} className="scroll-progress" aria-hidden />;
}

/* Niestandardowy kursor (tylko urządzenia z myszką) */
function CursorFX() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.body.classList.add("cursor-on");

    let mx = window.innerWidth / 2,
      my = window.innerHeight / 2,
      rx = mx,
      ry = my,
      raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dot.current) {
        dot.current.style.left = mx + "px";
        dot.current.style.top = my + "px";
      }
    };
    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ring.current) {
        ring.current.style.left = rx + "px";
        ring.current.style.top = ry + "px";
      }
      raf = requestAnimationFrame(loop);
    };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const interactive = t.closest("a,button,select,input,textarea,[role=button],.tilt");
      dot.current?.classList.toggle("hovering", !!interactive);
      ring.current?.classList.toggle("hovering", !!interactive);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", over);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", over);
      cancelAnimationFrame(raf);
      document.body.classList.remove("cursor-on");
    };
  }, []);
  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden />
      <div ref={ring} className="cursor-ring" aria-hidden />
    </>
  );
}

/* Animacje wejścia przy przewijaniu — obserwuje wszystkie .reveal */
function ScrollReveal() {
  const pathname = usePathname();
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.in)"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}

export default function SiteFX() {
  return (
    <>
      <ScrollProgress />
      <CursorFX />
      <ScrollReveal />
    </>
  );
}
