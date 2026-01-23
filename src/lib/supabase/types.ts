// Database types for Supabase
// These match the schema defined in supabase/migrations/001_initial_schema.sql

export type ProductType = 'main' | 'order_bump' | 'upsell' | 'downsell';
export type ContentType = 'video' | 'audio' | 'pdf' | 'text' | 'download';
export type PurchaseStatus = 'active' | 'refunded' | 'expired';
export type ResourceType = 'pdf' | 'worksheet' | 'checklist' | 'audio' | 'video' | 'link' | 'other';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  portal_price_cents: number | null;
  stripe_price_id: string | null;
  portal_stripe_price_id: string | null;
  product_type: ProductType;
  thumbnail_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Module {
  id: string;
  product_id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  description: string | null;
  content_type: ContentType;
  content_url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  sort_order: number;
  is_published: boolean;
  is_free_preview: boolean;
  created_at: string;
}

export interface UserPurchase {
  id: string;
  user_id: string;
  product_id: string;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  purchased_at: string;
  expires_at: string | null;
  status: PurchaseStatus;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  progress_percent: number;
  completed_at: string | null;
  last_position_seconds: number;
  updated_at: string;
}

export interface LessonResource {
  id: string;
  lesson_id: string;
  title: string;
  description: string | null;
  resource_type: ResourceType;
  file_url: string | null;
  external_url: string | null;
  file_size_bytes: number | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

// Extended types with relations
export interface ProductWithModules extends Product {
  modules: ModuleWithLessons[];
}

export interface ModuleWithLessons extends Module {
  lessons: Lesson[];
}

export interface ProductWithAccess extends Product {
  is_owned: boolean;
  purchase?: UserPurchase;
  progress_percent?: number;
}

export interface LessonWithProgress extends Lesson {
  progress?: LessonProgress;
  is_completed: boolean;
}

// Database type for Supabase client
// Using a simplified type that works better with Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          stripe_customer_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          price_cents: number;
          portal_price_cents?: number | null;
          stripe_price_id?: string | null;
          portal_stripe_price_id?: string | null;
          product_type: ProductType;
          thumbnail_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          slug?: string;
          name?: string;
          description?: string | null;
          price_cents?: number;
          portal_price_cents?: number | null;
          stripe_price_id?: string | null;
          portal_stripe_price_id?: string | null;
          product_type?: ProductType;
          thumbnail_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      modules: {
        Row: Module;
        Insert: {
          id?: string;
          product_id: string;
          slug: string;
          title: string;
          description?: string | null;
          sort_order?: number;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          product_id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          sort_order?: number;
          is_published?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "modules_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      lessons: {
        Row: Lesson;
        Insert: {
          id?: string;
          module_id: string;
          slug: string;
          title: string;
          description?: string | null;
          content_type: ContentType;
          content_url?: string | null;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          sort_order?: number;
          is_published?: boolean;
          is_free_preview?: boolean;
          created_at?: string;
        };
        Update: {
          module_id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          content_type?: ContentType;
          content_url?: string | null;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          sort_order?: number;
          is_published?: boolean;
          is_free_preview?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey";
            columns: ["module_id"];
            referencedRelation: "modules";
            referencedColumns: ["id"];
          }
        ];
      };
      user_purchases: {
        Row: UserPurchase;
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          stripe_payment_intent_id?: string | null;
          stripe_checkout_session_id?: string | null;
          purchased_at?: string;
          expires_at?: string | null;
          status?: PurchaseStatus;
        };
        Update: {
          stripe_payment_intent_id?: string | null;
          stripe_checkout_session_id?: string | null;
          expires_at?: string | null;
          status?: PurchaseStatus;
        };
        Relationships: [
          {
            foreignKeyName: "user_purchases_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_purchases_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      lesson_progress: {
        Row: LessonProgress;
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          progress_percent?: number;
          completed_at?: string | null;
          last_position_seconds?: number;
          updated_at?: string;
        };
        Update: {
          progress_percent?: number;
          completed_at?: string | null;
          last_position_seconds?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_progress_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey";
            columns: ["lesson_id"];
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
