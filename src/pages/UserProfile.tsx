import React, { useState, useEffect } from 'react';
import api from "@/lib/api";import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminProfile {
  id?: number;
  name?: string;
  email?: string;
  password?: string;     // usually not returned by GET — only for update
  phone?: string;
  status?: boolean;
}

const API_BASE = 'http://192.168.0.177:10000'; // change if needed
const TOKEN_KEY = 'access_token';

const getToken = () => localStorage.getItem(TOKEN_KEY);

const UserProfile = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<AdminProfile>>({});

  const fetchProfile = async () => {
    const token = getToken();
    if (!token) {
      setError('No authentication token found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.get<AdminProfile>("/admin/profile");

      setProfile(res.data);
      // Reset form data when profile loads
      setFormData({
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone,
        status: res.data.status,
        // password intentionally not pre-filled
      });
    } catch (err: any) {
      console.error('Profile fetch failed:', err);
      let msg = 'Failed to load profile.';
      if (err.response?.status === 401 || err.response?.status === 403) {
        msg = 'Session expired. Please log in again.';
        localStorage.removeItem(TOKEN_KEY);
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    const token = getToken();
    if (!token) {
      alert('No authentication token found.');
      return;
    }

    try {
      await api.put(
        "/admin/admin-profile-update",
        formData
      );

      alert('Profile updated successfully');
      setIsEditing(false);
      fetchProfile(); // refresh displayed data
    } catch (err: any) {
      console.error('Update failed:', err);
      const msg = err.response?.data?.message || 'Failed to update profile';
      alert(msg);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 p-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={fetchProfile}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">No profile data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Profile</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
          ) : (
            <div className="space-x-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: profile.name,
                    email: profile.email,
                    phone: profile.phone,
                    status: profile.status,
                  });
                }}
                className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <div className="p-8 space-y-6">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
              {isEditing ? (
                <input
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter name"
                />
              ) : (
                <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900">
                  {profile.name || '—'}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              {isEditing ? (
                <input
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email"
                />
              ) : (
                <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900">
                  {profile.email || '—'}
                </div>
              )}
            </div>

            {/* Password - only shown/editable in edit mode */}
            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  New Password (optional)
                </label>
                <input
                  name="password"
                  type="password"
                  value={formData.password || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Leave blank to keep current"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 8 characters recommended
                </p>
              </div>
            )}

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
              {isEditing ? (
                <input
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter phone number"
                />
              ) : (
                <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900">
                  {profile.phone || '—'}
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
              {isEditing ? (
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="status"
                    checked={formData.status ?? false}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-900">
                    {formData.status ? 'Active' : 'Inactive'}
                  </span>
                </label>
              ) : (
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-lg font-medium ${profile.status
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                    }`}
                >
                  {profile.status ? 'Active' : 'Inactive'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

