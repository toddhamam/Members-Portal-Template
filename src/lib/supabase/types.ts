// Database types for Supabase
// These match the schema defined in supabase/migrations/001_initial_schema.sql

export type ProductType = 'main' | 'order_bump' | 'upsell' | 'downsell';
export type ContentType = 'video' | 'audio' | 'pdf' | 'text' | 'download';
export type PurchaseStatus = 'active' | 'refunded' | 'expired';
export type PurchaseSource = 'funnel' | 'portal';
export type ResourceType = 'pdf' | 'worksheet' | 'checklist' | 'audio' | 'video' | 'link' | 'other';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  is_admin: boolean;
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
  product_type: ProductType;
  thumbnail_url: string | null;
  is_active: boolean;
  is_lead_magnet: boolean;
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
  purchase_source: PurchaseSource;
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

// ============================================
// FUNNEL DASHBOARD TYPES
// ============================================

export type FunnelEventType =
  | 'page_view'
  | 'purchase'
  | 'upsell_accept'
  | 'upsell_decline'
  | 'downsell_accept'
  | 'downsell_decline';

export type FunnelStep =
  | 'landing'
  | 'checkout'
  | 'upsell-1'
  | 'downsell-1'
  | 'upsell-2'
  | 'thank-you';

export interface FunnelEvent {
  id: string;
  visitor_id: string;
  funnel_session_id: string;
  session_id: string | null;
  event_type: FunnelEventType;
  funnel_step: FunnelStep;
  variant: string | null;
  revenue_cents: number;
  product_slug: string | null;
  ip_hash: string | null;
  user_agent: string | null;
  created_at: string;
}

// Dashboard metrics types
export interface FunnelStepMetrics {
  step: FunnelStep;
  sessions: number;
  purchases: number;
  conversionRate: number;
  revenue: number;
}

export interface FunnelSummary {
  sessions: number;
  purchases: number;
  conversionRate: number;
  totalRevenue: number;
  uniqueCustomers: number;
  aovPerCustomer: number;
}

export interface ABTestMetrics {
  step: FunnelStep;
  variant: string;
  sessions: number;
  purchases: number;
  conversionRate: number;
  revenue: number;
}

export interface DashboardMetrics {
  summary: FunnelSummary;
  stepMetrics: FunnelStepMetrics[];
  abTests: ABTestMetrics[];
}

// ============================================
// DISCUSSION TYPES
// ============================================

export type ReactionType = 'like' | 'heart' | 'celebrate';
export type NotificationType = 'mention' | 'reply_to_post' | 'reply_to_comment' | 'reaction';

export interface EmbeddedMedia {
  type: 'youtube' | 'vimeo' | 'loom';
  url: string;
  videoId: string;
  title?: string;
}

export interface DiscussionPost {
  id: string;
  author_id: string;
  body: string;
  image_urls: string[];
  embedded_media: EmbeddedMedia[];
  is_pinned: boolean;
  is_hidden: boolean;
  hidden_reason: string | null;
  hidden_by: string | null;
  comment_count: number;
  reaction_count: number;
  created_at: string;
  updated_at: string;
  edited_at: string | null;
}

export interface DiscussionComment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  body: string;
  image_urls: string[];
  is_hidden: boolean;
  hidden_reason: string | null;
  hidden_by: string | null;
  reply_count: number;
  reaction_count: number;
  created_at: string;
  updated_at: string;
  edited_at: string | null;
}

export interface DiscussionReaction {
  id: string;
  user_id: string;
  post_id: string | null;
  comment_id: string | null;
  reaction_type: ReactionType;
  created_at: string;
}

export interface DiscussionNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  actor_id: string;
  post_id: string | null;
  comment_id: string | null;
  is_read: boolean;
  preview_text: string | null;
  created_at: string;
}

// Discussion types with author joined (for display)
export interface PostWithAuthor extends DiscussionPost {
  author: { id: string; full_name: string | null; avatar_url: string | null };
  user_reaction?: ReactionType | null;
}

export interface CommentWithAuthor extends DiscussionComment {
  author: { id: string; full_name: string | null; avatar_url: string | null };
  user_reaction?: ReactionType | null;
  replies?: CommentWithAuthor[];
}

export interface NotificationWithActor extends DiscussionNotification {
  actor: { id: string; full_name: string | null; avatar_url: string | null };
}

// ============================================
// DIRECT MESSAGING TYPES
// ============================================

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  last_message_preview: string | null;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  is_admin: boolean;
  unread_count: number;
  last_read_at: string | null;
  created_at: string;
}

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  is_deleted: boolean;
}

// Direct messaging types with joins (for display)
export interface ConversationWithParticipant extends Conversation {
  otherParticipant: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    isAdmin: boolean;
  };
  unreadCount: number;
}

export interface MessageWithSender extends DirectMessage {
  sender: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    isAdmin: boolean;
  };
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
          is_admin?: boolean;
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
          is_admin?: boolean;
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
          product_type: ProductType;
          thumbnail_url?: string | null;
          is_active?: boolean;
          is_lead_magnet?: boolean;
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
          product_type?: ProductType;
          thumbnail_url?: string | null;
          is_active?: boolean;
          is_lead_magnet?: boolean;
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
          purchase_source?: PurchaseSource;
        };
        Update: {
          stripe_payment_intent_id?: string | null;
          stripe_checkout_session_id?: string | null;
          expires_at?: string | null;
          status?: PurchaseStatus;
          purchase_source?: PurchaseSource;
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
      funnel_events: {
        Row: FunnelEvent;
        Insert: {
          id?: string;
          visitor_id: string;
          funnel_session_id: string;
          session_id?: string | null;
          event_type: FunnelEventType;
          funnel_step: FunnelStep;
          variant?: string | null;
          revenue_cents?: number;
          product_slug?: string | null;
          ip_hash?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          visitor_id?: string;
          funnel_session_id?: string;
          session_id?: string | null;
          event_type?: FunnelEventType;
          funnel_step?: FunnelStep;
          variant?: string | null;
          revenue_cents?: number;
          product_slug?: string | null;
          ip_hash?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
