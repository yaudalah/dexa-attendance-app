import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { employeeApi, Employee } from '../api/employee';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToast } from '../store/slices/uiSlice';
import { User, Upload } from 'lucide-react';
import { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  password: string;
  position: 'staff' | 'admin';
  phone: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  editing: Employee | null;
}

export default function EmployeeModal({
  open,
  onClose,
  onSave,
  editing,
}: Props) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAppSelector((s) => s.auth);

  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>();
  const positionValue = watch('position');
  const isStaffEditingSelf = Boolean(editing && user?.position === 'staff');

  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        email: editing.email,
        password: '',
        position: editing.position as 'staff' | 'admin',
        phone: editing.phone || '',
      });
    } else {
      reset({
        name: '',
        email: '',
        password: '',
        position: 'staff',
        phone: '',
      });
    }
  }, [editing, open, reset]);

  const maxPhotoSize = 5 * 1024 * 1024; // 5MB
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxPhotoSize) {
      dispatch(
        addToast({
          message: 'Photo must not exceed 5MB',
          type: 'error',
        })
      );
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    setPhotoFile(null);
    setPhotoPreview(null);
  }, [open]);

  if (!open) return null;

  const onSubmit = async (data: FormData) => {
    if (photoFile && photoFile.size > maxPhotoSize) {
      dispatch(
        addToast({
          message: 'Photo must not exceed 5MB',
          type: 'error',
        })
      );
      return;
    }
    try {
      let employeeId = editing?.id;

      if (editing) {
        const payload: Partial<FormData> = {
          name: data.name,
          email: user?.position === 'staff' ? undefined : data.email,
          position: data.position,
          phone: data.phone || undefined,
        };
        if (data.password) payload.password = data.password;

        await employeeApi.update(editing.id, payload);
        employeeId = editing.id;

        dispatch(addToast({ message: 'Employee updated', type: 'success' }));
      } else {
        const res = await employeeApi.create({
          ...data,
          phone: data.phone || undefined,
        });
        employeeId = res.data.id;

        dispatch(addToast({ message: 'Employee created', type: 'success' }));
      }

      // 🔥 upload photo if selected
      if (photoFile && employeeId) {
        setUploading(true);
        await employeeApi.uploadPhoto(employeeId, photoFile);
      }

      onSave();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message;

      dispatch(
        addToast({
          message: Array.isArray(msg) ? msg.join(', ') : msg || 'Failed',
          type: 'error',
        })
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-slate-800 rounded-xl shadow-xl w-full max-w-md border border-slate-700">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold">
            {editing ? 'Edit Employee' : 'Add Employee'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div className="flex justify-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    className="w-full h-full object-cover"
                  />
                ) : editing?.photoUrl ? (
                  <img
                    src={editing.photoUrl}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-slate-400" />
                )}
              </div>

              <label className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition">
                <Upload className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Name</label>
            <input
              {...register('name', { required: 'Required' })}
              className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input
              {...register('email', {
                required: 'Required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email',
                },
              })}
              type="email"
              disabled={editing  && user?.position === 'staff' ? true : false}
              className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white disabled:opacity-60"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Password {editing && '(leave blank to keep)'}
            </label>
            <input
              {...register('password', {
                required: !editing ? 'Required' : false,
                minLength: editing
                  ? undefined
                  : { value: 6, message: 'Min 6 characters' },
              })}
              type="password"
              className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Position</label>
            {isStaffEditingSelf ? (
              <>
                <input type="hidden" {...register('position')} />
                <p className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white/70 capitalize cursor-default">
                  {positionValue || 'staff'}
                </p>
              </>
            ) : (
              <select
                {...register('position')}
                className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Phone</label>
            <input
              {...register('phone')}
              className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-400 hover:bg-red-500 hover:text-black transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
