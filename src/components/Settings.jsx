import { useState, useEffect } from 'react';
import { User, Shield, Bell, Lock, Upload, X } from 'lucide-react';

function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showLeaveBetaModal, setShowLeaveBetaModal] = useState(false);
  const [leaveBetaReason, setLeaveBetaReason] = useState('');

  // Load profile data from localStorage on mount
  const loadProfileFromStorage = () => {
    const savedProfile = localStorage.getItem('settingsProfile');
    if (savedProfile) {
      return JSON.parse(savedProfile);
    }
    // Default to onboarding data if available
    const firstName = localStorage.getItem('userFirstName') || '';
    const lastName = localStorage.getItem('userLastName') || '';
    const email = localStorage.getItem('userEmail') || '';
    const jobTitle = localStorage.getItem('userJobTitle') || '';
    const company = localStorage.getItem('userCompany') || '';

    return {
      fullName: `${firstName} ${lastName}`.trim() || 'User Name',
      email: email || 'user@example.com',
      jobTitle: jobTitle || 'Job Title',
      company: company || 'Company',
      location: 'Location',
      website: '',
      phone: '',
      bio: ''
    };
  };

  const loadInterestsFromStorage = () => {
    const savedInterests = localStorage.getItem('settingsInterests');
    if (savedInterests) {
      return JSON.parse(savedInterests);
    }
    return ['Technology', 'Design', 'Product Management', 'Startup', 'Leadership'];
  };

  // Profile state
  const [profile, setProfile] = useState(loadProfileFromStorage());
  const [selectedInterests, setSelectedInterests] = useState(loadInterestsFromStorage());

  const availableInterests = [
    'Technology', 'Marketing', 'Finance', 'Design', 'Sales', 'HR', 
    'Product Management', 'Data Science', 'Engineering', 'Consulting', 
    'Healthcare', 'Education', 'Real Estate', 'Legal', 'Media', 
    'Startup', 'AI/ML', 'Blockchain', 'Sustainability', 'Leadership'
  ];

  // Security state
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notifications state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newMessages: true,
    newMatches: true,
    eventReminders: true,
    weeklyDigest: false
  });

  // Privacy state
  const [privacy, setPrivacy] = useState({
    showEmail: false,
    showPhone: false,
    allowMessagesFromAnyone: true,
    showOnlineStatus: true,
    makeProfileSearchable: true
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Lock }
  ];

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const handleSaveProfile = () => {
    // Save to localStorage
    localStorage.setItem('settingsProfile', JSON.stringify(profile));
    localStorage.setItem('settingsInterests', JSON.stringify(selectedInterests));

    // Also update the main user data used by other components
    const names = profile.fullName.split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';

    localStorage.setItem('userFirstName', firstName);
    localStorage.setItem('userLastName', lastName);
    localStorage.setItem('userEmail', profile.email);
    localStorage.setItem('userJobTitle', profile.jobTitle);
    localStorage.setItem('userCompany', profile.company);

    showSuccess('Profile updated successfully!');
  };

  const handleChangePassword = () => {
    // Validate passwords match
    if (security.newPassword !== security.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (security.newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    // In a real app, this would call a backend API
    showSuccess('Password changed successfully!');
    setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleSaveNotifications = () => {
    // In a real app, this would save to a backend
    showSuccess('Notification preferences saved!');
  };

  const handleSavePrivacy = () => {
    // In a real app, this would save to a backend
    showSuccess('Privacy settings saved!');
  };

  const handleLeaveBetaClick = () => {
    setShowLeaveBetaModal(true);
  };

  const handleConfirmLeaveBeta = async () => {
    // Collect user data for email notification
    const userData = {
      firstName: localStorage.getItem('userFirstName') || '',
      lastName: localStorage.getItem('userLastName') || '',
      email: profile.email || localStorage.getItem('userEmail') || '',
      jobTitle: profile.jobTitle || localStorage.getItem('userJobTitle') || '',
      company: profile.company || localStorage.getItem('userCompany') || '',
      reason: leaveBetaReason || 'No reason provided'
    };

    try {
      // Send notification to Jeff
      const response = await fetch('/api/leaveBeta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          leftAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        console.error('Failed to send leave beta notification');
      }
    } catch (error) {
      console.error('Error sending leave beta notification:', error);
    }

    // Clear all localStorage
    localStorage.clear();

    // Redirect to home/onboarding
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Message Toast */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-2">Manage your profile, privacy, and account preferences</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="bg-gray-100 rounded-full p-1 mb-8 flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-3 rounded-full font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5" />
              <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
            </div>
            <p className="text-gray-600 mb-6">Update your professional profile information</p>

            {/* Profile Picture */}
            <div className="mb-8">
              <label className="block font-medium text-gray-900 mb-3">Profile Picture</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600">
                  {profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                </div>
                <div className="relative">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed" disabled>
                    <Upload className="w-4 h-4" />
                    Upload Photo
                  </button>
                  <div className="absolute -top-2 -right-2 bg-[#D0ED00] text-black px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                    Coming Soon
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-medium text-gray-900 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-[#009900] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-900 mb-2">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-[#009900] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-900 mb-2">Job Title</label>
                  <input
                    type="text"
                    value={profile.jobTitle}
                    onChange={(e) => setProfile({...profile, jobTitle: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-[#009900] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-900 mb-2">Company</label>
                  <input
                    type="text"
                    value={profile.company}
                    onChange={(e) => setProfile({...profile, company: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-[#009900] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-900 mb-2">Location</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({...profile, location: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-[#009900] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-900 mb-2">Website</label>
                  <input
                    type="text"
                    value={profile.website}
                    onChange={(e) => setProfile({...profile, website: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-[#009900] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-900 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-[#009900] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-900 mb-2">Professional Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  rows={5}
                  className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-[#009900] focus:bg-white"
                />
              </div>

              {/* Professional Interests */}
              <div>
                <label className="block font-medium text-gray-900 mb-2">Professional Interests</label>
                <p className="text-sm text-gray-600 mb-3">Select topics that interest you professionally</p>
                <div className="flex flex-wrap gap-2">
                  {availableInterests.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedInterests.includes(interest)
                          ? 'bg-black text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {interest}
                      {selectedInterests.includes(interest) && (
                        <X className="inline-block w-3 h-3 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSaveProfile}
                className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Change Password Card */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5" />
                <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
              </div>
              <p className="text-gray-600 mb-6">Update your account password</p>

              <div className="space-y-4">
                <div>
                  <label className="block font-medium text-gray-900 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={security.currentPassword}
                    onChange={(e) => setSecurity({...security, currentPassword: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-[#009900] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-900 mb-2">New Password</label>
                  <input
                    type="password"
                    value={security.newPassword}
                    onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-[#009900] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-900 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={security.confirmPassword}
                    onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-[#009900] focus:bg-white"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleChangePassword}
                  className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 font-medium"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Account Security Card */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5" />
                <h2 className="text-xl font-bold text-gray-900">Account Security</h2>
              </div>
              <p className="text-gray-600 mb-6">Additional security options</p>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
                  </div>
                  <div className="relative">
                    <button className="px-6 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed font-medium" disabled>
                      Enable
                    </button>
                    <div className="absolute -top-2 -right-2 bg-[#D0ED00] text-black px-2 py-0.5 rounded-full text-xs font-bold shadow-sm whitespace-nowrap">
                      Coming Soon
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg shadow-sm p-8 relative">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5" />
              <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
            </div>
            <p className="text-gray-600 mb-6">Choose what notifications you want to receive</p>

            {/* Beta Overlay */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
              <div className="bg-gradient-to-r from-green-100 to-lime-50 rounded-2xl p-6 max-w-md mx-4 text-center shadow-2xl border-4 border-[#D0ED00]">
                <img
                  src="/BudE-favicon.png"
                  alt="BudE"
                  className="h-16 w-16 mx-auto mb-4 object-contain"
                />
                <p className="text-green-800 font-bold text-xl mb-2">
                  Beta Version
                </p>
                <p className="text-green-700 font-medium text-base">
                  Notification settings coming soon!
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <ToggleSetting
                label="Email Notifications"
                description="Receive notifications via email"
                checked={notifications.emailNotifications}
                onChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
              />

              <ToggleSetting
                label="Push Notifications"
                description="Receive push notifications on your device"
                checked={notifications.pushNotifications}
                onChange={(checked) => setNotifications({...notifications, pushNotifications: checked})}
              />

              <ToggleSetting
                label="New Messages"
                description="Get notified when you receive new messages"
                checked={notifications.newMessages}
                onChange={(checked) => setNotifications({...notifications, newMessages: checked})}
              />

              <ToggleSetting
                label="New Matches"
                description="Get notified when you have new matches"
                checked={notifications.newMatches}
                onChange={(checked) => setNotifications({...notifications, newMatches: checked})}
              />

              <ToggleSetting
                label="Event Reminders"
                description="Receive reminders about upcoming events"
                checked={notifications.eventReminders}
                onChange={(checked) => setNotifications({...notifications, eventReminders: checked})}
              />

              <ToggleSetting
                label="Weekly Digest"
                description="Weekly summary of your network activity"
                checked={notifications.weeklyDigest}
                onChange={(checked) => setNotifications({...notifications, weeklyDigest: checked})}
              />
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSaveNotifications}
                className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 font-medium"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-8 relative">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5" />
                <h2 className="text-xl font-bold text-gray-900">Privacy Settings</h2>
              </div>
              <p className="text-gray-600 mb-6">Control who can see your information and contact you</p>

              {/* Beta Overlay */}
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                <div className="bg-gradient-to-r from-green-100 to-lime-50 rounded-2xl p-6 max-w-md mx-4 text-center shadow-2xl border-4 border-[#D0ED00]">
                  <img
                    src="/BudE-favicon.png"
                    alt="BudE"
                    className="h-16 w-16 mx-auto mb-4 object-contain"
                  />
                  <p className="text-green-800 font-bold text-xl mb-2">
                    Beta Version
                  </p>
                  <p className="text-green-700 font-medium text-base">
                    Privacy settings coming soon!
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <ToggleSetting
                  label="Show Email Address"
                  description="Display your email address on your profile"
                  checked={privacy.showEmail}
                  onChange={(checked) => setPrivacy({...privacy, showEmail: checked})}
                />

                <ToggleSetting
                  label="Show Phone Number"
                  description="Display your phone number on your profile"
                  checked={privacy.showPhone}
                  onChange={(checked) => setPrivacy({...privacy, showPhone: checked})}
                />

                <ToggleSetting
                  label="Allow Messages from Anyone"
                  description="Let anyone send you messages, not just matches"
                  checked={privacy.allowMessagesFromAnyone}
                  onChange={(checked) => setPrivacy({...privacy, allowMessagesFromAnyone: checked})}
                />

                <ToggleSetting
                  label="Show Online Status"
                  description="Show when you are online"
                  checked={privacy.showOnlineStatus}
                  onChange={(checked) => setPrivacy({...privacy, showOnlineStatus: checked})}
                />

                <ToggleSetting
                  label="Make Profile Searchable"
                  description="Allow others to find you in search"
                  checked={privacy.makeProfileSearchable}
                  onChange={(checked) => setPrivacy({...privacy, makeProfileSearchable: checked})}
                />
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSavePrivacy}
                  className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 font-medium"
                >
                  Save Settings
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-lg shadow-sm p-8 border-2 border-red-200">
              <div className="flex items-center gap-2 mb-2 text-red-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <h2 className="text-xl font-bold">Danger Zone</h2>
              </div>
              <p className="text-gray-600 mb-6">Irreversible and destructive actions</p>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Cancel Plan / Leave Beta / Unsubscribe</h3>
                  <p className="text-sm text-gray-600 mt-1">Stop participating in beta testing and remove your account data</p>
                </div>
                <button
                  onClick={handleLeaveBetaClick}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Leave Beta
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leave Beta Modal */}
      {showLeaveBetaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowLeaveBetaModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Leave Beta Program</h2>
              <button
                onClick={() => setShowLeaveBetaModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              We're sorry to see you go! Before you leave, would you mind sharing why you're leaving the beta program? Your feedback helps us improve BudE.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Leaving Beta (Thank you for participating!)
              </label>
              <textarea
                value={leaveBetaReason}
                onChange={(e) => setLeaveBetaReason(e.target.value)}
                rows={4}
                placeholder="Optional: Let us know what we could improve..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent resize-none"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This will clear all your data and return you to the onboarding page. This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveBetaModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLeaveBeta}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Leave Beta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleSetting({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{label}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-black' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default Settings;