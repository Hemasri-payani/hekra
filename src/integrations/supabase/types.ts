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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          metadata: Json
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          base_amount: number
          created_at: string
          id: string
          order_number: string
          package_id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          project_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          tax_amount: number
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          base_amount: number
          created_at?: string
          id?: string
          order_number?: string
          package_id: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          tax_amount?: number
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          base_amount?: number
          created_at?: string
          id?: string
          order_number?: string
          package_id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          description: string
          features: string[]
          id: string
          is_active: boolean
          name: string
          price_inr: number
          scope: string
          slug: string
          sort_order: number
          support: string
          tagline: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          features?: string[]
          id?: string
          is_active?: boolean
          name: string
          price_inr: number
          scope?: string
          slug: string
          sort_order?: number
          support?: string
          tagline?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          features?: string[]
          id?: string
          is_active?: boolean
          name?: string
          price_inr?: number
          scope?: string
          slug?: string
          sort_order?: number
          support?: string
          tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          failure_reason: string | null
          gateway: string
          gateway_order_id: string | null
          gateway_payment_id: string | null
          gateway_signature: string | null
          id: string
          order_id: string
          paid_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          failure_reason?: string | null
          gateway?: string
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          gateway_signature?: string | null
          id?: string
          order_id: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          failure_reason?: string | null
          gateway?: string
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          gateway_signature?: string | null
          id?: string
          order_id?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          phone_verified: boolean
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          is_active?: boolean
          phone?: string | null
          phone_verified?: boolean
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          phone_verified?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          additional_requirements: string | null
          admin_notes: string | null
          company: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string
          delivery_preference: string | null
          description: string
          id: string
          package_id: string
          platform: string
          progress: number
          project_name: string
          reference_url: string | null
          required_features: string | null
          software_type: string
          technologies: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_requirements?: string | null
          admin_notes?: string | null
          company?: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at?: string
          delivery_preference?: string | null
          description: string
          id?: string
          package_id: string
          platform: string
          progress?: number
          project_name: string
          reference_url?: string | null
          required_features?: string | null
          software_type: string
          technologies?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_requirements?: string | null
          admin_notes?: string | null
          company?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string
          delivery_preference?: string | null
          description?: string
          id?: string
          package_id?: string
          platform?: string
          progress?: number
          project_name?: string
          reference_url?: string | null
          required_features?: string | null
          software_type?: string
          technologies?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "customer"
      order_status:
        | "payment_pending"
        | "payment_successful"
        | "order_confirmed"
        | "requirements_review"
        | "development_started"
        | "development_in_progress"
        | "testing"
        | "completed"
        | "cancelled"
      payment_status:
        | "pending"
        | "successful"
        | "failed"
        | "cancelled"
        | "refunded"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "customer"],
      order_status: [
        "payment_pending",
        "payment_successful",
        "order_confirmed",
        "requirements_review",
        "development_started",
        "development_in_progress",
        "testing",
        "completed",
        "cancelled",
      ],
      payment_status: [
        "pending",
        "successful",
        "failed",
        "cancelled",
        "refunded",
      ],
    },
  },
} as const
