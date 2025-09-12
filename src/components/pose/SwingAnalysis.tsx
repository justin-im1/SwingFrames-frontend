'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import SnapshotGrid from './SnapshotGrid';
import { SwingAnalysisProps } from '../../types';
import {
  usePoseAnalysis,
  useGeneratePoseAnalysis,
} from '../../hooks/useSwings';
import {
  Play,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react';

export default function SwingAnalysis({
  swingId,
  onAnalysisComplete,
  onError,
}: SwingAnalysisProps) {
  console.log(
    `🎯 [DEBUG] SwingAnalysis component rendered for swing ${swingId}`
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const {
    data: analysis,
    isLoading,
    error,
    refetch,
  } = usePoseAnalysis(swingId);
  const generateMutation = useGeneratePoseAnalysis();

  // Debug logging
  console.log(`🔍 SwingAnalysis Debug for swing ${swingId}:`, {
    analysis,
    analysisStatus: analysis?.status,
    hasSnapshots: !!analysis?.snapshots,
    snapshotsKeys: analysis?.snapshots
      ? Object.keys(analysis.snapshots)
      : 'none',
    isLoading,
    error,
    isGenerating,
    generationError,
    generateMutationPending: generateMutation.isPending,
    shouldShowButton:
      (!analysis || analysis.status !== 'available') && !isGenerating,
  });

  // Handle analysis completion
  useEffect(() => {
    if (analysis?.status === 'available' && onAnalysisComplete) {
      onAnalysisComplete(analysis);
    }
  }, [analysis, onAnalysisComplete]);

  // Handle errors
  useEffect(() => {
    if (error && onError) {
      onError(error.message || 'Failed to load pose analysis');
    }
  }, [error, onError]);

  const handleGenerateSnapshots = async () => {
    try {
      console.log(`🚀 Starting pose analysis generation for swing ${swingId}`);
      setIsGenerating(true);
      setGenerationError(null);
      await generateMutation.mutateAsync(swingId);
      console.log(
        `✅ Pose analysis generation started successfully for swing ${swingId}`
      );
    } catch (err) {
      console.error(
        `❌ Failed to start pose analysis generation for swing ${swingId}:`,
        err
      );
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to generate snapshots';
      setGenerationError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    setGenerationError(null);
    refetch();
  };

  const getStatusIcon = () => {
    if (isLoading || isGenerating) {
      return <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />;
    }

    if (error || generationError) {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    }

    if (analysis?.status === 'available') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }

    if (analysis?.status === 'processing') {
      return <Clock className="h-5 w-5 text-yellow-600" />;
    }

    return <Zap className="h-5 w-5 text-gray-400" />;
  };

  const getStatusText = () => {
    if (isLoading || isGenerating) {
      return 'Generating pose analysis...';
    }

    if (error || generationError) {
      return 'Analysis failed';
    }

    if (analysis?.status === 'available') {
      return 'Analysis complete';
    }

    if (analysis?.status === 'processing') {
      return 'Processing video...';
    }

    if (analysis?.status === 'not_generated') {
      return 'Ready to analyze';
    }

    return 'Ready to analyze';
  };

  const getStatusColor = () => {
    if (isLoading || isGenerating) {
      return 'text-blue-600';
    }

    if (error || generationError) {
      return 'text-red-600';
    }

    if (analysis?.status === 'available') {
      return 'text-green-600';
    }

    if (analysis?.status === 'processing') {
      return 'text-yellow-600';
    }

    if (analysis?.status === 'not_generated') {
      return 'text-gray-600';
    }

    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Analysis Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <h3 className="text-lg font-semibold">Pose Analysis</h3>
                <p className={`text-sm ${getStatusColor()}`}>
                  {getStatusText()}
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              {/* Always show a test button for debugging */}
              <Button
                onClick={() => {
                  console.log(
                    `🧪 [DEBUG] Test button clicked for swing ${swingId}`
                  );
                  handleGenerateSnapshots();
                }}
                disabled={generateMutation.isPending}
                className="flex items-center bg-red-500 hover:bg-red-600"
              >
                <Play className="h-4 w-4 mr-2" />
                {generateMutation.isPending
                  ? 'Starting Analysis...'
                  : 'TEST Generate Analysis'}
              </Button>

              {(!analysis || analysis.status === 'not_generated') &&
                !isGenerating && (
                  <Button
                    onClick={handleGenerateSnapshots}
                    disabled={generateMutation.isPending}
                    className="flex items-center"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {generateMutation.isPending
                      ? 'Starting Analysis...'
                      : 'Generate Analysis'}
                  </Button>
                )}

              {(error || generationError) && (
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  className="flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {(error || generationError) && (
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">
                    Analysis Error
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    {error?.message || generationError}
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    Please try again or contact support if the issue persists.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        )}

        {analysis?.status === 'processing' && (
          <CardContent>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">
                    Processing in Progress
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your video is being analyzed. This typically takes 1-5
                    minutes.
                  </p>
                  <p className="text-xs text-yellow-600 mt-2">
                    The page will automatically update when complete.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Snapshots Grid */}
      <AnimatePresence>
        {analysis?.status === 'available' && analysis.snapshots && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SnapshotGrid
              snapshots={analysis.snapshots}
              onSnapshotClick={(event, url) => {
                // Open snapshot in new tab for detailed view
                window.open(url, '_blank');
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
