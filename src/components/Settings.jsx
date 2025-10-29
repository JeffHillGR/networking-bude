import { useState, useEffect } from 'react';
import { User, Shield, Bell, Lock, Upload, X, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function Settings({ autoOpenFeedback = false, onBackToDashboard }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showLeaveBetaModal, setShowLeaveBetaModal] = useState(false);
  const [leaveBetaReason, setLeaveBetaReason] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(autoOpenFeedback);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    name: '',
    email: '',
    signUpSmoothness: '',
    navigationEase: '',
    confusingSteps: '',
    visualAppeal: '',
    brandClarity: '',
    performance: '',
    crashesOrBugs: '',
    usefulFeatures: '',
    missingFeatures: '',
    corePurposeUnderstood: '',
    valueProposition: '',
    solvesRealProblem: '',
    wouldUseOrRecommend: '',
    reasonToComeBack: '',
    overallSatisfaction: '',
    overallRating: '',
    netPromoterScore: ''
  });

  // Load profile data from localStorage on mount
  const loadProfileFromStorage = () => {
    const savedProfile = localStorage.getItem('settingsProfile');
    const onboardingDataStr = localStorage.getItem('onboardingData');

    if (savedProfile) {
      const profile = JSON.parse(savedProfile);

      // Migration: If personalInterests or networkingGoals are missing, pull from onboarding
      if (onboardingDataStr && (!profile.personalInterests || !profile.networkingGoals)) {
        const data = JSON.parse(onboardingDataStr);
        if (!profile.personalInterests && data.personalInterests) {
          profile.personalInterests = data.personalInterests;
        }
        if (!profile.networkingGoals && data.networkingGoals) {
          profile.networkingGoals = data.networkingGoals;
        }
        // Save the migrated data back
        localStorage.setItem('settingsProfile', JSON.stringify(profile));
      }

      return profile;
    }

    // Try to get full onboarding data first
    if (onboardingDataStr) {
      const data = JSON.parse(onboardingDataStr);
      return {
        fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'User Name',
        email: data.email || 'user@example.com',
        jobTitle: data.jobTitle || 'Job Title',
        company: data.company || 'Company',
        location: data.zipCode ? `Zip Code: ${data.zipCode}` : 'Location',
        website: '',
        phone: '',
        bio: data.networkingGoals || data.personalInterests || '',
        // Store additional onboarding data
        industry: data.industry || '',
        sameIndustry: data.sameIndustry || '',
        gender: data.gender || '',
        genderPreference: data.genderPreference || '',
        dob: data.dob || '',
        dobPreference: data.dobPreference || '',
        zipCode: data.zipCode || '',
        organizations: data.organizations || [],
        organizationsOther: data.organizationsOther || '',
        organizationsToCheckOut: data.organizationsToCheckOut || [],
        organizationsToCheckOutOther: data.organizationsToCheckOutOther || '',
        personalInterests: data.personalInterests || '',
        networkingGoals: data.networkingGoals || ''
      };
    }

    // Fallback to individual localStorage items
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
      bio: '',
      industry: '',
      sameIndustry: '',
      gender: '',
      genderPreference: '',
      dob: '',
      dobPreference: '',
      zipCode: '',
      organizations: [],
      organizationsOther: '',
      organizationsToCheckOut: [],
      organizationsToCheckOutOther: '',
      personalInterests: '',
      networkingGoals: ''
    };
  };

  const loadInterestsFromStorage = () => {
    const savedInterests = localStorage.getItem('settingsInterests');
    if (savedInterests) {
      return JSON.parse(savedInterests);
    }

    // Try to get from onboarding data
    const onboardingData = localStorage.getItem('onboardingData');
    if (onboardingData) {
      const data = JSON.parse(onboardingData);
      if (data.professionalInterests && Array.isArray(data.professionalInterests) && data.professionalInterests.length > 0) {
        return data.professionalInterests;
      }
    }

    return [];
  };

  // Profile state
  const [profile, setProfile] = useState(loadProfileFromStorage());
  const [selectedInterests, setSelectedInterests] = useState(loadInterestsFromStorage());

  // Load photo URL after component mounts
  useEffect(() => {
    const savedProfile = localStorage.getItem('settingsProfile');
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      if (profileData.photoUrl) {
        setPhotoUrl(profileData.photoUrl);
      }
    }
  }, []);

  // Load profile from Supabase if localStorage is empty
  useEffect(() => {
    async function loadProfileFromSupabase() {
      if (!user) return;

      // Check if we already have profile data from localStorage
      if (profile.fullName !== 'User Name' && profile.email !== 'user@example.com') {
        return; // Already have data, don't overwrite
      }

      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single();

        if (error) {
          console.error('Error loading profile from Supabase:', error);
          return;
        }

        if (userData) {
          console.log('✅ Loaded profile from Supabase:', userData);

          const loadedProfile = {
            fullName: userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'User Name',
            email: userData.email || 'user@example.com',
            jobTitle: userData.title || 'Job Title',
            company: userData.company || 'Company',
            location: userData.zip_code ? `Zip Code: ${userData.zip_code}` : 'Location',
            website: userData.website || '',
            phone: userData.phone || '',
            bio: userData.networking_goals || '',
            industry: userData.industry || '',
            sameIndustry: userData.same_industry_preference || '',
            gender: userData.gender || '',
            genderPreference: userData.gender_preference || '',
            dob: userData.year_born ? String(userData.year_born) : '',
            dobPreference: userData.year_born_connect || '',
            zipCode: userData.zip_code || '',
            organizations: userData.organizations_current || [],
            organizationsOther: userData.organizations_other || '',
            organizationsToCheckOut: userData.organizations_interested || [],
            organizationsToCheckOutOther: userData.organizations_to_check_out_other || '',
            personalInterests: Array.isArray(userData.personal_interests)
              ? userData.personal_interests.join(', ')
              : (userData.personal_interests || ''),
            networkingGoals: userData.networking_goals || ''
          };

          setProfile(loadedProfile);

          // Also save to localStorage so other components can access it
          const firstName = userData.first_name || '';
          const lastName = userData.last_name || '';
          localStorage.setItem('userFirstName', firstName);
          localStorage.setItem('userLastName', lastName);
          localStorage.setItem('userEmail', userData.email || '');
          localStorage.setItem('userJobTitle', userData.title || '');
          localStorage.setItem('userCompany', userData.company || '');
          localStorage.setItem('settingsProfile', JSON.stringify(loadedProfile));

          if (userData.professional_interests && Array.isArray(userData.professional_interests)) {
            setSelectedInterests(userData.professional_interests);
            localStorage.setItem('settingsInterests', JSON.stringify(userData.professional_interests));
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }

    loadProfileFromSupabase();
  }, [user]);

  const availableInterests = [
    'Technology', 'Marketing', 'Finance', 'Design', 'Sales', 'HR',
    'Product Management', 'Data Science', 'Engineering', 'Consulting',
    'Healthcare', 'Education', 'Real Estate', 'Legal', 'Media',
    'Startup', 'AI/ML', 'Blockchain', 'Sustainability', 'Leadership'
  ];

  const availableOrganizations = [
    'GR Chamber of Commerce', 'Rotary Club', 'CREW', 'GRYP',
    'Economic Club of Grand Rapids', 'Create Great Leaders', 'Right Place', 'Bamboo',
    'Hello West Michigan', 'CARWM', 'Creative Mornings', 'Athena',
    'Inforum', 'Start Garden', 'GRABB', 'WMPRSA', 'Crain\'s GR Business'
  ];

  // Security state
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notifications state - Default: ALL OFF (connection requests always show in bell regardless)
  const [notifications, setNotifications] = useState({
    emailNotifications: false,
    pushNotifications: false,
    newMessages: false,
    newMatches: false,  // User can opt-in to get emails when algorithm finds new matches
    eventReminders: false,
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

  const toggleOrganization = (org) => {
    const currentOrgs = profile.organizations || [];
    if (currentOrgs.includes(org)) {
      setProfile({...profile, organizations: currentOrgs.filter(o => o !== org)});
    } else {
      setProfile({...profile, organizations: [...currentOrgs, org]});
    }
  };

  const toggleOrganizationToCheckOut = (org) => {
    const currentOrgs = profile.organizationsToCheckOut || [];
    if (currentOrgs.includes(org)) {
      setProfile({...profile, organizationsToCheckOut: currentOrgs.filter(o => o !== org)});
    } else {
      setProfile({...profile, organizationsToCheckOut: [...currentOrgs, org]});
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const handleSaveProfile = async () => {
    try {
      // Split full name into first and last
      const names = (profile.fullName || '').split(' ');
      const firstName = names[0] || '';
      const lastName = names.slice(1).join(' ') || '';

      // Update Supabase database
      if (user?.email) {
        // First, get the user's database ID from their email
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (userError) {
          console.error('Error finding user:', userError);
          throw new Error('Could not find your user profile');
        }

        // Now update with the correct database user ID
        const { error } = await supabase
          .from('users')
          .update({
            first_name: firstName,
            last_name: lastName,
            name: profile.fullName,
            title: profile.jobTitle,
            company: profile.company,
            industry: profile.industry,
            zip_code: profile.zipCode || '',
            organizations_current: profile.organizations || [],
            organizations_interested: profile.organizationsToCheckOut || [],
            organizations_other: profile.organizationsOther || '',
            organizations_to_check_out_other: profile.organizationsToCheckOutOther || '',
            professional_interests: Array.isArray(selectedInterests) ? selectedInterests : [],
            professional_interests_other: profile.professionalInterestsOther || '',
            personal_interests: profile.personalInterests || '',
            networking_goals: profile.networkingGoals || '',
            same_industry_preference: profile.sameIndustry || '',
            gender: profile.gender || '',
            gender_preference: profile.genderPreference || '',
            year_born: profile.dob ? new Date(profile.dob).getFullYear() : null,
            year_born_connect: profile.dobPreference || ''
          })
          .eq('id', userData.id);

        if (error) {
          console.error('Error updating Supabase:', error);
          throw error;
        }
      }

      // Save to localStorage as backup
      const profileWithPhoto = { ...profile, photoUrl };
      localStorage.setItem('settingsProfile', JSON.stringify(profileWithPhoto));
      localStorage.setItem('settingsInterests', JSON.stringify(selectedInterests));
      localStorage.setItem('userFirstName', firstName);
      localStorage.setItem('userLastName', lastName);
      localStorage.setItem('userEmail', profile.email);
      localStorage.setItem('userJobTitle', profile.jobTitle);
      localStorage.setItem('userCompany', profile.company);

      showSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    }
  };

  // Compress image before upload (LinkedIn-style profile picture optimization)
  const compressImage = async (file, maxWidth = 400, maxHeight = 400, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                }));
              } else {
                reject(new Error('Canvas to Blob conversion failed'));
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => reject(new Error('Image load failed'));
      };
      reader.onerror = () => reject(new Error('File read failed'));
    });
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, or WebP)');
      return;
    }

    // Validate file size (10MB max for original - will be compressed)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be less than 10MB');
      return;
    }

    setUploadingPhoto(true);

    try {
      // Compress image for profile picture (400x400 max, like LinkedIn)
      console.log(`Original image size: ${(file.size / 1024).toFixed(2)} KB`);
      const compressedFile = await compressImage(file);
      console.log(`Compressed image size: ${(compressedFile.size / 1024).toFixed(2)} KB`);

      // Generate a unique filename
      const fileName = `profile.jpg`; // Always save as JPG after compression

      // Use authenticated user ID for file path
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      const filePath = `${user.id}/${fileName}`;

      // Upload compressed image to Supabase Storage
      const { data: uploadData, error: uploadError} = await supabase.storage
        .from('profile-photos')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: true // Replace if exists
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      // Update user's photo in the database
      const { error: updateError } = await supabase
        .from('users')
        .update({ photo: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating photo in database:', updateError);
        throw updateError;
      }

      setPhotoUrl(publicUrl);

      // Save to localStorage immediately
      const updatedProfile = { ...profile, photoUrl: publicUrl };
      localStorage.setItem('settingsProfile', JSON.stringify(updatedProfile));

      showSuccess('Photo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert(`Error uploading photo: ${error.message}`);
    } finally {
      setUploadingPhoto(false);
    }
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

  const handleSaveNotifications = async () => {
    try {
      // Get current user ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();

      if (userError) throw userError;

      // Save notification preferences to Supabase
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userData.id,
          email_notifications: notifications.emailNotifications,
          push_notifications: notifications.pushNotifications,
          new_messages: notifications.newMessages,
          new_matches: notifications.newMatches,
          event_reminders: notifications.eventReminders,
          weekly_digest: notifications.weeklyDigest,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      showSuccess('Notification preferences saved!');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      showError('Failed to save notification preferences. Please try again.');
    }
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

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/submitFeedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...feedbackData,
          submittedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      // Show success message in modal
      setFeedbackSubmitted(true);

      // Reset form after 3 seconds and close modal
      setTimeout(() => {
        setFeedbackSubmitted(false);
        setShowFeedbackModal(false);
        setFeedbackData({
          name: '',
          email: '',
          signUpSmoothness: '',
          navigationEase: '',
          confusingSteps: '',
          visualAppeal: '',
          brandClarity: '',
          performance: '',
          crashesOrBugs: '',
          usefulFeatures: '',
          missingFeatures: '',
          corePurposeUnderstood: '',
          valueProposition: '',
          solvesRealProblem: '',
          wouldUseOrRecommend: '',
          reasonToComeBack: '',
          overallSatisfaction: '',
          overallRating: '',
          netPromoterScore: ''
        });
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('There was an error submitting your feedback. Please try again.');
    }
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
        {/* Back to Dashboard Button */}
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-[#009900] hover:text-[#007700] font-medium mb-4 md:mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
        <div className="text-center">
          <div className="inline-block bg-white px-6 py-3 rounded-lg mb-3 border-2 border-black">
            <h1 className="text-3xl font-bold text-black">Profile and Settings</h1>
          </div>
          <p className="text-gray-600 mt-2">Manage your profile, privacy, and account preferences</p>
        </div>
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
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-black" />
                ) : (
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-[#009900] border-4 border-black">
                    {(profile.fullName || 'User Name').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'UN'}
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer inline-block bg-[#009900] text-white px-4 py-2 rounded-lg hover:bg-[#007700] transition-colors"
                  >
                    {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                  </label>
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG or WebP (max 10MB)</p>
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
                  <label className="block font-medium text-gray-900 mb-2">Zip Code</label>
                  <input
                    type="text"
                    value={profile.zipCode}
                    onChange={(e) => setProfile({...profile, zipCode: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-[#009900] focus:bg-white"
                    placeholder="e.g., 49503"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-900 mb-2">Industry</label>
                  <select
                    value={profile.industry}
                    onChange={(e) => setProfile({...profile, industry: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-[#009900] focus:bg-white"
                  >
                    <option value="">Select your industry</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="education">Education</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="marketing">Marketing</option>
                    <option value="real estate">Real Estate</option>
                    <option value="law">Law</option>
                    <option value="non-profit">Non-Profit</option>
                    <option value="government">Government</option>
                    <option value="accounting">Accounting</option>
                    <option value="consulting">Consulting</option>
                    <option value="professional development">Professional Development</option>
                    <option value="recruiting">Recruiting</option>
                    <option value="events">Events</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="media">Media</option>
                    <option value="entrepreneur">Entrepreneur/Business Owner</option>
                    <option value="startup">Startup/Founder</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Onboarding Preferences Section */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="font-bold text-gray-900 mb-4">Connection Preferences</h3>
                <p className="text-sm text-gray-600 mb-4">Update your networking preferences to help us find better matches for you</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-medium text-gray-900 mb-2">Same Industry Preference</label>
                    <select
                      value={profile.sameIndustry || ''}
                      onChange={(e) => setProfile({...profile, sameIndustry: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-[#009900] focus:bg-white"
                    >
                      <option value="">Select your preference</option>
                      <option value="yes">Yes, prefer same industry</option>
                      <option value="no">No preference</option>
                      <option value="different">Prefer different industries</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-900 mb-2">Gender</label>
                    <select
                      value={profile.gender || ''}
                      onChange={(e) => setProfile({...profile, gender: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-[#009900] focus:bg-white"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-900 mb-2">Gender Preference for Connections</label>
                    <select
                      value={profile.genderPreference || ''}
                      onChange={(e) => setProfile({...profile, genderPreference: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-[#009900] focus:bg-white"
                    >
                      <option value="">No preference</option>
                      <option value="male">Prefer male connections</option>
                      <option value="female">Prefer female connections</option>
                      <option value="non-binary">Prefer non-binary connections</option>
                      <option value="same">Prefer same gender as mine</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-900 mb-2">Age Group Preference</label>
                    <select
                      value={profile.dobPreference || ''}
                      onChange={(e) => setProfile({...profile, dobPreference: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-[#009900] focus:bg-white"
                    >
                      <option value="">No preference</option>
                      <option value="similar">Similar age (+/- 10 years)</option>
                      <option value="younger">Prefer younger connections</option>
                      <option value="older">Prefer older connections</option>
                      <option value="any">Any age group</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Organizations Section */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="font-bold text-gray-900 mb-4">Organizations</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block font-medium text-gray-900 mb-3">Organizations I Attend Events For</label>
                    <p className="text-sm text-gray-600 mb-3">Select all organizations whose events you regularly attend</p>
                    <div className="flex flex-wrap gap-2">
                      {availableOrganizations.map((org) => (
                        <button
                          key={org}
                          type="button"
                          onClick={() => toggleOrganization(org)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            profile.organizations?.includes(org)
                              ? 'bg-black text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {org}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3">
                      <input
                        type="text"
                        placeholder="Other organization (type to add)"
                        className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-[#009900] focus:bg-white text-sm"
                        value={profile.organizationsOther || ''}
                        onChange={(e) => setProfile({...profile, organizationsOther: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-900 mb-3">Organizations I Want to Check Out</label>
                    <p className="text-sm text-gray-600 mb-3">Select organizations you're interested in exploring</p>
                    <div className="flex flex-wrap gap-2">
                      {availableOrganizations.map((org) => (
                        <button
                          key={`checkout-${org}`}
                          type="button"
                          onClick={() => toggleOrganizationToCheckOut(org)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            profile.organizationsToCheckOut?.includes(org)
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {org}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3">
                      <input
                        type="text"
                        placeholder="Other organization (type to add)"
                        className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-[#009900] focus:bg-white text-sm"
                        value={profile.organizationsToCheckOutOther || ''}
                        onChange={(e) => setProfile({...profile, organizationsToCheckOutOther: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Interests and Networking Goals Section */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="font-bold text-gray-900 mb-4">About You</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block font-medium text-gray-900 mb-2">Personal Interests</label>
                    <p className="text-sm text-gray-600 mb-2">What keeps you busy in your spare time?</p>
                    <textarea
                      value={profile.personalInterests}
                      onChange={(e) => setProfile({...profile, personalInterests: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-[#009900] focus:bg-white"
                      placeholder="Share your hobbies and activities..."
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-900 mb-2">Networking Goals</label>
                    <p className="text-sm text-gray-600 mb-2">What are you hoping to achieve through networking?</p>
                    <textarea
                      value={profile.networkingGoals}
                      onChange={(e) => setProfile({...profile, networkingGoals: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-[#009900] focus:bg-white"
                      placeholder="Share your networking objectives..."
                    />
                  </div>
                </div>
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
                    During Beta testing phase, your provided personal profile data is stored unencrypted in your browser to simulate a logged in status. Privacy settings coming soon.
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

            {/* Beta Feedback */}
            <div className="bg-white rounded-lg shadow-sm p-8 border-2 border-[#D0ED00]">
              <div className="flex items-center gap-2 mb-2 text-[#009900]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <h2 className="text-xl font-bold">Beta Feedback</h2>
              </div>
              <p className="text-gray-600 mb-6">Help us improve BudE by sharing your experience</p>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Give Feedback on Your Beta Experience</h3>
                  <p className="text-sm text-gray-600 mt-1">Share your thoughts on features, usability, and overall experience</p>
                </div>
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="bg-[#009900] text-white px-6 py-2 rounded-lg hover:bg-[#007700] font-medium border-[3px] border-[#D0ED00] flex items-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Give Feedback
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

      {/* Beta Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => !feedbackSubmitted && setShowFeedbackModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {feedbackSubmitted ? (
              // Success Message
              <div className="text-center py-12">
                <div className="mb-6">
                  <svg className="w-20 h-20 mx-auto text-[#009900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
                <p className="text-lg text-gray-600 mb-2">Your feedback has been submitted successfully.</p>
                <p className="text-gray-500">This helps us make BudE better for everyone!</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Beta Feedback</h2>
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <p className="text-gray-600 mb-6">
                  Thank you for testing BudE! Your feedback is invaluable in helping us create the best networking platform.
                </p>

                <form onSubmit={handleSubmitFeedback} className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={feedbackData.name}
                    onChange={(e) => setFeedbackData({...feedbackData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={feedbackData.email}
                    onChange={(e) => setFeedbackData({...feedbackData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Onboarding & First Impressions */}
              <div>
                <h3 className="font-bold text-lg mb-3">Onboarding & First Impressions</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">How smooth was the sign-up or login process?</label>
                    <textarea
                      value={feedbackData.signUpSmoothness}
                      onChange={(e) => setFeedbackData({...feedbackData, signUpSmoothness: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* User Experience */}
              <div>
                <h3 className="font-bold text-lg mb-3">User Experience (UX)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">How easy or intuitive is it to navigate the app?</label>
                    <textarea
                      value={feedbackData.navigationEase}
                      onChange={(e) => setFeedbackData({...feedbackData, navigationEase: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Any steps that felt confusing or frustrating?</label>
                    <textarea
                      value={feedbackData.confusingSteps}
                      onChange={(e) => setFeedbackData({...feedbackData, confusingSteps: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Design & Branding */}
              <div>
                <h3 className="font-bold text-lg mb-3">Design & Branding</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visual appeal of the app (colors, fonts, imagery)</label>
                    <textarea
                      value={feedbackData.visualAppeal}
                      onChange={(e) => setFeedbackData({...feedbackData, visualAppeal: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Does the brand feel clear, memorable, and consistent?</label>
                    <textarea
                      value={feedbackData.brandClarity}
                      onChange={(e) => setFeedbackData({...feedbackData, brandClarity: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Performance & Speed */}
              <div>
                <h3 className="font-bold text-lg mb-3">Performance & Speed</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loading times, responsiveness, lag</label>
                    <textarea
                      value={feedbackData.performance}
                      onChange={(e) => setFeedbackData({...feedbackData, performance: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Any crashes, bugs, or slowdowns?</label>
                    <textarea
                      value={feedbackData.crashesOrBugs}
                      onChange={(e) => setFeedbackData({...feedbackData, crashesOrBugs: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Features & Functionality */}
              <div>
                <h3 className="font-bold text-lg mb-3">Features & Functionality</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Which features were most useful or enjoyable?</label>
                    <textarea
                      value={feedbackData.usefulFeatures}
                      onChange={(e) => setFeedbackData({...feedbackData, usefulFeatures: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Anything missing or not working as expected?</label>
                    <textarea
                      value={feedbackData.missingFeatures}
                      onChange={(e) => setFeedbackData({...feedbackData, missingFeatures: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Core Purpose */}
              <div>
                <h3 className="font-bold text-lg mb-3">Value Proposition & Relevance</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Did you understand the core purpose of the app right away?</label>
                    <textarea
                      value={feedbackData.corePurposeUnderstood}
                      onChange={(e) => setFeedbackData({...feedbackData, corePurposeUnderstood: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Does the app solve a real problem for you?</label>
                    <textarea
                      value={feedbackData.solvesRealProblem}
                      onChange={(e) => setFeedbackData({...feedbackData, solvesRealProblem: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Would you realistically use it or recommend it?</label>
                    <textarea
                      value={feedbackData.wouldUseOrRecommend}
                      onChange={(e) => setFeedbackData({...feedbackData, wouldUseOrRecommend: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Does the app give you a reason to come back?</label>
                    <textarea
                      value={feedbackData.reasonToComeBack}
                      onChange={(e) => setFeedbackData({...feedbackData, reasonToComeBack: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Overall Ratings */}
              <div>
                <h3 className="font-bold text-lg mb-3">Overall Satisfaction & Likelihood to Recommend</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Overall satisfaction</label>
                    <textarea
                      value={feedbackData.overallSatisfaction}
                      onChange={(e) => setFeedbackData({...feedbackData, overallSatisfaction: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Overall rating (1–10)</label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setFeedbackData({...feedbackData, overallRating: rating.toString()})}
                          className={`w-12 h-12 rounded-lg font-bold text-lg transition-all ${
                            feedbackData.overallRating === rating.toString()
                              ? 'bg-[#009900] text-white border-2 border-[#D0ED00] shadow-md scale-105'
                              : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-[#009900] hover:bg-gray-50'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">"Would you recommend this app to a friend or colleague?" (0-10 scale)</label>
                    <div className="flex flex-wrap gap-2">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setFeedbackData({...feedbackData, netPromoterScore: score.toString()})}
                          className={`w-12 h-12 rounded-lg font-bold text-lg transition-all ${
                            feedbackData.netPromoterScore === score.toString()
                              ? 'bg-[#009900] text-white border-2 border-[#D0ED00] shadow-md scale-105'
                              : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-[#009900] hover:bg-gray-50'
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#009900] text-white rounded-lg font-medium hover:bg-[#007700] transition-colors border-[3px] border-[#D0ED00]"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
              </>
            )}
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