import { useState, useEffect } from 'react';
import { Upload, X, Link2, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase.js';
import EventSlotsManager from './EventSlotsManager.jsx';

function AdminPanel() {
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
            .select('is_admin, email')
            .eq('id', session.user.id)
            .single();

          if (userError) {
            console.error('Error checking admin status:', userError);
            setErrorMessage('Error verifying admin permissions');
            setLoading(false);
            return;
          }

          if (userData && userData.is_admin === true) {
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
    const reader = new FileReader();
    reader.onloadend = () => {
      const newAd = { ...ads[slot], image: reader.result };
      updateAd(slot, newAd);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (slot, url) => {
    const newAd = { ...ads[slot], url };
    updateAd(slot, newAd);
  };

  const updateAd = (slot, adData) => {
    localStorage.setItem(`ad_${slot}`, JSON.stringify(adData));
    setAds({ ...ads, [slot]: adData });
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
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Back to Site
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
              Dashboard Setup
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
  const [featuredContent, setFeaturedContent] = useState({
    title: '',
    description: '',
    image: '',
    url: '',
    tags: '',
    sponsoredBy: '',
    fullContent: '',
    author: ''
  });

  // Load featured content #1 from Supabase on mount
  useEffect(() => {
    const loadFeaturedContent = async () => {
      try {
        const { data, error } = await supabase
          .from('featured_content')
          .select('*')
          .eq('slot_number', 1)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('Error loading featured content #1:', error);
          return;
        }

        if (data) {
          setFeaturedContent({
            title: data.title || '',
            description: data.description || '',
            image: data.image || '',
            url: data.url || '',
            tags: data.tags || '',
            sponsoredBy: data.sponsored_by || '',
            fullContent: data.full_content || '',
            author: data.author || ''
          });
        }
      } catch (err) {
        console.error('Error in loadFeaturedContent:', err);
      }
    };

    loadFeaturedContent();
  }, []);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');

  const handleContentChange = (field, value) => {
    setFeaturedContent({ ...featuredContent, [field]: value });
  };

  const handleScrapeContent = async () => {
    if (!scrapeUrl) {
      setScrapeError('Please enter a URL');
      return;
    }

    setIsScraping(true);
    setScrapeError('');

    try {
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const response = await fetch(proxyUrl + encodeURIComponent(scrapeUrl));
      const html = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      let scrapedData = { url: scrapeUrl };

      // Try to find title
      const title = doc.querySelector('h1')?.textContent?.trim() ||
                   doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                   doc.querySelector('title')?.textContent?.trim() || '';
      scrapedData.title = title;

      // Try to find description
      const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
                      doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
      if (metaDesc) {
        scrapedData.description = metaDesc;
      }

      // Try to find image
      const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
      if (ogImage) {
        scrapedData.image = ogImage.startsWith('http') ? ogImage : new URL(ogImage, scrapeUrl).href;
      }

      // Merge scraped data
      setFeaturedContent(prev => ({
        ...prev,
        title: scrapedData.title || prev.title,
        description: scrapedData.description || prev.description,
        image: scrapedData.image || prev.image,
        url: scrapedData.url || prev.url
      }));

      alert('Content scraped! Please review and edit as needed.');
    } catch (error) {
      console.error('Scraping error:', error);
      setScrapeError('Unable to scrape this URL. Please enter details manually.');
    } finally {
      setIsScraping(false);
    }
  };

  const handleSaveContent = async () => {
    try {
      const { error } = await supabase
        .from('featured_content')
        .upsert({
          slot_number: 1,
          title: featuredContent.title,
          description: featuredContent.description,
          image: featuredContent.image,
          url: featuredContent.url || null,
          tags: featuredContent.tags || null,
          sponsored_by: featuredContent.sponsoredBy || null,
          full_content: featuredContent.fullContent || null,
          author: featuredContent.author || null
        }, {
          onConflict: 'slot_number'
        });

      if (error) {
        console.error('Error saving featured content #1:', error);
        alert('Failed to save: ' + error.message);
        return;
      }

      alert('Featured Content #1 saved successfully!');
    } catch (err) {
      console.error('Error in handleSaveContent:', err);
      alert('Failed to save content');
    }
  };

  const handleImageUploadToSupabase = async (file, contentNumber) => {
    if (!file) return;

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `featured-content-${contentNumber}-${Date.now()}.${fileExt}`;
      const filePath = `featured-images/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('featured-content')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        alert('Failed to upload image: ' + error.message);
        return null;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('featured-content')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading to Supabase:', error);
      alert('Failed to upload image to Supabase');
      return null;
    }
  };

  // Featured Content #2 handlers
  const [featuredContent2, setFeaturedContent2] = useState({
    title: '',
    description: '',
    image: '',
    url: '',
    tags: '',
    sponsoredBy: '',
    fullContent: '',
    author: ''
  });

  // Load featured content #2 from Supabase on mount
  useEffect(() => {
    const loadFeaturedContent2 = async () => {
      try {
        const { data, error } = await supabase
          .from('featured_content')
          .select('*')
          .eq('slot_number', 2)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading featured content #2:', error);
          return;
        }

        if (data) {
          setFeaturedContent2({
            title: data.title || '',
            description: data.description || '',
            image: data.image || '',
            url: data.url || '',
            tags: data.tags || '',
            sponsoredBy: data.sponsored_by || '',
            fullContent: data.full_content || '',
            author: data.author || ''
          });
        }
      } catch (err) {
        console.error('Error in loadFeaturedContent2:', err);
      }
    };

    loadFeaturedContent2();
  }, []);
  const [scrapeUrl2, setScrapeUrl2] = useState('');
  const [isScraping2, setIsScraping2] = useState(false);
  const [scrapeError2, setScrapeError2] = useState('');

  const handleContentChange2 = (field, value) => {
    setFeaturedContent2({ ...featuredContent2, [field]: value });
  };

  const handleScrapeContent2 = async () => {
    if (!scrapeUrl2) {
      setScrapeError2('Please enter a URL');
      return;
    }

    setIsScraping2(true);
    setScrapeError2('');

    try {
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const response = await fetch(proxyUrl + encodeURIComponent(scrapeUrl2));
      const html = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      let scrapedData = { url: scrapeUrl2 };

      const title = doc.querySelector('h1')?.textContent?.trim() ||
                   doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                   doc.querySelector('title')?.textContent?.trim() || '';
      scrapedData.title = title;

      const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
                      doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
      if (metaDesc) {
        scrapedData.description = metaDesc;
      }

      const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
      if (ogImage) {
        scrapedData.image = ogImage.startsWith('http') ? ogImage : new URL(ogImage, scrapeUrl2).href;
      }

      setFeaturedContent2(prev => ({
        ...prev,
        title: scrapedData.title || prev.title,
        description: scrapedData.description || prev.description,
        image: scrapedData.image || prev.image,
        url: scrapedData.url || prev.url
      }));

      alert('Content scraped! Please review and edit as needed.');
    } catch (error) {
      console.error('Scraping error:', error);
      setScrapeError2('Unable to scrape this URL. Please enter details manually.');
    } finally {
      setIsScraping2(false);
    }
  };

  const handleSaveContent2 = async () => {
    try {
      const { error } = await supabase
        .from('featured_content')
        .upsert({
          slot_number: 2,
          title: featuredContent2.title,
          description: featuredContent2.description,
          image: featuredContent2.image,
          url: featuredContent2.url || null,
          tags: featuredContent2.tags || null,
          sponsored_by: featuredContent2.sponsoredBy || null,
          full_content: featuredContent2.fullContent || null,
          author: featuredContent2.author || null
        }, {
          onConflict: 'slot_number'
        });

      if (error) {
        console.error('Error saving featured content #2:', error);
        alert('Failed to save: ' + error.message);
        return;
      }

      alert('Featured Content #2 saved successfully!');
    } catch (err) {
      console.error('Error in handleSaveContent2:', err);
      alert('Failed to save content');
    }
  };

  // Featured Content #3 handlers
  const [featuredContent3, setFeaturedContent3] = useState({
    title: '',
    description: '',
    image: '',
    url: '',
    tags: '',
    sponsoredBy: '',
    fullContent: '',
    author: ''
  });

  // Load featured content #3 from Supabase on mount
  useEffect(() => {
    const loadFeaturedContent3 = async () => {
      try {
        const { data, error } = await supabase
          .from('featured_content')
          .select('*')
          .eq('slot_number', 3)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading featured content #3:', error);
          return;
        }

        if (data) {
          setFeaturedContent3({
            title: data.title || '',
            description: data.description || '',
            image: data.image || '',
            url: data.url || '',
            tags: data.tags || '',
            sponsoredBy: data.sponsored_by || '',
            fullContent: data.full_content || '',
            author: data.author || ''
          });
        }
      } catch (err) {
        console.error('Error in loadFeaturedContent3:', err);
      }
    };

    loadFeaturedContent3();
  }, []);
  const [scrapeUrl3, setScrapeUrl3] = useState('');
  const [isScraping3, setIsScraping3] = useState(false);
  const [scrapeError3, setScrapeError3] = useState('');

  const handleContentChange3 = (field, value) => {
    setFeaturedContent3({ ...featuredContent3, [field]: value });
  };

  const handleScrapeContent3 = async () => {
    if (!scrapeUrl3) {
      setScrapeError3('Please enter a URL');
      return;
    }

    setIsScraping3(true);
    setScrapeError3('');

    try {
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const response = await fetch(proxyUrl + encodeURIComponent(scrapeUrl3));
      const html = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      let scrapedData = { url: scrapeUrl3 };

      const title = doc.querySelector('h1')?.textContent?.trim() ||
                   doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                   doc.querySelector('title')?.textContent?.trim() || '';
      scrapedData.title = title;

      const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
                      doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
      if (metaDesc) {
        scrapedData.description = metaDesc;
      }

      const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
      if (ogImage) {
        scrapedData.image = ogImage.startsWith('http') ? ogImage : new URL(ogImage, scrapeUrl3).href;
      }

      setFeaturedContent3(prev => ({
        ...prev,
        title: scrapedData.title || prev.title,
        description: scrapedData.description || prev.description,
        image: scrapedData.image || prev.image,
        url: scrapedData.url || prev.url
      }));

      alert('Content scraped! Please review and edit as needed.');
    } catch (error) {
      console.error('Scraping error:', error);
      setScrapeError3('Unable to scrape this URL. Please enter details manually.');
    } finally {
      setIsScraping3(false);
    }
  };

  const handleSaveContent3 = async () => {
    try {
      const { error } = await supabase
        .from('featured_content')
        .upsert({
          slot_number: 3,
          title: featuredContent3.title,
          description: featuredContent3.description,
          image: featuredContent3.image,
          url: featuredContent3.url || null,
          tags: featuredContent3.tags || null,
          sponsored_by: featuredContent3.sponsoredBy || null,
          full_content: featuredContent3.fullContent || null,
          author: featuredContent3.author || null
        }, {
          onConflict: 'slot_number'
        });

      if (error) {
        console.error('Error saving featured content #3:', error);
        alert('Failed to save: ' + error.message);
        return;
      }

      alert('Featured Content #3 saved successfully!');
    } catch (err) {
      console.error('Error in handleSaveContent3:', err);
      alert('Failed to save content');
    }
  };

  // Hero Banner State for 3 slots
  const [heroBanners, setHeroBanners] = useState({
    slot1: { image_url: '', click_url: '', alt_text: '', target_zip: '', target_radius: '50', is_active: true },
    slot2: { image_url: '', click_url: '', alt_text: '', target_zip: '', target_radius: '50', is_active: true },
    slot3: { image_url: '', click_url: '', alt_text: '', target_zip: '', target_radius: '50', is_active: true }
  });

  const [uploadingBanner, setUploadingBanner] = useState(null);

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard Layout Setup</h2>

      {/* Banner Status Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-3">🔍 Current Banner Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(slot => {
            const slotKey = `slot${slot}`;
            const banner = heroBanners[slotKey];
            const hasImage = banner?.image_url && banner.image_url !== '';
            return (
              <div key={slot} className="bg-white p-3 rounded border border-gray-200">
                <p className="font-semibold mb-1">Banner Slot {slot}</p>
                <p className="text-sm">
                  Status: {hasImage ? '✅ Image Uploaded' : '⚠️ No Image'}
                </p>
                {hasImage && (
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {banner.image_url.split('/').pop()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-600 mt-3">
          💡 Tip: After uploading an image, click "Save Banner X" to activate it on the site. Then refresh your dashboard to see it rotating.
        </p>
      </div>

      {/* Hero Banner Carousel - 3 Rotating Slots */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">Hero Banner Carousel (Geotagged)</h3>
        <p className="text-gray-600 mb-6">
          Upload up to 3 banner images that will rotate on each dashboard page refresh. Optionally add geotagging to show location-specific banners.
        </p>

        {/* Hero Banner Slot 1 */}
        <div className="mb-6 p-4 border-2 border-blue-300 rounded-lg bg-blue-50">
          <h4 className="font-bold text-gray-900 mb-3">Hero Banner Slot 1</h4>
          <div className="space-y-3 bg-white p-3 rounded">
            <div>
              <label className="block text-sm font-medium mb-2">Banner Image</label>
              {uploadingBanner === 1 ? (
                <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-2"></div>
                  <span className="text-sm text-blue-600 font-medium">Uploading...</span>
                </div>
              ) : heroBanners.slot1.image_url ? (
                <div className="relative">
                  <img src={heroBanners.slot1.image_url} alt="Banner 1" className="w-full h-48 object-cover rounded-lg" />
                  <button
                    onClick={() => handleHeroBannerChange(1, 'image_url', '')}
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
                    onChange={(e) => handleHeroBannerUpload(1, e.target.files[0])}
                  />
                </label>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Alt Text (for accessibility)</label>
              <input
                type="text"
                value={heroBanners.slot1.alt_text}
                onChange={(e) => handleHeroBannerChange(1, 'alt_text', e.target.value)}
                placeholder="Description of banner"
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Click-through URL (optional)</label>
              <div className="flex gap-2">
                <Link2 className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0" />
                <input
                  type="url"
                  value={heroBanners.slot1.click_url}
                  onChange={(e) => handleHeroBannerChange(1, 'click_url', e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Organization Zip Code (for targeting, optional)</label>
              <input
                type="text"
                value={heroBanners.slot1.target_zip}
                onChange={(e) => handleHeroBannerChange(1, 'target_zip', e.target.value)}
                placeholder="49503"
                maxLength="5"
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Target Radius</label>
              <select
                value={heroBanners.slot1.target_radius}
                onChange={(e) => handleHeroBannerChange(1, 'target_radius', e.target.value)}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
              >
                <option value="25">25 miles</option>
                <option value="50">50 miles (recommended)</option>
                <option value="100">100 miles</option>
                <option value="statewide">Statewide</option>
                <option value="national">National (entire country)</option>
              </select>
            </div>
            <button
              onClick={() => saveHeroBanner(1)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
            >
              Save Banner 1
            </button>
          </div>
        </div>

        {/* Hero Banner Slot 2 */}
        <div className="mb-6 p-4 border-2 border-green-300 rounded-lg bg-green-50">
          <h4 className="font-bold text-gray-900 mb-3">Hero Banner Slot 2</h4>
          <div className="space-y-3 bg-white p-3 rounded">
            <div>
              <label className="block text-sm font-medium mb-2">Banner Image</label>
              {uploadingBanner === 2 ? (
                <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-green-300 rounded-lg bg-green-50">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-2"></div>
                  <span className="text-sm text-green-600 font-medium">Uploading...</span>
                </div>
              ) : heroBanners.slot2.image_url ? (
                <div className="relative">
                  <img src={heroBanners.slot2.image_url} alt="Banner 2" className="w-full h-48 object-cover rounded-lg" />
                  <button
                    onClick={() => handleHeroBannerChange(2, 'image_url', '')}
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
                    onChange={(e) => handleHeroBannerUpload(2, e.target.files[0])}
                  />
                </label>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Alt Text (for accessibility)</label>
              <input
                type="text"
                value={heroBanners.slot2.alt_text}
                onChange={(e) => handleHeroBannerChange(2, 'alt_text', e.target.value)}
                placeholder="Description of banner"
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Click-through URL (optional)</label>
              <div className="flex gap-2">
                <Link2 className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0" />
                <input
                  type="url"
                  value={heroBanners.slot2.click_url}
                  onChange={(e) => handleHeroBannerChange(2, 'click_url', e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Organization Zip Code (for targeting, optional)</label>
              <input
                type="text"
                value={heroBanners.slot2.target_zip}
                onChange={(e) => handleHeroBannerChange(2, 'target_zip', e.target.value)}
                placeholder="49503"
                maxLength="5"
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Target Radius</label>
              <select
                value={heroBanners.slot2.target_radius}
                onChange={(e) => handleHeroBannerChange(2, 'target_radius', e.target.value)}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
              >
                <option value="25">25 miles</option>
                <option value="50">50 miles (recommended)</option>
                <option value="100">100 miles</option>
                <option value="statewide">Statewide</option>
                <option value="national">National (entire country)</option>
              </select>
            </div>
            <button
              onClick={() => saveHeroBanner(2)}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-medium"
            >
              Save Banner 2
            </button>
          </div>
        </div>

        {/* Hero Banner Slot 3 */}
        <div className="mb-6 p-4 border-2 border-purple-300 rounded-lg bg-purple-50">
          <h4 className="font-bold text-gray-900 mb-3">Hero Banner Slot 3</h4>
          <div className="space-y-3 bg-white p-3 rounded">
            <div>
              <label className="block text-sm font-medium mb-2">Banner Image</label>
              {uploadingBanner === 3 ? (
                <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-purple-300 rounded-lg bg-purple-50">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-2"></div>
                  <span className="text-sm text-purple-600 font-medium">Uploading...</span>
                </div>
              ) : heroBanners.slot3.image_url ? (
                <div className="relative">
                  <img src={heroBanners.slot3.image_url} alt="Banner 3" className="w-full h-48 object-cover rounded-lg" />
                  <button
                    onClick={() => handleHeroBannerChange(3, 'image_url', '')}
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
                    onChange={(e) => handleHeroBannerUpload(3, e.target.files[0])}
                  />
                </label>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Alt Text (for accessibility)</label>
              <input
                type="text"
                value={heroBanners.slot3.alt_text}
                onChange={(e) => handleHeroBannerChange(3, 'alt_text', e.target.value)}
                placeholder="Description of banner"
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Click-through URL (optional)</label>
              <div className="flex gap-2">
                <Link2 className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0" />
                <input
                  type="url"
                  value={heroBanners.slot3.click_url}
                  onChange={(e) => handleHeroBannerChange(3, 'click_url', e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Organization Zip Code (for targeting, optional)</label>
              <input
                type="text"
                value={heroBanners.slot3.target_zip}
                onChange={(e) => handleHeroBannerChange(3, 'target_zip', e.target.value)}
                placeholder="49503"
                maxLength="5"
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Target Radius</label>
              <select
                value={heroBanners.slot3.target_radius}
                onChange={(e) => handleHeroBannerChange(3, 'target_radius', e.target.value)}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg"
              >
                <option value="25">25 miles</option>
                <option value="50">50 miles (recommended)</option>
                <option value="100">100 miles</option>
                <option value="statewide">Statewide</option>
                <option value="national">National (entire country)</option>
              </select>
            </div>
            <button
              onClick={() => saveHeroBanner(3)}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 font-medium"
            >
              Save Banner 3
            </button>
          </div>
        </div>
      </div>

      {/* Featured Content Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">Featured Content</h3>
        <p className="text-gray-600 mb-4">
          Create featured content that appears on the dashboard
        </p>

        {/* Featured Item #1 - Editable */}
        <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50 mb-4">
          <div className="mb-3">
            <h4 className="font-bold text-gray-900">Featured Item #1</h4>
          </div>

          <div className="space-y-3 bg-white p-3 rounded">
            {/* URL Scraper */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded border border-blue-200">
              <p className="text-xs font-semibold text-gray-900 mb-2">✨ Quick Add from URL (Optional)</p>
              <p className="text-xs text-gray-600 mb-2">Paste a URL to auto-fill title, description, and image</p>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  disabled={isScraping}
                />
                <button
                  onClick={handleScrapeContent}
                  disabled={isScraping}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isScraping ? 'Scraping...' : 'Scrape'}
                </button>
              </div>
              {scrapeError && <p className="text-xs text-red-600 mt-1">{scrapeError}</p>}
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={featuredContent.title}
                onChange={(e) => handleContentChange('title', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="e.g., Building Meaningful Professional Networks"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Card Preview Text *</label>
              <textarea
                value={featuredContent.description}
                onChange={(e) => handleContentChange('description', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                rows="3"
                placeholder="Brief teaser shown on the dashboard card (2-3 sentences)"
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Image *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={featuredContent.image}
                  onChange={(e) => handleContentChange('image', e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  placeholder="Image URL or upload below"
                />
                <label className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300 cursor-pointer flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const publicUrl = await handleImageUploadToSupabase(file, 1);
                        if (publicUrl) {
                          handleContentChange('image', publicUrl);
                        }
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              {featuredContent.image && (
                <img src={featuredContent.image} alt="Preview" className="mt-1 w-full h-24 object-cover rounded" />
              )}
            </div>

            {/* URL Link */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Content URL (optional)</label>
              <input
                type="url"
                value={featuredContent.url}
                onChange={(e) => handleContentChange('url', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="https://example.com/article (leave blank for no link)"
              />
            </div>

            {/* Professional Interest Tags */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Professional Interest Tags</label>
              <input
                type="text"
                value={featuredContent.tags}
                onChange={(e) => handleContentChange('tags', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="e.g., Leadership, Marketing, Technology (comma separated)"
              />
            </div>

            {/* Sponsored By */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sponsored By (optional)</label>
              <input
                type="text"
                value={featuredContent.sponsoredBy}
                onChange={(e) => handleContentChange('sponsoredBy', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="e.g., Lake Michigan Credit Union"
              />
              <p className="text-xs text-gray-500 mt-1">Only displays on dashboard if filled in</p>
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Author (optional)</label>
              <input
                type="text"
                value={featuredContent.author}
                onChange={(e) => handleContentChange('author', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="e.g., Jeff Hill"
              />
              <p className="text-xs text-gray-500 mt-1">Displays under title for blog posts</p>
            </div>

            {/* Full Content */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Blog Content (if applicable)</label>
              <textarea
                value={featuredContent.fullContent}
                onChange={(e) => handleContentChange('fullContent', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                rows="8"
                maxLength={5000}
                placeholder="For blog posts without external URLs, enter the full article text here (max ~1000 words)"
              />
              <p className="text-xs text-gray-500 mt-1">{featuredContent.fullContent?.length || 0}/5000 characters (~{Math.round((featuredContent.fullContent?.length || 0) / 5)} words)</p>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-4">
            <button
              onClick={handleSaveContent}
              className="w-full px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700"
            >
              Save Featured Content #1
            </button>
          </div>
        </div>

        {/* Featured Item #2 - Editable */}
        <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50 mb-4">
          <div className="mb-3">
            <h4 className="font-bold text-gray-900">Featured Item #2</h4>
          </div>

          <div className="space-y-3 bg-white p-3 rounded">
            {/* URL Scraper */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded border border-blue-200">
              <p className="text-xs font-semibold text-gray-900 mb-2">✨ Quick Add from URL (Optional)</p>
              <p className="text-xs text-gray-600 mb-2">Paste a URL to auto-fill title, description, and image</p>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={scrapeUrl2}
                  onChange={(e) => setScrapeUrl2(e.target.value)}
                  placeholder="https://example.com/article"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  disabled={isScraping2}
                />
                <button
                  onClick={handleScrapeContent2}
                  disabled={isScraping2}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isScraping2 ? 'Scraping...' : 'Scrape'}
                </button>
              </div>
              {scrapeError2 && <p className="text-xs text-red-600 mt-1">{scrapeError2}</p>}
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={featuredContent2.title}
                onChange={(e) => handleContentChange2('title', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="e.g., Leadership in the Modern Workplace"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Card Preview Text *</label>
              <textarea
                value={featuredContent2.description}
                onChange={(e) => handleContentChange2('description', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                rows="3"
                placeholder="Brief teaser shown on the dashboard card (2-3 sentences)"
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Image *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={featuredContent2.image}
                  onChange={(e) => handleContentChange2('image', e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  placeholder="Image URL or upload below"
                />
                <label className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300 cursor-pointer flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const publicUrl = await handleImageUploadToSupabase(file, 2);
                        if (publicUrl) {
                          handleContentChange2('image', publicUrl);
                        }
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              {featuredContent2.image && (
                <img src={featuredContent2.image} alt="Preview" className="mt-1 w-full h-24 object-cover rounded" />
              )}
            </div>

            {/* URL Link */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Content URL (optional)</label>
              <input
                type="url"
                value={featuredContent2.url}
                onChange={(e) => handleContentChange2('url', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="https://example.com/article (leave blank for no link)"
              />
            </div>

            {/* Professional Interest Tags */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Professional Interest Tags</label>
              <input
                type="text"
                value={featuredContent2.tags}
                onChange={(e) => handleContentChange2('tags', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="e.g., Leadership, Marketing, Technology (comma separated)"
              />
            </div>

            {/* Sponsored By */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sponsored By (optional)</label>
              <input
                type="text"
                value={featuredContent2.sponsoredBy}
                onChange={(e) => handleContentChange2('sponsoredBy', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="e.g., Mercantile Bank"
              />
              <p className="text-xs text-gray-500 mt-1">Only displays on dashboard if filled in</p>
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Author (optional)</label>
              <input
                type="text"
                value={featuredContent2.author}
                onChange={(e) => handleContentChange2('author', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="e.g., Jeff Hill"
              />
              <p className="text-xs text-gray-500 mt-1">Displays under title for blog posts</p>
            </div>

            {/* Full Content */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Blog Content (if applicable)</label>
              <textarea
                value={featuredContent2.fullContent}
                onChange={(e) => handleContentChange2('fullContent', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                rows="8"
                maxLength={5000}
                placeholder="For blog posts without external URLs, enter the full article text here (max ~1000 words)"
              />
              <p className="text-xs text-gray-500 mt-1">{featuredContent2.fullContent?.length || 0}/5000 characters (~{Math.round((featuredContent2.fullContent?.length || 0) / 5)} words)</p>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-4">
            <button
              onClick={handleSaveContent2}
              className="w-full px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700"
            >
              Save Featured Content #2
            </button>
          </div>
        </div>

        {/* Featured Item #3 - Editable */}
        <div className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50 mb-4">
          <div className="mb-3">
            <h4 className="font-bold text-gray-900">Featured Item #3</h4>
          </div>

          <div className="space-y-3 bg-white p-3 rounded">
            {/* URL Scraper */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded border border-blue-200">
              <p className="text-xs font-semibold text-gray-900 mb-2">✨ Quick Add from URL (Optional)</p>
              <p className="text-xs text-gray-600 mb-2">Paste a URL to auto-fill title, description, and image</p>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={scrapeUrl3}
                  onChange={(e) => setScrapeUrl3(e.target.value)}
                  placeholder="https://example.com/article"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  disabled={isScraping3}
                />
                <button
                  onClick={handleScrapeContent3}
                  disabled={isScraping3}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isScraping3 ? 'Scraping...' : 'Scrape'}
                </button>
              </div>
              {scrapeError3 && <p className="text-xs text-red-600 mt-1">{scrapeError3}</p>}
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={featuredContent3.title}
                onChange={(e) => handleContentChange3('title', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="e.g., Innovation in Business"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Card Preview Text *</label>
              <textarea
                value={featuredContent3.description}
                onChange={(e) => handleContentChange3('description', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                rows="3"
                placeholder="Brief teaser shown on the dashboard card (2-3 sentences)"
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Image *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={featuredContent3.image}
                  onChange={(e) => handleContentChange3('image', e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  placeholder="Image URL or upload below"
                />
                <label className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300 cursor-pointer flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const publicUrl = await handleImageUploadToSupabase(file, 3);
                        if (publicUrl) {
                          handleContentChange3('image', publicUrl);
                        }
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              {featuredContent3.image && (
                <img src={featuredContent3.image} alt="Preview" className="mt-1 w-full h-24 object-cover rounded" />
              )}
            </div>

            {/* URL Link */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Content URL (optional)</label>
              <input
                type="url"
                value={featuredContent3.url}
                onChange={(e) => handleContentChange3('url', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="https://example.com/article (leave blank for no link)"
              />
            </div>

            {/* Professional Interest Tags */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Professional Interest Tags</label>
              <input
                type="text"
                value={featuredContent3.tags}
                onChange={(e) => handleContentChange3('tags', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="e.g., Leadership, Marketing, Technology (comma separated)"
              />
            </div>

            {/* Sponsored By */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sponsored By (optional)</label>
              <input
                type="text"
                value={featuredContent3.sponsoredBy}
                onChange={(e) => handleContentChange3('sponsoredBy', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="e.g., Fifth Third Bank"
              />
              <p className="text-xs text-gray-500 mt-1">Only displays on dashboard if filled in</p>
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Author (optional)</label>
              <input
                type="text"
                value={featuredContent3.author}
                onChange={(e) => handleContentChange3('author', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                placeholder="e.g., Jeff Hill"
              />
              <p className="text-xs text-gray-500 mt-1">Displays under title for blog posts</p>
            </div>

            {/* Full Content */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Blog Content (if applicable)</label>
              <textarea
                value={featuredContent3.fullContent}
                onChange={(e) => handleContentChange3('fullContent', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                rows="8"
                maxLength={5000}
                placeholder="For blog posts without external URLs, enter the full article text here (max ~1000 words)"
              />
              <p className="text-xs text-gray-500 mt-1">{featuredContent3.fullContent?.length || 0}/5000 characters (~{Math.round((featuredContent3.fullContent?.length || 0) / 5)} words)</p>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-4">
            <button
              onClick={handleSaveContent3}
              className="w-full px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700"
            >
              Save Featured Content #3
            </button>
          </div>
        </div>
      </div>

      {/* Featured Events Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">Featured Events</h3>
        <p className="text-gray-600 mb-4">
          Select and manage which events appear as featured on the dashboard
        </p>
        <div className="bg-gray-100 p-4 rounded border-2 border-dashed border-gray-300 text-center">
          <p className="text-gray-500">Featured Events Manager - Coming Soon</p>
        </div>
      </div>

       {/* Dashboard Bottom Ad */}
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

function EventsAdsTab({ ads, handleImageUpload, handleUrlChange, removeAd }) {
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
  const [contentSlots, setContentSlots] = useState([
    { slot_number: 1, title: '', description: '', image: '', url: '', tags: '', sponsored_by: '', full_content: '', author: '' },
    { slot_number: 2, title: '', description: '', image: '', url: '', tags: '', sponsored_by: '', full_content: '', author: '' },
    { slot_number: 3, title: '', description: '', image: '', url: '', tags: '', sponsored_by: '', full_content: '', author: '' }
  ]);
  const [loading, setLoading] = useState(true);
  const [activeSlot, setActiveSlot] = useState(1);

  // Load all content slots from Supabase
  useEffect(() => {
    const loadContentSlots = async () => {
      try {
        const { data, error } = await supabase
          .from('featured_content')
          .select('*')
          .order('slot_number', { ascending: true });

        if (error) {
          console.error('Error loading content slots:', error);
          return;
        }

        if (data) {
          const updatedSlots = [1, 2, 3].map(slotNum => {
            const existing = data.find(item => item.slot_number === slotNum);
            return existing ? {
              slot_number: slotNum,
              title: existing.title || '',
              description: existing.description || '',
              image: existing.image || '',
              url: existing.url || '',
              tags: existing.tags || '',
              sponsored_by: existing.sponsored_by || '',
              full_content: existing.full_content || '',
              author: existing.author || ''
            } : {
              slot_number: slotNum,
              title: '',
              description: '',
              image: '',
              url: '',
              tags: '',
              sponsored_by: '',
              full_content: '',
              author: ''
            };
          });
          setContentSlots(updatedSlots);
        }
      } catch (err) {
        console.error('Error loading content:', err);
      } finally {
        setLoading(false);
      }
    };

    loadContentSlots();
  }, []);

  // Swap two content slots using delete-and-reinsert pattern
  const handleSwapSlots = async (slotA, slotB) => {
    try {
      console.log(`Swapping slots ${slotA} and ${slotB}`);

      // Step 1: Fetch both complete content records from database
      const { data: dataA, error: fetchErrorA } = await supabase
        .from('featured_content')
        .select('*')
        .eq('slot_number', slotA)
        .maybeSingle();

      if (fetchErrorA) {
        console.error('Error fetching slot A:', fetchErrorA);
        throw fetchErrorA;
      }

      const { data: dataB, error: fetchErrorB } = await supabase
        .from('featured_content')
        .select('*')
        .eq('slot_number', slotB)
        .maybeSingle();

      if (fetchErrorB) {
        console.error('Error fetching slot B:', fetchErrorB);
        throw fetchErrorB;
      }

      // If one or both slots are empty, handle appropriately
      if (!dataA && !dataB) {
        alert('Both slots are empty - nothing to swap');
        return;
      }

      console.log('Fetched both slots, now deleting...');

      // Step 2: Delete both slots (if they exist)
      const slotsToDelete = [slotA, slotB].filter(slot => {
        const data = slot === slotA ? dataA : dataB;
        return data !== null;
      });

      if (slotsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('featured_content')
          .delete()
          .in('slot_number', slotsToDelete);

        if (deleteError) {
          console.error('Error deleting slots:', deleteError);
          throw deleteError;
        }
      }

      console.log('Deleted slots, now reinserting with swapped slot numbers...');

      // Step 3: Reinsert with swapped slot numbers (remove id and timestamps)
      const itemsToInsert = [];

      if (dataA) {
        const { id, created_at, updated_at, ...contentAData } = dataA;
        itemsToInsert.push({ ...contentAData, slot_number: slotB });
      }

      if (dataB) {
        const { id, created_at, updated_at, ...contentBData } = dataB;
        itemsToInsert.push({ ...contentBData, slot_number: slotA });
      }

      if (itemsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('featured_content')
          .insert(itemsToInsert);

        if (insertError) {
          console.error('Error reinserting slots:', insertError);
          throw insertError;
        }
      }

      console.log('Successfully swapped slots');

      // Step 4: Reload content to reflect changes
      const { data: reloadedData, error: reloadError } = await supabase
        .from('featured_content')
        .select('*')
        .order('slot_number', { ascending: true });

      if (reloadError) {
        console.error('Error reloading content:', reloadError);
        throw reloadError;
      }

      const updatedSlots = [1, 2, 3].map(slotNum => {
        const existing = reloadedData?.find(item => item.slot_number === slotNum);
        return existing ? {
          slot_number: slotNum,
          title: existing.title || '',
          description: existing.description || '',
          image: existing.image || '',
          url: existing.url || '',
          tags: existing.tags || '',
          sponsored_by: existing.sponsored_by || '',
          full_content: existing.full_content || '',
          author: existing.author || ''
        } : {
          slot_number: slotNum,
          title: '',
          description: '',
          image: '',
          url: '',
          tags: '',
          sponsored_by: '',
          full_content: '',
          author: ''
        };
      });

      setContentSlots(updatedSlots);
      alert(`Content swapped successfully: Slot ${slotA} ↔ Slot ${slotB}`);
    } catch (err) {
      console.error('Error swapping slots:', err);
      alert('Failed to reorder content: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Insights Management</h2>
      <p className="text-gray-600 mb-6">
        Manage up to ten featured content slots. The first 3 slots appear on the Dashboard; all slots appear on the Insights page.
      </p>

      {/* Slot Selector with Reorder Buttons */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((slotNum) => (
          <div key={slotNum} className="flex flex-row items-center gap-2">
            {slotNum > 1 && (
              <button
                onClick={() => handleSwapSlots(slotNum, slotNum - 1)}
                className="p-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                title={`Move slot ${slotNum} left (swap with slot ${slotNum - 1})`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setActiveSlot(slotNum)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeSlot === slotNum
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              #{slotNum}
            </button>
            {slotNum < 10 && (
              <button
                onClick={() => handleSwapSlots(slotNum, slotNum + 1)}
                className="p-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                title={`Move slot ${slotNum} right (swap with slot ${slotNum + 1})`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      ) : (
        <ContentSlotEditor
          content={contentSlots[activeSlot - 1]}
          onUpdate={(updatedContent) => {
            const newSlots = [...contentSlots];
            newSlots[activeSlot - 1] = updatedContent;
            setContentSlots(newSlots);
          }}
        />
      )}
    </div>
  );
}

function ContentSlotEditor({ content, onUpdate }) {
  const [formData, setFormData] = useState(content);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(content);
  }, [content]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleScrapeContent = async () => {
    if (!scrapeUrl) {
      setScrapeError('Please enter a URL');
      return;
    }

    setIsScraping(true);
    setScrapeError('');

    try {
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const response = await fetch(proxyUrl + encodeURIComponent(scrapeUrl));
      const html = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const title = doc.querySelector('meta[property="og:title"]')?.content ||
                   doc.querySelector('title')?.textContent ||
                   '';

      const description = doc.querySelector('meta[property="og:description"]')?.content ||
                         doc.querySelector('meta[name="description"]')?.content ||
                         '';

      const image = doc.querySelector('meta[property="og:image"]')?.content ||
                   doc.querySelector('meta[name="twitter:image"]')?.content ||
                   '';

      const author = doc.querySelector('meta[name="author"]')?.content ||
                    doc.querySelector('.author')?.textContent ||
                    '';

      setFormData({
        ...formData,
        title: title.trim(),
        description: description.trim(),
        image: image,
        url: scrapeUrl,
        author: author.trim()
      });

      setScrapeUrl('');
    } catch (error) {
      console.error('Scrape error:', error);
      setScrapeError('Failed to scrape content. Try entering manually.');
    } finally {
      setIsScraping(false);
    }
  };

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, image: reader.result });
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('featured_content')
        .upsert({
          slot_number: formData.slot_number,
          title: formData.title,
          description: formData.description,
          image: formData.image,
          url: formData.url,
          tags: formData.tags,
          sponsored_by: formData.sponsored_by,
          full_content: formData.full_content,
          author: formData.author
        }, {
          onConflict: 'slot_number'
        });

      if (error) throw error;

      alert('Content saved successfully!');
      onUpdate(formData);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save content: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the content in Slot ${formData.slot_number}? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('featured_content')
        .delete()
        .eq('slot_number', formData.slot_number);

      if (error) throw error;

      alert('Content deleted successfully!');
      // Reset form to empty state
      onUpdate({
        slot_number: formData.slot_number,
        title: '',
        description: '',
        image: '',
        url: '',
        tags: '',
        sponsored_by: '',
        full_content: '',
        author: ''
      });
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete content: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-6">
      {/* URL Scraper */}
      <div>
        <label className="block text-sm font-medium mb-2">Scrape from URL</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={scrapeUrl}
            onChange={(e) => setScrapeUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={handleScrapeContent}
            disabled={isScraping}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isScraping ? 'Scraping...' : 'Scrape'}
          </button>
        </div>
        {scrapeError && <p className="text-red-600 text-sm mt-1">{scrapeError}</p>}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Preview Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Preview Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Image */}
      <div>
        <label className="block text-sm font-medium mb-2">Image</label>
        <div className="flex gap-4">
          <input
            type="url"
            value={formData.image}
            onChange={(e) => handleChange('image', e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <label className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e.target.files[0])}
            />
          </label>
        </div>
        {formData.image && (
          <img src={formData.image} alt="Preview" className="mt-2 w-48 h-48 object-cover rounded border" />
        )}
      </div>

      {/* External URL */}
      <div>
        <label className="block text-sm font-medium mb-2">External Site URL (if applicable)</label>
        <input
          type="url"
          value={formData.url}
          onChange={(e) => handleChange('url', e.target.value)}
          placeholder="https://example.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Full Content */}
      <div>
        <label className="block text-sm font-medium mb-2">Full Content (if blog post)</label>
        <textarea
          value={formData.full_content}
          onChange={(e) => handleChange('full_content', e.target.value)}
          rows="8"
          placeholder="Full article content for blog posts..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
        />
      </div>

      {/* Author */}
      <div>
        <label className="block text-sm font-medium mb-2">Author (if applicable)</label>
        <input
          type="text"
          value={formData.author}
          onChange={(e) => handleChange('author', e.target.value)}
          placeholder="Author name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Professional Interest Tags */}
      <div>
        <label className="block text-sm font-medium mb-2">Professional Interest Tags</label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => handleChange('tags', e.target.value)}
          placeholder="Technology, Leadership, Innovation"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        <p className="text-xs text-gray-500 mt-1">Comma-separated tags</p>
      </div>

      {/* Sponsored By */}
      <div>
        <label className="block text-sm font-medium mb-2">Sponsored By (optional)</label>
        <input
          type="text"
          value={formData.sponsored_by}
          onChange={(e) => handleChange('sponsored_by', e.target.value)}
          placeholder="Company name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between gap-4 pt-4 border-t">
        <button
          onClick={handleDelete}
          disabled={isSaving}
          className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold"
        >
          {isSaving ? 'Deleting...' : 'Delete Content'}
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
        >
          {isSaving ? 'Saving...' : 'Save Content'}
        </button>
      </div>
    </div>
  );
}

function ModerationTab({ onReportReviewed }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewed, setShowReviewed] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);

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
              <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
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
                  {!showReviewed && (
                    <button
                      onClick={() => handleMarkAsReviewed(report.id)}
                      disabled={reviewingId === report.id}
                      className="ml-4 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {reviewingId === report.id ? 'Reviewing...' : 'Mark as Reviewed'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InlineAdEditor({ title, slot, ad, onImageUpload, onUrlChange, onRemove, dimensions, description, aspectRatio = "160/600" }) {
  const [tags, setTags] = useState(ad?.tags || '');

  const handleTagsChange = (newTags) => {
    setTags(newTags);
    const updatedAd = { ...ad, tags: newTags };
    localStorage.setItem(`ad_${slot}`, JSON.stringify(updatedAd));
  };

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
          value={tags}
          onChange={(e) => handleTagsChange(e.target.value)}
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

      {ad?.image && ad?.url && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium">LIVE</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel