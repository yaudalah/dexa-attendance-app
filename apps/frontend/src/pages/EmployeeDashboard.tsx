import { useEffect, useState } from 'react';
import {
  User,
  LogIn,
  LogOut,
  Calendar, Upload,
  Pencil
} from 'lucide-react';
import { format, startOfMonth } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchHistory,
  checkInOut,
  clearError,
} from '../store/slices/attendanceSlice';
import { Employee, employeeApi } from '../api/employee';
import { addToast } from '../store/slices/uiSlice';
import EmployeeModal from '../components/EmployeeModal';
import AppHeader from '../components/layout/AppHeader';

export default function EmployeeDashboard() {
  const dispatch = useAppDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [user, setUser] = useState<Employee>({} as Employee);
  const { history, loading, error } = useAppSelector((s) => s.attendance);
  const [startDate, setStartDate] = useState(
    format(startOfMonth(new Date()), 'yyyy-MM-dd')
  );

  const [endDate, setEndDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [uploading, setUploading] = useState(false);

  const loadMyData = async (): Promise<{ user: Employee; }> => {
    const res = await employeeApi.getMe();
    const data = { ...res?.data?.data };
    setUser(data || {});
    return { user: data || {} };
  };

  useEffect(() => {
    dispatch(
      fetchHistory({ startDate, endDate, page: 1, limit: 50 })
    );
  }, [dispatch, startDate, endDate]);

  useEffect(() => {
    loadMyData();
  }, []);

  const handleCheckIn = () => dispatch(checkInOut('in'));
  const handleCheckOut = () => dispatch(checkInOut('out'));

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const maxPhotoUploadSize: number = 5 * 1024 * 1024; // 5MB
    if (file.size > maxPhotoUploadSize) {
      dispatch(
        addToast({
          message: 'File size must not exceed 5MB',
          type: 'error',
        })
      );
      return;
    }
    setUploading(true);
    try {
      const res = await employeeApi.uploadPhoto(user.id, file);
      dispatch(addToast({ message: 'Photo updated', type: 'success' }));
      setUser(res.data.data);
    } catch (err) {
      dispatch(addToast({ message: 'Upload failed', type: 'error' }));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    setEditing(null);
    loadMyData();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <AppHeader
        title="Dexa - Employee"
        showUserInfo={true}
        showAdminLink={true}
      />

      <main className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Profile Card */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                {user?.photoUrl ? (
                  <img
                    src={user?.photoUrl}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-slate-400" />
                )}
              </div>
              <label className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition">
                <Upload className="w-6 h-6" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <p className="text-slate-300">{user?.email}</p>
              <p className="text-slate-400 text-sm">{user?.phone}</p>
              <p className="text-slate-500 text-sm capitalize">{user?.position}</p>
            </div>
            <div className="flex flex-col justify-start ml-auto">
              <button
                onClick={() => {
                  setEditing(user);
                  setModalOpen(true);
                }}
                className="p-2 rounded-lg hover:bg-slate-600 text-slate-400 hover:text-yellow-400"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Attendance Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition"
          >
            <LogIn className="w-6 h-6" />
            Check In
          </button>
          <button
            onClick={handleCheckOut}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 transition"
          >
            <LogOut className="w-6 h-6" />
            Check Out
          </button>
        </div>

        {error && (
          <div
            className="p-4 rounded-lg bg-red-900/50 text-red-300 flex justify-between items-center"
            onClick={() => dispatch(clearError())}
          >
            {error}
          </div>
        )}

        {/* History Table */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex flex-wrap gap-4 items-center">
            <Calendar className="w-5 h-5 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 rounded bg-slate-700 border border-slate-600 text-sm"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 rounded bg-slate-700 border border-slate-600 text-sm"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-slate-500">
                      No records
                    </td>
                  </tr>
                ) : (
                  history.map((r) => (
                    <tr key={r.id} className="border-t border-slate-700">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm ${r.type === 'in'
                            ? 'bg-emerald-900/50 text-emerald-300'
                            : 'bg-amber-900/50 text-amber-300'
                            }`}
                        >
                          {r.type === 'in' ? (
                            <LogIn className="w-4 h-4" />
                          ) : (
                            <LogOut className="w-4 h-4" />
                          )}
                          {r.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {format(new Date(r.timestamp), 'PPpp')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <EmployeeModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        editing={editing}
      />
    </div>
  );
}