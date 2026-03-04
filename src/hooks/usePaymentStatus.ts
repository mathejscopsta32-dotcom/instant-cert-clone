import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook that listens for realtime status changes on a pedido.
 * Returns true when status becomes 'aprovado'.
 */
export function usePaymentStatus(pedidoId: string | null) {
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    if (!pedidoId) return;

    const channel = supabase
      .channel(`pedido-status-${pedidoId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pedidos",
          filter: `id=eq.${pedidoId}`,
        },
        (payload) => {
          if (payload.new && (payload.new as any).status === "aprovado") {
            setApproved(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pedidoId]);

  return approved;
}
