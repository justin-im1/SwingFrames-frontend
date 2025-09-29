'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Play,
  Eye,
  EyeOff,
  ArrowLeft,
  PlayCircle,
  Scissors,
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useAppSelector, useAppDispatch } from '../../lib/store';
import { setOverlayMode } from '../../features/overlay/overlaySlice';
import {
  usePoseAnalysis,
  useGeneratePoseAnalysis,
} from '../../hooks/useSwings';
import PoseComparison from '../../components/pose/PoseComparison';

export default function ComparePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { library, selectedSwings: reduxSelectedSwings } = useAppSelector(
    state => state.swings
  );
  const { isOverlayMode } = useAppSelector(state => state.overlay);

  const [selectedSwingIds, setSelectedSwingIds] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoTimings, setVideoTimings] = useState<
    { start: number; end: number }[]
  >([
    { start: 0, end: 0 },
    { start: 0, end: 0 },
  ]);
  const [videoDurations, setVideoDurations] = useState<number[]>([0, 0]);
  const [isPlayingBoth, setIsPlayingBoth] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const selectedSwings = library.filter(swing =>
    selectedSwingIds.includes(swing.id)
  );

  // Get pose analysis for both selected swings
  const poseAnalysis1 = usePoseAnalysis(selectedSwingIds[0] || '');
  const poseAnalysis2 = usePoseAnalysis(selectedSwingIds[1] || '');

  // Hook for generating pose analysis
  const generatePoseAnalysis = useGeneratePoseAnalysis();

  useEffect(() => {
    // Initialize with selected swings from Redux or URL params
    if (reduxSelectedSwings.length > 0) {
      setSelectedSwingIds(reduxSelectedSwings.slice(0, 2));
    }
  }, [reduxSelectedSwings]);

  // Auto-trigger analysis for selected swings
  useEffect(() => {
    const autoAnalyzeSwings = async () => {
      for (const swingId of selectedSwingIds) {
        if (!swingId) continue;

        // Check if analysis is needed
        const analysis =
          swingId === selectedSwingIds[0] ? poseAnalysis1 : poseAnalysis2;

        if (
          analysis?.data?.status === 'not_generated' &&
          !generatePoseAnalysis.isPending
        ) {
          console.log(
            `🚀 [AUTO-ANALYZE] Starting analysis for swing ${swingId}`
          );
          try {
            await generatePoseAnalysis.mutateAsync(swingId);
            console.log(
              `✅ [AUTO-ANALYZE] Analysis started for swing ${swingId}`
            );
          } catch (error) {
            console.error(
              `❌ [AUTO-ANALYZE] Failed to start analysis for swing ${swingId}:`,
              error
            );
          }
        }
      }
    };

    // Only auto-analyze if we have selected swings
    if (selectedSwingIds.length > 0) {
      autoAnalyzeSwings();
    }
  }, [
    selectedSwingIds,
    poseAnalysis1.data,
    poseAnalysis2.data,
    generatePoseAnalysis,
  ]);

  const handleSwingSelect = (swingId: string) => {
    if (selectedSwingIds.includes(swingId)) {
      setSelectedSwingIds(selectedSwingIds.filter(id => id !== swingId));
    } else if (selectedSwingIds.length < 2) {
      setSelectedSwingIds([...selectedSwingIds, swingId]);
    }
  };

  const handlePlayBothVideos = () => {
    videoRefs.current.forEach((video, index) => {
      if (video && videoTimings[index]) {
        // Start from the start time (or beginning if no start time set)
        const startTime = videoTimings[index].start || 0;
        video.currentTime = startTime;
        video.play();
      }
    });
    setIsPlaying(true);
    setIsPlayingBoth(true);
  };

  const handlePauseBothVideos = () => {
    videoRefs.current.forEach(video => {
      if (video) {
        video.pause();
      }
    });
    setIsPlaying(false);
    setIsPlayingBoth(false);
  };

  const handleResetTimings = (index: number) => {
    setVideoTimings(prev => {
      const newTimings = [...prev];
      newTimings[index] = { start: 0, end: 0 };
      return newTimings;
    });
  };

  // const handleTimeUpdate = (time: number) => {
  //   setCurrentTime(time);
  // };

  // const handleLoadedMetadata = (duration: number) => {
  //   setDuration(duration);
  // };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Compare Swings
                </h1>
                <p className="text-gray-600">
                  Analyze and compare your golf swings side-by-side
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-4 sm:mt-0">
              {selectedSwingIds.length >= 2 && (
                <Button
                  variant="primary"
                  onClick={
                    isPlaying ? handlePauseBothVideos : handlePlayBothVideos
                  }
                  className="flex items-center"
                >
                  {isPlaying ? (
                    <PlayCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {isPlaying ? 'Pause Both' : 'Play Both'}
                </Button>
              )}

              <Button
                variant={isOverlayMode ? 'primary' : 'outline'}
                onClick={() => dispatch(setOverlayMode(!isOverlayMode))}
                className="flex items-center"
              >
                {isOverlayMode ? (
                  <EyeOff className="h-4 w-4 mr-2" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                {isOverlayMode ? 'Side-by-Side' : 'Overlay'}
              </Button>
            </div>
          </div>

          {/* Swing Selection */}
          {selectedSwingIds.length < 2 && (
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-lg font-semibold">
                  Select Swings to Compare
                </h2>
                <p className="text-sm text-gray-600">
                  Choose up to 2 swings from your library
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {library.map(swing => (
                    <motion.div
                      key={swing.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all ${
                          selectedSwingIds.includes(swing.id)
                            ? 'ring-2 ring-green-500 shadow-lg'
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => handleSwingSelect(swing.id)}
                      >
                        <CardContent className="p-4">
                          <div className="bg-gray-900 rounded-lg mb-3 overflow-hidden w-48 mx-auto">
                            {(() => {
                              const videoUrl =
                                swing.videoUrl ||
                                swing.video_url ||
                                swing.file_url;
                              const isValidUrl =
                                videoUrl && videoUrl.startsWith('http');

                              return isValidUrl ? (
                                <video
                                  src={videoUrl}
                                  className="w-full h-full object-contain"
                                  muted
                                  preload="metadata"
                                  playsInline
                                />
                              ) : swing.thumbnailUrl ? (
                                <img
                                  src={swing.thumbnailUrl}
                                  alt={swing.title}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                                  <Play className="h-8 w-8 text-green-400" />
                                </div>
                              );
                            })()}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {swing.tags?.slice(0, 2).map(tag => (
                              <span
                                key={tag.id}
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  tag.type === 'outcome'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {tag.label}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comparison Player */}
          {selectedSwingIds.length >= 2 && (
            <div className="space-y-6">
              {/* Video Players */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {selectedSwings.map((swing, index: number) => (
                  <motion.div
                    key={swing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="space-y-3">
                      {/* Swing Info */}
                      <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            Swing {index + 1}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              videoTimings[index]?.start > 0 ||
                              videoTimings[index]?.end > 0
                                ? 'bg-green-100 text-green-800'
                                : 'text-gray-500'
                            }`}
                          >
                            {videoTimings[index]?.start?.toFixed(1) || '0.0'}s -{' '}
                            {videoTimings[index]?.end?.toFixed(1) || '0.0'}s
                          </span>
                        </div>

                        {/* Control buttons */}
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const video = videoRefs.current[index];
                              if (video) {
                                const currentTime = video.currentTime;
                                console.log(
                                  'Setting start time to current time:',
                                  currentTime
                                );
                                setVideoTimings(prev => {
                                  const newTimings = [...prev];
                                  newTimings[index] = {
                                    ...newTimings[index],
                                    start: currentTime,
                                    end:
                                      newTimings[index]?.end ||
                                      videoDurations[index] ||
                                      0,
                                  };
                                  return newTimings;
                                });
                              }
                            }}
                            className="text-xs px-3 py-1"
                          >
                            <Scissors className="h-3 w-3 mr-1" />
                            Set Start (Current Time)
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const video = videoRefs.current[index];
                              if (video) {
                                const currentTime = video.currentTime;
                                console.log(
                                  'Setting end time to current time:',
                                  currentTime
                                );
                                setVideoTimings(prev => {
                                  const newTimings = [...prev];
                                  newTimings[index] = {
                                    ...newTimings[index],
                                    start: newTimings[index]?.start || 0,
                                    end: currentTime,
                                  };
                                  return newTimings;
                                });
                              }
                            }}
                            className="text-xs px-3 py-1"
                          >
                            <Scissors className="h-3 w-3 mr-1" />
                            Set End (Current Time)
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetTimings(index)}
                            className="text-xs px-3 py-1 text-gray-500"
                          >
                            Reset
                          </Button>
                        </div>
                      </div>

                      <div className="bg-gray-900 rounded-lg overflow-hidden w-64 mx-auto">
                        {(() => {
                          const videoUrl =
                            swing.videoUrl || swing.video_url || swing.file_url;
                          const isValidUrl =
                            videoUrl && videoUrl.startsWith('http');

                          return isValidUrl ? (
                            <video
                              ref={video => {
                                videoRefs.current[index] = video;
                              }}
                              src={videoUrl}
                              className="w-full h-full object-contain"
                              muted
                              preload="metadata"
                              playsInline
                              controls={true}
                              onPlay={() => {
                                // Only set isPlaying to true if we're not in "Play Both" mode
                                if (!isPlayingBoth) {
                                  setIsPlaying(true);
                                }
                              }}
                              onPause={() => {
                                // Only set isPlaying to false if we're not in "Play Both" mode
                                if (!isPlayingBoth) {
                                  setIsPlaying(false);
                                }
                              }}
                              onLoadedMetadata={() => {
                                const video = videoRefs.current[index];
                                if (video) {
                                  setVideoDurations(prev => {
                                    const newDurations = [...prev];
                                    newDurations[index] = video.duration;
                                    return newDurations;
                                  });
                                }
                              }}
                              onTimeUpdate={() => {
                                const video = videoRefs.current[index];
                                if (
                                  video &&
                                  videoTimings[index]?.end > 0 &&
                                  video.currentTime >= videoTimings[index].end
                                ) {
                                  // Only handle end behavior if we're in "Play Both" mode
                                  if (isPlayingBoth) {
                                    video.pause();
                                    // Keep video at end time (final frame) but reset button state
                                    setIsPlaying(false);
                                    setIsPlayingBoth(false);
                                  }
                                }
                              }}
                              onEnded={() => {
                                // Handle when video reaches natural end (no end time set)
                                if (isPlayingBoth) {
                                  // Reset button state when video naturally ends
                                  setIsPlaying(false);
                                  setIsPlayingBoth(false);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                              <Play className="h-12 w-12 text-green-400" />
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pose Analysis Comparison */}
              {selectedSwings.length >= 2 &&
                poseAnalysis1.data?.status === 'available' &&
                poseAnalysis2.data?.status === 'available' && (
                  <div className="my-8">
                    <PoseComparison
                      swing1={poseAnalysis1.data}
                      swing2={poseAnalysis2.data}
                    />
                  </div>
                )}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
