import React, { useState, useEffect } from 'react';
import { useExamContext } from './context/ExamContext';
import { FiEdit, FiSave, FiX, FiUpload, FiUser } from 'react-icons/fi';

const Profile = () => {
  const { user, updateUser } = useExamContext();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatedUser, setUpdatedUser] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'Student',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (user) {
      setUpdatedUser({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'Student',
      });
      if (user.avatar) {
        setPreviewUrl(`http://localhost:5000/uploads/${user.avatar}`);
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
        setError('Please select an image file (JPEG, PNG)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const uploadProfilePicture = async () => {
    if (!profilePicture) return;

    const formData = new FormData();
    formData.append('avatar', profilePicture);

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile/picture', {
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
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile', {
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
    setPreviewUrl(user.avatar ? `http://localhost:5000/uploads/${user.avatar}` : '');
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
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
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
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
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
              </div>
            )}
          </div>

          {/* Profile Content */}
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar Section */}
              <div className="w-full md:w-1/3 flex flex-col items-center">
                <div className="relative mb-4">
                  <img
                    src={previewUrl || getDefaultAvatar()}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                  />
                  {editMode && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-700">
                      <FiUpload className="h-5 w-5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {editMode && profilePicture && (
                  <button
                    onClick={uploadProfilePicture}
                    disabled={loading}
                    className="flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 w-full"
                  >
                    {loading ? 'Uploading...' : 'Save Picture'}
                  </button>
                )}

                <div className="mt-4 text-center">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {editMode ? (
                      <input
                        type="text"
                        name="name"
                        value={updatedUser.name}
                        onChange={handleChange}
                        className="border rounded px-3 py-2 w-full text-center font-semibold"
                      />
                    ) : (
                      updatedUser.name
                    )}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {editMode ? (
                      <input
                        type="email"
                        name="email"
                        value={updatedUser.email}
                        onChange={handleChange}
                        className="border rounded px-3 py-2 w-full text-center"
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
                    <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center">
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
                      <div className="flex items-center">
                        <span className="w-1/3 text-gray-600">Status:</span>
                        <span className="flex-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Additional profile fields can be added here */}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end space-x-3">
                  {editMode ? (
                    <>
                      <button
                        onClick={handleCancel}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <FiX className="mr-2" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <FiSave className="mr-2" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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