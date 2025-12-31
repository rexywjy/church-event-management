import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventApi } from '../../lib/api';
import Navbar from '../../components/Navbar';
import { ArrowLeft, Users } from 'lucide-react';

export default function EventRegistrations() {
  const { id } = useParams();

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const res = await eventApi.getById(id);
      return res.data;
    },
  });

  const { data: registrations, isLoading } = useQuery({
    queryKey: ['event-registrations', id],
    queryFn: async () => {
      const res = await eventApi.getRegistrations(id);
      return res.data;
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

  const registered = registrations.filter(r => r.status === 'registered');
  const waitlisted = registrations.filter(r => r.status === 'waitlisted');

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/admin/events" className="text-primary-600 hover:text-primary-700 flex items-center gap-2 mb-4">
            <ArrowLeft size={20} />
            Back to Events
          </Link>
          <h1 className="text-3xl font-bold mb-2">Event Registrations</h1>
          <p className="text-gray-600 mb-4">{event?.title}</p>
          
          {event?.attendance_enabled && event?.sessions?.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Mark Attendance</h3>
              <div className="flex flex-wrap gap-2">
                {event.sessions.map((session) => (
                  <Link
                    key={session.id}
                    to={`/admin/attendance/${session.id}`}
                    className="btn btn-primary text-sm"
                  >
                    {session.session_name || 'Session'} - {new Date(session.start_time).toLocaleDateString()}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-green-600" size={24} />
              <h3 className="text-lg font-semibold">Registered</h3>
            </div>
            <div className="text-3xl font-bold text-green-600">{registered.length}</div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-orange-600" size={24} />
              <h3 className="text-lg font-semibold">Waiting List</h3>
            </div>
            <div className="text-3xl font-bold text-orange-600">{waitlisted.length}</div>
          </div>
        </div>

        {registered.length > 0 && (
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4">Registered Participants</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">NIJ</th>
                    <th className="text-left py-3 px-4">Class</th>
                    <th className="text-left py-3 px-4">District</th>
                    <th className="text-left py-3 px-4">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {registered.map((reg) => (
                    <tr key={reg.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{reg.name}</td>
                      <td className="py-3 px-4">{reg.email}</td>
                      <td className="py-3 px-4">{reg.nij || '-'}</td>
                      <td className="py-3 px-4">{reg.class || '-'}</td>
                      <td className="py-3 px-4">{reg.district || '-'}</td>
                      <td className="py-3 px-4">{reg.phone || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {waitlisted.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Waiting List</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Position</th>
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">NIJ</th>
                    <th className="text-left py-3 px-4">Class</th>
                    <th className="text-left py-3 px-4">District</th>
                    <th className="text-left py-3 px-4">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {waitlisted.map((reg) => (
                    <tr key={reg.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="badge badge-waitlisted">#{reg.queue_position}</span>
                      </td>
                      <td className="py-3 px-4 font-medium">{reg.name}</td>
                      <td className="py-3 px-4">{reg.email}</td>
                      <td className="py-3 px-4">{reg.nij || '-'}</td>
                      <td className="py-3 px-4">{reg.class || '-'}</td>
                      <td className="py-3 px-4">{reg.district || '-'}</td>
                      <td className="py-3 px-4">{reg.phone || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {registrations.length === 0 && (
          <div className="card text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No registrations yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
