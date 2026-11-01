"use client";

import Link, { useLinkStatus } from "next/link";
import { useRef, type ComponentProps, type MouseEvent } from "react";

/**
 * Rendered inside <Link>. `useLinkStatus` flips to pending the instant the click
 * starts a client navigation and flips back by itself when the route commits (or
 * fails), so there is no state of ours that can get stuck. The overlay fades in
 * after a short delay (see globals.css) so already-prefetched, near-instant
 * navigations never flash a spinner.
 */
function PendingOverlay() {
  const { pending } = useLinkStatus();
  return <span aria-hidden="true" className="nav-pending" data-pending={pending ? "true" : "false"} />;
}

// A second click this soon after the first is the same intent, not a new one.
const DUPLICATE_CLICK_WINDOW_MS = 900;

type NavLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/**
 * Drop-in replacement for next/link used for every in-app navigation button:
 *  - client-side navigation with Next's default viewport prefetching,
 *  - pressed-state feedback (CSS `.nav-link:active`),
 *  - pending overlay + global top progress bar (NavigationProgress),
 *  - repeated clicks are ignored for a very short window (time based, so the
 *    link is never left disabled if a navigation is slow or fails).
 */
export default function NavLink({ className = "", onClick, children, ...props }: NavLinkProps) {
  const lastClick = useRef(0);
  // Overlay needs a positioned parent; never override an explicit positioning class.
  const positioned = /(^|\s)(absolute|fixed|sticky|relative)(\s|$)/.test(className);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    const plain = event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
    if (!plain) return; // let the browser open new tabs/windows normally
    const now = Date.now();
    if (now - lastClick.current < DUPLICATE_CLICK_WINDOW_MS) {
      event.preventDefault();
      return;
    }
    lastClick.current = now;
  };

  return (
    <Link {...props} onClick={handleClick} className={`nav-link ${positioned ? "" : "relative "}${className}`}>
      {children}
      <PendingOverlay />
    </Link>
  );
}
