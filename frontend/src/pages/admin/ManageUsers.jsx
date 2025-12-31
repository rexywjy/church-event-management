import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { userApi } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import Navbar from '../../components/Navbar';
import { Users, UserPlus } from 'lucide-react';

export default function ManageUsers() {
  const queryClient = useQueryClient();
  const { isSuperadmin } = useAuth();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await userApi.getAll();
      return res.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id) => userApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
    onError: (error) => {
      alert(error.response?.data?.error || 'Failed to approve user. Only superadmin can approve users.');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => userApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
    onError: (error) => {
      alert(error.response?.data?.error || 'Failed to reject user. Only superadmin can reject users.');
    },
  });

  const disableMutation = useMutation({
    mutationFn: (id) => userApi.disable(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
    onError: (error) => {
      alert(error.response?.data?.error || 'Failed to disable user');
    },
  });

  const enableMutation = useMutation({
    mutationFn: (id) => userApi.enable(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
    onError: (error) => {
      alert(error.response?.data?.error || 'Failed to enable user');
    },
  });

  const roleMap = {
    user: 'User',
    admin: 'Admin',
    superadmin: 'Superadmin',
  };

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Users</h1>
            <p className="text-gray-600">View and manage all user accounts</p>
          </div>
          {isSuperadmin && (
            <Link to="/admin/users/create" className="btn btn-primary flex items-center gap-2">
              <UserPlus size={20} />
              Create User
            </Link>
          )}
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">NIJ</th>
                <th className="text-left py-3 px-4">District</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{user.name}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`badge ${
                      user.role === 'superadmin' ? 'badge-rejected' :
                      user.role === 'admin' ? 'badge-registered' :
                      'badge-disabled'
                    }`}>
                      {roleMap[user.role]}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge badge-${user.status}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.nij || '-'}</td>
                  <td className="py-3 px-4 text-gray-600">{user.district || '-'}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {user.status === 'pending' && isSuperadmin && (
                        <>
                          <button
                            onClick={() => {
                              if (confirm(`Approve ${user.name}?`)) {
                                approveMutation.mutate(user.id);
                              }
                            }}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Reject ${user.name}?`)) {
                                rejectMutation.mutate(user.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {isSuperadmin && user.status !== 'pending' && (
                        <>
                          <Link
                            to={`/admin/users/${user.id}/edit`}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            Edit
                          </Link>
                          {user.status === 'disabled' ? (
                            <button
                              onClick={() => {
                                if (confirm(`Enable ${user.name}?`)) {
                                  enableMutation.mutate(user.id);
                                }
                              }}
                              className="text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              Enable
                            </button>
                          ) : user.status === 'approved' && (
                            <button
                              onClick={() => {
                                if (confirm(`Disable ${user.name}?`)) {
                                  disableMutation.mutate(user.id);
                                }
                              }}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Disable
                            </button>
                          )}
                        </>
                      )}
                      {!isSuperadmin && (
                        <span className="text-gray-400 text-sm">View Only</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
