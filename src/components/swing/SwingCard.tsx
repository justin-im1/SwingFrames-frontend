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
  showActions?: boolean;
}

export default function SwingCard({
  swing,
  onSelect,
  onDelete,
  onAnalyze,
  isSelected = false,
  showActions = true,
}: SwingCardProps) {
  const [videoError, setVideoError] = useState(false);
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
        className={`border-none rounded-lg shadow-sm hover:shadow-lg transition-all ${
          isSelected ? 'ring-2 ring-green-500' : ''
        }`}
        hover
      >
        <CardContent className="p-0">
          {/* Video Preview */}
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
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
              <div className="w-full h-full flex items-center justify-center bg-red-50">
                <div className="text-center">
                  <Play className="h-8 w-8 text-red-400 mx-auto mb-2" />
                  <p className="text-xs text-red-600">Video unavailable</p>
                </div>
              </div>
            ) : swing.thumbnailUrl ? (
              <img
                src={swing.thumbnailUrl}
                alt={swing.title || 'Swing Video'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                <Play className="h-12 w-12 text-green-400" />
              </div>
            )}

            {/* Checkbox overlay for selection - hover only */}
            <button
              aria-label="Select swing"
              className={`absolute top-2 left-2 h-6 w-6 rounded-md border transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 hover:cursor-pointer ${
                isSelected
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-black/50 border-white/60 text-white'
              }`}
              onClick={e => {
                e.stopPropagation();
                onSelect?.(swing);
              }}
            >
              {isSelected ? '✓' : ''}
            </button>
          </div>

          {/* Action buttons - top right, on hover */}
          {showActions && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
              {onAnalyze && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    onAnalyze(swing);
                  }}
                  aria-label="Analyze swing"
                  className="h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white hover:text-white hover:cursor-pointer"
                >
                  <Zap className="h-3 w-3 text-yellow-400" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                aria-label="Delete swing"
                disabled={deleteSwingMutation.isPending}
                className="h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white hover:text-white hover:cursor-pointer"
              >
                <Trash2 className="h-3 w-3 text-red-400" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
