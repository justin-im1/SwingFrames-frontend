'use client';

import { useRef, useState, useCallback, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
} from 'lucide-react';
import Button from '../ui/Button';
import { SuspenseBoundary, VideoLoadingFallback } from '../SuspenseBoundary';

interface ModernVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  onTimeUpdate?: (currentTime: number) => void;
  onLoadedMetadata?: (duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
}

export default function ModernVideoPlayer({
  src,
  poster,
  className = '',
  onTimeUpdate,
  onLoadedMetadata,
  onPlay,
  onPause,
}: ModernVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [showControls, setShowControls] = useState(false);

  const handlePlayPause = useCallback(() => {
    startTransition(() => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
          onPause?.();
        } else {
          videoRef.current.play();
          onPlay?.();
        }
        setIsPlaying(!isPlaying);
      }
    });
  }, [isPlaying, onPlay, onPause]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);
    }
  }, [onTimeUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      onLoadedMetadata?.(videoDuration);
    }
  }, [onLoadedMetadata]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newTime = parseFloat(e.target.value);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleReset = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  }, []);

  const handleFullscreen = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <SuspenseBoundary fallback={<VideoLoadingFallback />}>
      <div
        className={`relative group ${className}`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full h-full object-cover rounded-lg"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          muted={isMuted}
          preload="metadata"
        />

        {/* Overlay Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center"
            >
              <div className="flex items-center space-x-3">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handlePlayPause}
                  disabled={isPending}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>

                <Button variant="secondary" size="lg" onClick={handleReset}>
                  <RotateCcw className="h-5 w-5" />
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleMuteToggle}
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleFullscreen}
                >
                  <Maximize2 className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4"
            >
              <div className="flex items-center space-x-3">
                <span className="text-white text-sm font-mono">
                  {formatTime(currentTime)}
                </span>

                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />

                <span className="text-white text-sm font-mono">
                  {formatTime(duration)}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SuspenseBoundary>
  );
}
