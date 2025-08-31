import React, { useState, useEffect, useRef } from 'react';
import config from '../config';
import { useExamContext } from './context/ExamContext';
import { FiEdit, FiSave, FiX, FiUpload, FiUser, FiCamera, FiTrash2 } from 'react-icons/fi';

const Profile = () => {
  const { user, updateUser } = useExamContext();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatedUser, setUpdatedUser] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'Student',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  // Centralized API base

  useEffect(() => {
    if (user) {
      setUpdatedUser({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'Student',
      });
      if (user.avatar) {
        setPreviewUrl(`${config.API_BASE}/uploads/${user.avatar}?${new Date().getTime()}`);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, GIF)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setProfilePicture(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setError('');
    }
  };

  const uploadProfilePicture = async () => {
    if (!profilePicture) return;

    const formData = new FormData();
    formData.append('avatar', profilePicture);

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE}/api/users/profile/picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload profile picture');
      }

      const updatedUserData = { ...user, avatar: data.avatar };
      updateUser(updatedUserData);

      setSuccess('Profile picture updated successfully!');
      setProfilePicture(null);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeProfilePicture = async () => {
    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE}/api/users/profile/picture`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove profile picture');
      }

      const updatedUserData = { ...user, avatar: null };
      updateUser(updatedUserData);
      setPreviewUrl('');
      setSuccess('Profile picture removed successfully!');

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      const updatedUserData = { ...user, ...updatedUser };
      updateUser(updatedUserData);

      setSuccess('Profile updated successfully!');
      setEditMode(false);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setUpdatedUser({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'Student',
    });
    setProfilePicture(null);
    setPreviewUrl(user.avatar ? `${config.API_BASE}/uploads/${user.avatar}` : '');
    setEditMode(false);
    setError('');
  };

  const getDefaultAvatar = () => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(updatedUser.name)}&size=200&background=1658a0&color=fff&bold=true`;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-blue-100">Manage your account information</p>
          </div>

          {/* Alert Messages */}
          <div className="px-6 pt-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex justify-between items-center">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
                <button
                  onClick={() => setError('')}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Dismiss error"
                >
                  <FiX size={18} />
                </button>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded flex justify-between items-center">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{success}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSuccess('')}
                  className="text-green-500 hover:text-green-700"
                  aria-label="Dismiss success message"
                >
                  <FiX size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Profile Content */}
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar Section */}
              <div className="w-full md:w-1/3 flex flex-col items-center">
                <div className="relative mb-4 group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md relative">
                    <img
                      src={previewUrl || getDefaultAvatar()}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                    {editMode && (
                      <>
                        <label
                          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          htmlFor="avatar-upload"
                        >
                          <FiCamera className="h-6 w-6 text-white" />
                        </label>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          ref={fileInputRef}
                        />
                      </>
                    )}
                  </div>

                  {editMode && user.avatar && !profilePicture && (
                    <button
                      onClick={removeProfilePicture}
                      disabled={uploading}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 disabled:opacity-50"
                      aria-label="Remove profile picture"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {editMode && profilePicture && (
                  <div className="flex flex-col gap-2 w-full">
                    <button
                      onClick={uploadProfilePicture}
                      disabled={uploading}
                      className="flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 w-full"
                    >
                      {uploading ? 'Uploading...' : 'Save Picture'}
                    </button>
                    <button
                      onClick={() => {
                        setProfilePicture(null);
                        setPreviewUrl(user.avatar ? `${config.API_BASE}/uploads/${user.avatar}` : '');
                      }}
                      className="flex items-center justify-center bg-gray-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-600 w-full"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="mt-4 text-center w-full">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {editMode ? (
                      <input
                        type="text"
                        name="name"
                        value={updatedUser.name}
                        onChange={handleChange}
                        className="border rounded px-3 py-2 w-full text-center font-semibold"
                        placeholder="Enter your name"
                      />
                    ) : (
                      updatedUser.name
                    )}
                  </h2>
                  <p className="text-gray-600">
                    {editMode ? (
                      <input
                        type="email"
                        name="email"
                        value={updatedUser.email}
                        onChange={handleChange}
                        className="border rounded px-3 py-2 w-full text-center"
                        placeholder="Enter your email"
                      />
                    ) : (
                      updatedUser.email
                    )}
                  </p>
                </div>
              </div>

              {/* Details Section */}
              <div className="w-full md:w-2/3">
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                        <span className="w-1/3 text-gray-600">Role:</span>
                        {editMode ? (
                          <select
                            name="role"
                            value={updatedUser.role}
                            onChange={handleChange}
                            className="flex-1 border rounded px-3 py-2"
                          >
                            <option value="Student">Student</option>
                            <option value="Teacher">Teacher</option>
                            <option value="Admin">Admin</option>
                          </select>
                        ) : (
                          <span className="flex-1 font-medium">{updatedUser.role}</span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                        <span className="w-1/3 text-gray-600">Status:</span>
                        <span className="flex-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                        <span className="w-1/3 text-gray-600">Member since:</span>
                        <span className="flex-1 text-gray-800">
                          {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Additional profile fields can be added here */}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                  {editMode ? (
                    <>
                      <button
                        onClick={handleCancel}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <FiX className="mr-2" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <FiSave className="mr-2" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiEdit className="mr-2" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;