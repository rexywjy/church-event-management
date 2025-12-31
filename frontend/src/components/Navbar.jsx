import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { LogOut, User, Calendar, Users, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-primary-600">
            SOCSA
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/events" className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
              <Calendar size={20} />
              <span>Events</span>
            </Link>

            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
                <LayoutDashboard size={20} />
                <span>Admin</span>
              </Link>
            )}

            <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
              <User size={20} />
              <span>{user?.profile?.name || user?.email}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-red-600"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
