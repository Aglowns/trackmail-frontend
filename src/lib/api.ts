import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { supabase } from './supabase';
import { 
  Application, 
  CreateApplicationRequest, 
  ApplicationFilters, 
  PaginatedApplications,
  Event,
  CreateEventRequest 
} from '@/types/application';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
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
  async getApplications(filters?: ApplicationFilters, page = 1, limit = 10): Promise<PaginatedApplications> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.company) params.append('company', filters.company);
    if (filters?.search) params.append('search', filters.search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response: AxiosResponse<{status: string, applications: Application[], count: number}> = await this.client.get(
      `/v1/applications?${params.toString()}`
    );
    
    // Handle simple backend response format
    if (response.data.status === 'success') {
      return {
        applications: response.data.applications || [],
        total: response.data.count || 0,
        page: page,
        limit: limit,
        total_pages: Math.ceil((response.data.count || 0) / limit)
      };
    }
    
    // Fallback for unexpected response format
    return {
      applications: [],
      total: 0,
      page: page,
      limit: limit,
      total_pages: 0
    };
  }

  async getApplication(id: string): Promise<Application> {
    const response: AxiosResponse<Application> = await this.client.get(`/v1/applications/${id}`);
    return response.data;
  }

  async createApplication(data: CreateApplicationRequest): Promise<Application> {
    const response: AxiosResponse<{status: string, message: string}> = await this.client.post('/v1/applications', data);
    
    // Handle simple backend response format
    if (response.data.status === 'success') {
      // Return a mock application for now since the simple backend doesn't return the created application
      return {
        id: 'temp-id-' + Date.now(),
        company: data.company,
        position: data.position,
        status: data.status,
        location: data.location || '',
        source_url: data.source_url || '',
        notes: data.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    
    return response.data;
  }

  async updateApplication(id: string, data: Partial<CreateApplicationRequest>): Promise<Application> {
    const response: AxiosResponse<Application> = await this.client.put(`/v1/applications/${id}`, data);
    return response.data;
  }

  async deleteApplication(id: string): Promise<void> {
    await this.client.delete(`/v1/applications/${id}`);
  }

  // Event endpoints
  async getApplicationEvents(applicationId: string): Promise<Event[]> {
    const response: AxiosResponse<Event[]> = await this.client.get(`/v1/applications/${applicationId}/events`);
    return response.data;
  }

  async createEvent(data: CreateEventRequest): Promise<Event> {
    const response: AxiosResponse<Event> = await this.client.post('/v1/events', data);
    return response.data;
  }

  async updateEvent(id: string, data: Partial<CreateEventRequest>): Promise<Event> {
    const response: AxiosResponse<Event> = await this.client.put(`/v1/events/${id}`, data);
    return response.data;
  }

  async deleteEvent(id: string): Promise<void> {
    await this.client.delete(`/v1/events/${id}`);
  }
}

export const apiClient = new ApiClient();
