'use client';

import { useState, FormEvent } from 'react';
import PageLayout from '@/components/PageLayout';
import { useVerifySubmission } from '@/app/hooks/useVerifySubmission';

export default function Verify() {
  const [image, setImage] = useState<File | null>(null);
  const [text, setText] = useState('');
  const { isLoading, error, success, submitVerification } = useVerifySubmission();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (image && text) {
      await submitVerification(image, text);
    }
  };

  return (
    <PageLayout title="Verify">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Image
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="mt-1 block w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700">
            Text
          </label>
          <input
            type="text"
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-black"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">Verification successful!</p>}
    </PageLayout>
  );
}