import axios, { AxiosResponse } from 'axios';
import { supabase } from './supabase';
import {
  Application,
  ApplicationFilters,
  CreateApplicationRequest,
  CreateEventRequest,
  PaginatedApplications,
  UpdateApplicationRequest,
  TimelineEvent,
  AnalyticsOverview,
  AnalyticsTrends,
  AnalyticsCompanies,
  AnalyticsSources,
  UserProfile,
  UpdateUserProfileRequest,
} from '@/types/application';

class ApiClient {
  private client;

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_URL;
    if (!baseURL) {
      throw new Error('NEXT_PUBLIC_API_URL is not set. Please configure the backend URL.');
    }

    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to inject JWT token
    this.client.interceptors.request.use(async (config) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          supabase.auth.signOut();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Application endpoints
  async getApplications(
    filters?: ApplicationFilters,
    page = 1,
    limit = 20,
  ): Promise<PaginatedApplications> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.company) params.append('company', filters.company);
    if (filters?.source) params.append('source', filters.source);
    if (filters?.confidence) params.append('confidence', filters.confidence);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response: AxiosResponse<{
      status: string;
      applications: Application[];
      count: number;
      total_pages?: number;
    }> = await this.client.get(`/v1/applications?${params.toString()}`);

    const total = response.data.count ?? response.data.applications?.length ?? 0;
    const totalPages = response.data.total_pages ?? Math.ceil(total / limit);

    return {
      applications: response.data.applications ?? [],
      total,
      page,
      limit,
      total_pages: totalPages,
    };
  }

  async getApplicationsByStatus(): Promise<Record<string, Application[]>> {
    const response: AxiosResponse<Record<string, Application[]>> = await this.client.get(
      '/v1/applications/status-groups',
    );
    return response.data;
  }

  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    const response: AxiosResponse<AnalyticsOverview> = await this.client.get(
      '/v1/applications/analytics/overview',
    );
    return response.data;
  }

  async getAnalyticsTrends(days = 30): Promise<AnalyticsTrends> {
    const response: AxiosResponse<AnalyticsTrends> = await this.client.get(
      `/v1/applications/analytics/trends?days=${days}`,
    );
    return response.data;
  }

  async getAnalyticsCompanies(): Promise<AnalyticsCompanies> {
    const response: AxiosResponse<AnalyticsCompanies> = await this.client.get(
      '/v1/applications/analytics/companies',
    );
    return response.data;
  }

  async getAnalyticsSources(): Promise<AnalyticsSources> {
    const response: AxiosResponse<AnalyticsSources> = await this.client.get(
      '/v1/applications/analytics/sources',
    );
    return response.data;
  }

  async getCurrentProfile(): Promise<UserProfile> {
    const response: AxiosResponse<UserProfile> = await this.client.get('/v1/profiles/me');
    return response.data;
  }

  async updateProfile(data: UpdateUserProfileRequest): Promise<UserProfile> {
    const response: AxiosResponse<UserProfile> = await this.client.put('/v1/profiles/me', data);
    return response.data;
  }

  async getApplication(id: string): Promise<Application> {
    const response: AxiosResponse<Application> = await this.client.get(`/v1/applications/${id}`);
    return response.data;
  }

  async createApplication(data: CreateApplicationRequest): Promise<Application> {
    const response = await this.client.post('/v1/applications', data);
    // Accept both legacy wrapper { status, application } and plain Application payloads
    const payload: unknown = response.data;

    const hasKeys = (obj: unknown, keys: string[]): obj is Record<string, unknown> =>
      typeof obj === 'object' && obj !== null && keys.every((k) => k in (obj as Record<string, unknown>));

    const isApplication = (obj: unknown): obj is Application =>
      hasKeys(obj, ['id', 'company', 'position']);

    const isWrapped = (obj: unknown): obj is { application: Application } =>
      hasKeys(obj, ['application']) && isApplication((obj as Record<string, unknown>).application);

    if (isWrapped(payload)) return payload.application;
    if (isApplication(payload)) return payload;
    throw new Error('Failed to create application');
  }

  async updateApplication(
    id: string,
    data: Partial<UpdateApplicationRequest>,
  ): Promise<Application> {
    const response: AxiosResponse<Application> = await this.client.patch(
      `/v1/applications/${id}`,
      data,
    );
    return response.data;
  }

  async updateManyApplications(
    updates: Array<{ id: string; data: Partial<UpdateApplicationRequest> }>,
  ): Promise<Application[]> {
    const response: AxiosResponse<Application[]> = await this.client.put(
      '/v1/applications/bulk-update',
      { updates },
    );
    return response.data;
  }

  async deleteApplication(id: string): Promise<void> {
    await this.client.delete(`/v1/applications/${id}`);
  }

  async exportApplications(filters?: ApplicationFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.source) params.append('source', filters.source);
    if (filters?.confidence) params.append('confidence', filters.confidence);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.search) params.append('search', filters.search);

    const response = await this.client.get(`/v1/applications/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Event endpoints
  async getApplicationEvents(applicationId: string): Promise<TimelineEvent[]> {
    const response: AxiosResponse<TimelineEvent[]> = await this.client.get(
      `/v1/applications/${applicationId}/events`,
    );
    return response.data;
  }

  async createEvent(data: CreateEventRequest): Promise<TimelineEvent> {
    const response: AxiosResponse<TimelineEvent> = await this.client.post(
      `/v1/applications/${data.application_id}/events`,
      data,
    );
    return response.data;
  }

  async updateEvent(id: string, data: Partial<CreateEventRequest>): Promise<TimelineEvent> {
    const response: AxiosResponse<TimelineEvent> = await this.client.put(`/v1/events/${id}`, data);
    return response.data;
  }

  async deleteEvent(id: string): Promise<void> {
    await this.client.delete(`/v1/events/${id}`);
  }

  // Health check endpoint (for diagnostics)
  async checkHealth(): Promise<{ status: string; version?: string; timestamp?: string }> {
    const response = await this.client.get('/v1/health');
    return response.data;
  }

  // Get current access token from backend
  // This is more reliable than getting from Supabase session directly
  async getAccessToken(): Promise<string> {
    const response = await this.client.get<{ access_token: string; token_type: string }>('/v1/token');
    return response.data.access_token;
  }

  // Get or issue a long-lived installation token for the Gmail add-on
  async getInstallationToken(): Promise<string> {
    const response = await this.client.post<{ installation_token: string; token_type: string; expires_in_days: number }>(
      '/v1/installation-token'
    );
    return response.data.installation_token;
  }

  // API Key endpoints for Gmail add-on integration
  async issueApiKey(name = 'Gmail Add-on Key'): Promise<{ api_key: string; created_at: string; name: string; expires_at: string | null }> {
    const response = await this.client.post<{ api_key: string; created_at: string; name: string; expires_at: string | null }>(
      '/v1/api-keys/issue',
      { name }
    );
    return response.data;
  }

  async listApiKeys(): Promise<{ api_keys: Array<{ id: string; name: string; created_at: string; last_used_at: string | null; expires_at: string | null }> }> {
    const response = await this.client.get<{ api_keys: Array<{ id: string; name: string; created_at: string; last_used_at: string | null; expires_at: string | null }> }>(
      '/v1/api-keys'
    );
    return response.data;
  }

  async revokeApiKey(keyId: string): Promise<{ message: string }> {
    const response = await this.client.delete<{ message: string }>(
      `/v1/api-keys/${keyId}`
    );
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
