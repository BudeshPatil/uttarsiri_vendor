import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/auth.service';
import userService from '../services/user.service';
import { 
  User, 
  Mail, 
  Edit3, 
  Save, 
  X, 
  ArrowLeft,
  Shield,
  Key,
  Bell,
  Globe,
  Check,
  Loader2,
} from 'lucide-react';

const ProfileSettings = ({ onBack }) => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => (
    localStorage.getItem('innoventies_notifications') !== 'false'
  ));
  const [profileVisible, setProfileVisible] = useState(() => (
    localStorage.getItem('innoventies_profile_visible') !== 'false'
  ));

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setProfileMessage({ type: '', text: '' });

    if (!editedUser.name.trim() || !editedUser.email.trim()) {
      setProfileMessage({ type: 'error', text: 'Name and email are required.' });
      return;
    }

    try {
      setSavingProfile(true);
      const response = await userService.update(user.user_id, {
        name: editedUser.name.trim(),
        email: editedUser.email.trim(),
      });
      const savedUser = response.data?.user || response.data || editedUser;
      updateUser({
        name: savedUser.name || editedUser.name.trim(),
        email: savedUser.email || editedUser.email.trim(),
      });
      setIsEditing(false);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (error) {
      setProfileMessage({ type: 'error', text: error.message || 'Unable to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancel = () => {
    setEditedUser({
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    localStorage.setItem('innoventies_notifications', String(notificationsEnabled));
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem('innoventies_profile_visible', String(profileVisible));
  }, [profileVisible]);

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setChangingPassword(true);
      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordSuccess('Password changed successfully.');
      setShowPasswordForm(false);
    } catch (error) {
      setPasswordError(error.message || 'Unable to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8f3]">
      {/* Header */}
      <div className="border-b border-[#dbe8d8] bg-white/90 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={onBack}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-[#eef7e9] hover:text-[#0e782c]"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0e782c]">Innoventies</p>
                <h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-2xl border border-[#dbe8d8] bg-white shadow-sm">
              <div className="h-24 bg-[#0e782c]" />
              <div className="-mt-12 p-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-[#f5f10a] shadow-md">
                  <User className="h-12 w-12 text-[#0e782c]" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  {user?.name || 'User Name'}
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  {user?.email || 'user@example.com'}
                </p>
                <button
                  onClick={handleEdit}
                  className="flex w-full items-center justify-center space-x-2 rounded-lg bg-[#0e782c] px-4 py-2 text-white transition-colors hover:bg-[#095c21]"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-[#dbe8d8] bg-white shadow-sm">
              {/* Personal Information */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="mb-1 text-lg font-semibold text-gray-900">Personal Information</h3>
                <p className="mb-4 text-sm text-gray-500">Keep your account details current for client communication.</p>
                
                <div className="space-y-4">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedUser.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <div className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                          {user?.name || 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="email"
                          value={editedUser.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your email address"
                        />
                      ) : (
                        <div className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                          {user?.email || 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {profileMessage.text && (
                  <p className={`mt-4 text-sm ${profileMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                    {profileMessage.text}
                  </p>
                )}

                {isEditing && (
                  <div className="flex space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={savingProfile}
                      className="flex items-center space-x-2 rounded-lg bg-[#0e782c] px-4 py-2 text-white transition-colors hover:bg-[#095c21] disabled:opacity-60"
                    >
                      {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      <span>{savingProfile ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Account Settings */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Change Password</p>
                        <p className="text-sm text-gray-500">Update your account password</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm((previous) => !previous);
                        setPasswordError('');
                        setPasswordSuccess('');
                      }}
                      className="font-medium text-[#0e782c] hover:text-[#095c21]"
                    >
                      Change
                    </button>
                  </div>

                  {showPasswordForm && (
                    <form onSubmit={handlePasswordChange} className="space-y-4 rounded-lg border border-gray-200 p-4">
                      <div>
                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                          Current password
                        </label>
                        <input
                          id="current-password"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                          New password
                        </label>
                        <input
                          id="new-password"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          minLength={8}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm new password
                        </label>
                        <input
                          id="confirm-password"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          minLength={8}
                          required
                        />
                      </div>
                      {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="rounded-lg bg-[#0e782c] px-4 py-2 text-sm font-medium text-white hover:bg-[#095c21] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {changingPassword ? 'Changing...' : 'Update Password'}
                      </button>
                    </form>
                  )}

                  {passwordSuccess && <p className="text-sm text-green-600">{passwordSuccess}</p>}

                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Notification Settings</p>
                        <p className="text-sm text-gray-500">Choose whether account alerts are enabled.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotificationsEnabled((previous) => !previous)}
                      className={`flex items-center gap-2 font-medium ${notificationsEnabled ? 'text-[#0e782c]' : 'text-gray-500'}`}
                    >
                      {notificationsEnabled && <Check className="h-4 w-4" />}
                      {notificationsEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Privacy Settings</p>
                        <p className="text-sm text-gray-500">Control whether your profile is visible to the team.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProfileVisible((previous) => !previous)}
                      className={`flex items-center gap-2 font-medium ${profileVisible ? 'text-[#0e782c]' : 'text-gray-500'}`}
                    >
                      {profileVisible && <Check className="h-4 w-4" />}
                      {profileVisible ? 'Visible' : 'Hidden'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;


