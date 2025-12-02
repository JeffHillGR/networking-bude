import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Upload, X, Link2, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase.js';
import EventSlotsManager from './EventSlotsManager.jsx';

// Maximum file size for image uploads (1.5MB)
const MAX_FILE_SIZE = 1.5 * 1024 * 1024; // 1.5MB in bytes

// Helper function to format bytes to readable size
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

function AdminPanel() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [unreviewedReportsCount, setUnreviewedReportsCount] = useState(0);
  const [ads, setAds] = useState({
    eventsSidebar1: JSON.parse(localStorage.getItem('ad_eventsSidebar1') || 'null'),
    eventsSidebar2: JSON.parse(localStorage.getItem('ad_eventsSidebar2') || 'null'),
    eventsBottom: JSON.parse(localStorage.getItem('ad_eventsBottom') || 'null'),
    eventDetailBanner: JSON.parse(localStorage.getItem('ad_eventDetailBanner') || 'null'),
    dashboardBottom1: JSON.parse(localStorage.getItem('ad_dashboardBottom1') || 'null'),
    dashboardBottom2: JSON.parse(localStorage.getItem('ad_dashboardBottom2') || 'null'),
    dashboardBottom3: JSON.parse(localStorage.getItem('ad_dashboardBottom3') || 'null')
  });

  // Check if user is authenticated AND has admin role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setIsAuthenticated(true);

          // Check if user has admin role
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('is_admin, admin_level, email')
            .eq('id', session.user.id)
            .single();

          if (userError) {
            console.error('Error checking admin status:', userError);
            setErrorMessage('Error verifying admin permissions');
            setLoading(false);
            return;
          }

          // Check admin_level first (new system), fallback to is_admin (legacy)
          const hasAdminAccess = userData && (
            userData.admin_level === 'admin' ||
            userData.admin_level === 'super_admin' ||
            userData.is_admin === true
          );

          if (hasAdminAccess) {
            setIsAdmin(true);
          } else {
            setErrorMessage(`Access Denied: ${userData?.email || 'Your account'} does not have admin permissions. Please contact the site administrator.`);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setErrorMessage('Error checking authentication');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch unreviewed reports count
  useEffect(() => {
    if (!isAdmin) return;

    const fetchUnreviewedCount = async () => {
      try {
        const { count, error } = await supabase
          .from('user_reports')
          .select('*', { count: 'exact', head: true })
          .eq('reviewed', false);

        if (error) throw error;
        setUnreviewedReportsCount(count || 0);
      } catch (error) {
        console.error('Error fetching unreviewed reports count:', error);
      }
    };

    fetchUnreviewedCount();

    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreviewedCount, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      // Check if user has admin role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_admin, email')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        console.error('Error checking admin status:', userError);
        setErrorMessage('Error verifying admin permissions');
        await supabase.auth.signOut();
        return;
      }

      if (userData && userData.is_admin === true) {
        setIsAuthenticated(true);
        setIsAdmin(true);
        alert('Admin login successful!');
      } else {
        setErrorMessage(`Access Denied: ${userData?.email || email} does not have admin permissions. Please contact the site administrator.`);
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setErrorMessage('');
  };

  const handleImageUpload = (slot, file) => {
    if (!file) return;

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      alert(`File too large! Please select an image smaller than ${formatFileSize(MAX_FILE_SIZE)}.\n\nYour file size: ${formatFileSize(file.size)}`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newAd = { ...ads[slot], image: reader.result };
      setAds({ ...ads, [slot]: newAd });
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (slot, url) => {
    const newAd = { ...ads[slot], url };
    setAds({ ...ads, [slot]: newAd });
  };

  const handleTagsChange = (slot, tags) => {
    const newAd = { ...ads[slot], tags };
    setAds({ ...ads, [slot]: newAd });
  };

  const saveAd = (slot) => {
    const ad = ads[slot];
    if (!ad || !ad.image) {
      alert('Please add an image before saving.');
      return;
    }
    // URL is optional - if empty, clicking the ad will open the inquiry modal
    localStorage.setItem(`ad_${slot}`, JSON.stringify(ad));
    alert(`Ad saved successfully!`);
  };

  const removeAd = (slot) => {
    localStorage.removeItem(`ad_${slot}`);
    setAds({ ...ads, [slot]: null });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated OR not an admin
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6">Admin Login</h1>

          {/* Error Message Display */}
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Only users with admin permissions can access this panel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
              <button
                onClick={() =>  navigate('/dashboard')}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard Banners & Ads
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'events'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Events & Banner Ads
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-4 py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'resources'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Insights
            </button>
            <button
              onClick={() => setActiveTab('moderation')}
              className={`px-4 py-4 font-semibold border-b-2 transition-colors relative ${
                activeTab === 'moderation'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Moderation
              {unreviewedReportsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreviewedReportsCount > 9 ? '9+' : unreviewedReportsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto p-8">
        {activeTab === 'dashboard' && (
          <DashboardSetupTab
            ads={ads}
            handleImageUpload={handleImageUpload}
            handleUrlChange={handleUrlChange}
            removeAd={removeAd}
          />
        )}
        {activeTab === 'events' && (
          <EventsAdsTab
            ads={ads}
            handleImageUpload={handleImageUpload}
            handleUrlChange={handleUrlChange}
            handleTagsChange={handleTagsChange}
            saveAd={saveAd}
            removeAd={removeAd}
          />
        )}
        {activeTab === 'resources' && <ResourcesInsightsTab />}
        {activeTab === 'moderation' && <ModerationTab onReportReviewed={() => setUnreviewedReportsCount(prev => Math.max(0, prev - 1))} />}
      </div>
    </div>
  );
}

function DashboardSetupTab({ ads, handleImageUpload, handleUrlChange, removeAd }) {

  // Hero Banner State for 3 slots
  const [heroBanners, setHeroBanners] = useState({
    slot1: { image_url: '', click_url: '', alt_text: '', target_zip: '', target_radius: '50', is_active: true },
    slot2: { image_url: '', click_url: '', alt_text: '', target_zip: '', target_radius: '50', is_active: true },
    slot3: { image_url: '', click_url: '', alt_text: '', target_zip: '', target_radius: '50', is_active: true }
  });

  const [uploadingBanner, setUploadingBanner] = useState(null);
  const [expandedHeroBanner, setExpandedHeroBanner] = useState(null);

  // Bottom Banner Ads state (localStorage-based)
  const [bottomBanners, setBottomBanners] = useState({
    slot1: { image: '', url: '' },
    slot2: { image: '', url: '' },
    slot3: { image: '', url: '' }
  });
  const [uploadingBottomBanner, setUploadingBottomBanner] = useState(null);

  // Load existing bottom banners from Supabase
  useEffect(() => {
    const loadBottomBanners = async () => {
      try {
        const { data: banners, error } = await supabase
          .from('dashboard_bottom_banners')
          .select('*')
          .order('slot_number');

        if (error) {
          console.error('Error loading bottom banners:', error);
          return;
        }

        const loadedBanners = {
          slot1: { image: '', url: '' },
          slot2: { image: '', url: '' },
          slot3: { image: '', url: '' }
        };

        (banners || []).forEach(banner => {
          const slotKey = `slot${banner.slot_number}`;
          loadedBanners[slotKey] = {
            image: banner.image_url,
            url: banner.click_url
          };
        });

        setBottomBanners(loadedBanners);
      } catch (error) {
        console.error('Error loading bottom banners:', error);
      }
    };

    loadBottomBanners();
  }, []);

  // Handle bottom banner image upload to Supabase Storage
  const handleBottomBannerUpload = async (slotNumber, file) => {
    if (!file) return;

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      alert(`File too large! Please select an image smaller than ${formatFileSize(MAX_FILE_SIZE)}.\n\nYour file size: ${formatFileSize(file.size)}`);
      return;
    }

    setUploadingBottomBanner(slotNumber);
    try {
      const slotKey = `slot${slotNumber}`;
      const existingImageUrl = bottomBanners[slotKey]?.image;

      // Delete old image if it exists
      if (existingImageUrl && existingImageUrl.includes('Dashboard-bottom-banner-ads')) {
        try {
          const oldPath = existingImageUrl.split('/Dashboard-bottom-banner-ads/')[1]?.split('?')[0];
          if (oldPath) {
            await supabase.storage.from('Dashboard-bottom-banner-ads').remove([oldPath]);
          }
        } catch (error) {
          console.error('Error removing old image:', error);
        }
      }

      // Upload new image
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `bottom-banner-${slotNumber}-${timestamp}.${fileExt}`;

      console.log('Uploading file:', {
        fileName,
        fileSize: file.size,
        fileType: file.type,
        bucket: 'Dashboard-bottom-banner-ads'
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('Dashboard-bottom-banner-ads')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error details:', {
          error: uploadError,
          message: uploadError.message,
          statusCode: uploadError.statusCode,
          fileName: fileName
        });
        alert(`Failed to upload image: ${uploadError.message || 'Please try again.'}`);
        setUploadingBottomBanner(null);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('Dashboard-bottom-banner-ads')
        .getPublicUrl(fileName);

      // Add cache-busting parameter
      const cacheBustedUrl = `${urlData.publicUrl}?v=${timestamp}`;

      console.log('Upload successful! URL:', cacheBustedUrl);

      setBottomBanners(prev => {
        const updated = {
          ...prev,
          [slotKey]: { ...prev[slotKey], image: cacheBustedUrl }
        };
        console.log('Updated bottomBanners state:', updated);
        return updated;
      });

      setUploadingBottomBanner(null);
      alert('Image uploaded successfully! Now add a URL and click Save.');
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Failed to upload image. Please try again.');
      setUploadingBottomBanner(null);
    }
  };

  // Handle bottom banner URL change
  const handleBottomBannerChange = (slotNumber, field, value) => {
    const slotKey = `slot${slotNumber}`;
    setBottomBanners({
      ...bottomBanners,
      [slotKey]: { ...bottomBanners[slotKey], [field]: value }
    });
  };

  // Save bottom banner to Supabase
  const saveBottomBanner = async (slotNumber) => {
    console.log('Save button clicked for slot:', slotNumber);
    const slotKey = `slot${slotNumber}`;
    const banner = bottomBanners[slotKey];

    console.log('Banner data:', banner);
    console.log('Has image:', !!banner.image);
    console.log('Has URL:', !!banner.url);

    if (!banner.image || !banner.url) {
      alert('Please add both an image and URL before saving.');
      return;
    }

    try {
      const { error } = await supabase
        .from('dashboard_bottom_banners')
        .upsert({
          slot_number: slotNumber,
          image_url: banner.image,
          click_url: banner.url,
          is_active: true
        }, {
          onConflict: 'slot_number'
        });

      if (error) {
        console.error('Error saving banner:', error);
        alert('Failed to save banner. Please try again.');
        return;
      }

      alert(`Bottom Banner ${slotNumber} saved successfully!`);
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Failed to save banner. Please try again.');
    }
  };

  // Remove bottom banner
  const removeBottomBanner = async (slotNumber) => {
    const slotKey = `slot${slotNumber}`;
    const existingImageUrl = bottomBanners[slotKey]?.image;

    // Delete image from Supabase storage if it exists
    if (existingImageUrl && existingImageUrl.includes('Dashboard-bottom-banner-ads')) {
      try {
        const oldPath = existingImageUrl.split('/Dashboard-bottom-banner-ads/')[1]?.split('?')[0];
        if (oldPath) {
          await supabase.storage.from('Dashboard-bottom-banner-ads').remove([oldPath]);
        }
      } catch (error) {
        console.error('Error removing image from storage:', error);
      }
    }

    // Remove from Supabase database
    try {
      const { error } = await supabase
        .from('dashboard_bottom_banners')
        .delete()
        .eq('slot_number', slotNumber);

      if (error) {
        console.error('Error removing banner from database:', error);
      }
    } catch (error) {
      console.error('Error removing banner:', error);
    }

    // Update state
    setBottomBanners({
      ...bottomBanners,
      [slotKey]: { image: '', url: '' }
    });
  };

  // Load existing hero banners from Supabase
  useEffect(() => {
    const loadHeroBanners = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_banners')
          .select('*')
          .order('slot_number');

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading hero banners:', error);
          return;
        }

        if (data && data.length > 0) {
          const bannersState = {
            slot1: data.find(b => b.slot_number === 1) || heroBanners.slot1,
            slot2: data.find(b => b.slot_number === 2) || heroBanners.slot2,
            slot3: data.find(b => b.slot_number === 3) || heroBanners.slot3
          };
          setHeroBanners(bannersState);
        }
      } catch (err) {
        console.error('Error loading hero banners:', err);
      }
    };

    loadHeroBanners();
  }, []);

  // Handle hero banner image upload to Supabase Storage
  const handleHeroBannerUpload = async (slotNumber, file) => {
    if (!file) return;

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      alert(`File too large! Please select an image smaller than ${formatFileSize(MAX_FILE_SIZE)}.\n\nYour file size: ${formatFileSize(file.size)}`);
      return;
    }

    setUploadingBanner(slotNumber);
    try {
      const slotKey = `slot${slotNumber}`;
      const existingImageUrl = heroBanners[slotKey]?.image_url;

      // Delete old image if it exists
      if (existingImageUrl && existingImageUrl.includes('Hero-Banners-Geotagged')) {
        try {
          // Extract file path from URL
          const urlParts = existingImageUrl.split('/storage/v1/object/public/Hero-Banners-Geotagged/');
          if (urlParts.length > 1) {
            const oldFilePath = decodeURIComponent(urlParts[1]);
            await supabase.storage
              .from('Hero-Banners-Geotagged')
              .remove([oldFilePath]);
            console.log('Deleted old banner:', oldFilePath);
          }
        } catch (deleteError) {
          console.warn('Could not delete old banner:', deleteError);
          // Continue with upload even if delete fails
        }
      }

      // Upload new image
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-banner-slot-${slotNumber}.${fileExt}`;
      const filePath = `hero-banners/${fileName}`;

      // Use upsert to overwrite if file exists
      const { error: uploadError } = await supabase.storage
        .from('Hero-Banners-Geotagged')
        .upload(filePath, file, {
          upsert: true // Overwrite if exists
        });

      if (uploadError) throw uploadError;

      // Get public URL with cache-busting timestamp
      const { data: { publicUrl } } = supabase.storage
        .from('Hero-Banners-Geotagged')
        .getPublicUrl(filePath);

      // Add cache-busting query parameter to force browser to fetch new image
      const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;

      // Update state
      setHeroBanners({
        ...heroBanners,
        [slotKey]: { ...heroBanners[slotKey], image_url: cacheBustedUrl }
      });

      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading hero banner:', error);
      alert('Failed to upload image: ' + error.message);
    } finally {
      setUploadingBanner(null);
    }
  };

  // Handle hero banner field changes
  const handleHeroBannerChange = (slotNumber, field, value) => {
    const slotKey = `slot${slotNumber}`;
    setHeroBanners({
      ...heroBanners,
      [slotKey]: { ...heroBanners[slotKey], [field]: value }
    });
  };

  // Save hero banner to Supabase
  const saveHeroBanner = async (slotNumber) => {
    const slotKey = `slot${slotNumber}`;
    const banner = heroBanners[slotKey];

    if (!banner.image_url) {
      alert('Please upload an image first');
      return;
    }

    try {
      const { error } = await supabase
        .from('hero_banners')
        .upsert({
          slot_number: slotNumber,
          image_url: banner.image_url,
          click_url: banner.click_url || null,
          alt_text: banner.alt_text || null,
          target_zip: banner.target_zip || null,
          target_radius: banner.target_radius || '50',
          is_active: true  // Always activate banner when saving
        }, {
          onConflict: 'slot_number'
        });

      if (error) throw error;

      alert(`Hero Banner ${slotNumber} saved successfully! Refresh your dashboard to see it.`);
    } catch (error) {
      console.error('Error saving hero banner:', error);
      alert('Failed to save: ' + error.message);
    }
  };

  const renderHeroBannerSlot = (slotNumber) => {
    const slotKey = `slot${slotNumber}`;
    const banner = heroBanners[slotKey];
    const isExpanded = expandedHeroBanner === slotNumber;
    const hasBanner = banner?.image_url && banner.image_url !== '';

    return (
      <div key={slotNumber} className="border-2 border-gray-300 rounded-lg p-4 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExpandedHeroBanner(isExpanded ? null : slotNumber)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Hero Banner Slot {slotNumber}</h4>
              {hasBanner && !isExpanded && (
                <p className="text-xs text-gray-600 mt-0.5">
                  {banner.alt_text || 'Banner uploaded'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Form */}
        {isExpanded && (
          <div className="space-y-3 bg-gray-50 p-4 rounded">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Banner Image</label>
              {uploadingBanner === slotNumber ? (
                <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-2"></div>
                  <span className="text-sm text-blue-600 font-medium">Uploading...</span>
                </div>
              ) : banner.image_url ? (
                <div className="relative">
                  <img src={banner.image_url} alt={`Banner ${slotNumber}`} className="w-full h-48 object-cover rounded-lg" />
                  <button
                    onClick={() => handleHeroBannerChange(slotNumber, 'image_url', '')}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-gray-50">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload banner</span>
                  <span className="text-xs text-gray-500 mt-1">Recommended size: 1200x300px</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleHeroBannerUpload(slotNumber, e.target.files[0])}
                  />
                </label>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Alt Text (for accessibility)</label>
              <input
                type="text"
                value={banner.alt_text || ''}
                onChange={(e) => handleHeroBannerChange(slotNumber, 'alt_text', e.target.value)}
                placeholder="Description of banner"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Click-through URL (optional)</label>
              <div className="flex gap-2">
                <Link2 className="w-4 h-4 text-gray-400 mt-2 flex-shrink-0" />
                <input
                  type="url"
                  value={banner.click_url || ''}
                  onChange={(e) => handleHeroBannerChange(slotNumber, 'click_url', e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Organization Zip Code (for targeting, optional)</label>
              <input
                type="text"
                value={banner.target_zip || ''}
                onChange={(e) => handleHeroBannerChange(slotNumber, 'target_zip', e.target.value)}
                placeholder="49503"
                maxLength="5"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Target Radius</label>
              <select
                value={banner.target_radius || '50'}
                onChange={(e) => handleHeroBannerChange(slotNumber, 'target_radius', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              >
                <option value="25">25 miles</option>
                <option value="50">50 miles (recommended)</option>
                <option value="100">100 miles</option>
                <option value="statewide">Statewide</option>
                <option value="national">National (entire country)</option>
              </select>
            </div>
            <button
              onClick={() => saveHeroBanner(slotNumber)}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-medium"
            >
              Save Banner {slotNumber}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard Banners & Ads</h2>

      {/* Hero Banner Carousel - Accordion Style */}
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-sm text-blue-900 mb-1">Hero Banner Carousel (Geotagged)</h3>
          <p className="text-xs text-blue-700">
            Upload up to 3 banner images that will rotate on each dashboard page refresh. Optionally add geotagging to show location-specific banners.
          </p>
        </div>

        {[1, 2, 3].map(slotNumber => renderHeroBannerSlot(slotNumber))}
      </div>

      {/* Dashboard Bottom Ads */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">Dashboard Bottom Ads (Rotating)</h3>
        <p className="text-gray-600 mb-6">
          Upload up to 3 banner ads that will rotate every 8 seconds at the bottom of the user dashboard
        </p>

        {/* Bottom Banner Slot 1 */}
        <div className="mb-6 p-4 border-2 border-blue-300 rounded-lg bg-blue-50">
          <h4 className="font-bold text-gray-900 mb-3">Bottom Banner Slot 1</h4>
          <div className="space-y-3 bg-white p-3 rounded">
            <div>
              <label className="block text-sm font-medium mb-2">Banner Image</label>
              {uploadingBottomBanner === 1 ? (
                <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-2"></div>
                  <span className="text-sm text-blue-600 font-medium">Uploading...</span>
                </div>
              ) : bottomBanners.slot1.image ? (
                <div className="relative">
                  <img src={bottomBanners.slot1.image} alt="Banner 1" className="w-full h-32 object-cover rounded-lg" />
                  <button
                    onClick={() => removeBottomBanner(1)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-gray-50">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload banner</span>
                  <span className="text-xs text-gray-500 mt-1">Recommended size: 1200x180px</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleBottomBannerUpload(1, e.target.files[0])}
                  />
                </label>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Click-through URL</label>
              <div className="flex gap-2">
                <Link2 className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0" />
                <input
                  type="url"
                  value={bottomBanners.slot1.url}
                  onChange={(e) => handleBottomBannerChange(1, 'url', e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={() => saveBottomBanner(1)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
            >
              Save Banner 1
            </button>
          </div>
        </div>

        {/* Bottom Banner Slot 2 */}
        <div className="mb-6 p-4 border-2 border-green-300 rounded-lg bg-green-50">
          <h4 className="font-bold text-gray-900 mb-3">Bottom Banner Slot 2</h4>
          <div className="space-y-3 bg-white p-3 rounded">
            <div>
              <label className="block text-sm font-medium mb-2">Banner Image</label>
              {uploadingBottomBanner === 2 ? (
                <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-green-300 rounded-lg bg-green-50">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-2"></div>
                  <span className="text-sm text-green-600 font-medium">Uploading...</span>
                </div>
              ) : bottomBanners.slot2.image ? (
                <div className="relative">
                  <img src={bottomBanners.slot2.image} alt="Banner 2" className="w-full h-32 object-cover rounded-lg" />
                  <button
                    onClick={() => removeBottomBanner(2)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-gray-50">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload banner</span>
                  <span className="text-xs text-gray-500 mt-1">Recommended size: 1200x180px</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleBottomBannerUpload(2, e.target.files[0])}
                  />
                </label>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Click-through URL</label>
              <div className="flex gap-2">
                <Link2 className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0" />
                <input
                  type="url"
                  value={bottomBanners.slot2.url}
                  onChange={(e) => handleBottomBannerChange(2, 'url', e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={() => saveBottomBanner(2)}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-medium"
            >
              Save Banner 2
            </button>
          </div>
        </div>

        {/* Bottom Banner Slot 3 */}
        <div className="mb-6 p-4 border-2 border-purple-300 rounded-lg bg-purple-50">
          <h4 className="font-bold text-gray-900 mb-3">Bottom Banner Slot 3</h4>
          <div className="space-y-3 bg-white p-3 rounded">
            <div>
              <label className="block text-sm font-medium mb-2">Banner Image</label>
              {uploadingBottomBanner === 3 ? (
                <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-300 rounded-lg bg-purple-50">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-2"></div>
                  <span className="text-sm text-purple-600 font-medium">Uploading...</span>
                </div>
              ) : bottomBanners.slot3.image ? (
                <div className="relative">
                  <img src={bottomBanners.slot3.image} alt="Banner 3" className="w-full h-32 object-cover rounded-lg" />
                  <button
                    onClick={() => removeBottomBanner(3)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-gray-50">
                  <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload banner</span>
                  <span className="text-xs text-gray-500 mt-1">Recommended size: 1200x180px</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleBottomBannerUpload(3, e.target.files[0])}
                  />
                </label>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Click-through URL</label>
              <div className="flex gap-2">
                <Link2 className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0" />
                <input
                  type="url"
                  value={bottomBanners.slot3.url}
                  onChange={(e) => handleBottomBannerChange(3, 'url', e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={() => saveBottomBanner(3)}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 font-medium"
            >
              Save Banner 3
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventsAdsTab({ ads, handleImageUpload, handleUrlChange, handleTagsChange, saveAd, removeAd }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Events Page Content and Ads</h2>

      <div className="flex gap-6">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white rounded-lg p-8 border border-gray-200 mb-6">
            <EventSlotsManager />
          </div>

          {/* Bottom Banner Ad - pushed to bottom */}
          <div className="mt-auto">
            <InlineAdEditor
              title="Events - Bottom Banner"
              slot="eventsBottom"
              ad={ads.eventsBottom}
              onImageUpload={handleImageUpload}
              onUrlChange={handleUrlChange}
              onTagsChange={handleTagsChange}
              onSave={saveAd}
              onRemove={removeAd}
              dimensions="728x160px"
              description="Full width banner below Events list"
              aspectRatio="728/160"
            />
          </div>
        </div>

        {/* Sidebar with Ads */}
        <div className="w-44 space-y-6">
          <InlineAdEditor
            title="Events - Sidebar Ad 1"
            slot="eventsSidebar1"
            ad={ads.eventsSidebar1}
            onImageUpload={handleImageUpload}
            onUrlChange={handleUrlChange}
            onTagsChange={handleTagsChange}
            onSave={saveAd}
            onRemove={removeAd}
            dimensions="160x600px"
            description="Appears in right sidebar, top position"
            aspectRatio="160/600"
          />

          <InlineAdEditor
            title="Events - Sidebar Ad 2"
            slot="eventsSidebar2"
            ad={ads.eventsSidebar2}
            onImageUpload={handleImageUpload}
            onUrlChange={handleUrlChange}
            onTagsChange={handleTagsChange}
            onSave={saveAd}
            onRemove={removeAd}
            dimensions="160x600px"
            description="Appears in right sidebar, lower position"
            aspectRatio="160/600"
          />
        </div>
      </div>
    </div>
  );
}

function ResourcesInsightsTab() {
  const [contentSlots, setContentSlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedSlot, setExpandedSlot] = useState(null);
  const [saving, setSaving] = useState({});
  const [scrapeUrls, setScrapeUrls] = useState({});
  const [scraping, setScraping] = useState({});
  const [scrapeErrors, setScrapeErrors] = useState({});

  const emptyContent = {
    title: '',
    description: '',
    image: '',
    url: '',
    tags: '',
    sponsored_by: '',
    full_content: '',
    author: ''
  };

  // Load all content slots from Supabase
  useEffect(() => {
    loadContentSlots();
  }, []);

  const loadContentSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .order('slot_number', { ascending: true });

      if (error) throw error;

      // Convert array to object keyed by slot_number
      const slotsObj = {};
      data.forEach(content => {
        slotsObj[content.slot_number] = content;
      });
      setContentSlots(slotsObj);
    } catch (error) {
      console.error('Error loading content slots:', error);
      alert('Failed to load insights from database');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (slotNumber, field, value) => {
    setContentSlots(prev => ({
      ...prev,
      [slotNumber]: {
        ...(prev[slotNumber] || { ...emptyContent, slot_number: slotNumber }),
        [field]: value
      }
    }));
  };

  const handleImageUpload = (slotNumber, file) => {
    if (!file) return;

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      alert(`File too large! Please select an image smaller than ${formatFileSize(MAX_FILE_SIZE)}.\n\nYour file size: ${formatFileSize(file.size)}`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      handleInputChange(slotNumber, 'image', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveContent = async (slotNumber) => {
    const content = contentSlots[slotNumber];

    if (!content || !content.title) {
      alert('Please fill in at least the Title field');
      return;
    }

    setSaving(prev => ({ ...prev, [slotNumber]: true }));

    try {
      const contentData = {
        ...content,
        slot_number: slotNumber
      };

      const { error } = await supabase
        .from('insights')
        .upsert(contentData, {
          onConflict: 'slot_number'
        });

      if (error) throw error;

      alert(`Insight Slot ${slotNumber} saved successfully!`);
      await loadContentSlots();
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content: ' + error.message);
    } finally {
      setSaving(prev => ({ ...prev, [slotNumber]: false }));
    }
  };

  const handleDeleteContent = async (slotNumber) => {
    if (!confirm(`Are you sure you want to delete Insight Slot ${slotNumber}? This cannot be undone.`)) {
      return;
    }

    setSaving(prev => ({ ...prev, [slotNumber]: true }));

    try {
      const { error } = await supabase
        .from('insights')
        .delete()
        .eq('slot_number', slotNumber);

      if (error) throw error;

      setContentSlots(prev => {
        const newSlots = { ...prev };
        delete newSlots[slotNumber];
        return newSlots;
      });

      alert(`Insight Slot ${slotNumber} deleted successfully!`);
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content: ' + error.message);
    } finally {
      setSaving(prev => ({ ...prev, [slotNumber]: false }));
    }
  };

  const handleMoveUp = async (slotNumber) => {
    if (slotNumber <= 1) return;

    const currentContent = contentSlots[slotNumber];
    const prevContent = contentSlots[slotNumber - 1];

    if (!currentContent) {
      alert('Cannot move an empty slot');
      return;
    }

    setSaving(prev => ({ ...prev, [slotNumber]: true, [slotNumber - 1]: true }));

    try {
      if (prevContent) {
        // Swap both slots
        const { data: currentData, error: fetchError1 } = await supabase
          .from('insights')
          .select('*')
          .eq('slot_number', slotNumber)
          .single();

        if (fetchError1) throw fetchError1;

        const { data: prevData, error: fetchError2 } = await supabase
          .from('insights')
          .select('*')
          .eq('slot_number', slotNumber - 1)
          .single();

        if (fetchError2) throw fetchError2;

        // Delete both
        const { error: deleteError } = await supabase
          .from('insights')
          .delete()
          .in('slot_number', [slotNumber, slotNumber - 1]);

        if (deleteError) throw deleteError;

        // Reinsert with swapped slot numbers
        const { id: currentId, created_at: currentCreated, updated_at: currentUpdated, ...currentContentData } = currentData;
        const { id: prevId, created_at: prevCreated, updated_at: prevUpdated, ...prevContentData } = prevData;

        const { error: insertError } = await supabase
          .from('insights')
          .insert([
            { ...currentContentData, slot_number: slotNumber - 1 },
            { ...prevContentData, slot_number: slotNumber }
          ]);

        if (insertError) throw insertError;
      } else {
        // Only move current slot up
        const { data: contentData, error: fetchError } = await supabase
          .from('insights')
          .select('*')
          .eq('slot_number', slotNumber)
          .single();

        if (fetchError) throw fetchError;

        const { error: deleteError } = await supabase
          .from('insights')
          .delete()
          .eq('slot_number', slotNumber);

        if (deleteError) throw deleteError;

        const { id, created_at, updated_at, ...cleanContentData } = contentData;
        const { error: insertError } = await supabase
          .from('insights')
          .insert({ ...cleanContentData, slot_number: slotNumber - 1 });

        if (insertError) throw insertError;
      }

      await loadContentSlots();
      alert(`Content moved from Slot ${slotNumber} to Slot ${slotNumber - 1}`);
    } catch (error) {
      console.error('Error moving content:', error);
      alert('Failed to move content: ' + error.message);
      await loadContentSlots();
    } finally {
      setSaving(prev => ({ ...prev, [slotNumber]: false, [slotNumber - 1]: false }));
    }
  };

  const handleMoveDown = async (slotNumber) => {
    if (slotNumber >= 10) return;

    const currentContent = contentSlots[slotNumber];
    const nextContent = contentSlots[slotNumber + 1];

    if (!currentContent) {
      alert('Cannot move an empty slot');
      return;
    }

    setSaving(prev => ({ ...prev, [slotNumber]: true, [slotNumber + 1]: true }));

    try {
      if (nextContent) {
        // Swap both slots
        const { data: currentData, error: fetchError1 } = await supabase
          .from('insights')
          .select('*')
          .eq('slot_number', slotNumber)
          .single();

        if (fetchError1) throw fetchError1;

        const { data: nextData, error: fetchError2 } = await supabase
          .from('insights')
          .select('*')
          .eq('slot_number', slotNumber + 1)
          .single();

        if (fetchError2) throw fetchError2;

        // Delete both
        const { error: deleteError } = await supabase
          .from('insights')
          .delete()
          .in('slot_number', [slotNumber, slotNumber + 1]);

        if (deleteError) throw deleteError;

        // Reinsert with swapped slot numbers
        const { id: currentId, created_at: currentCreated, updated_at: currentUpdated, ...currentContentData } = currentData;
        const { id: nextId, created_at: nextCreated, updated_at: nextUpdated, ...nextContentData } = nextData;

        const { error: insertError } = await supabase
          .from('insights')
          .insert([
            { ...currentContentData, slot_number: slotNumber + 1 },
            { ...nextContentData, slot_number: slotNumber }
          ]);

        if (insertError) throw insertError;
      } else {
        // Only move current slot down
        const { data: contentData, error: fetchError } = await supabase
          .from('insights')
          .select('*')
          .eq('slot_number', slotNumber)
          .single();

        if (fetchError) throw fetchError;

        const { error: deleteError } = await supabase
          .from('insights')
          .delete()
          .eq('slot_number', slotNumber);

        if (deleteError) throw deleteError;

        const { id, created_at, updated_at, ...cleanContentData } = contentData;
        const { error: insertError } = await supabase
          .from('insights')
          .insert({ ...cleanContentData, slot_number: slotNumber + 1 });

        if (insertError) throw insertError;
      }

      await loadContentSlots();
      alert(`Content moved from Slot ${slotNumber} to Slot ${slotNumber + 1}`);
    } catch (error) {
      console.error('Error moving content:', error);
      alert('Failed to move content: ' + error.message);
      await loadContentSlots();
    } finally {
      setSaving(prev => ({ ...prev, [slotNumber]: false, [slotNumber + 1]: false }));
    }
  };

  const handleScrapeUrl = async (slotNumber) => {
    const url = scrapeUrls[slotNumber];
    if (!url) {
      setScrapeErrors(prev => ({ ...prev, [slotNumber]: 'Please enter a URL' }));
      return;
    }

    setScraping(prev => ({ ...prev, [slotNumber]: true }));
    setScrapeErrors(prev => ({ ...prev, [slotNumber]: '' }));

    try {
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const response = await fetch(proxyUrl + encodeURIComponent(url));

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      let scrapedData = { url };

      // Try to find JSON-LD structured data (used by many article/blog sites)
      const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
      let articleData = null;

      for (const script of jsonLdScripts) {
        try {
          const data = JSON.parse(script.textContent);
          // Handle both single objects and arrays
          const items = Array.isArray(data) ? data : [data];
          articleData = items.find(item =>
            item && (item['@type'] === 'Article' ||
                    item['@type'] === 'BlogPosting' ||
                    item['@type'] === 'NewsArticle')
          );
          if (articleData) {
            console.log('Found structured article data');
            break;
          }
        } catch (e) {
          console.warn('Failed to parse JSON-LD script');
        }
      }

      if (articleData) {
        // Extract title from structured data
        if (articleData.headline || articleData.name) {
          scrapedData.title = articleData.headline || articleData.name;
        }

        // Extract description from structured data
        if (articleData.description) {
          scrapedData.description = articleData.description;
        }

        // Extract author from structured data
        if (articleData.author) {
          if (typeof articleData.author === 'string') {
            scrapedData.author = articleData.author;
          } else if (articleData.author.name) {
            scrapedData.author = articleData.author.name;
          } else if (Array.isArray(articleData.author) && articleData.author[0]?.name) {
            scrapedData.author = articleData.author[0].name;
          }
        }

        // Extract image from structured data
        if (articleData.image) {
          try {
            const imageUrl = typeof articleData.image === 'string' ? articleData.image :
                           (articleData.image.url || (Array.isArray(articleData.image) ? articleData.image[0] : null));
            if (imageUrl) {
              scrapedData.image = imageUrl.startsWith('http') ? imageUrl : new URL(imageUrl, url).href;
            }
          } catch (e) {
            console.warn('Failed to parse image URL from structured data');
          }
        }
      }

      // Fallback chain for title
      if (!scrapedData.title) {
        scrapedData.title =
          doc.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim() ||
          doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content')?.trim() ||
          doc.querySelector('h1')?.textContent?.trim() ||
          doc.querySelector('title')?.textContent?.trim() ||
          '';
      }

      // Fallback chain for description
      if (!scrapedData.description) {
        scrapedData.description =
          doc.querySelector('meta[property="og:description"]')?.getAttribute('content')?.trim() ||
          doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ||
          doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content')?.trim() ||
          '';
      }

      // Fallback chain for image
      if (!scrapedData.image) {
        const ogImage =
          doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
          doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
          doc.querySelector('img[class*="hero"]')?.getAttribute('src') ||
          doc.querySelector('img[class*="featured"]')?.getAttribute('src') ||
          '';
        if (ogImage) {
          try {
            scrapedData.image = ogImage.startsWith('http') ? ogImage : new URL(ogImage, url).href;
          } catch (e) {
            console.warn('Failed to construct absolute image URL');
          }
        }
      }

      // Fallback chain for author
      if (!scrapedData.author) {
        scrapedData.author =
          doc.querySelector('meta[name="author"]')?.getAttribute('content')?.trim() ||
          doc.querySelector('meta[property="article:author"]')?.getAttribute('content')?.trim() ||
          doc.querySelector('[rel="author"]')?.textContent?.trim() ||
          doc.querySelector('.author')?.textContent?.trim() ||
          doc.querySelector('[class*="author"]')?.textContent?.trim() ||
          '';
      }

      // Log what we found for debugging
      const fieldsFound = Object.keys(scrapedData).filter(k => scrapedData[k] && k !== 'url');
      console.log(`Scraped ${fieldsFound.length} fields:`, fieldsFound);

      setContentSlots(prev => ({
        ...prev,
        [slotNumber]: {
          ...(prev[slotNumber] || { ...emptyContent, slot_number: slotNumber }),
          title: scrapedData.title || prev[slotNumber]?.title || '',
          description: scrapedData.description || prev[slotNumber]?.description || '',
          image: scrapedData.image || prev[slotNumber]?.image || '',
          url: scrapedData.url,
          author: scrapedData.author || prev[slotNumber]?.author || ''
        }
      }));

      if (fieldsFound.length > 0) {
        alert(`Scraped ${fieldsFound.length} field(s)! Please review and fill in remaining details.`);
      } else {
        alert('Could not extract data from this URL. Please enter details manually.');
      }
    } catch (error) {
      console.error('Scraping error:', error);
      setScrapeErrors(prev => ({ ...prev, [slotNumber]: `Unable to scrape: ${error.message}. Please enter details manually.` }));
    } finally {
      setScraping(prev => ({ ...prev, [slotNumber]: false }));
    }
  };

  const toggleSlot = (slotNumber) => {
    setExpandedSlot(expandedSlot === slotNumber ? null : slotNumber);
  };

  const renderInsightSlot = (slotNumber) => {
    const content = contentSlots[slotNumber] || { ...emptyContent, slot_number: slotNumber };
    const isExpanded = expandedSlot === slotNumber;
    const hasContent = !!contentSlots[slotNumber]?.title;
    const isDashboard = slotNumber <= 3;

    return (
      <div key={slotNumber} className="border-2 border-gray-300 rounded-lg p-4 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleSlot(slotNumber)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            <div>
              <h4 className="font-bold text-sm text-gray-900">
                Insight Slot {slotNumber}
                {isDashboard && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Dashboard</span>}
              </h4>
              {hasContent && !isExpanded && (
                <p className="text-xs text-gray-600 mt-0.5">{content.title}</p>
              )}
            </div>
          </div>

          {/* Move Up/Down Buttons */}
          {hasContent && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMoveUp(slotNumber)}
                disabled={slotNumber === 1 || saving[slotNumber] || saving[slotNumber - 1]}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Move Up"
              >
                <Upload className="w-4 h-4 rotate-180" />
              </button>
              <button
                onClick={() => handleMoveDown(slotNumber)}
                disabled={slotNumber === 10 || saving[slotNumber] || saving[slotNumber + 1]}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Move Down"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Expanded Form */}
        {isExpanded && (
          <div className="space-y-3 bg-gray-50 p-4 rounded">
            {/* URL Scraper */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded border border-blue-200">
              <p className="text-xs font-semibold text-gray-900 mb-2">✨ Quick Add from URL (Optional)</p>
              <p className="text-xs text-gray-600 mb-2">Paste an article URL to auto-fill details</p>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={scrapeUrls[slotNumber] || ''}
                  onChange={(e) => setScrapeUrls(prev => ({ ...prev, [slotNumber]: e.target.value }))}
                  placeholder="https://example.com/article"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  disabled={scraping[slotNumber]}
                />
                <button
                  onClick={() => handleScrapeUrl(slotNumber)}
                  disabled={scraping[slotNumber]}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {scraping[slotNumber] ? 'Scraping...' : 'Scrape'}
                </button>
              </div>
              {scrapeErrors[slotNumber] && <p className="text-xs text-red-600 mt-1">{scrapeErrors[slotNumber]}</p>}
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => handleInputChange(slotNumber, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="e.g., Leadership Tips for 2025"
              />
            </div>

            {/* Preview Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Preview Description *</label>
              <textarea
                value={content.description || ''}
                onChange={(e) => handleInputChange(slotNumber, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                rows="3"
                placeholder="Brief description for card preview"
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Image</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={content.image || ''}
                  onChange={(e) => handleInputChange(slotNumber, 'image', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Image URL or upload below"
                />
                <label className="px-3 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300 cursor-pointer flex items-center gap-1">
                  <Upload className="w-4 h-4" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(slotNumber, e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
              {content.image && (
                <img src={content.image} alt="Preview" className="mt-2 w-full h-32 object-cover rounded" />
              )}
            </div>

            {/* External URL */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">External Site URL (if applicable)</label>
              <input
                type="url"
                value={content.url || ''}
                onChange={(e) => handleInputChange(slotNumber, 'url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="https://example.com"
              />
            </div>

            {/* Full Content */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Content (if blog post)</label>
              <textarea
                value={content.full_content || ''}
                onChange={(e) => handleInputChange(slotNumber, 'full_content', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                rows="6"
                placeholder="Full article content for blog posts..."
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Author (if applicable)</label>
              <input
                type="text"
                value={content.author || ''}
                onChange={(e) => handleInputChange(slotNumber, 'author', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Author name"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Professional Interest Tags</label>
              <input
                type="text"
                value={content.tags || ''}
                onChange={(e) => handleInputChange(slotNumber, 'tags', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Technology, Leadership, Innovation"
              />
              <p className="text-xs text-gray-500 mt-1">Comma-separated tags</p>
            </div>

            {/* Sponsored By */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sponsored By (optional)</label>
              <input
                type="text"
                value={content.sponsored_by || ''}
                onChange={(e) => handleInputChange(slotNumber, 'sponsored_by', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Company name"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t">
              <div className="flex gap-2">
                {/* Delete Button */}
                {hasContent && (
                  <button
                    onClick={() => handleDeleteContent(slotNumber)}
                    disabled={saving[slotNumber]}
                    className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Delete
                  </button>
                )}

                {/* Save Button */}
                <button
                  onClick={() => handleSaveContent(slotNumber)}
                  disabled={saving[slotNumber]}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving[slotNumber] ? 'Saving...' : `Save Insight Slot ${slotNumber}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="p-8 text-center">Loading insights...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-sm text-blue-900 mb-1">Insights Content Management (10 Slots)</h3>
        <p className="text-xs text-blue-700">
          Slots 1-3 appear on the <strong>Dashboard</strong>. All slots appear on the Insights page.
          Empty slots won't appear on the public site.
        </p>
      </div>

      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(slotNumber => renderInsightSlot(slotNumber))}
    </div>
  );
}

function ModerationTab({ onReportReviewed }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewed, setShowReviewed] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [banningUserId, setBanningUserId] = useState(null);

  // Check if current user is super admin
  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: userData, error } = await supabase
            .from('users')
            .select('admin_level')
            .eq('id', session.user.id)
            .single();

          if (!error && userData) {
            setIsSuperAdmin(userData.admin_level === 'super_admin');
          }
        }
      } catch (error) {
        console.error('Error checking super admin status:', error);
      }
    };
    checkSuperAdmin();
  }, []);

  // Fetch reports
  useEffect(() => {
    fetchReports();
  }, [showReviewed]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_reports')
        .select(`
          *,
          reporter:reporter_id (name, email),
          reported_user:reported_user_id (name, email)
        `)
        .eq('reviewed', showReviewed)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsReviewed = async (reportId) => {
    setReviewingId(reportId);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const adminUserId = sessionData?.session?.user?.id;

      const { error } = await supabase
        .from('user_reports')
        .update({
          reviewed: true,
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminUserId
        })
        .eq('id', reportId);

      if (error) throw error;

      // Remove from list
      setReports(prev => prev.filter(r => r.id !== reportId));

      // Notify parent to update count
      if (onReportReviewed) onReportReviewed();

      alert('Report marked as reviewed');
    } catch (error) {
      console.error('Error marking report as reviewed:', error);
      alert('Failed to mark as reviewed');
    } finally {
      setReviewingId(null);
    }
  };

  const handleBanUser = async (userId, userName) => {
    // Confirm action
    const reason = prompt(
      `⚠️ PERMANENT BAN - This action cannot be undone!\n\n` +
      `You are about to permanently ban: ${userName}\n\n` +
      `Please enter the reason for this ban:`
    );

    if (!reason || reason.trim() === '') {
      return; // User cancelled or didn't provide a reason
    }

    setBanningUserId(userId);
    try {
      // Call the Supabase RPC function to ban the user
      const { data, error } = await supabase.rpc('ban_user', {
        target_user_id: userId,
        ban_reason_text: reason.trim()
      });

      if (error) throw error;

      alert(`User ${userName} has been permanently banned.\n\nReason: ${reason}`);

      // Refresh the reports list
      fetchReports();
    } catch (error) {
      console.error('Error banning user:', error);
      if (error.message.includes('Only super admins')) {
        alert('Permission denied: Only super admins can ban users');
      } else if (error.message.includes('Cannot ban admin')) {
        alert('Cannot ban admin users');
      } else if (error.message.includes('Cannot ban yourself')) {
        alert('You cannot ban yourself');
      } else {
        alert('Failed to ban user: ' + error.message);
      }
    } finally {
      setBanningUserId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">User Reports</h2>
        <button
          onClick={() => setShowReviewed(!showReviewed)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          {showReviewed ? 'Show Unreviewed' : 'Show Reviewed'}
        </button>
      </div>

      {/* Reported Users Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">
          {showReviewed ? 'Reviewed Reports' : 'Unreviewed Reports'}
        </h3>

        {loading ? (
          <div className="bg-gray-100 p-8 rounded text-center text-gray-500">
            <p>Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-gray-100 p-8 rounded text-center text-gray-500">
            <p>No {showReviewed ? 'reviewed' : 'unreviewed'} reports</p>
            <p className="text-sm mt-2">
              {showReviewed
                ? 'All reviewed reports will appear here'
                : 'User reports will appear here for review'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} data-testid="report-item" className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        {report.reporter?.name || 'Unknown User'}
                      </span>
                      <span className="text-gray-500">reported</span>
                      <span className="font-semibold text-red-600">
                        {report.reported_user?.name || 'Unknown User'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Reason:</span> {report.reason}
                    </p>
                    {report.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Description:</span> {report.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Reporter: {report.reporter?.email}</span>
                      <span>Reported: {report.reported_user?.email}</span>
                      <span>{formatDate(report.created_at)}</span>
                    </div>
                    {report.reviewed && report.reviewed_at && (
                      <p className="text-xs text-green-600 mt-2">
                        ✓ Reviewed on {formatDate(report.reviewed_at)}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    {!showReviewed && (
                      <button
                        onClick={() => handleMarkAsReviewed(report.id)}
                        disabled={reviewingId === report.id}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reviewingId === report.id ? 'Reviewing...' : 'Mark as Reviewed'}
                      </button>
                    )}
                    {isSuperAdmin && report.reported_user?.id && (
                      <button
                        onClick={() => handleBanUser(report.reported_user_id, report.reported_user?.name || report.reported_user?.email)}
                        disabled={banningUserId === report.reported_user_id}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        data-testid="ban-user-button"
                      >
                        {banningUserId === report.reported_user_id ? 'Banning...' : '🚫 Ban User'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InlineAdEditor({ title, slot, ad, onImageUpload, onUrlChange, onTagsChange, onSave, onRemove, dimensions, description, aspectRatio = "160/600" }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border-2 border-gray-300">
      <div className="mb-3">
        <h3 className="font-bold text-sm">{title}</h3>
        <p className="text-xs text-gray-600">{description}</p>
        <p className="text-xs text-gray-500">Recommended size: {dimensions}</p>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium mb-2">Ad Image</label>
        {ad?.image ? (
          <div className="relative">
            <img
              src={ad.image}
              alt="Ad preview"
              className="w-full rounded border border-gray-300"
              style={{ aspectRatio }}
            />
            <button
              onClick={() => onRemove(slot)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded hover:bg-red-600 shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label
            className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-gray-50"
            style={{ aspectRatio }}
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-xs text-gray-600">Click to upload image</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onImageUpload(slot, e.target.files[0])}
            />
          </label>
        )}
      </div>

      <div className="mb-3">
  <label className="block text-xs font-medium mb-2">Click-through URL</label>
  <div className="flex gap-2">
    <Link2 className="w-4 h-4 text-gray-400 mt-2 flex-shrink-0" />
    <input
      type="url"
      value={ad?.url || ''}
      onChange={(e) => onUrlChange(slot, e.target.value)}
      placeholder="https://example.com"
      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg min-w-0"
      style={{ textOverflow: 'ellipsis' }}
    />
  </div>
</div>

      {/* Tags Input */}
      <div className="mb-3">
        <label className="block text-xs font-medium mb-2">Content Tags (comma-separated)</label>
        <input
          type="text"
          value={ad?.tags || ''}
          onChange={(e) => onTagsChange(slot, e.target.value)}
          placeholder="e.g., Technology, Leadership, Innovation"
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
        />
        <p className="text-xs text-gray-500 mt-1">Ad will show on events matching these tags</p>
      </div>

      {/* Zip Code Input - DEMO ONLY */}
      <div className="mb-3">
        <label className="block text-xs font-medium mb-2">Organization Zip Code (for targeting)</label>
        <input
          type="text"
          placeholder="49503"
          maxLength="5"
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
        />
      </div>

      {/* Radius Selector - DEMO ONLY */}
      <div className="mb-3">
        <label className="block text-xs font-medium mb-2">Target Radius</label>
        <select
          defaultValue="50"
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
        >
          <option value="25">25 miles</option>
          <option value="50">50 miles (recommended)</option>
          <option value="100">100 miles</option>
          <option value="statewide">Statewide</option>
          <option value="national">National (entire country)</option>
        </select>
      </div>

      {/* Save Button */}
      <button
        onClick={() => onSave(slot)}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-medium text-sm"
      >
        Save Ad
      </button>
    </div>
  );
}

export default AdminPanel