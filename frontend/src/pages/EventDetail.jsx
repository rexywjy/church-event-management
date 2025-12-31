import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi, registrationApi } from '../lib/api';
import { useAuth } from '../lib/auth';
import Navbar from '../components/Navbar';
import { Calendar, Clock, MapPin, Users, AlertCircle } from 'lucide-react';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const res = await eventApi.getById(id);
      return res.data;
    },
  });

  const registerMutation = useMutation({
    mutationFn: () => registrationApi.register(id, user.profile),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['event', id]);
      setShowRegisterModal(false);
      alert(res.data.message);
    },
    onError: (error) => {
      alert(error.response?.data?.error || 'Failed to register');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => registrationApi.cancel(event.user_registration.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['event', id]);
      alert('Registration cancelled successfully');
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canRegister = event.registration_open && !event.user_registration;
  const isRegistered = event.user_registration?.status === 'registered';
  const isWaitlisted = event.user_registration?.status === 'waitlisted';

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="card">
            <div className="flex items-start justify-between mb-6">
              <div className="card mb-6">
                <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
                {event.description && (
                  <p className="text-gray-700 mb-6 whitespace-pre-wrap">{event.description}</p>
                )}

                {(event.event_url || event.location) && (
                  <div className="flex flex-wrap gap-4 mb-6">
                    {event.event_url && (
                      <a
                        href={event.event_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 underline text-sm"
                      >
                        🔗 Event Link
                      </a>
                    )}
                    {event.location && (
                      <div className="text-gray-600 text-sm">
                        📍 {event.location}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <div className="flex gap-2">
                  {event.enabled ? (
                    <span className="badge badge-approved">Active</span>
                  ) : (
                    <span className="badge badge-disabled">Disabled</span>
                  )}
                  {event.registration_open ? (
                    <span className="badge badge-registered">Registration Open</span>
                  ) : (
                    <span className="badge badge-disabled">Registration Closed</span>
                  )}
                </div>
              </div>

              {isRegistered && (
                <span className="badge badge-registered text-lg px-4 py-2">
                  ✓ Registered
                </span>
              )}
              {isWaitlisted && (
                <span className="badge badge-waitlisted text-lg px-4 py-2">
                  Position #{event.user_registration.queue_position}
                </span>
              )}
            </div>

            <div className="prose max-w-none mb-8">
              <p className="text-gray-700">{event.description || 'No description available'}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Clock size={20} />
                  Event Sessions
                </h3>
                {event.sessions.map((session, index) => (
                  <div key={session.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium text-gray-900">
                      {session.session_name || `Session ${index + 1}`}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatDateTime(session.start_time)}
                    </div>
                    <div className="text-sm text-gray-600">
                      to {formatDateTime(session.end_time)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Users size={20} />
                  Registration Info
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Registered:</span>
                    <span className="font-semibold">{event.registered_count}</span>
                  </div>
                  {event.registration_limit && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-semibold">{event.registration_limit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available:</span>
                        <span className="font-semibold">
                          {Math.max(0, event.registration_limit - event.registered_count)}
                        </span>
                      </div>
                    </>
                  )}
                  {event.waitlisted_count > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Waiting List:</span>
                      <span className="font-semibold">{event.waitlisted_count}</span>
                    </div>
                  )}
                </div>

                {event.attendance_enabled && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start gap-2 text-blue-800">
                      <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                      <span className="text-sm">
                        Attendance tracking is enabled for this event
                      </span>
                    </div>
                  </div>
                )}

                {event.contact_persons && event.contact_persons.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Contact Persons</h3>
                    {event.contact_persons.map((contact, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="font-medium text-gray-900">{contact.name}</div>
                        {contact.phone && (
                          <div className="text-sm text-gray-600 mt-1">
                            Phone: {contact.phone}
                          </div>
                        )}
                        {contact.email && (
                          <div className="text-sm text-gray-600">
                            Email: {contact.email}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              {canRegister && (
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="btn btn-primary flex-1"
                >
                  Register for Event
                </button>
              )}

              {event.user_registration && event.user_registration.status !== 'cancelled' && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel your registration?')) {
                      cancelMutation.mutate();
                    }
                  }}
                  disabled={cancelMutation.isPending}
                  className="btn btn-danger"
                >
                  {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Registration'}
                </button>
              )}

              <button
                onClick={() => navigate('/events')}
                className="btn btn-secondary"
              >
                Back to Events
              </button>
            </div>
          </div>
        </div>
      </div>

      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Registration</h2>
            <p className="text-gray-600 mb-6">
              You are about to register for <strong>{event.title}</strong>.
              {event.registration_limit && event.registered_count >= event.registration_limit && (
                <span className="block mt-2 text-orange-600 font-medium">
                  Note: Event is full. You will be added to the waiting list.
                </span>
              )}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => registerMutation.mutate()}
                disabled={registerMutation.isPending}
                className="btn btn-primary flex-1"
              >
                {registerMutation.isPending ? 'Registering...' : 'Confirm'}
              </button>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
