import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

const FacebookPixel = () => {
  useEffect(() => {
    const loadPixel = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "facebook_pixel_id")
        .maybeSingle();

      const pixelId = data?.value;
      if (!pixelId) return;

      // Init fbq
      if (window.fbq) return;
      const n: any = (window.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      });
      if (!window._fbq) window._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];

      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(script);

      window.fbq("init", pixelId);
      window.fbq("track", "PageView");

      // Add noscript pixel
      const noscript = document.createElement("noscript");
      const img = document.createElement("img");
      img.height = 1;
      img.width = 1;
      img.style.display = "none";
      img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
      noscript.appendChild(img);
      document.body.appendChild(noscript);
    };

    loadPixel();
  }, []);

  return null;
};

export default FacebookPixel;
