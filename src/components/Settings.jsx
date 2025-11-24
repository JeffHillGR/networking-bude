import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Bell, Lock, Upload, X, ArrowLeft, Calendar, CheckCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
// Matching algorithm now runs server-side via Edge Function

function Settings({ autoOpenFeedback = false, initialTab = 'profile', onBackToDashboard }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showCancelAccountModal, setShowCancelAccountModal] = useState(false);
  const [cancelAccountReason, setCancelAccountReason] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(autoOpenFeedback);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [feedbackData, setFeedbackData] = useState({
    name: '',
    email: '',
    loveFeatures: '',
    improveFeatures: '',
    newFeatures: ''
  });
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');
  const [eventsAttendedCount, setEventsAttendedCount] = useState(0);
  const [goingEvents, setGoingEvents] = useState([]);
  const [showPrivacyTerms, setShowPrivacyTerms] = useState(false);

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
        zipCode: data.zipCode || '',
        organizations: data.organizations || [],
        organizationsOther: data.organizationsOther || '',
        organizationsToCheckOut: data.organizationsToCheckOut || [],
        organizationsToCheckOutOther: data.organizationsToCheckOutOther || '',
        groupsBelongTo: data.groupsBelongTo || '',
        lookingToAccomplish: data.lookingToAccomplish || [],
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
      zipCode: '',
      organizations: [],
      organizationsOther: '',
      organizationsToCheckOut: [],
      organizationsToCheckOutOther: '',
      groupsBelongTo: '',
      lookingToAccomplish: [],
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

  // Sync profile email with authenticated user's email
  useEffect(() => {
    if (user?.email && profile.email !== user.email) {
      setProfile(prev => ({ ...prev, email: user.email }));
    }
  }, [user?.email]);

  // Load events attended count and details
  useEffect(() => {
    async function loadEventsAttended() {
      if (!user) return;

      try {
        // Get event IDs user is attending
        const { data: attendeeData, error: attendeeError } = await supabase
          .from('event_attendees')
          .select('event_id')
          .eq('user_id', user.id)
          .eq('status', 'going');

        if (attendeeError) {
          console.error('Error loading event attendees:', attendeeError);
          return;
        }

        if (attendeeData && attendeeData.length > 0) {
          setEventsAttendedCount(attendeeData.length);

          const eventIds = attendeeData.map(a => a.event_id).filter(id => id != null);

          if (eventIds.length > 0) {
            // Build query - use .eq() for single item, .in() for multiple
            let query = supabase
              .from('events')
              .select('id, title, image_url, date');

            if (eventIds.length === 1) {
              query = query.eq('id', eventIds[0]);
            } else {
              query = query.in('id', eventIds);
            }

            const { data: eventsData, error: eventsError } = await query
              .order('date', { ascending: true })
              .limit(7);

            if (eventsError) {
              console.error('Error fetching events:', eventsError);
            } else {
              setGoingEvents(eventsData || []);
            }
          }
        } else {
          setEventsAttendedCount(0);
          setGoingEvents([]);
        }
      } catch (err) {
        console.error('Error loading events attended:', err);
      }
    }

    loadEventsAttended();
  }, [user]);

  // Calculate profile strength (generous calculation)
  const getProfileFields = () => [
    { name: 'Full Name', value: profile.fullName, weight: 10 },
    { name: 'Email', value: profile.email, weight: 8 },
    { name: 'Job Title', value: profile.jobTitle, weight: 8 },
    { name: 'Company', value: profile.company, weight: 8 },
    { name: 'Zip Code', value: profile.zipCode, weight: 4 },
    { name: 'Industry', value: profile.industry, weight: 8 },
    { name: 'Profile Photo', value: photoUrl, weight: 12 },
    { name: 'Personal Interests', value: profile.personalInterests?.length > 0, weight: 10 },
    { name: 'Networking Goals', value: profile.networkingGoals?.length > 0, weight: 10 },
    { name: 'Organizations (Attending)', value: profile.organizationsAttending?.length >= 3, weight: 8 },
    { name: 'Organizations (Member)', value: profile.organizationsMember?.length >= 3, weight: 6 },
    { name: 'Groups Belong To', value: profile.groupsBelongTo, weight: 4 },
    { name: 'Looking To Accomplish', value: profile.lookingToAccomplish?.length > 0, weight: 4 }
  ];

  const calculateProfileStrength = () => {
    const fields = getProfileFields();
    let score = 0;

    fields.forEach(field => {
      if (field.value && field.value !== '' && field.value !== false) {
        score += field.weight;
      }
    });

    // Add bonus points for having events attended (generous!)
    if (eventsAttendedCount > 0) score = Math.min(100, score + 8);
    if (eventsAttendedCount >= 3) score = Math.min(100, score + 4);

    return Math.min(100, score);
  };

  const getMissingFields = () => {
    const fields = getProfileFields();
    const missing = [];

    fields.forEach(field => {
      if (!field.value || field.value === '' || field.value === false) {
        missing.push(field.name);
      }
    });

    // Only show main profile fields (not preferences)
    const mainFields = ['Profile Photo', 'Full Name', 'Job Title', 'Company', 'Industry', 'Networking Goals', 'Personal Interests', 'Organizations (Attending)'];
    const prioritized = missing.filter(m => mainFields.includes(m)).slice(0, 3);

    return prioritized;
  };

  // Load notification preferences from Supabase
  useEffect(() => {
    async function loadNotificationPreferences() {
      if (!user) return;

      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (userError) {
          console.error('Error finding user:', userError);
          return;
        }

        const { data: prefs, error } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', userData.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error loading notification preferences:', error);
          return;
        }

        if (prefs) {
          setNotifications({
            emailNotifications: prefs.email_notifications,
            pushNotifications: prefs.push_notifications,
            newMessages: prefs.new_messages,
            newMatches: prefs.new_matches,
            eventReminders: prefs.event_reminders,
            weeklyDigest: prefs.weekly_digest
          });
        }
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      }
    }

    loadNotificationPreferences();
  }, [user]);

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
            zipCode: userData.zip_code || '',
            organizations: userData.organizations_current || [],
            organizationsOther: userData.organizations_other || '',
            organizationsToCheckOut: userData.organizations_interested || [],
            organizationsToCheckOutOther: userData.organizations_to_check_out_other || '',
            groupsBelongTo: userData.groups_belong_to || '',
            lookingToAccomplish: userData.looking_to_accomplish || [],
            personalInterests: Array.isArray(userData.personal_interests)
              ? userData.personal_interests.join(', ')
              : (userData.personal_interests || ''),
            networkingGoals: userData.networking_goals || ''
          };

          setProfile(loadedProfile);

          // Load photo from Supabase
          if (userData.photo) {
            setPhotoUrl(userData.photo);
            // Save photo to localStorage
            const profileWithPhoto = { ...loadedProfile, photoUrl: userData.photo };
            localStorage.setItem('settingsProfile', JSON.stringify(profileWithPhoto));
          } else {
            localStorage.setItem('settingsProfile', JSON.stringify(loadedProfile));
          }

          // Also save to localStorage so other components can access it
          const firstName = userData.first_name || '';
          const lastName = userData.last_name || '';
          localStorage.setItem('userFirstName', firstName);
          localStorage.setItem('userLastName', lastName);
          localStorage.setItem('userEmail', userData.email || '');
          localStorage.setItem('userJobTitle', userData.title || '');
          localStorage.setItem('userCompany', userData.company || '');

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
    'Economic Club of Grand Rapids', 'Create Great Leaders', 'Right Place', 'Bamboo GR',
    'Hello West Michigan', 'CARWM', 'Creative Mornings GR', 'Athena',
    'Inforum', 'Start Garden', 'GRABB', 'WMPRSA', 'Crain\'s GR Business'
  ];

  // Security state
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notifications state - Default: First 4 ON, last 2 OFF (will be loaded from database)
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newMessages: true,
    newMatches: true,
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
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'terms', label: 'Terms of Service', icon: FileText }
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

      // Check if email has changed
      const emailChanged = profile.email && user?.email && profile.email !== user.email;

      // Handle email change with secure two-step verification
      if (emailChanged) {
        try {
          const response = await fetch('/api/requestEmailChange', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              oldEmail: user.email,
              newEmail: profile.email,
              userId: user.id
            })
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to initiate email change');
          }

          // Show special message for secure email change
          alert('Email change request initiated!\n\nIMPORTANT: For your security, we need to verify both email addresses:\n\n1. Check your CURRENT email (' + user.email + ') and click the confirmation link\n2. Check your NEW email (' + profile.email + ') and click the confirmation link\n\nBoth confirmations are required before your email will change. You have 24 hours to complete this process.\n\nYour account remains active with your current email until both confirmations are complete.');

          // Don't proceed with other profile updates if email change was requested
          // User should complete email verification first
          return;
        } catch (error) {
          console.error('Error requesting email change:', error);
          throw new Error(error.message || 'Failed to initiate email change. Please try again.');
        }
      }

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
        const updateData = {
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
          groups_belong_to: profile.groupsBelongTo || '',
          looking_to_accomplish: profile.lookingToAccomplish || [],
          professional_interests: Array.isArray(selectedInterests) ? selectedInterests : [],
          professional_interests_other: profile.professionalInterestsOther || '',
          personal_interests: profile.personalInterests || '',
          networking_goals: profile.networkingGoals || ''
        };

        // Note: Email updates are handled separately through secure two-step verification
        // and are NOT included in this update

        const { error } = await supabase
          .from('users')
          .update(updateData)
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

      if (!emailChanged) {
        showSuccess('Profile updated successfully!');
      }

      // Trigger matching algorithm after profile update (don't wait for it)
      // Call server-side Edge Function which has permission to create matches
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/run-matching-algorithm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.json()).then(data => {
        console.log('✅ Matching algorithm completed:', data);
      }).catch(err => {
        console.error('⚠️ Matching algorithm failed (non-critical):', err);
      });
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
      alert('Failed to upload photo. Please try again with a smaller image.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleChangePassword = async () => {
    // Validate passwords match
    if (security.newPassword !== security.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (security.newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    try {
      // Update password in Supabase
      const { error } = await supabase.auth.updateUser({
        password: security.newPassword
      });

      if (error) throw error;

      showSuccess('Password changed successfully!');
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password. Please try again.');
    }
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
      alert('Failed to save notification preferences. Please try again.');
    }
  };

  const handleSavePrivacy = () => {
    // In a real app, this would save to a backend
    showSuccess('Privacy settings saved!');
  };

  const handleCancelAccountClick = () => {
    setShowCancelAccountModal(true);
  };

  const handleConfirmCancelAccount = async () => {
    // Collect user data for email notification
    const userData = {
      firstName: localStorage.getItem('userFirstName') || '',
      lastName: localStorage.getItem('userLastName') || '',
      email: profile.email || localStorage.getItem('userEmail') || '',
      jobTitle: profile.jobTitle || localStorage.getItem('userJobTitle') || '',
      company: profile.company || localStorage.getItem('userCompany') || '',
      reason: cancelAccountReason || 'No reason provided'
    };

    try {
      // Send notification to Jeff
      const response = await fetch('/api/cancelAccount', {
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
        console.error('Failed to send account cancellation notification');
      }
    } catch (error) {
      console.error('Error sending account cancellation notification:', error);
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
          loveFeatures: '',
          improveFeatures: '',
          newFeatures: ''
        });
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('There was an error submitting your feedback. Please try again.');
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError('');
    setContactSubmitting(true);

    if (!contactName || !contactEmail || !contactMessage) {
      setContactError('Please fill in all fields');
      setContactSubmitting(false);
      return;
    }

    if (!isValidEmail(contactEmail)) {
      setContactError('Please enter a valid email address');
      setContactSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/submitContact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMessage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setContactSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    } catch (error) {
      console.error('Contact form error:', error);
      setContactError('Failed to send message. Please try again.');
    }
    setContactSubmitting(false);
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
                    className="cursor-pointer inline-block bg-[#009900] text-white px-4 py-2 rounded-lg hover:bg-[#007700] transition-colors border-[3px] border-[#D0ED00]"
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
                <div className="space-y-6">
                  <div>
                    <label className="block font-medium text-gray-900 mb-2">Groups I belong to</label>
                    <p className="text-sm text-gray-600 mb-2">List groups or organizations you're a member of</p>
                    <input
                      type="text"
                      value={profile.groupsBelongTo || ''}
                      onChange={(e) => setProfile({...profile, groupsBelongTo: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-[#009900] focus:bg-white"
                      placeholder="Leadership Grand Rapids, University Alumni, BNI, YNPN, Other/suggest a group"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-900 mb-2">I'm looking to</label>
                    <p className="text-sm text-gray-600 mb-2">Hold Ctrl (Windows) or Cmd (Mac) to select multiple options</p>
                    <select
                      multiple
                      value={profile.lookingToAccomplish || []}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        setProfile({...profile, lookingToAccomplish: selected});
                      }}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:bg-white text-sm"
                      style={{ minHeight: '150px' }}
                    >
                      <option value="Launch a business">Launch a business</option>
                      <option value="Find professional cohorts">Find professional cohorts</option>
                      <option value="Find a collaborator for a project">Find a collaborator for a project</option>
                      <option value="Fill vacant board positions">Fill vacant board positions</option>
                      <option value="Join a board">Join a board</option>
                      <option value="Find volunteers for my organization">Find volunteers for my organization</option>
                      <option value="Volunteer more">Volunteer more</option>
                      <option value="Check out educational events with someone">Check out educational events with someone</option>
                      <option value="Make a connection in a specific organization (elaborate in Networking Goals)">Make a connection in a specific organization (elaborate in Networking Goals)</option>
                      <option value="Get out and network more">Get out and network more</option>
                      <option value="Get out of my home office more">Get out of my home office more</option>
                      <option value="Change career paths">Change career paths</option>
                      <option value="Find a coach">Find a coach</option>
                      <option value="Make a few new friends">Make a few new friends</option>
                      <option value="Sell my products or services here to other users (you've come to the wrong place for that)">Sell my products or services here to other users (you've come to the wrong place for that)</option>
                      <option value="Other (please elaborate in Networking Goals)">Other (please elaborate in Networking Goals)</option>
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

            {/* Profile Stats */}
            <div className="border-t border-gray-200 pt-6 mt-8">
              <h3 className="font-bold text-gray-900 mb-4">Profile Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-6">
                  <Calendar className="w-8 h-8 text-green-600 mb-2" />
                  <p className="text-2xl font-bold">{eventsAttendedCount}</p>
                  <p className="text-sm text-gray-600">Events Attending</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <CheckCircle className="w-8 h-8 text-purple-600 mb-2" />
                  <p className="text-2xl font-bold">{calculateProfileStrength()}%</p>
                  <p className="text-sm text-gray-600">Profile Strength</p>
                  {calculateProfileStrength() >= 90 ? (
                    <p className="text-xs text-green-600 mt-2 font-medium">
                      Great job on your profile!
                    </p>
                  ) : getMissingFields().length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Boost by adding: {getMissingFields().join(', ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Events Going To */}
              {goingEvents.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Events You're Attending</h4>
                  <div className="flex flex-wrap gap-3">
                    {goingEvents.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => navigate(`/events/${event.id}`)}
                        className="relative group cursor-pointer"
                        title={event.title}
                      >
                        <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-300 group-hover:border-[#009900] transition-all">
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {event.title.length > 20 ? event.title.substring(0, 20) + '...' : event.title}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
              {/* Privacy Coming Soon Overlay */}
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                <div className="bg-gradient-to-r from-green-100 to-lime-50 rounded-2xl p-6 max-w-md mx-4 text-center shadow-2xl border-4 border-[#D0ED00]">
                  <img
                    src="/BudE-favicon.png"
                    alt="BudE"
                    className="h-16 w-16 mx-auto mb-4 object-contain"
                  />
                  <p className="text-green-800 font-bold text-xl mb-2">
                    Coming Soon
                  </p>
                  <p className="text-green-700 font-medium text-base">
                    Advanced privacy controls are on the way!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5" />
                <h2 className="text-xl font-bold text-gray-900">Privacy Settings</h2>
              </div>
              <p className="text-gray-600 mb-6">Control who can see your information and contact you</p>

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

            {/* Privacy Terms & Conditions - Expandable */}
            <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 overflow-hidden">
              <button
                onClick={() => setShowPrivacyTerms(!showPrivacyTerms)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-gray-700" />
                  <h2 className="text-xl font-bold text-gray-900">Privacy Policy</h2>
                </div>
                {showPrivacyTerms ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {showPrivacyTerms && (
                <div className="px-6 pb-6 pt-2 max-h-96 overflow-y-auto border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-4">Last updated: October 3, 2025</p>

                  <div className="space-y-4 text-sm text-gray-700">
                    <section>
                      <h3 className="font-semibold text-gray-900 mb-2">1. Information We Collect</h3>
                      <p className="mb-2">We collect information that you provide directly to us, including:</p>
                      <ul className="list-disc ml-6 space-y-1 text-xs">
                        <li>Name, email address, and profile information</li>
                        <li>Professional details and networking preferences</li>
                        <li>Messages and communications with other users</li>
                        <li>Payment and billing information</li>
                        <li>Usage data and analytics</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-semibold text-gray-900 mb-2">2. How We Use Your Information</h3>
                      <p className="mb-2">We use the information we collect to:</p>
                      <ul className="list-disc ml-6 space-y-1 text-xs">
                        <li>Provide, maintain, and improve our services</li>
                        <li>Connect you with other professionals</li>
                        <li>Process payments and transactions</li>
                        <li>Send you updates and marketing communications</li>
                        <li>Respond to your requests and support needs</li>
                        <li>Protect against fraud and abuse</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-semibold text-gray-900 mb-2">3. Information Sharing</h3>
                      <p className="mb-2">We do not sell your personal information. We may share your information with:</p>
                      <ul className="list-disc ml-6 space-y-1 text-xs">
                        <li>Other users as part of the networking features</li>
                        <li>Service providers who assist in our operations</li>
                        <li>Law enforcement when required by law</li>
                        <li>Other parties with your consent</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-semibold text-gray-900 mb-2">4. Data Security</h3>
                      <p className="text-xs">We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>
                    </section>

                    <section>
                      <h3 className="font-semibold text-gray-900 mb-2">5. Your Rights</h3>
                      <p className="mb-2">You have the right to:</p>
                      <ul className="list-disc ml-6 space-y-1 text-xs">
                        <li>Access and receive a copy of your personal data</li>
                        <li>Correct inaccurate or incomplete data</li>
                        <li>Request deletion of your data</li>
                        <li>Object to or restrict certain processing</li>
                        <li>Data portability</li>
                        <li>Withdraw consent at any time</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="font-semibold text-gray-900 mb-2">6. Contact Us</h3>
                      <p className="text-xs">If you have questions about this Privacy Policy, please contact us at: privacy@bude.com</p>
                    </section>
                  </div>
                </div>
              )}
            </div>

            {/* Share Feedback */}
            <div className="bg-white rounded-lg shadow-sm p-8 border-2 border-[#D0ED00]">
              <div className="flex items-center gap-2 mb-2 text-[#009900]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <h2 className="text-xl font-bold">Share Feedback</h2>
              </div>
              <p className="text-gray-600 mb-6">Help us improve BudE by sharing your experience</p>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Give Feedback on Your Experience</h3>
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

            {/* Contact Us */}
            <div className="bg-white rounded-lg shadow-sm p-8 border-2 border-gray-200">
              <div className="flex items-center gap-2 mb-2 text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h2 className="text-xl font-bold">Contact Us</h2>
              </div>
              <p className="text-gray-600 mb-6">Have a question or need help? We'd love to hear from you!</p>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Send Us a Message</h3>
                  <p className="text-sm text-gray-600 mt-1">Get in touch with the BudE team</p>
                </div>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 font-medium flex items-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Us
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
                  <h3 className="font-medium text-gray-900">Cancel Account</h3>
                  <p className="text-sm text-gray-600 mt-1">Remove your account and all associated data</p>
                </div>
                <button
                  onClick={handleCancelAccountClick}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Cancel Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Terms of Service Tab */}
        {activeTab === 'terms' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-700" />
                <h2 className="text-2xl font-bold text-gray-900">Terms of Service</h2>
              </div>
              <p className="text-sm text-gray-500 mb-6">Last updated: October 3, 2025</p>

              <div className="space-y-6 text-sm text-gray-700">
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h3>
                  <p>By accessing and using the BudE networking platform, you accept and agree to be bound by the terms and provision of this agreement.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Use License</h3>
                  <p>Permission is granted to temporarily access the materials on BudE for personal, non-commercial use only. This is the grant of a license, not a transfer of title.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">3. User Accounts</h3>
                  <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Prohibited Uses</h3>
                  <p className="mb-2">You may not use the service to:</p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>Violate any applicable laws or regulations</li>
                    <li>Harass, abuse, or harm other users</li>
                    <li>Impersonate any person or entity</li>
                    <li>Transmit spam or unsolicited communications</li>
                    <li>Interfere with the security of the service</li>
                  </ul>

                  <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <p className="mb-3 font-medium">
                      <strong>This is not a DATING app.</strong> If you are reported by another BudE user for using it for that purpose your correspondence will be reviewed and you could be subject to suspension and NO refund of your subscription.
                    </p>
                    <p className="font-medium">
                      <strong>This app shall not be used by you (as a user) to SELL goods or services to other users.</strong> If you are reported by another BudE user for using it for that purpose your correspondence will be reviewed and you could be subject to suspension and NO refund of your subscription.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Subscription and Payment</h3>
                  <p>Paid subscriptions are billed in advance on a monthly or annual basis. Subscriptions automatically renew unless cancelled before the renewal date.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Cancellation and Refunds</h3>
                  <p>You may cancel your subscription at any time. Refunds are provided on a case-by-case basis in accordance with our refund policy.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Intellectual Property</h3>
                  <p>The service and its original content, features, and functionality are owned by The BudE System™ and are protected by international copyright, trademark, and other intellectual property laws.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Termination</h3>
                  <p>We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Limitation of Liability</h3>
                  <p>In no event shall BudE or its suppliers be liable for any damages arising out of the use or inability to use the service.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">10. Changes to Terms</h3>
                  <p>We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">11. Contact Information</h3>
                  <p>For questions about these Terms, please contact us at: support@bude.com</p>
                </section>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">© 2025 The BudE System™. All rights reserved.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Account Modal */}
      {showCancelAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowCancelAccountModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Cancel Account</h2>
              <button
                onClick={() => setShowCancelAccountModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              We're sorry to see you go! Before you leave, would you mind sharing why you're canceling your account? Your feedback helps us improve BudE.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Canceling (Optional)
              </label>
              <textarea
                value={cancelAccountReason}
                onChange={(e) => setCancelAccountReason(e.target.value)}
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
                onClick={() => setShowCancelAccountModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCancelAccount}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Cancel Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => !feedbackSubmitted && setShowFeedbackModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
                  <h2 className="text-2xl font-bold text-gray-900">Share Feedback</h2>
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

                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        required
                        value={feedbackData.name}
                        onChange={(e) => setFeedbackData({...feedbackData, name: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={feedbackData.email}
                        onChange={(e) => setFeedbackData({...feedbackData, email: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">What features do you love?</label>
                    <textarea
                      value={feedbackData.loveFeatures}
                      onChange={(e) => setFeedbackData({...feedbackData, loveFeatures: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent resize-none"
                      placeholder="Tell us what you enjoy most..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">What features need improvement?</label>
                    <textarea
                      value={feedbackData.improveFeatures}
                      onChange={(e) => setFeedbackData({...feedbackData, improveFeatures: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent resize-none"
                      placeholder="What could we do better..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">What new features would you like to see?</label>
                    <textarea
                      value={feedbackData.newFeatures}
                      onChange={(e) => setFeedbackData({...feedbackData, newFeatures: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent resize-none"
                      placeholder="Share your ideas..."
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
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

      {/* Contact Us Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => !contactSubmitting && setShowContactModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-center mb-6">Contact Us</h2>

            {!contactSuccess ? (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent resize-none"
                    required
                  />
                </div>
                {contactError && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-red-600">{contactError}</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowContactModal(false);
                      setContactName('');
                      setContactEmail('');
                      setContactMessage('');
                      setContactError('');
                    }}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={contactSubmitting}
                    className="flex-1 px-4 py-3 bg-[#009900] text-white rounded-lg font-medium hover:bg-[#007700] transition-colors border-[3px] border-[#D0ED00] disabled:opacity-50"
                  >
                    {contactSubmitting ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-[#009900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-600 mb-6">Thank you for reaching out. We'll get back to you soon!</p>
                <button
                  onClick={() => {
                    setShowContactModal(false);
                    setContactSuccess(false);
                  }}
                  className="px-6 py-2 bg-[#009900] text-white rounded-lg font-medium hover:bg-[#007700] transition-colors"
                >
                  Close
                </button>
              </div>
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
          checked ? 'bg-[#009900]' : 'bg-gray-300'
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