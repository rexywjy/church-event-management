import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import Navbar from '../../components/Navbar';
import { CheckCircle, XCircle, User } from 'lucide-react';

export default function Approvals() {
  const queryClient = useQueryClient();
  const { isSuperadmin } = useAuth();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', 'pending'],
    queryFn: async () => {
      const res = await userApi.getPending();
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Pending User Approvals</h1>
          <p className="text-gray-600">Review and approve new user registrations</p>
          {!isSuperadmin && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                ⚠️ You can view pending users, but only superadmin can approve or reject them.
              </p>
            </div>
          )}
        </div>

        {users.length === 0 ? (
          <div className="card text-center py-12">
            <User className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-primary-100 p-2 rounded-full">
                        <User className="text-primary-600" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{user.name}</h3>
                        <p className="text-gray-600">{user.email}</p>
                      </div>
                      <span className="badge badge-pending ml-auto">Pending</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {user.nij && (
                        <div>
                          <span className="text-gray-600">NIJ:</span>
                          <span className="ml-2 font-medium">{user.nij}</span>
                        </div>
                      )}
                      {user.class && (
                        <div>
                          <span className="text-gray-600">Class:</span>
                          <span className="ml-2 font-medium">{user.class}</span>
                        </div>
                      )}
                      {user.gender && (
                        <div>
                          <span className="text-gray-600">Gender:</span>
                          <span className="ml-2 font-medium">{user.gender}</span>
                        </div>
                      )}
                      {user.district && (
                        <div>
                          <span className="text-gray-600">District:</span>
                          <span className="ml-2 font-medium">{user.district}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {isSuperadmin && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          if (confirm(`Approve ${user.name}?`)) {
                            approveMutation.mutate(user.id);
                          }
                        }}
                        disabled={approveMutation.isPending}
                        className="btn btn-success flex items-center gap-2"
                      >
                        <CheckCircle size={20} />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Reject ${user.name}?`)) {
                            rejectMutation.mutate(user.id);
                          }
                        }}
                        disabled={rejectMutation.isPending}
                        className="btn btn-danger flex items-center gap-2"
                      >
                        <XCircle size={20} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
