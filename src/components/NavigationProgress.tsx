"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SAFETY_TIMEOUT_MS = 10_000;

/**
 * Lightweight top progress bar for in-app navigation. It never re-renders React:
 * a capture-phase click listener sets `data-nav="loading"` on <html> in the same
 * frame as the click, and the route change (pathname) clears it. A timeout and
 * pageshow handler guarantee it can never stay stuck. Styling lives in globals.css.
 */
export default function NavigationProgress() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    let timer = 0;
    const stop = () => {
      window.clearTimeout(timer);
      delete root.dataset.nav;
    };
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || (anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return; // hash jumps / same page
      window.clearTimeout(timer);
      root.dataset.nav = "loading";
      timer = window.setTimeout(stop, SAFETY_TIMEOUT_MS);
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("pageshow", stop);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("pageshow", stop);
      stop();
    };
  }, []);

  // The new route has committed: finish the bar.
  useEffect(() => {
    delete document.documentElement.dataset.nav;
  }, [pathname]);

  return null;
}
