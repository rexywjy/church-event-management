import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../../lib/api';
import Navbar from '../../components/Navbar';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

export default function Attendance() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: sessionData, isLoading } = useQuery({
    queryKey: ['attendance', sessionId],
    queryFn: async () => {
      const res = await attendanceApi.getSessionAttendance(sessionId);
      return res.data;
    },
  });

  const markMutation = useMutation({
    mutationFn: (data) => attendanceApi.mark(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance', sessionId]);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id) => attendanceApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['attendance', sessionId]);
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

  const filteredAttendees = sessionData.attendees.filter(attendee =>
    attendee.name.toLowerCase().includes(search.toLowerCase()) ||
    attendee.email.toLowerCase().includes(search.toLowerCase()) ||
    attendee.nij?.toLowerCase().includes(search.toLowerCase())
  );

  const attendedCount = sessionData.attendees.filter(a => a.attended).length;
  const totalCount = sessionData.attendees.length;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="text-primary-600 hover:text-primary-700 flex items-center gap-2 mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="card mb-6">
          <h1 className="text-2xl font-bold mb-2">Mark Attendance</h1>
          <div className="text-gray-600 mb-4">
            <div className="font-medium text-lg">{sessionData.session.event_title}</div>
            <div>{sessionData.session.session_name || 'Session'}</div>
            <div className="text-sm">
              {new Date(sessionData.session.start_time).toLocaleString()}
            </div>
          </div>
          <div className="flex items-center gap-4 text-lg">
            <span className="font-semibold">Attendance:</span>
            <span className="text-green-600 font-bold">{attendedCount}</span>
            <span className="text-gray-400">/</span>
            <span className="font-bold">{totalCount}</span>
            <span className="text-gray-600">
              ({totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="card mb-6">
          <input
            type="text"
            placeholder="Search by name, email, or NIJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>

        <div className="space-y-3">
          {filteredAttendees.map((attendee) => (
            <div key={attendee.userId} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-lg">{attendee.name}</div>
                  <div className="text-gray-600 text-sm">{attendee.email}</div>
                  <div className="flex gap-4 text-sm text-gray-600 mt-1">
                    {attendee.nij && <span>NIJ: {attendee.nij}</span>}
                    {attendee.class && <span>Class: {attendee.class}</span>}
                    {attendee.district && <span>District: {attendee.district}</span>}
                  </div>
                </div>

                <div className="ml-4">
                  {attendee.attended ? (
                    <button
                      onClick={() => {
                        if (confirm(`Remove attendance for ${attendee.name}?`)) {
                          removeMutation.mutate(attendee.attendanceId);
                        }
                      }}
                      disabled={removeMutation.isPending}
                      className="btn btn-danger flex items-center gap-2"
                    >
                      <XCircle size={20} />
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        markMutation.mutate({
                          sessionId: sessionId,
                          userId: attendee.userId,
                        });
                      }}
                      disabled={markMutation.isPending}
                      className="btn btn-success flex items-center gap-2"
                    >
                      <CheckCircle size={20} />
                      Mark Present
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAttendees.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-gray-600">No attendees found</p>
          </div>
        )}
      </div>
    </div>
  );
}
