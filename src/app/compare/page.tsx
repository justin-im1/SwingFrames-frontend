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
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
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
        <div className="h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                  Compare Swings
                </h1>
                <p className="text-gray-400 text-lg">
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
                  className="flex items-center bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0"
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
                className={`flex items-center ${
                  isOverlayMode
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0'
                    : 'bg-white/5 backdrop-blur-sm border-white/20 text-white hover:bg-white/10'
                }`}
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
            <Card glass className="mb-6 border-white/10">
              <CardHeader className="border-white/10">
                <h2 className="text-lg font-semibold text-white">
                  Select Swings to Compare
                </h2>
                <p className="text-sm text-gray-400">
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
                        glass
                        className={`cursor-pointer transition-all border-white/10 ${
                          selectedSwingIds.includes(swing.id)
                            ? 'ring-2 ring-emerald-500 border-emerald-500/40 shadow-lg'
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => handleSwingSelect(swing.id)}
                      >
                        <CardContent className="p-4">
                          <div className="bg-black rounded-lg mb-3 overflow-hidden w-48 mx-auto border border-white/10">
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
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-950/50 to-black">
                                  <Play className="h-8 w-8 text-emerald-400" />
                                </div>
                              );
                            })()}
                          </div>
                          <div className="text-xs text-gray-400 text-center">
                            {formatDate(swing.createdAt || swing.created_at)}
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
              {isOverlayMode ? (
                <div className="space-y-4">
                  {/* Overlay Mode - Single video view with blending */}
                  <div className="relative bg-black rounded-xl overflow-hidden aspect-video max-w-4xl mx-auto border border-white/10">
                    {/* Background Video (Swing 1) */}
                    <video
                      ref={video => {
                        videoRefs.current[0] = video;
                      }}
                      src={
                        selectedSwings[0]?.videoUrl ||
                        selectedSwings[0]?.video_url ||
                        selectedSwings[0]?.file_url
                      }
                      className="w-full h-full object-contain"
                      muted
                      preload="metadata"
                      playsInline
                      controls={false}
                      onPlay={() => {
                        if (!isPlayingBoth) {
                          setIsPlaying(true);
                        }
                      }}
                      onPause={() => {
                        if (!isPlayingBoth) {
                          setIsPlaying(false);
                        }
                      }}
                      onLoadedMetadata={() => {
                        const video = videoRefs.current[0];
                        if (video) {
                          setVideoDurations(prev => {
                            const newDurations = [...prev];
                            newDurations[0] = video.duration;
                            return newDurations;
                          });
                        }
                      }}
                      onTimeUpdate={() => {
                        const video = videoRefs.current[0];
                        if (
                          video &&
                          videoTimings[0]?.end > 0 &&
                          video.currentTime >= videoTimings[0].end
                        ) {
                          if (isPlayingBoth) {
                            video.pause();
                            setIsPlaying(false);
                            setIsPlayingBoth(false);
                          }
                        }
                      }}
                      onEnded={() => {
                        if (isPlayingBoth) {
                          setIsPlaying(false);
                          setIsPlayingBoth(false);
                        }
                      }}
                    />

                    {/* Overlay Video (Swing 2) */}
                    <video
                      ref={video => {
                        videoRefs.current[1] = video;
                      }}
                      src={
                        selectedSwings[1]?.videoUrl ||
                        selectedSwings[1]?.video_url ||
                        selectedSwings[1]?.file_url
                      }
                      className="absolute inset-0 w-full h-full object-contain"
                      style={{ opacity: overlayOpacity }}
                      muted
                      preload="metadata"
                      playsInline
                      controls={false}
                      onLoadedMetadata={() => {
                        const video = videoRefs.current[1];
                        if (video) {
                          setVideoDurations(prev => {
                            const newDurations = [...prev];
                            newDurations[1] = video.duration;
                            return newDurations;
                          });
                        }
                      }}
                      onTimeUpdate={() => {
                        const video = videoRefs.current[1];
                        if (
                          video &&
                          videoTimings[1]?.end > 0 &&
                          video.currentTime >= videoTimings[1].end
                        ) {
                          if (isPlayingBoth) {
                            video.pause();
                            setIsPlaying(false);
                            setIsPlayingBoth(false);
                          }
                        }
                      }}
                      onEnded={() => {
                        if (isPlayingBoth) {
                          setIsPlaying(false);
                          setIsPlayingBoth(false);
                        }
                      }}
                    />
                  </div>

                  {/* Overlay Controls */}
                  <Card glass className="border-white/10">
                    <CardHeader className="border-white/10">
                      <h3 className="text-lg font-semibold text-white">
                        Overlay Controls
                      </h3>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Opacity Control */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-white">
                            Overlay Opacity
                          </label>
                          <span className="text-sm text-emerald-400 font-semibold">
                            {Math.round(overlayOpacity * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={overlayOpacity}
                          onChange={e =>
                            setOverlayOpacity(parseFloat(e.target.value))
                          }
                          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          style={{
                            background: `linear-gradient(to right, rgb(16, 185, 129) 0%, rgb(16, 185, 129) ${overlayOpacity * 100}%, rgba(255, 255, 255, 0.2) ${overlayOpacity * 100}%, rgba(255, 255, 255, 0.2) 100%)`,
                          }}
                        />
                      </div>

                      {/* Video Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="glass-dark rounded-lg p-3 border border-white/10">
                          <div className="text-xs text-gray-400 mb-1">
                            Swing 1 (Background)
                          </div>
                          <div className="text-sm font-semibold text-white">
                            {videoTimings[0]?.start?.toFixed(1) || '0.0'}s -{' '}
                            {videoTimings[0]?.end?.toFixed(1) || '0.0'}s
                          </div>
                        </div>
                        <div className="glass-dark rounded-lg p-3 border border-white/10">
                          <div className="text-xs text-gray-400 mb-1">
                            Swing 2 (Overlay)
                          </div>
                          <div className="text-sm font-semibold text-white">
                            {videoTimings[1]?.start?.toFixed(1) || '0.0'}s -{' '}
                            {videoTimings[1]?.end?.toFixed(1) || '0.0'}s
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* External Video Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Swing 1 Controls */}
                    <Card glass className="border-white/10">
                      <CardHeader className="border-white/10">
                        <h4 className="text-sm font-semibold text-white">
                          Swing 1 (Background) Controls
                        </h4>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Timeline Scrubber */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>0s</span>
                            <span>
                              {videoDurations[0]?.toFixed(1) || '0.0'}s
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max={videoDurations[0] || 0}
                            step="0.1"
                            value={videoRefs.current[0]?.currentTime || 0}
                            onChange={e => {
                              const video = videoRefs.current[0];
                              if (video) {
                                video.currentTime = parseFloat(e.target.value);
                              }
                            }}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                        </div>

                        {/* Control Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const video = videoRefs.current[0];
                              if (video) {
                                const currentTime = video.currentTime;
                                setVideoTimings(prev => {
                                  const newTimings = [...prev];
                                  newTimings[0] = {
                                    ...newTimings[0],
                                    start: currentTime,
                                    end:
                                      newTimings[0]?.end ||
                                      videoDurations[0] ||
                                      0,
                                  };
                                  return newTimings;
                                });
                              }
                            }}
                            className="bg-white/5 border-white/20 text-white hover:bg-white/10 text-xs"
                          >
                            <Scissors className="h-3 w-3 mr-1" />
                            Set Start
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const video = videoRefs.current[0];
                              if (video) {
                                const currentTime = video.currentTime;
                                setVideoTimings(prev => {
                                  const newTimings = [...prev];
                                  newTimings[0] = {
                                    ...newTimings[0],
                                    start: newTimings[0]?.start || 0,
                                    end: currentTime,
                                  };
                                  return newTimings;
                                });
                              }
                            }}
                            className="bg-white/5 border-white/20 text-white hover:bg-white/10 text-xs"
                          >
                            <Scissors className="h-3 w-3 mr-1" />
                            Set End
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetTimings(0)}
                            className="text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10"
                          >
                            Reset
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Swing 2 Controls */}
                    <Card glass className="border-white/10">
                      <CardHeader className="border-white/10">
                        <h4 className="text-sm font-semibold text-white">
                          Swing 2 (Overlay) Controls
                        </h4>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Timeline Scrubber */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>0s</span>
                            <span>
                              {videoDurations[1]?.toFixed(1) || '0.0'}s
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max={videoDurations[1] || 0}
                            step="0.1"
                            value={videoRefs.current[1]?.currentTime || 0}
                            onChange={e => {
                              const video = videoRefs.current[1];
                              if (video) {
                                video.currentTime = parseFloat(e.target.value);
                              }
                            }}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                        </div>

                        {/* Control Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const video = videoRefs.current[1];
                              if (video) {
                                const currentTime = video.currentTime;
                                setVideoTimings(prev => {
                                  const newTimings = [...prev];
                                  newTimings[1] = {
                                    ...newTimings[1],
                                    start: currentTime,
                                    end:
                                      newTimings[1]?.end ||
                                      videoDurations[1] ||
                                      0,
                                  };
                                  return newTimings;
                                });
                              }
                            }}
                            className="bg-white/5 border-white/20 text-white hover:bg-white/10 text-xs"
                          >
                            <Scissors className="h-3 w-3 mr-1" />
                            Set Start
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const video = videoRefs.current[1];
                              if (video) {
                                const currentTime = video.currentTime;
                                setVideoTimings(prev => {
                                  const newTimings = [...prev];
                                  newTimings[1] = {
                                    ...newTimings[1],
                                    start: newTimings[1]?.start || 0,
                                    end: currentTime,
                                  };
                                  return newTimings;
                                });
                              }
                            }}
                            className="bg-white/5 border-white/20 text-white hover:bg-white/10 text-xs"
                          >
                            <Scissors className="h-3 w-3 mr-1" />
                            Set End
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetTimings(1)}
                            className="text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10"
                          >
                            Reset
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {selectedSwings.map((swing, index: number) => (
                    <motion.div
                      key={swing.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="space-y-4">
                        {/* Swing Info */}
                        <Card glass className="border-white/10">
                          <CardHeader className="border-white/10">
                            <div className="flex items-center justify-between">
                              <h3 className="text-base font-semibold text-white">
                                Swing {index + 1}
                              </h3>
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  videoTimings[index]?.start > 0 ||
                                  videoTimings[index]?.end > 0
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'text-gray-500 bg-white/5 border border-white/10'
                                }`}
                              >
                                {videoTimings[index]?.start?.toFixed(1) ||
                                  '0.0'}
                                s -{' '}
                                {videoTimings[index]?.end?.toFixed(1) || '0.0'}s
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Control buttons */}
                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const video = videoRefs.current[index];
                                  if (video) {
                                    const currentTime = video.currentTime;
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
                                className="bg-white/5 border-white/20 text-white hover:bg-white/10 text-xs"
                              >
                                <Scissors className="h-3 w-3 mr-1" />
                                Set Start
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const video = videoRefs.current[index];
                                  if (video) {
                                    const currentTime = video.currentTime;
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
                                className="bg-white/5 border-white/20 text-white hover:bg-white/10 text-xs"
                              >
                                <Scissors className="h-3 w-3 mr-1" />
                                Set End
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResetTimings(index)}
                                className="text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10"
                              >
                                Reset
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="bg-black rounded-xl overflow-hidden border border-white/10 aspect-video">
                          {(() => {
                            const videoUrl =
                              swing.videoUrl ||
                              swing.video_url ||
                              swing.file_url;
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
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-950/50 to-black">
                                <Play className="h-12 w-12 text-emerald-400" />
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

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
