import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useClickTracker = () => {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Skip tracking on admin pages
      if (window.location.pathname.startsWith("/admin")) return;

      const element = target.tagName.toLowerCase() +
        (target.className ? `.${String(target.className).split(" ").slice(0, 2).join(".")}` : "");

      const elementText = (target.textContent || "").slice(0, 100).trim();

      supabase.from("click_events").insert({
        page: window.location.pathname,
        element,
        element_text: elementText || null,
      }).then(); // fire and forget
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);
};
