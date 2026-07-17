"use client";

import { useEffect, useRef, useState } from "react";
import { Quote } from "lucide-react";
import { TESTIMONIALS } from "@/lib/constants";

const ITEMS = TESTIMONIALS.slice(0, 6);

const FIRST_PAUSE_MS = 2_000;
const PAUSE_MS = 5_000;
const ROTATE_MS = 2_600;

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * Flat 2D orbit (sin/cos) — avoids CSS 3D layer rasterization that
 * makes text look soft when the animation pauses.
 */
export function Testimonials() {
  const count = ITEMS.length;
  const angleStep = 360 / count;
  const [rotation, setRotation] = useState(0);
  const [radius, setRadius] = useState(280);
  const [reducedMotion, setReducedMotion] = useState(false);
  const rotationRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setRadius(150);
      else if (w < 1024) setRadius(230);
      else setRadius(280);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    let cancelled = false;
    let raf = 0;
    let pauseTimer = 0;
    let first = true;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        pauseTimer = window.setTimeout(resolve, ms);
      });

    const animateTo = (from: number, to: number) =>
      new Promise<void>((resolve) => {
        const start = performance.now();
        const tick = (now: number) => {
          if (cancelled) {
            resolve();
            return;
          }
          const t = Math.min(1, (now - start) / ROTATE_MS);
          const value = from + (to - from) * easeInOut(t);
          rotationRef.current = value;
          setRotation(value);
          if (t < 1) raf = requestAnimationFrame(tick);
          else {
            // Snap to exact step — keeps front card pixel-aligned
            const snapped = Math.round(to / angleStep) * angleStep;
            rotationRef.current = snapped;
            setRotation(snapped);
            resolve();
          }
        };
        raf = requestAnimationFrame(tick);
      });

    const run = async () => {
      while (!cancelled) {
        await sleep(first ? FIRST_PAUSE_MS : PAUSE_MS);
        first = false;
        if (cancelled) break;
        const from = rotationRef.current;
        await animateTo(from, from + angleStep);
      }
    };

    void run();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(pauseTimer);
    };
  }, [reducedMotion, angleStep]);

  if (reducedMotion) {
    return (
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Header />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ITEMS.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Header />

        <div className="relative mx-auto mt-4 h-[460px] w-full max-w-5xl sm:h-[520px]">
          <div className="pointer-events-none absolute inset-x-[10%] bottom-[8%] h-28 rounded-[100%] bg-primary/10 blur-3xl" />

          <div className="absolute inset-0">
            {ITEMS.map((t, i) => {
              const deg = i * angleStep - rotation;
              const rad = (deg * Math.PI) / 180;
              // Ellipse: x wide, y slight curve “into the back”
              const x = Math.sin(rad) * radius;
              const y = -Math.cos(rad) * radius * 0.22;
              const depth = (Math.cos(rad) + 1) / 2; // 1 = front, 0 = back
              const scale = 0.72 + depth * 0.28;
              const opacity = 0.25 + depth * 0.75;
              const featured = depth > 0.92;
              const width = featured ? 300 : 250;

              return (
                <div
                  key={t.name}
                  className="absolute left-1/2 top-[48%]"
                  style={{
                    width,
                    zIndex: Math.round(depth * 40),
                    opacity,
                    // Pure 2D — no rotateY / translateZ (keeps text sharp when paused)
                    transform: `translate(-50%, -50%) translate(${Math.round(x)}px, ${Math.round(y)}px) scale(${scale})`,
                  }}
                >
                  <TestimonialCard {...t} compact featured={featured} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Header() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
        Kullanıcılar ne diyor?
      </h2>
    </div>
  );
}

function TestimonialCard({
  name,
  role,
  text,
  city,
  compact,
  featured,
}: {
  name: string;
  role: string;
  text: string;
  city: string;
  compact?: boolean;
  featured?: boolean;
}) {
  return (
    <blockquote
      className={`relative rounded-2xl border bg-card ${
        featured
          ? "border-primary/30 shadow-2xl shadow-primary/15"
          : "border-border/70 shadow-lg shadow-black/10"
      } ${compact ? "p-5 sm:p-6" : "p-8"}`}
    >
      <Quote
        className={`text-primary/40 ${compact ? "mb-2.5 h-6 w-6" : "mb-4 h-8 w-8"}`}
      />
      <p
        className={`leading-relaxed text-foreground ${
          featured ? "text-base" : "line-clamp-4 text-sm"
        }`}
      >
        &ldquo;{text}&rdquo;
      </p>
      <footer className="mt-4">
        <p className="text-[15px] font-semibold tracking-tight">{name}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {role} · {city}
        </p>
      </footer>
    </blockquote>
  );
}
