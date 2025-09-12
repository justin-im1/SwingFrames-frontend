import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import userSlice from '../features/user/userSlice';
import swingsSlice from '../features/swings/swingsSlice';
import overlaySlice from '../features/overlay/overlaySlice';
import uiSlice from '../features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    user: userSlice,
    swings: swingsSlice,
    overlay: overlaySlice,
    ui: uiSlice,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
