import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const REDIRECT_URL =
  "https://www.youtube.com/watch?v=jBwmQMdBpfU&pp=ygUPZ2VtaWTDo28gZG8gemFw";

/**
 * Best-effort DevTools detection + hard-key blocking.
 * NOTE: This is NOT a security boundary — anyone can bypass it. Real data
 * protection lives in Supabase RLS / edge functions. This only deters casual
 * snooping by redirecting suspicious sessions away from the app.
 *
 * Skipped on /admin* routes (admins legitimately use DevTools) and in dev.
 */
export function useDevToolsGuard() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) return;
    if (pathname.startsWith("/admin")) return;

    let redirected = false;
    const redirect = () => {
      if (redirected) return;
      redirected = true;
      try {
        window.location.replace(REDIRECT_URL);
      } catch {
        window.location.href = REDIRECT_URL;
      }
    };

    // 1) Window-size heuristic: open DevTools usually shrinks viewport.
    const sizeCheck = () => {
      const wDiff = window.outerWidth - window.innerWidth;
      const hDiff = window.outerHeight - window.innerHeight;
      // Ignore mobile / small zoom artifacts
      if (window.innerWidth < 500) return;
      if (wDiff > 200 || hDiff > 220) redirect();
    };

    // 2) toString-getter trick: console.log(obj) triggers the getter only
    //    when DevTools panel is rendering the object.
    const bait: any = {};
    let triggered = false;
    Object.defineProperty(bait, "id", {
      get() {
        triggered = true;
        return "";
      },
    });
    const consoleCheck = () => {
      triggered = false;
      // eslint-disable-next-line no-console
      console.log(bait);
      // eslint-disable-next-line no-console
      console.clear();
      if (triggered) redirect();
    };

    // 3) debugger-timing: a debugger statement pauses execution when DevTools
    //    "pause on exceptions/sources" is open.
    const debuggerCheck = () => {
      const start = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      if (performance.now() - start > 120) redirect();
    };

    const interval = window.setInterval(() => {
      sizeCheck();
      consoleCheck();
      debuggerCheck();
    }, 1200);

    // 4) Block common inspect shortcuts and right-click
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "f12") {
        e.preventDefault();
        redirect();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(key)) {
        e.preventDefault();
        redirect();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && key === "u") {
        e.preventDefault();
        redirect();
      }
    };
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("contextmenu", onContextMenu);

    // Initial run
    sizeCheck();

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("contextmenu", onContextMenu);
    };
  }, [pathname]);
}
