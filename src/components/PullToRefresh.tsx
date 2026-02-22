"use client";

import { useEffect, useRef } from "react";

const THRESHOLD_PX = 80;

function isTextInput(el: EventTarget | null) {
  const node = el as HTMLElement | null;
  if (!node) return false;
  const tag = node.tagName?.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || node.isContentEditable;
}

export function PullToRefresh() {
  const startYRef = useRef<number | null>(null);
  const maxDeltaRef = useRef(0);
  const refreshingRef = useRef(false);

  useEffect(() => {
    const onTouchStart = (ev: TouchEvent) => {
      if (refreshingRef.current) return;
      if (window.scrollY > 0) return;
      if (isTextInput(ev.target)) return;

      const t = ev.touches[0];
      if (!t) return;
      startYRef.current = t.clientY;
      maxDeltaRef.current = 0;
    };

    const onTouchMove = (ev: TouchEvent) => {
      const startY = startYRef.current;
      if (startY == null) return;
      if (window.scrollY > 0) return;

      const t = ev.touches[0];
      if (!t) return;
      const delta = t.clientY - startY;
      if (delta > maxDeltaRef.current) maxDeltaRef.current = delta;
    };

    const onTouchEnd = () => {
      const pulled = maxDeltaRef.current;
      startYRef.current = null;
      maxDeltaRef.current = 0;

      if (refreshingRef.current) return;
      if (window.scrollY > 0) return;
      if (pulled < THRESHOLD_PX) return;

      refreshingRef.current = true;
      window.location.reload();
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  return null;
}
