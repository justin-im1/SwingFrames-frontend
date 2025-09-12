'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { PoseVisualizationProps } from '../../types';
import {
  Eye,
  EyeOff,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';

// MediaPipe Pose landmark connections for skeleton drawing
const POSE_CONNECTIONS = [
  // Face
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 7],
  [0, 4],
  [4, 5],
  [5, 6],
  [6, 8],
  // Torso
  [9, 10],
  [11, 12],
  [11, 13],
  [13, 15],
  [15, 17],
  [15, 19],
  [15, 21],
  [17, 19],
  [12, 14],
  [14, 16],
  [16, 18],
  [16, 20],
  [16, 22],
  [18, 20],
  [11, 23],
  [12, 24],
  [23, 24],
  // Arms
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  // Legs
  [23, 25],
  [25, 27],
  [27, 29],
  [29, 31],
  [27, 31],
  [24, 26],
  [26, 28],
  [28, 30],
  [30, 32],
  [28, 32],
];

const LANDMARK_NAMES = [
  'nose',
  'left_eye_inner',
  'left_eye',
  'left_eye_outer',
  'right_eye_inner',
  'right_eye',
  'right_eye_outer',
  'left_ear',
  'right_ear',
  'mouth_left',
  'mouth_right',
  'left_shoulder',
  'right_shoulder',
  'left_elbow',
  'right_elbow',
  'left_wrist',
  'right_wrist',
  'left_pinky',
  'right_pinky',
  'left_index',
  'right_index',
  'left_thumb',
  'right_thumb',
  'left_hip',
  'right_hip',
  'left_knee',
  'right_knee',
  'left_ankle',
  'right_ankle',
  'left_heel',
  'right_heel',
  'left_foot_index',
  'right_foot_index',
];

export default function PoseVisualization({
  snapshotUrl,
  landmarks,
  showLandmarks = true,
  highlightPart,
}: PoseVisualizationProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [imageError, setImageError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Draw skeleton overlay on canvas
  useEffect(() => {
    if (!canvasRef.current || !imageRef.current || !landmarks || !showSkeleton)
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = imageRef.current.naturalWidth;
    canvas.height = imageRef.current.naturalHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const startLandmark = landmarks[startIdx];
      const endLandmark = landmarks[endIdx];

      if (
        startLandmark &&
        endLandmark &&
        startLandmark.visibility > 0.5 &&
        endLandmark.visibility > 0.5
      ) {
        ctx.beginPath();
        ctx.moveTo(
          startLandmark.x * canvas.width,
          startLandmark.y * canvas.height
        );
        ctx.lineTo(endLandmark.x * canvas.width, endLandmark.y * canvas.height);
        ctx.stroke();
      }
    });

    // Draw landmarks
    if (showLandmarks) {
      landmarks.forEach((landmark, index) => {
        if (landmark.visibility > 0.5) {
          const x = landmark.x * canvas.width;
          const y = landmark.y * canvas.height;

          // Highlight specific part if requested
          const isHighlighted =
            highlightPart &&
            LANDMARK_NAMES[index]?.includes(highlightPart.toLowerCase());

          ctx.fillStyle = isHighlighted ? '#ff0000' : '#00ff00';
          ctx.beginPath();
          ctx.arc(x, y, isHighlighted ? 6 : 4, 0, 2 * Math.PI);
          ctx.fill();

          // Draw landmark index
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Arial';
          ctx.fillText(index.toString(), x + 8, y - 8);
        }
      });
    }
  }, [landmarks, showSkeleton, showLandmarks, highlightPart]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (imageError) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="text-gray-400 mb-4">⚠️</div>
            <p className="text-gray-600">Failed to load pose visualization</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isFullscreen ? 'fixed inset-0 z-50 m-0 rounded-none' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Pose Visualization</h3>
            <p className="text-sm text-gray-600">
              Interactive skeleton overlay analysis
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSkeleton(!showSkeleton)}
              className="flex items-center"
            >
              {showSkeleton ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              {showSkeleton ? 'Hide' : 'Show'} Skeleton
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative overflow-hidden rounded-lg bg-gray-100">
          <div
            className="relative"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            <img
              ref={imageRef}
              src={snapshotUrl}
              alt="Pose analysis snapshot"
              className="w-full h-auto"
              onError={() => setImageError(true)}
              onLoad={() => {
                // Trigger canvas redraw when image loads
                if (canvasRef.current && landmarks) {
                  const canvas = canvasRef.current;
                  const ctx = canvas.getContext('2d');
                  if (ctx && imageRef.current) {
                    canvas.width = imageRef.current.naturalWidth;
                    canvas.height = imageRef.current.naturalHeight;
                  }
                }
              }}
            />

            {landmarks && showSkeleton && (
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: 'none' }}
              />
            )}
          </div>
        </div>

        {landmarks && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Landmark Information
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {landmarks.slice(0, 8).map((landmark, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">
                    {LANDMARK_NAMES[index] || `Point ${index}`}:
                  </span>
                  <span className="text-gray-900">
                    {(landmark.visibility * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
