export interface SubscriptionFeatures {
  max_applications?: number | null;
  unlimited_applications?: boolean;
  auto_tracking?: boolean;
  advanced_analytics?: boolean;
  export_data?: boolean;
  [key: string]: unknown;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description?: string | null;
  price_monthly: number;
  price_yearly: number;
  stripe_price_id_monthly?: string | null;
  stripe_price_id_yearly?: string | null;
  features: SubscriptionFeatures;
  is_active?: boolean;
}

export interface SubscriptionUsage {
  applications_count: number;
  applications_limit?: number | null;
}

export interface SubscriptionStatusSummary {
  plan_name: string;
  plan_id?: string;
  status: string;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
}

export interface SubscriptionStatusResponse {
  subscription: SubscriptionStatusSummary;
  features: SubscriptionFeatures;
  usage: SubscriptionUsage;
}

export interface CheckoutSessionResponse {
  checkout_url: string;
  session_id?: string;
  plan?: string;
  price?: number;
  billing_period?: string;
}

