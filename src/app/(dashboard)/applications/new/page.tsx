'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ApplicationForm } from '@/components/applications/application-form';
import { apiClient } from '@/lib/api';
import { CreateApplicationRequest } from '@/types/application';

export default function NewApplicationPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (data: CreateApplicationRequest) => {
    try {
      setLoading(true);
      setError('');
      await apiClient.createApplication(data);
      toast.success('Application created successfully!');
      router.push('/');
    } catch (err) {
      const errorMessage = 'Failed to create application';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <ApplicationForm
        onSubmit={handleSubmit}
        loading={loading}
        submitText="Create Application"
      />
    </div>
  );
}
