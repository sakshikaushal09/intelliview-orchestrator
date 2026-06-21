"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Vim/Linear-style keyboard navigation.
 * `g` then a letter jumps to a route; `?` opens the help dialog.
 */
export function useKeyboardNav(onShowHelp: () => void) {
  const router = useRouter();
  useEffect(() => {
    let lastG = 0;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      const now = Date.now();
      if (e.key === "g" && now - lastG < 800) {
        lastG = 0;
        return;
      }
      if (e.key === "g") {
        lastG = now;
        return;
      }
      if (lastG && now - lastG < 800) {
        const route: Record<string, string> = {
          s: "/sessions",
          w: "/workers",
          a: "/analytics",
          o: "/",
          ",": "/settings",
        };
        if (route[e.key.toLowerCase()]) {
          e.preventDefault();
          router.push(route[e.key.toLowerCase()]);
          lastG = 0;
        }
        return;
      }
      if (e.key === "?") {
        e.preventDefault();
        onShowHelp();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router, onShowHelp]);
}
