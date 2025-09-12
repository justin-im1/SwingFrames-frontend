import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OverlaySettings } from '../../types';

interface OverlayState {
  settings: OverlaySettings;
  isOverlayMode: boolean;
  syncEnabled: boolean;
}

const initialState: OverlayState = {
  settings: {
    opacity: 0.5,
    syncPlayback: true,
    showTimeline: true,
    highlightDifferences: false,
  },
  isOverlayMode: false,
  syncEnabled: true,
};

const overlaySlice = createSlice({
  name: 'overlay',
  initialState,
  reducers: {
    setOverlayMode: (state, action: PayloadAction<boolean>) => {
      state.isOverlayMode = action.payload;
    },
    updateSettings: (
      state,
      action: PayloadAction<Partial<OverlaySettings>>
    ) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    setOpacity: (state, action: PayloadAction<number>) => {
      state.settings.opacity = Math.max(0, Math.min(1, action.payload));
    },
    toggleSyncPlayback: state => {
      state.settings.syncPlayback = !state.settings.syncPlayback;
      state.syncEnabled = state.settings.syncPlayback;
    },
    toggleTimeline: state => {
      state.settings.showTimeline = !state.settings.showTimeline;
    },
    toggleHighlightDifferences: state => {
      state.settings.highlightDifferences =
        !state.settings.highlightDifferences;
    },
    resetSettings: state => {
      state.settings = initialState.settings;
    },
  },
});

export const {
  setOverlayMode,
  updateSettings,
  setOpacity,
  toggleSyncPlayback,
  toggleTimeline,
  toggleHighlightDifferences,
  resetSettings,
} = overlaySlice.actions;

export default overlaySlice.reducer;
