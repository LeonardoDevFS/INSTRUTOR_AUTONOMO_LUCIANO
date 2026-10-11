"use client";

import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export type PhotoEffectVariant = "hero" | "portrait" | "card";

type PhotoEffectsProps = {
  children: ReactNode;
  variant?: PhotoEffectVariant;
  className?: string;
  reveal?: boolean;
  revealDelay?: number;
};

type PhotoEffectsStyle = CSSProperties & {
  "--photo-reveal-delay": string;
};

export function PhotoEffects({
  children,
  variant = "portrait",
  className,
  reveal = false,
  revealDelay = 0,
}: PhotoEffectsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !reveal) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      container.dataset.visible = "true";
      return;
    }

    const bounds = container.getBoundingClientRect();

    if (bounds.top < window.innerHeight * 0.94 && bounds.bottom > 0) {
      window.requestAnimationFrame(() => {
        container.dataset.visible = "true";
      });
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        container.dataset.visible = "true";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8%", threshold: 0.14 },
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [reveal]);

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (variant !== "portrait" || event.pointerType === "touch") {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    event.currentTarget.style.setProperty("--photo-x", `${x}%`);
    event.currentTarget.style.setProperty("--photo-y", `${y}%`);
  }

  function handlePointerLeave(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.style.setProperty("--photo-x", "68%");
    event.currentTarget.style.setProperty("--photo-y", "24%");
  }

  const style: PhotoEffectsStyle = {
    "--photo-reveal-delay": `${Math.max(0, revealDelay)}ms`,
  };

  return (
    <div
      ref={containerRef}
      className={cn("photo-effects", className)}
      data-variant={variant}
      data-reveal={reveal ? "true" : "false"}
      data-visible={reveal ? "false" : "true"}
      style={style}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <span className="photo-effects__glow" aria-hidden="true" />
      <div className="photo-effects__frame">
        {children}
        <span className="photo-effects__tone" aria-hidden="true" />
        <span className="photo-effects__vignette" aria-hidden="true" />
        {variant === "hero" && (
          <>
            <span className="photo-effects__grain" aria-hidden="true" />
            <span className="photo-effects__flare" aria-hidden="true" />
            <span className="photo-effects__particles" aria-hidden="true" />
          </>
        )}
        {variant === "portrait" && (
          <span className="photo-effects__light" aria-hidden="true" />
        )}
        {variant === "card" && (
          <span className="photo-effects__glass" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
