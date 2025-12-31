import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userApi, eventApi } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import Navbar from '../../components/Navbar';
import { Users, Calendar, UserCheck, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const { isSuperadmin } = useAuth();
  const { data: pendingUsers } = useQuery({
    queryKey: ['users', 'pending'],
    queryFn: async () => {
      const res = await userApi.getPending();
      return res.data;
    },
  });

  const { data: events } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await eventApi.getAll();
      return res.data;
    },
  });

  const stats = [
    {
      title: 'Pending Approvals',
      value: pendingUsers?.length || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      link: '/admin/approvals',
    },
    {
      title: 'Total Events',
      value: events?.length || 0,
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      link: '/admin/events',
    },
    {
      title: 'Active Events',
      value: events?.filter(e => e.enabled && e.registration_open).length || 0,
      icon: UserCheck,
      color: 'text-green-600',
      bg: 'bg-green-50',
      link: '/admin/events',
    },
  ];

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage church events and user approvals</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {stats.map((stat) => (
            <Link
              key={stat.title}
              to={stat.link}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <stat.icon className={stat.color} size={32} />
                </div>
                <div>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className="text-gray-600">{stat.title}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-3">
              <Link to="/admin/approvals" className="btn btn-primary w-full flex items-center justify-center gap-2">
                <Users size={20} />
                <span>Review Pending Users</span>
              </Link>
              <Link to="/admin/events/new" className="btn btn-primary w-full flex items-center justify-center gap-2">
                <Calendar size={20} />
                <span>Create New Event</span>
              </Link>
              <Link to="/admin/users" className="btn btn-secondary w-full flex items-center justify-center gap-2">
                <Users size={20} />
                <span>Manage All Users</span>
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Recent Pending Users</h2>
            {!isSuperadmin && pendingUsers && pendingUsers.length > 0 && (
              <p className="text-sm text-amber-600 mb-3 italic">
                ⚠️ Only superadmin can approve/reject users
              </p>
            )}
            {pendingUsers && pendingUsers.length > 0 ? (
              <div className="space-y-3">
                {pendingUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                    <span className="badge badge-pending">Pending</span>
                  </div>
                ))}
                {pendingUsers.length > 5 && (
                  <Link to="/admin/approvals" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View all {pendingUsers.length} pending users →
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-gray-600">No pending approvals</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
