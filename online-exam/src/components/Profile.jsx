import React, { useState, useEffect } from 'react';
import { useExamContext } from './context/ExamContext';

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

  // Get user data from context on component mount
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (5MB limit)
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

      // Update context with new avatar
      const updatedUserData = { ...user, avatar: data.avatar };
      updateUser(updatedUserData);

      setSuccess('Profile picture uploaded successfully!');
      setProfilePicture(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
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

      // Update context
      const updatedUserData = { ...user, ...updatedUser };
      updateUser(updatedUserData);

      setSuccess('Profile updated successfully!');
      setEditMode(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
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
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(updatedUser.name)}&size=96&background=1658a0&color=fff`;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-lg w-full max-w-md p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
            {success}
          </div>
        )}

        {/* Avatar + Upload */}
        <div className="flex flex-col items-center text-center">
          <img
            src={previewUrl || getDefaultAvatar()}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover mb-2 border-4 border-gray-200"
          />

          {editMode && (
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm mb-2"
              />
              {profilePicture && (
                <button
                  onClick={uploadProfilePicture}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Upload Picture
                </button>
              )}
            </div>
          )}

          <h2 className="text-xl font-bold text-gray-800">
            {editMode ? (
              <input
                type="text"
                name="name"
                value={updatedUser.name}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full text-center"
              />
            ) : (
              updatedUser.name
            )}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {editMode ? (
              <input
                type="email"
                name="email"
                value={updatedUser.email}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full text-center"
              />
            ) : (
              updatedUser.email
            )}
          </p>
        </div>

        <hr className="my-6" />

        {/* Role + Meta Info */}
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <span className="font-semibold">Role:</span>{' '}
            {editMode ? (
              <select
                name="role"
                value={updatedUser.role}
                onChange={handleChange}
                className="border rounded px-2 py-1 ml-2"
              >
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Admin">Admin</option>
              </select>
            ) : (
              updatedUser.role
            )}
          </div>

          <div>
            <span className="font-semibold">Profile Status:</span>{' '}
            <span className="text-green-600 font-medium">Active</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-4">
          {editMode ? (
            <>
              <button
                onClick={handleCancel}
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
