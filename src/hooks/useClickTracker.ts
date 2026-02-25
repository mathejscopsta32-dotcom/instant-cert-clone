import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useClickTracker = () => {
  const cityRef = useRef<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Fetch city once on mount
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetch("https://ipapi.co/json/")
        .then((res) => res.json())
        .then((data) => {
          cityRef.current = data?.city || null;
        })
        .catch(() => {
          cityRef.current = null;
        });
    }

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Skip tracking on admin pages
      if (window.location.pathname.startsWith("/admin")) return;

      const elementText = (target.textContent || "").slice(0, 100).trim();

      supabase.from("click_events").insert({
        page: window.location.pathname,
        element_text: elementText || null,
        city: cityRef.current,
      }).then(); // fire and forget
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);
};
