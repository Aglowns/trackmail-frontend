export interface Application {
  id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  location?: string;
  source_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export type ApplicationStatus = 
  | 'applied'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'offer_received'
  | 'rejected'
  | 'withdrawn';

export interface CreateApplicationRequest {
  company: string;
  position: string;
  status: ApplicationStatus;
  location?: string;
  source_url?: string;
  notes?: string;
}

export interface UpdateApplicationRequest extends Partial<CreateApplicationRequest> {
  id: string;
}

export interface ApplicationFilters {
  status?: ApplicationStatus;
  company?: string;
  search?: string;
}

export interface PaginatedApplications {
  applications: Application[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface Event {
  id: string;
  application_id: string;
  event_type: string;
  event_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEventRequest {
  application_id: string;
  event_type: string;
  event_date: string;
  notes?: string;
}
