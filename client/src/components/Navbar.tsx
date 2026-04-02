import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ClipboardList, PlusCircle, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
          <img src="/llama.png" alt="SurveyLlama" className="w-8 h-8" />
          <span>SurveyLlama</span>
        </Link>

        <div className="flex items-center gap-8">
          {token ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-neutral-50 rounded-full border border-neutral-100">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold uppercase">
                  {(user?.displayName || user?.email || '?')[0]}
                </div>
                <span className="text-sm font-medium text-neutral-700 max-w-37.5 truncate">
                  {user?.displayName || user?.email}
                </span>
              </div>
              <Link to="/dashboard" className="flex items-center gap-1 text-neutral-600 hover:text-indigo-600 transition-colors">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <Link to="/create" className="flex items-center gap-1 text-neutral-600 hover:text-indigo-600 transition-colors">
                <PlusCircle size={18} />
                <span>New Survey</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-neutral-600 hover:text-red-600 transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
