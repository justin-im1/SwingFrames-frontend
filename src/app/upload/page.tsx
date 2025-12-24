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
        <div className="h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-6 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
              Upload Your Golf Swing
            </h1>
            <p className="text-gray-400 text-lg">
              Upload a video of your golf swing and add details to track your
              progress.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-6">
              <Card glass className="border-white/10">
                <CardHeader className="border-white/10">
                  <div className="flex items-center space-x-2">
                    <Upload className="h-5 w-5 text-emerald-400" />
                    <h2 className="text-lg font-semibold text-white">
                      Video Upload
                    </h2>
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
              <Card glass className="border-white/10">
                <CardHeader className="border-white/10">
                  <h2 className="text-lg font-semibold text-white">Preview</h2>
                </CardHeader>
                <CardContent>
                  {uploadedFileId ? (
                    <div className="space-y-4">
                      <div className="aspect-video glass-dark rounded-lg flex items-center justify-center border border-emerald-500/20">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/30">
                            <Upload className="h-8 w-8 text-emerald-400" />
                          </div>
                          <p className="text-sm text-white">
                            Video uploaded successfully
                          </p>
                          {swingId && (
                            <p className="text-xs text-gray-400 mt-1">
                              Swing ID: {swingId}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => router.push('/library')}
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0"
                        size="lg"
                      >
                        View in Library
                      </Button>
                    </div>
                  ) : (
                    <div className="aspect-video glass-dark rounded-lg flex items-center justify-center border border-white/10">
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
