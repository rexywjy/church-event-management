import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi } from '../../lib/api';
import Navbar from '../../components/Navbar';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    enabled: true,
    registrationOpen: false,
    registrationLimit: '',
    attendanceEnabled: true,
    eventUrl: '',
    location: '',
  });

  const [sessions, setSessions] = useState([
    { sessionName: '', startTime: '', endTime: '' }
  ]);

  const [contactPersons, setContactPersons] = useState([
    { name: '', phone: '', email: '' }
  ]);

  const { data: event } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const res = await eventApi.getById(id);
      return res.data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        enabled: event.enabled,
        registrationOpen: event.registration_open,
        registrationLimit: event.registration_limit || '',
        attendanceEnabled: event.attendance_enabled,
        eventUrl: event.event_url || '',
        location: event.location || '',
      });
      if (event.sessions && event.sessions.length > 0) {
        setSessions(event.sessions.map(s => ({
          sessionName: s.session_name || '',
          startTime: s.start_time ? new Date(s.start_time).toISOString().slice(0, 16) : '',
          endTime: s.end_time ? new Date(s.end_time).toISOString().slice(0, 16) : '',
        })));
      }
      if (event.contact_persons && event.contact_persons.length > 0) {
        setContactPersons(event.contact_persons);
      }
    }
  }, [event]);

  const saveMutation = useMutation({
    mutationFn: (data) => isEdit ? eventApi.update(id, data) : eventApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      navigate('/admin/events');
    },
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSessionChange = (index, field, value) => {
    const newSessions = [...sessions];
    newSessions[index][field] = value;
    setSessions(newSessions);
  };

  const addSession = () => {
    setSessions([...sessions, { sessionName: '', startTime: '', endTime: '' }]);
  };

  const removeSession = (index) => {
    if (sessions.length > 1) {
      setSessions(sessions.filter((_, i) => i !== index));
    }
  };

  const handleContactChange = (index, field, value) => {
    const newContacts = [...contactPersons];
    newContacts[index][field] = value;
    setContactPersons(newContacts);
  };

  const addContact = () => {
    setContactPersons([...contactPersons, { name: '', phone: '', email: '' }]);
  };

  const removeContact = (index) => {
    if (contactPersons.length > 1) {
      setContactPersons(contactPersons.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validSessions = sessions.filter(s => s.startTime && s.endTime);
    if (validSessions.length === 0) {
      alert('Please add at least one session with start and end times');
      return;
    }

    const validContacts = contactPersons.filter(c => c.name && (c.phone || c.email));

    const data = {
      ...formData,
      registrationLimit: formData.registrationLimit ? parseInt(formData.registrationLimit) : null,
      sessions: validSessions,
      contactPersons: validContacts.length > 0 ? validContacts : null,
    };

    saveMutation.mutate(data);
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="card">
            <h1 className="text-2xl font-bold mb-6">
              {isEdit ? 'Edit Event' : 'Create New Event'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="eventUrl"
                    value={formData.eventUrl}
                    onChange={handleChange}
                    className="input"
                    placeholder="https://example.com/event"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="input"
                    placeholder="Church Hall, Main Building"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="enabled"
                      checked={formData.enabled}
                      onChange={handleChange}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Event Enabled</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="registrationOpen"
                      checked={formData.registrationOpen}
                      onChange={handleChange}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Registration Open</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="attendanceEnabled"
                      checked={formData.attendanceEnabled}
                      onChange={handleChange}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Attendance Tracking</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Limit (Optional)
                  </label>
                  <input
                    type="number"
                    name="registrationLimit"
                    value={formData.registrationLimit}
                    onChange={handleChange}
                    className="input"
                    min="1"
                    placeholder="No limit"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Event Sessions *
                  </label>
                  <button
                    type="button"
                    onClick={addSession}
                    className="btn btn-secondary text-sm flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Session
                  </button>
                </div>

                <div className="space-y-4">
                  {sessions.map((session, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Session {index + 1}</h4>
                        {sessions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSession(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Session Name (Optional)
                          </label>
                          <input
                            type="text"
                            value={session.sessionName}
                            onChange={(e) => handleSessionChange(index, 'sessionName', e.target.value)}
                            className="input"
                            placeholder="e.g., Morning Service"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">
                              Start Time *
                            </label>
                            <input
                              type="datetime-local"
                              value={session.startTime}
                              onChange={(e) => handleSessionChange(index, 'startTime', e.target.value)}
                              className="input"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-700 mb-1">
                              End Time *
                            </label>
                            <input
                              type="datetime-local"
                              value={session.endTime}
                              onChange={(e) => handleSessionChange(index, 'endTime', e.target.value)}
                              className="input"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Persons (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={addContact}
                    className="btn btn-secondary text-sm flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Contact
                  </button>
                </div>

                <div className="space-y-3">
                  {contactPersons.map((contact, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Contact {index + 1}</h4>
                        {contactPersons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeContact(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={contact.name}
                            onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                            className="input"
                            placeholder="Contact person name"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">
                              Phone
                            </label>
                            <input
                              type="tel"
                              value={contact.phone}
                              onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                              className="input"
                              placeholder="+1234567890"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-700 mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              value={contact.email}
                              onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                              className="input"
                              placeholder="contact@example.com"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Save size={20} />
                  {saveMutation.isPending ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/events')}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
