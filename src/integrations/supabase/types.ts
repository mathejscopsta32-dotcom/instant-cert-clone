export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      click_events: {
        Row: {
          city: string | null
          created_at: string
          element: string | null
          element_text: string | null
          id: string
          page: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          element?: string | null
          element_text?: string | null
          id?: string
          page: string
        }
        Update: {
          city?: string | null
          created_at?: string
          element?: string | null
          element_text?: string | null
          id?: string
          page?: string
        }
        Relationships: []
      }
      comprovante_hashes: {
        Row: {
          created_at: string
          hash: string
          id: string
          pedido_id: string
        }
        Insert: {
          created_at?: string
          hash: string
          id?: string
          pedido_id: string
        }
        Update: {
          created_at?: string
          hash?: string
          id?: string
          pedido_id?: string
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          addon_cid: boolean | null
          addon_pacote3: boolean | null
          addon_qr_code: boolean | null
          cidade: string | null
          comprovante_url: string | null
          cpf: string
          created_at: string
          data_nascimento: string | null
          dias_afastamento: string | null
          email: string
          estado: string | null
          hospital_preferencia: string | null
          id: string
          inicio_sintomas: string | null
          inicio_sintomas_data: string | null
          nome_completo: string
          observacoes: string | null
          outros_sintomas: string | null
          pdf_url: string | null
          sintomas: string[] | null
          status: string
          telefone: string
          tipo: string
          updated_at: string
          valor_total: number
        }
        Insert: {
          addon_cid?: boolean | null
          addon_pacote3?: boolean | null
          addon_qr_code?: boolean | null
          cidade?: string | null
          comprovante_url?: string | null
          cpf: string
          created_at?: string
          data_nascimento?: string | null
          dias_afastamento?: string | null
          email: string
          estado?: string | null
          hospital_preferencia?: string | null
          id?: string
          inicio_sintomas?: string | null
          inicio_sintomas_data?: string | null
          nome_completo: string
          observacoes?: string | null
          outros_sintomas?: string | null
          pdf_url?: string | null
          sintomas?: string[] | null
          status?: string
          telefone: string
          tipo?: string
          updated_at?: string
          valor_total: number
        }
        Update: {
          addon_cid?: boolean | null
          addon_pacote3?: boolean | null
          addon_qr_code?: boolean | null
          cidade?: string | null
          comprovante_url?: string | null
          cpf?: string
          created_at?: string
          data_nascimento?: string | null
          dias_afastamento?: string | null
          email?: string
          estado?: string | null
          hospital_preferencia?: string | null
          id?: string
          inicio_sintomas?: string | null
          inicio_sintomas_data?: string | null
          nome_completo?: string
          observacoes?: string | null
          outros_sintomas?: string | null
          pdf_url?: string | null
          sintomas?: string[] | null
          status?: string
          telefone?: string
          tipo?: string
          updated_at?: string
          valor_total?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      pedidos_public: {
        Row: {
          created_at: string | null
          id: string | null
          nome_completo: string | null
          status: string | null
          tipo: string | null
          valor_total: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          nome_completo?: string | null
          status?: string | null
          tipo?: string | null
          valor_total?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          nome_completo?: string | null
          status?: string | null
          tipo?: string | null
          valor_total?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      submit_comprovante: {
        Args: { p_comprovante_url: string; p_pedido_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
