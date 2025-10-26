export interface Application {
  id: string;
  user_id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  location?: string;
  source_url?: string;
  source?: string;
  notes?: string;
  confidence?: 'High' | 'Medium' | 'Low';
  salary_range?: string;
  applied_at?: string;
  created_at: string;
  updated_at: string;
  order_index?: number;
  timeline?: TimelineEvent[];
}

export type ApplicationStatus =
  | 'wishlist'
  | 'applied'
  | 'screening'
  | 'interviewing'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'offer'
  | 'offer_received'
  | 'rejected'
  | 'accepted'
  | 'withdrawn';

export interface TimelineEvent {
  id: string;
  application_id: string;
  event_type: string;
  status?: ApplicationStatus;
  notes?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface CreateApplicationRequest {
  company: string;
  position: string;
  status: ApplicationStatus;
  location?: string;
  source_url?: string;
  source?: string;
  notes?: string;
  confidence?: 'High' | 'Medium' | 'Low';
  salary_range?: string;
  applied_at?: string;
}

export interface UpdateApplicationRequest extends Partial<CreateApplicationRequest> {
  id: string;
  order_index?: number;
}

export interface ApplicationFilters {
  status?: ApplicationStatus | 'all';
  source?: string;
  confidence?: 'High' | 'Medium' | 'Low';
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface PaginatedApplications {
  applications: Application[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface AnalyticsOverview {
  total_applications: number;
  applications_this_month: number;
  response_rate: number;
  status_counts: Record<string, number>;
}

export interface AnalyticsTrendPoint {
  date: string;
  applications: number;
}

export interface AnalyticsTrends {
  trend_data: AnalyticsTrendPoint[];
  total_in_period: number;
}

export interface AnalyticsCompanies {
  company_counts: Record<string, number>;
  top_companies: Array<{ company: string; count: number }>;
  unique_companies: number;
}

export interface AnalyticsSources {
  source_counts: Record<string, number>;
  top_sources: Array<{ source: string; count: number }>;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  profession?: string;
  phone?: string;
  notification_email?: string;
  job_preferences?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserProfileRequest {
  full_name?: string;
  profession?: string;
  phone?: string;
  notification_email?: string;
  job_preferences?: Record<string, unknown>;
}

export interface Event {
  id: string;
  application_id: string;
  event_type: string;
  event_date?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export interface CreateEventRequest {
  application_id: string;
  event_type: string;
  event_date?: string;
  status?: ApplicationStatus;
  notes?: string;
  metadata?: Record<string, unknown>;
}
