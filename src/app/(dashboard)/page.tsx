'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { Application, ApplicationStatus } from '@/types/application';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

const statusColors: Record<ApplicationStatus, string> = {
  applied: 'bg-blue-100 text-blue-800',
  interview_scheduled: 'bg-yellow-100 text-yellow-800',
  interview_completed: 'bg-purple-100 text-purple-800',
  offer_received: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  interview_scheduled: 'Interview Scheduled',
  interview_completed: 'Interview Completed',
  offer_received: 'Offer Received',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      };
      const data = await apiClient.getApplications(filters);
      setApplications(data.applications);
    } catch (err) {
      setError('Failed to fetch applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      try {
        await apiClient.deleteApplication(id);
        setApplications(applications.filter(app => app.id !== id));
        toast.success('Application deleted successfully!');
      } catch (err) {
        const errorMessage = 'Failed to delete application';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
          <p className="text-gray-600">Track and manage your job applications</p>
        </div>
        <Link href="/applications/new">
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Application</span>
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ApplicationStatus | 'all')}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Applications List */}
      {applications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg font-medium">No applications found</p>
              <p className="text-sm mt-2">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Get started by creating your first application'
                }
              </p>
            </div>
            {!searchTerm && statusFilter === 'all' && (
              <Link href="/applications/new" className="mt-4 inline-block">
                <Button>Create Application</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{application.position}</CardTitle>
                    <CardDescription className="text-lg font-medium">
                      {application.company}
                    </CardDescription>
                    {application.location && (
                      <p className="text-sm text-gray-600 mt-1">{application.location}</p>
                    )}
                  </div>
                  <Badge className={statusColors[application.status]}>
                    {statusLabels[application.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {application.notes && (
                  <p className="text-gray-700 mb-4">{application.notes}</p>
                )}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Applied: {new Date(application.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/applications/${application.id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(application.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
