import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceApi } from '../../api/attendance';
import { format, subDays } from 'date-fns';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  type: 'in' | 'out';
  timestamp: string;
}

interface AttendanceState {
  history: AttendanceRecord[];
  monitoring: AttendanceRecord[];
  meta: { total: number; page: number; limit: number; totalPages: number } | null;
  loading: boolean;
  error: string | null;
}

const initialState: AttendanceState = {
  history: [],
  monitoring: [],
  meta: null,
  loading: false,
  error: null,
};

export const fetchHistory = createAsyncThunk(
  'attendance/fetchHistory',
  async (
    params: { startDate?: string; endDate?: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await attendanceApi.getHistory(params);
      return res.data;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      return rejectWithValue(msg || 'Failed to fetch history');
    }
  }
);

export const fetchMonitoring = createAsyncThunk(
  'attendance/fetchMonitoring',
  async (params: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const res = await attendanceApi.getMonitoring(params);
      return res.data;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      return rejectWithValue(msg || 'Failed to fetch monitoring');
    }
  }
);

export const checkInOut = createAsyncThunk(
  'attendance/checkInOut',
  async (type: 'in' | 'out', { dispatch, rejectWithValue }) => {
    try {
      const res = await attendanceApi.checkInOut(type);

      dispatch(
        fetchHistory({
          startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
          endDate: format(new Date(), 'yyyy-MM-dd'),
          page: 1,
          limit: 50,
        })
      );

      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    appendMonitoring: (state, action) => {
      state.monitoring = [action.payload, ...state.monitoring];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.data;
        state.meta = action.payload.meta;
        state.error = null;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed';
      })
      .addCase(fetchMonitoring.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMonitoring.fulfilled, (state, action) => {
        state.loading = false;
        state.monitoring = action.payload.data;
        state.error = null;
      })
      .addCase(fetchMonitoring.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed';
      })
      .addCase(checkInOut.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(checkInOut.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed';
      });
  },
});

export const { clearError, appendMonitoring } = attendanceSlice.actions;
export default attendanceSlice.reducer;
