import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Swing, Comparison } from '../../types';

interface SwingsState {
  library: Swing[];
  selectedSwings: string[];
  currentComparison: Comparison | null;
  loading: boolean;
  error: string | null;
}

const initialState: SwingsState = {
  library: [],
  selectedSwings: [],
  currentComparison: null,
  loading: false,
  error: null,
};

const swingsSlice = createSlice({
  name: 'swings',
  initialState,
  reducers: {
    setLibrary: (state, action: PayloadAction<Swing[]>) => {
      state.library = action.payload;
      state.loading = false;
      state.error = null;
    },
    addSwing: (state, action: PayloadAction<Swing>) => {
      state.library.unshift(action.payload);
    },
    updateSwing: (state, action: PayloadAction<Swing>) => {
      const index = state.library.findIndex(
        swing => swing.id === action.payload.id
      );
      if (index !== -1) {
        state.library[index] = action.payload;
      }
    },
    removeSwing: (state, action: PayloadAction<string>) => {
      state.library = state.library.filter(
        swing => swing.id !== action.payload
      );
      state.selectedSwings = state.selectedSwings.filter(
        id => id !== action.payload
      );
    },
    selectSwing: (state, action: PayloadAction<string>) => {
      if (!state.selectedSwings.includes(action.payload)) {
        state.selectedSwings.push(action.payload);
      }
    },
    deselectSwing: (state, action: PayloadAction<string>) => {
      state.selectedSwings = state.selectedSwings.filter(
        id => id !== action.payload
      );
    },
    clearSelection: state => {
      state.selectedSwings = [];
    },
    setCurrentComparison: (state, action: PayloadAction<Comparison | null>) => {
      state.currentComparison = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setLibrary,
  addSwing,
  updateSwing,
  removeSwing,
  selectSwing,
  deselectSwing,
  clearSelection,
  setCurrentComparison,
  setLoading,
  setError,
} = swingsSlice.actions;

export default swingsSlice.reducer;
