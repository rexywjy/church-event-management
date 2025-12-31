import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { eventApi } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import Navbar from '../../components/Navbar';
import { Calendar, Plus, Edit, Trash2, Users } from 'lucide-react';

export default function ManageEvents() {
  const queryClient = useQueryClient();
  const { isSuperadmin } = useAuth();

  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await eventApi.getAll();
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => eventApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
    },
    onError: (error) => {
      alert(error.response?.data?.error || 'Failed to delete event');
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Events</h1>
            <p className="text-gray-600">Create and manage church events</p>
          </div>
          <Link to="/admin/events/new" className="btn btn-primary flex items-center gap-2">
            <Plus size={20} />
            Create Event
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-4">No events created yet</p>
            <Link to="/admin/events/new" className="btn btn-primary inline-flex items-center gap-2">
              <Plus size={20} />
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{event.title}</h3>
                      <span className={`badge ${event.enabled ? 'badge-approved' : 'badge-disabled'}`}>
                        {event.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <span className={`badge ${event.registration_open ? 'badge-registered' : 'badge-disabled'}`}>
                        {event.registration_open ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{event.description || 'No description'}</p>
                    <div className="flex gap-6 text-sm text-gray-600">
                      <span>{event.session_count} session{event.session_count !== 1 ? 's' : ''}</span>
                      <span className="flex items-center gap-1">
                        <Users size={16} />
                        {event.registered_count} registered
                        {event.registration_limit && ` / ${event.registration_limit}`}
                      </span>
                      {event.waitlisted_count > 0 && (
                        <span className="text-orange-600">
                          {event.waitlisted_count} waitlisted
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <div className="text-sm text-gray-600">
                      {event.registration_open ? '🟢 Open' : '🔴 Closed'} · 
                      {event.registration_limit ? ` Max ${event.registration_limit}` : ' Unlimited'}
                    </div>
                    {!event.enabled && (
                      <span className="badge badge-disabled text-xs">Disabled</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {(event.enabled || isSuperadmin) && (
                    <Link
                      to={`/admin/events/${event.id}/edit`}
                      className="text-primary-600 hover:text-primary-700"
                      title={!event.enabled ? 'Only superadmin can edit disabled events' : 'Edit event'}
                    >
                      <Edit size={20} />
                    </Link>
                  )}
                  <Link
                    to={`/admin/events/${event.id}/registrations`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Users size={20} />
                  </Link>
                  {isSuperadmin && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${event.title}"?`)) {
                          deleteMutation.mutate(event.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
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
