'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Plus, BarChart3 } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import SwingCard from '../../components/swing/SwingCard';
import Button from '../../components/ui/Button';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useAppSelector, useAppDispatch, RootState } from '../../lib/store';
import {
  selectSwing,
  deselectSwing,
  clearSelection,
  setLibrary,
  setLoading,
  setError,
} from '../../features/swings/swingsSlice';
import { Swing, SwingsState } from '../../types';
import { useAuthenticatedApi } from '../../hooks/useAuthenticatedApi';
import { useAuth } from '@clerk/nextjs';

type ViewMode = 'grid' | 'list';

export default function LibraryPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoaded, isSignedIn } = useAuth();
  const selectSwingsState = (state: RootState): SwingsState =>
    state.swings as SwingsState;
  const swingsState = useAppSelector(selectSwingsState);
  const { library, selectedSwings, loading } = swingsState;
  const api = useAuthenticatedApi();

  // State for view mode
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    const loadLibrary = async () => {
      // Only load if authentication is ready and user is signed in
      if (!isLoaded || !isSignedIn) {
        return;
      }

      try {
        dispatch(setLoading(true));
        const swingsApi = await api.swings();
        const res = await swingsApi.getLibrary(1, 20);
        // Handle both array response and object with data property
        const swingsData = Array.isArray(res) ? res : res?.data || [];
        dispatch(setLibrary(swingsData));
      } catch {
        dispatch(setError('Failed to load swings'));
      }
    };
    loadLibrary();
  }, [isLoaded, isSignedIn, api, dispatch]);

  const filteredSwings = library.filter((swing: Swing) => {
    // Add null checks to prevent errors
    if (!swing) return false;
    return true;
  });

  const handleSwingSelect = (swing: Swing) => {
    if (selectedSwings.includes(swing.id)) {
      dispatch(deselectSwing(swing.id));
    } else {
      dispatch(selectSwing(swing.id));
    }
  };

  const handleCompare = () => {
    if (selectedSwings.length >= 2) {
      router.push('/compare');
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Swing Library
                </h1>
                <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {library.length}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Your uploaded swing videos
              </p>
            </div>

            <div className="flex space-x-2 mt-4 sm:mt-0">
              <Button
                onClick={() => router.push('/upload')}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Swing
              </Button>
            </div>
          </div>

          {selectedSwings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 px-6 py-4 backdrop-blur-sm bg-white/95">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      {selectedSwings.length} swing
                      {selectedSwings.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleCompare}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      disabled={selectedSwings.length < 2}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Compare ({selectedSwings.length})
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dispatch(clearSelection())}
                      className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Swings Grid/List */}
          <AnimatePresence mode="wait">
            {!isLoaded ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-600">Loading authentication...</p>
              </motion.div>
            ) : loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-600">Loading swings…</p>
              </motion.div>
            ) : filteredSwings.length > 0 ? (
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                    : 'space-y-3'
                }
              >
                {filteredSwings.map((swing: Swing) => (
                  <SwingCard
                    key={swing.id}
                    swing={swing}
                    onSelect={handleSwingSelect}
                    isSelected={selectedSwings.includes(swing.id)}
                    showActions={true}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No swings found
                </h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Upload your first golf swing to get started
                </p>
                <Button onClick={() => router.push('/upload')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Your First Swing
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Footer stats removed for a cleaner, lighter UI */}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
