import { LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { navLinkClass } from '../../utils/navLinkClass';

interface Props {
  title: string;
  showAdminLink?: boolean;
  showUserInfo?: boolean;
}

export default function AppHeader({
  title,
  showAdminLink = false,
  showUserInfo = false,
}: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <header className="border-b border-slate-700 px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">{title}</h1>

      <div className="flex items-center gap-4">
        {showUserInfo && (
          <span className="text-slate-400">{user?.email}</span>
        )}

        {showAdminLink && user?.position === 'admin' && (
          <>
            <NavLink to="/dashboard" end className={navLinkClass}>
              Profile
            </NavLink>

            <NavLink to="/admin" className={navLinkClass}>
              HR Admin
            </NavLink>
          </>
        )}

        <button
          onClick={handleLogout}
          className="group flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4 group-hover:text-red-500 transition-colors" />
          Logout
        </button>
      </div>
    </header>
  );
}