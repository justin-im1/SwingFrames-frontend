'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap } from 'lucide-react';
import Layout from '../../../components/layout/Layout';
import Button from '../../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import SwingAnalysis from '../../../components/pose/SwingAnalysis';
import { useAppSelector } from '../../../lib/store';
import { PoseAnalysis, Swing } from '../../../types';

export default function AnalyzePage() {
  const router = useRouter();
  const params = useParams();
  const swingId = params.id as string;

  const { library } = useAppSelector(state => state.swings);
  const [swing, setSwing] = useState<Swing | null>(null);
  const [analysis, setAnalysis] = useState<PoseAnalysis | null>(null);

  useEffect(() => {
    if (swingId && library.length > 0) {
      const foundSwing = library.find(s => s.id === swingId);
      if (foundSwing) {
        setSwing(foundSwing);
      } else {
        // Swing not found, redirect to library
        router.push('/library');
      }
    }
  }, [swingId, library, router]);

  const handleAnalysisComplete = (completedAnalysis: PoseAnalysis) => {
    setAnalysis(completedAnalysis);
  };

  const handleError = (error: string) => {
    console.error('Analysis error:', error);
  };

  if (!swing) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading swing...</p>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Pose Analysis
                </h1>
                <p className="text-gray-600">
                  {swing.title || 'Untitled Swing'}
                </p>
              </div>
            </div>
          </div>

          {/* Video Preview */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold">Original Video</h2>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                {(() => {
                  const videoUrl =
                    swing.videoUrl || swing.video_url || swing.file_url;
                  const isValidUrl = videoUrl && videoUrl.startsWith('http');

                  return isValidUrl ? (
                    <video
                      src={videoUrl}
                      className="w-full h-full object-contain"
                      muted
                      preload="metadata"
                      playsInline
                      controls={true}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                      <div className="text-center">
                        <div className="text-gray-400 mb-2">📹</div>
                        <p className="text-sm text-gray-500">
                          No video available
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Pose Analysis */}
          <SwingAnalysis
            swingId={swingId}
            onAnalysisComplete={handleAnalysisComplete}
            onError={handleError}
          />

          {/* Analysis Results Summary */}
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Analysis Summary</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">4</div>
                      <div className="text-sm text-gray-600">Key Events</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">33</div>
                      <div className="text-sm text-gray-600">
                        Body Landmarks
                      </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        100%
                      </div>
                      <div className="text-sm text-gray-600">
                        Analysis Complete
                      </div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600">Generated</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
