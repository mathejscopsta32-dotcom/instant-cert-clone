import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useClickTracker = () => {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    if (window.location.pathname.startsWith("/admin")) return;
    trackedRef.current = true;

    // Track one page visit per session/page load
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        supabase.from("click_events").insert({
          page: window.location.pathname,
          city: data?.city || null,
          element_text: null,
        }).then();
      })
      .catch(() => {
        supabase.from("click_events").insert({
          page: window.location.pathname,
          city: null,
          element_text: null,
        }).then();
      });
  }, []);
};
