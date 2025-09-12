'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { SnapshotGridProps } from '../../types';
import { Loader2, AlertCircle, Eye } from 'lucide-react';

const swingEvents = [
  {
    key: 'setup',
    label: 'Setup',
    description: 'Initial stance and grip position',
  },
  {
    key: 'top_backswing',
    label: 'Top of Backswing',
    description: 'Maximum backswing position',
  },
  { key: 'impact', label: 'Impact', description: 'Club-ball contact moment' },
  {
    key: 'follow_through',
    label: 'Follow Through',
    description: 'Post-impact swing completion',
  },
] as const;

export default function SnapshotGrid({
  snapshots,
  loading = false,
  error,
  onSnapshotClick,
}: SnapshotGridProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (eventKey: string) => {
    setImageErrors(prev => ({ ...prev, [eventKey]: true }));
  };

  const handleImageClick = (eventKey: string, url: string) => {
    if (onSnapshotClick) {
      onSnapshotClick(eventKey, url);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Pose Analysis Snapshots</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-gray-600">
                Generating pose analysis snapshots...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This may take 1-5 minutes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Pose Analysis Snapshots</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-medium">
                Failed to generate snapshots
              </p>
              <p className="text-sm text-gray-500 mt-2">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Pose Analysis Snapshots</h3>
        <p className="text-sm text-gray-600">
          Key swing events with skeleton overlay analysis
        </p>
      </CardHeader>
      <CardContent>
        {/* Debug URLs */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Debug - Snapshot URLs:
          </h4>
          <div className="text-xs space-y-1">
            {Object.entries(snapshots).map(([key, url]) => (
              <div key={key}>
                <strong>{key}:</strong>{' '}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {url}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {swingEvents.map((event, index) => {
            const snapshotUrl = snapshots[event.key as keyof typeof snapshots];
            const hasError = imageErrors[event.key];

            return (
              <motion.div
                key={event.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    snapshotUrl ? 'hover:ring-2 hover:ring-green-500' : ''
                  }`}
                  onClick={() =>
                    snapshotUrl && handleImageClick(event.key, snapshotUrl)
                  }
                >
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3 relative">
                      {snapshotUrl && !hasError ? (
                        <>
                          <img
                            src={snapshotUrl}
                            alt={`${event.label} pose analysis`}
                            className="w-full h-full object-cover"
                            onError={e => {
                              console.error(
                                `Failed to load image for ${event.key}:`,
                                snapshotUrl
                              );
                              console.error('Image error:', e);
                              handleImageError(event.key);
                            }}
                            onLoad={() => {
                              console.log(
                                `Successfully loaded image for ${event.key}:`,
                                snapshotUrl
                              );
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                            <Eye className="h-6 w-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <div className="text-center">
                            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">
                              {hasError
                                ? 'Image failed to load'
                                : 'No snapshot available'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        {event.label}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {event.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
