/**
 * Tipos de la base de datos.
 *
 * Se mantienen a mano para la primera entrega. Cuando el proyecto esté vinculado,
 * pueden regenerarse automáticamente con:
 *   supabase gen types typescript --linked > src/lib/supabase/database.types.ts
 */
export type PlanningType = "unidad_mensual" | "secuencia_clases";
export type PlanStatus = "borrador" | "completo";
export type GenerationStatus = "pendiente" | "exito" | "error";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          institution: string | null;
          province: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          institution?: string | null;
          province?: string;
        };
        Update: {
          display_name?: string | null;
          institution?: string | null;
          province?: string;
        };
        Relationships: [];
      };
      curriculum_contents: {
        Row: {
          id: string;
          jurisdiction: string;
          level: string;
          grade: number;
          area: string;
          axis: string | null;
          content_number: string | null;
          content_text: string;
          source_year: number | null;
          active: boolean;
          content_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          jurisdiction?: string;
          level?: string;
          grade: number;
          area: string;
          axis?: string | null;
          content_number?: string | null;
          content_text: string;
          source_year?: number | null;
          active?: boolean;
          content_hash: string;
        };
        Update: Partial<Database["public"]["Tables"]["curriculum_contents"]["Insert"]>;
        Relationships: [];
      };
      plans: {
        Row: {
          id: string;
          user_id: string;
          teacher_name: string;
          institution: string | null;
          grade: number;
          planning_type: PlanningType;
          duration: string | null;
          start_date: string | null;
          title: string;
          guiding_question: string;
          teacher_resource: string | null;
          generated_sections: Record<string, unknown>;
          status: PlanStatus;
          ai_model: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          teacher_name: string;
          institution?: string | null;
          grade: number;
          planning_type: PlanningType;
          duration?: string | null;
          start_date?: string | null;
          title: string;
          guiding_question: string;
          teacher_resource?: string | null;
          generated_sections?: Record<string, unknown>;
          status?: PlanStatus;
          ai_model?: string | null;
        };
        Update: {
          teacher_name?: string;
          institution?: string | null;
          grade?: number;
          planning_type?: PlanningType;
          duration?: string | null;
          start_date?: string | null;
          title?: string;
          guiding_question?: string;
          teacher_resource?: string | null;
          generated_sections?: Record<string, unknown>;
          status?: PlanStatus;
          ai_model?: string | null;
        };
        Relationships: [];
      };
      plan_contents: {
        Row: { plan_id: string; curriculum_content_id: string };
        Insert: { plan_id: string; curriculum_content_id: string };
        Update: { plan_id?: string; curriculum_content_id?: string };
        Relationships: [];
      };
      generation_events: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string | null;
          status: GenerationStatus;
          model: string | null;
          error_code: string | null;
          input_tokens: number | null;
          output_tokens: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id?: string | null;
          status: GenerationStatus;
          model?: string | null;
          error_code?: string | null;
          input_tokens?: number | null;
          output_tokens?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["generation_events"]["Insert"]>;
        Relationships: [];
      };
      usage_limits: {
        Row: {
          user_id: string;
          period_start: string;
          generations_used: number;
          monthly_limit: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          period_start?: string;
          generations_used?: number;
          monthly_limit?: number;
        };
        Update: {
          period_start?: string;
          generations_used?: number;
          monthly_limit?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      planning_type: PlanningType;
      plan_status: PlanStatus;
      generation_status: GenerationStatus;
    };
    CompositeTypes: Record<never, never>;
  };
}
