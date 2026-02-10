import { createSlice } from '@reduxjs/toolkit';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  title?: string;
}

interface UiState {
  toasts: Toast[];
  sidebarOpen: boolean;
}

const initialState: UiState = {
  toasts: [],
  sidebarOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast: (state, action) => {
      state.toasts.push({
        id: crypto.randomUUID(),
        ...action.payload,
      });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { addToast, removeToast, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
