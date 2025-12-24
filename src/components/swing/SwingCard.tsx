'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Trash2, Zap } from 'lucide-react';
import { Swing } from '../../types';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { useDeleteSwing } from '../../hooks/useSwings';
import { useAppDispatch } from '../../lib/store';
import { removeSwing } from '../../features/swings/swingsSlice';

interface SwingCardProps {
  swing: Swing;
  onSelect?: (swing: Swing) => void;
  onDelete?: (swingId: string) => void;
  onAnalyze?: (swing: Swing) => void;
  isSelected?: boolean;
  isDisabled?: boolean;
  showActions?: boolean;
}

export default function SwingCard({
  swing,
  onSelect,
  onDelete,
  onAnalyze,
  isSelected = false,
  isDisabled = false,
  showActions = true,
}: SwingCardProps) {
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const deleteSwingMutation = useDeleteSwing();
  const dispatch = useAppDispatch();

  // Get the video URL and log it for debugging
  const videoUrl = swing.videoUrl || swing.video_url || swing.file_url;
  const isValidUrl = videoUrl && videoUrl.startsWith('http');

  // Test URL accessibility

  // Video format test removed - issue confirmed as S3 Content-Type

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await deleteSwingMutation.mutateAsync(swing.id);
      // Remove from Redux state immediately
      dispatch(removeSwing(swing.id));
      // Call the onDelete prop if provided (for any additional cleanup)
      onDelete?.(swing.id);
    } catch (error) {
      console.error('Failed to delete swing:', error);
      alert('Failed to delete swing. Please try again.');
    }
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card
        glass
        className={`border-white/10 rounded-2xl shadow-lg transition-all ${
          isDisabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:shadow-xl cursor-pointer'
        } ${isSelected ? 'ring-2 ring-emerald-500 border-emerald-500/40' : ''}`}
        hover={!isDisabled}
        onClick={() => !isDisabled && onSelect?.(swing)}
      >
        <CardContent className="p-0">
          {/* Video Preview */}
          <div className="relative aspect-video bg-black rounded-t-2xl overflow-hidden border-b border-white/10">
            {isValidUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                style={{
                  minWidth: '100%',
                  minHeight: '100%',
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
                muted
                preload="metadata"
                playsInline
                controls={true}
                onPlay={() => {
                  console.log(
                    '🎵 Video play event fired - audio should be playing'
                  );
                  console.log('📐 Video dimensions:', {
                    videoWidth: videoRef.current?.videoWidth,
                    videoHeight: videoRef.current?.videoHeight,
                    clientWidth: videoRef.current?.clientWidth,
                    clientHeight: videoRef.current?.clientHeight,
                    offsetWidth: videoRef.current?.offsetWidth,
                    offsetHeight: videoRef.current?.offsetHeight,
                  });

                  // Check for overlaying elements
                  if (videoRef.current) {
                    const rect = videoRef.current.getBoundingClientRect();
                    console.log('📍 Video position:', {
                      top: rect.top,
                      left: rect.left,
                      width: rect.width,
                      height: rect.height,
                    });

                    // Check if video has any content
                    console.log(
                      '🎬 Video current time:',
                      videoRef.current.currentTime
                    );
                    console.log(
                      '🎬 Video duration:',
                      videoRef.current.duration
                    );
                  }

                  setIsPlaying(true);
                }}
                onPause={() => {
                  console.log('⏸️ Video pause event fired');
                  setIsPlaying(false);
                }}
                onEnded={() => {
                  setIsPlaying(false);
                }}
                onError={e => {
                  setVideoError(true);
                }}
              />
            ) : videoError ? (
              <div className="w-full h-full flex items-center justify-center bg-red-950/20 border border-red-500/20">
                <div className="text-center">
                  <Play className="h-8 w-8 text-red-400 mx-auto mb-2" />
                  <p className="text-xs text-red-400">Video unavailable</p>
                </div>
              </div>
            ) : swing.thumbnailUrl ? (
              <img
                src={swing.thumbnailUrl}
                alt={swing.title || 'Swing Video'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-950/50 to-black">
                <Play className="h-12 w-12 text-emerald-400" />
              </div>
            )}

            {/* Checkbox overlay for selection */}
            <button
              aria-label="Select swing"
              className={`absolute top-3 left-3 h-7 w-7 rounded-lg border-2 transition-all flex items-center justify-center font-bold ${
                isSelected
                  ? 'bg-emerald-500 border-emerald-500 text-white opacity-100 scale-110'
                  : 'glass-dark border-white/60 text-white opacity-0 group-hover:opacity-100 hover:scale-110'
              }`}
              onClick={e => {
                e.stopPropagation();
                onSelect?.(swing);
              }}
            >
              {isSelected ? '✓' : ''}
            </button>

            {/* Action buttons - top right, on hover */}
            {showActions && (
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                {onAnalyze && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation();
                      onAnalyze(swing);
                    }}
                    aria-label="Analyze swing"
                    className="h-8 w-8 p-0 glass-dark hover:bg-emerald-500/20 border border-white/20"
                  >
                    <Zap className="h-4 w-4 text-emerald-400" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  aria-label="Delete swing"
                  disabled={deleteSwingMutation.isPending}
                  className="h-8 w-8 p-0 glass-dark hover:bg-red-500/20 border border-white/20"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            )}
          </div>

          {/* Card Footer with Date */}
          <div className="p-4">
            <div className="text-sm text-gray-400">
              {formatDate(swing.createdAt || swing.created_at)}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
