'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ApplicationForm } from '@/components/applications/application-form';
import { apiClient } from '@/lib/api';
import { Application, CreateApplicationRequest } from '@/types/application';

interface EditApplicationPageProps {
  params: {
    id: string;
  };
}

export default function EditApplicationPage({ params }: EditApplicationPageProps) {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchApplication = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getApplication(params.id);
      setApplication(data);
    } catch (err) {
      setError('Failed to fetch application');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleSubmit = async (data: CreateApplicationRequest) => {
    try {
      setSubmitLoading(true);
      setError('');
      await apiClient.updateApplication(params.id, data);
      toast.success('Application updated successfully!');
      router.push('/');
    } catch (err) {
      const errorMessage = 'Failed to update application';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          Application not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <ApplicationForm
        application={application}
        onSubmit={handleSubmit}
        loading={submitLoading}
        submitText="Update Application"
      />
    </div>
  );
}
