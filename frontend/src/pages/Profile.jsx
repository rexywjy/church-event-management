import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../lib/api';
import Navbar from '../components/Navbar';
import { Save, User } from 'lucide-react';

export default function Profile() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await profileApi.get();
      const profileData = {
        name: res.data.profile.name || '',
        nij: res.data.profile.nij || '',
        class: res.data.profile.class || '',
        gender: res.data.profile.gender || '',
        district: res.data.profile.district || '',
        address: res.data.profile.address || '',
        dateOfBirth: res.data.profile.dateOfBirth || '',
        phone: res.data.profile.phone || '',
      };
      setFormData(profileData);
      return res.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => profileApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      setEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
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
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <User className="text-primary-600" size={32} />
                <h1 className="text-2xl font-bold">My Profile</h1>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="btn btn-primary"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {message && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-6">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  className="input bg-gray-100"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  disabled={!editing}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIJ
                  </label>
                  <input
                    type="text"
                    name="nij"
                    value={formData.nij}
                    onChange={handleChange}
                    className="input"
                    disabled={!editing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class
                  </label>
                  <input
                    type="text"
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className="input"
                    disabled={!editing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="input"
                    disabled={!editing}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="input"
                    disabled={!editing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input"
                  rows={3}
                  disabled={!editing}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="input"
                    disabled={!editing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input"
                    disabled={!editing}
                  />
                </div>
              </div>

              {editing && (
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Save size={20} />
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
