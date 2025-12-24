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

export default function LibraryPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoaded, isSignedIn } = useAuth();
  const selectSwingsState = (state: RootState): SwingsState =>
    state.swings as SwingsState;
  const swingsState = useAppSelector(selectSwingsState);
  const { library, selectedSwings, loading } = swingsState;
  const api = useAuthenticatedApi();

  useEffect(() => {
    const loadLibrary = async () => {
      // Only load if authentication is ready and user is signed in
      if (!isLoaded || !isSignedIn) {
        return;
      }

      try {
        dispatch(setLoading(true));
        dispatch(setError(null));
        const swingsApi = await api.swings();
        const res = await swingsApi.getLibrary(1, 20);
        // Handle both array response and object with data property
        const swingsData = Array.isArray(res) ? res : res?.data || [];
        dispatch(setLibrary(swingsData));
        dispatch(setLoading(false));
      } catch (error) {
        // Silently handle network errors - API server might not be running
        // Just show empty state instead of error message
        if (error instanceof Error) {
          const isNetworkError =
            error.message.includes('Failed to fetch') ||
            error.message.includes('Network error') ||
            error.message.includes('Unable to connect');

          if (isNetworkError) {
            // Silently set empty library for network errors
            dispatch(setLibrary([]));
          } else {
            // Only show error for non-network issues
            dispatch(setError('Failed to load swings'));
          }
        } else {
          dispatch(setLibrary([]));
        }
        dispatch(setLoading(false));
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
      // Deselect if already selected
      dispatch(deselectSwing(swing.id));
    } else {
      // Only allow selecting if less than 2 swings are already selected
      if (selectedSwings.length < 2) {
        dispatch(selectSwing(swing.id));
      }
      // If 2 swings are already selected, do nothing (user needs to deselect first)
    }
  };

  const handleCompare = () => {
    if (selectedSwings.length === 2) {
      router.push('/compare');
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl md:text-5xl font-black text-white">
                    Swing Library
                  </h1>
                  <span className="inline-flex items-center text-sm px-3 py-1 rounded-full glass-dark border border-emerald-500/30 text-emerald-400 font-semibold">
                    {library.length}
                  </span>
                </div>
                <p className="text-gray-400 text-lg">
                  Your uploaded swing videos
                </p>
              </div>

              <div className="flex space-x-3 mt-4 sm:mt-0">
                <Button
                  onClick={() => router.push('/upload')}
                  className="flex items-center bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Swing
                </Button>
              </div>
            </div>
          </div>

          {selectedSwings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className="glass-dark rounded-2xl shadow-2xl border border-white/10 px-6 py-4 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  {selectedSwings.length === 2 ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          2 swings selected
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleCompare}
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium border-0"
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Compare Swings
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dispatch(clearSelection())}
                          className="text-gray-400 hover:text-white px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10"
                        >
                          Clear
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-400">
                          {selectedSwings.length} of 2 swings selected
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dispatch(clearSelection())}
                          className="text-gray-400 hover:text-white px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10"
                        >
                          Clear
                        </Button>
                      </div>
                    </>
                  )}
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
                <p className="text-gray-400">Loading authentication...</p>
              </motion.div>
            ) : loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-400">Loading swings…</p>
              </motion.div>
            ) : filteredSwings.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredSwings.map((swing: Swing, index: number) => (
                  <motion.div
                    key={swing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SwingCard
                      swing={swing}
                      onSelect={handleSwingSelect}
                      isSelected={selectedSwings.includes(swing.id)}
                      isDisabled={
                        selectedSwings.length >= 2 &&
                        !selectedSwings.includes(swing.id)
                      }
                      showActions={true}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 glass-dark rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                  <Plus className="h-12 w-12 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  No swings found
                </h3>
                <p className="text-gray-400 mb-6 text-base">
                  Upload your first golf swing to get started
                </p>
                <Button
                  onClick={() => router.push('/upload')}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0"
                >
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
