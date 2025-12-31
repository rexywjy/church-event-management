import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { eventApi } from '../lib/api';
import Navbar from '../components/Navbar';
import { Calendar, Users, Clock } from 'lucide-react';

export default function Events() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await eventApi.getAll();
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

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Church Events</h1>
          <p className="text-gray-600">Browse and register for upcoming events</p>
        </div>

        {events.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No events available at the moment</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {event.title}
                  </h3>
                  {event.registration_open ? (
                    <span className="badge badge-approved">Open</span>
                  ) : (
                    <span className="badge badge-disabled">Closed</span>
                  )}
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {event.description || 'No description available'}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={16} />
                    <span>{event.session_count} session{event.session_count !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={16} />
                    <span>
                      {event.registered_count} registered
                      {event.registration_limit && ` / ${event.registration_limit}`}
                    </span>
                  </div>

                  {event.waitlisted_count > 0 && (
                    <div className="text-orange-600">
                      {event.waitlisted_count} on waiting list
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <button className="btn btn-primary w-full text-sm">
                    View Details
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
