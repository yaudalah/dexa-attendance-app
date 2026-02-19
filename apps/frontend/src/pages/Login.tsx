import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, clearError } from '../store/slices/authSlice';
import { addToast } from '../store/slices/uiSlice';

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error, user } = useAppSelector((s) => s.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (!error) return;
    dispatch(
      addToast({
        type: 'error',
        title: 'Login failed',
        message: error,
      })
    );
  }, [error, dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.position === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = (data: LoginForm) => {
    dispatch(login(data));
  };

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
          <h1 className="text-2xl font-bold text-white text-center mb-6">
            Dexa HR
          </h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email',
                    },
                  })}
                  type="email"
                  placeholder="karyawan@dexa.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-500 border border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-500 border border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
