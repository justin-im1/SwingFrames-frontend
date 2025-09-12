'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle, AlertCircle, FileVideo } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useUploadVideoAndCreateSwing } from '../../hooks/useSwings';
import { UploadProgress } from '../../types';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

interface VideoUploadProps {
  onUploadComplete?: (fileId: string, swingId?: string) => void;
  onUploadError?: (error: string) => void;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  tag?: string;
  title?: string;
  description?: string;
}

export default function VideoUpload({
  onUploadComplete,
  onUploadError,
  maxSize = 100 * 1024 * 1024, // 100MB
  acceptedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
  tag,
  title,
  description,
}: VideoUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );
  const uploadVideoMutation = useUploadVideoAndCreateSwing();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file size
      if (file.size > maxSize) {
        onUploadError?.(
          `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
        );
        return;
      }

      // Start upload
      setUploadProgress({
        fileId: '',
        fileName: file.name,
        progress: 0,
        status: 'uploading',
      });

      try {
        const result = await uploadVideoMutation.mutateAsync({
          file,
          fileName: file.name,
          fileType: file.type,
          tag,
          title,
          description,
        });

        setUploadProgress({
          fileId: result.fileId,
          fileName: file.name,
          progress: 100,
          status: 'completed',
        });

        // Pass both fileId and swingId to the callback
        const swingId = result.swing?.data?.id;
        onUploadComplete?.(result.fileId, swingId);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Upload failed';
        setUploadProgress({
          fileId: '',
          fileName: file.name,
          progress: 0,
          status: 'error',
          error: errorMessage,
        });
        onUploadError?.(errorMessage);
      }
    },
    [
      maxSize,
      onUploadComplete,
      onUploadError,
      uploadVideoMutation,
      tag,
      title,
      description,
    ]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': acceptedTypes,
    },
    multiple: false,
    maxSize,
  });

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-0">
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />

            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>

              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive
                    ? 'Drop your video here'
                    : 'Upload your golf swing video'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Drag and drop or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supports MP4, MOV, AVI • Max {formatFileSize(maxSize)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploadProgress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {uploadProgress.status === 'completed' ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : uploadProgress.status === 'error' ? (
                      <AlertCircle className="h-6 w-6 text-red-500" />
                    ) : (
                      <FileVideo className="h-6 w-6 text-blue-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadProgress.fileName}
                    </p>

                    {uploadProgress.status === 'uploading' && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-blue-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}

                    {uploadProgress.status === 'completed' && (
                      <p className="text-sm text-green-600 mt-1">
                        Upload completed successfully!
                      </p>
                    )}

                    {uploadProgress.status === 'error' && (
                      <p className="text-sm text-red-600 mt-1">
                        {uploadProgress.error}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadProgress(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
