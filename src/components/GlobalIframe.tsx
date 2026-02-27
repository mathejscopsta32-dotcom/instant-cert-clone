import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const GlobalIframe = () => {
  const [iframeUrl, setIframeUrl] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("key, value")
        .in("key", ["iframe_url", "iframe_enabled"]);
      if (data) {
        data.forEach((row) => {
          if (row.key === "iframe_url") setIframeUrl(row.value);
          if (row.key === "iframe_enabled") setEnabled(row.value === "true");
        });
      }
    };
    fetchSettings();
  }, []);

  if (!enabled || !iframeUrl) return null;

  return (
    <div className="w-full bg-background border-t border-border">
      <iframe
        src={iframeUrl}
        className="w-full border-0"
        style={{ height: "500px" }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Conteúdo externo"
      />
    </div>
  );
};

export default GlobalIframe;
