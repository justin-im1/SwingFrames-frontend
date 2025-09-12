import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '../../types';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
}

const initialState: UIState = {
  sidebarOpen: false,
  theme: 'light',
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: state => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: state => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: `notification-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        n => n.id !== action.payload
      );
    },
    clearNotifications: state => {
      state.notifications = [];
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  toggleTheme,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;
