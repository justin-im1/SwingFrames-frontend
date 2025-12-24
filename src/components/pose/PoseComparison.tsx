'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { PoseComparisonProps } from '../../types';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const swingEvents = [
  { key: 'setup', label: 'Setup' },
  { key: 'top_backswing', label: 'Top of Backswing' },
  { key: 'follow_through', label: 'Follow Through' },
] as const;

export default function PoseComparison({
  swing1,
  swing2,
  alignmentType = 'setup',
}: PoseComparisonProps) {
  const [currentEvent, setCurrentEvent] = useState<
    'setup' | 'top_backswing' | 'follow_through'
  >(alignmentType);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (swingId: string, eventKey: string) => {
    setImageErrors(prev => ({ ...prev, [`${swingId}-${eventKey}`]: true }));
  };

  const handleEventChange = (eventKey: string) => {
    setCurrentEvent(eventKey as 'setup' | 'top_backswing' | 'follow_through');
  };

  const getSnapshotUrl = (swing: typeof swing1, eventKey: string) => {
    return swing.snapshots[eventKey as keyof typeof swing.snapshots];
  };

  const hasError = (swingId: string, eventKey: string) => {
    return imageErrors[`${swingId}-${eventKey}`];
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Event Selector */}
      <Card glass className="border-white/10">
        <CardHeader className="border-white/10">
          <h3 className="text-lg font-semibold text-white">Pose Comparison</h3>
          <p className="text-sm text-gray-400">
            Compare swing poses at different events
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {swingEvents.map(event => (
              <Button
                key={event.key}
                variant={currentEvent === event.key ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleEventChange(event.key)}
                className={`flex items-center ${
                  currentEvent === event.key
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0'
                    : 'bg-white/5 backdrop-blur-sm border-white/20 text-white hover:bg-white/10'
                }`}
              >
                {event.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Swing 1 */}
        <motion.div
          key={`swing1-${currentEvent}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card glass className="border-white/10">
            <CardHeader className="border-white/10">
              <h4 className="text-lg font-semibold text-white">Swing 1</h4>
              <p className="text-sm text-gray-400">
                {swingEvents.find(e => e.key === currentEvent)?.label}
              </p>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-black rounded-lg overflow-hidden border border-white/10">
                {(() => {
                  const snapshotUrl = getSnapshotUrl(swing1, currentEvent);
                  const hasImageError = hasError(swing1.swing_id, currentEvent);

                  if (snapshotUrl && !hasImageError) {
                    return (
                      <img
                        src={snapshotUrl}
                        alt={`Swing 1 - ${currentEvent}`}
                        className="w-full h-full object-cover"
                        onError={() =>
                          handleImageError(swing1.swing_id, currentEvent)
                        }
                      />
                    );
                  }

                  return (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-950/50 to-black">
                      <div className="text-center">
                        <div className="text-emerald-400 mb-2 text-2xl">
                          {hasImageError ? '⚠️' : '📷'}
                        </div>
                        <p className="text-sm text-gray-400">
                          {hasImageError
                            ? 'Image failed to load'
                            : 'No snapshot available'}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Swing 2 */}
        <motion.div
          key={`swing2-${currentEvent}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card glass className="border-white/10">
            <CardHeader className="border-white/10">
              <h4 className="text-lg font-semibold text-white">Swing 2</h4>
              <p className="text-sm text-gray-400">
                {swingEvents.find(e => e.key === currentEvent)?.label}
              </p>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-black rounded-lg overflow-hidden border border-white/10">
                {(() => {
                  const snapshotUrl = getSnapshotUrl(swing2, currentEvent);
                  const hasImageError = hasError(swing2.swing_id, currentEvent);

                  if (snapshotUrl && !hasImageError) {
                    return (
                      <img
                        src={snapshotUrl}
                        alt={`Swing 2 - ${currentEvent}`}
                        className="w-full h-full object-cover"
                        onError={() =>
                          handleImageError(swing2.swing_id, currentEvent)
                        }
                      />
                    );
                  }

                  return (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-950/50 to-black">
                      <div className="text-center">
                        <div className="text-emerald-400 mb-2 text-2xl">
                          {hasImageError ? '⚠️' : '📷'}
                        </div>
                        <p className="text-sm text-gray-400">
                          {hasImageError
                            ? 'Image failed to load'
                            : 'No snapshot available'}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Navigation Controls */}
      <Card glass className="border-white/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentIndex = swingEvents.findIndex(
                  e => e.key === currentEvent
                );
                const prevIndex =
                  currentIndex > 0 ? currentIndex - 1 : swingEvents.length - 1;
                setCurrentEvent(swingEvents[prevIndex].key);
              }}
              className="flex items-center bg-white/5 backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="text-center">
              <p className="text-sm font-medium text-white">
                {swingEvents.find(e => e.key === currentEvent)?.label}
              </p>
              <p className="text-xs text-gray-400">
                {swingEvents.findIndex(e => e.key === currentEvent) + 1} of{' '}
                {swingEvents.length}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentIndex = swingEvents.findIndex(
                  e => e.key === currentEvent
                );
                const nextIndex =
                  currentIndex < swingEvents.length - 1 ? currentIndex + 1 : 0;
                setCurrentEvent(swingEvents[nextIndex].key);
              }}
              className="flex items-center bg-white/5 backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
