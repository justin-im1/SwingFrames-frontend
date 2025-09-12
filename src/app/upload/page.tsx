'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, ArrowLeft } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import VideoUpload from '../../components/upload/VideoUpload';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useAppDispatch } from '../../lib/store';
import { addNotification } from '../../features/ui/uiSlice';
import { useUploadVideoAndCreateSwing } from '../../hooks/useSwings';

export default function UploadPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [swingId, setSwingId] = useState<string | null>(null);

  const handleUploadComplete = (fileId: string, newSwingId?: string) => {
    console.log('Video upload and swing creation completed:', {
      fileId,
      swingId: newSwingId,
    });
    setUploadedFileId(fileId);
    setSwingId(newSwingId || null);
    dispatch(
      addNotification({
        type: 'success',
        message: 'Video uploaded and swing created successfully!',
      })
    );
  };

  const handleUploadError = (error: string) => {
    dispatch(
      addNotification({
        type: 'error',
        message: `Upload failed: ${error}`,
      })
    );
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Upload Your Golf Swing
            </h1>
            <p className="text-gray-600">
              Upload a video of your golf swing and add details to track your
              progress.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Upload className="h-5 w-5 text-green-600" />
                    <h2 className="text-lg font-semibold">Video Upload</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <VideoUpload
                    onUploadComplete={handleUploadComplete}
                    onUploadError={handleUploadError}
                    tag="practice_swing"
                    title={`Golf Swing - ${new Date().toLocaleDateString()}`}
                    description="Uploaded swing video"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Preview Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold">Preview</h2>
                </CardHeader>
                <CardContent>
                  {uploadedFileId ? (
                    <div className="space-y-4">
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Upload className="h-8 w-8 text-green-600" />
                          </div>
                          <p className="text-sm text-gray-600">
                            Video uploaded successfully
                          </p>
                          {swingId && (
                            <p className="text-xs text-gray-500 mt-1">
                              Swing ID: {swingId}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => router.push('/library')}
                        className="w-full"
                        size="lg"
                      >
                        View in Library
                      </Button>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Upload className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm">Upload a video to see preview</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
