import { useState, useEffect } from 'react';
import { Upload, X, Link2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase.js';

function AdminPanel() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ads, setAds] = useState({
    eventsSidebar1: JSON.parse(localStorage.getItem('ad_eventsSidebar1') || 'null'),
    eventsSidebar2: JSON.parse(localStorage.getItem('ad_eventsSidebar2') || 'null'),
    eventsBottom: JSON.parse(localStorage.getItem('ad_eventsBottom') || 'null'),
    eventDetailBanner: JSON.parse(localStorage.getItem('ad_eventDetailBanner') || 'null'),
    dashboardBottom: JSON.parse(localStorage.getItem('ad_dashboardBottom') || 'null')
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
          <div>
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10"
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
              onClick={handleLogin}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Login
            </button>
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
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Back to Site
            </button>
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
              onClick={() => setActiveTab('eventDetailAds')}
              className={`px-4 py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'eventDetailAds'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Event Details Banner Ads
            </button>
            <button
              onClick={() => setActiveTab('moderation')}
              className={`px-4 py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'moderation'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Moderation
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
        {activeTab === 'eventDetailAds' && (
          <EventDetailAdsTab
            ads={ads}
            handleImageUpload={handleImageUpload}
            handleUrlChange={handleUrlChange}
            removeAd={removeAd}
          />
        )}
        {activeTab === 'moderation' && <ModerationTab />}
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
    fullContent: ''
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
            fullContent: data.full_content || ''
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
          full_content: featuredContent.fullContent || null
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
    fullContent: ''
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
            fullContent: data.full_content || ''
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
          full_content: featuredContent2.fullContent || null
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
    fullContent: ''
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
            fullContent: data.full_content || ''
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
          full_content: featuredContent3.fullContent || null
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard Layout Setup</h2>
      
      {/* Top Banner Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">Top Banner (Geotagged)</h3>
        <p className="text-gray-600 mb-4">
          Upload a banner image that will display at the top of user dashboards. You can geotag this to show location-specific content.
        </p>
        <div>
  <div className="mb-4">
    <label className="block text-sm font-medium mb-2">Banner Image</label>
    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-gray-50">
      <Upload className="w-12 h-12 text-gray-400 mb-2" />
      <span className="text-sm text-gray-600">Click to upload banner</span>
      <span className="text-xs text-gray-500 mt-1">Recommended size: 1200x300px</span>
      <input type="file" accept="image/*" className="hidden" />
    </label>
  </div>

  <div className="mb-4">
    <label className="block text-sm font-medium mb-2">Click-through URL</label>
    <div className="flex gap-2">
      <Link2 className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0" />
      <input type="url" placeholder="https://example.com" className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg" />
    </div>
  </div>

  <div className="mb-4">
    <label className="block text-sm font-medium mb-2">Organization Zip Code (for targeting)</label>
    <input type="text" placeholder="49503" maxLength="5" className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg" />
  </div>

  <div className="mb-4">
    <label className="block text-sm font-medium mb-2">Target Radius</label>
    <select defaultValue="50" className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg">
      <option value="25">25 miles</option>
      <option value="50">50 miles (recommended)</option>
      <option value="100">100 miles</option>
      <option value="statewide">Statewide</option>
      <option value="national">National (entire country)</option>
    </select>
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
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-900">Featured Item #1</h4>
            <button
              onClick={handleSaveContent}
              className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
            >
              Save Content
            </button>
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
        </div>

        {/* Featured Item #2 - Editable */}
        <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-900">Featured Item #2</h4>
            <button
              onClick={handleSaveContent2}
              className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
            >
              Save Content
            </button>
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
        </div>

        {/* Featured Item #3 - Editable */}
        <div className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-900">Featured Item #3</h4>
            <button
              onClick={handleSaveContent3}
              className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
            >
              Save Content
            </button>
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
        <h3 className="text-xl font-semibold mb-4">Dashboard Bottom Ad</h3>
        <p className="text-gray-600 mb-4">
          Advertisement that appears at the bottom of the user dashboard
        </p>

        <div>
          <InlineAdEditor
            title="Dashboard Bottom Banner"
            slot="dashboardBottom"
            ad={ads.dashboardBottom}
            onImageUpload={handleImageUpload}
            onUrlChange={handleUrlChange}
            onRemove={removeAd}
            dimensions="1200x180px"
            description="Appears at bottom of user dashboard"
            aspectRatio="1200/180"
          />
        </div>
      </div>
    </div>
  );
}

function EventsAdsTab({ ads, handleImageUpload, handleUrlChange, removeAd }) {
  // Load most recent event from localStorage if exists
  const loadMostRecentEvent = () => {
    const events = JSON.parse(localStorage.getItem('adminEvents') || '[]');
    if (events.length > 0) {
      return events[0]; // Most recent event
    }
    return {
      title: '',
      description: '',
      fullDescription: '',
      date: '',
      time: '',
      location: '',
      fullAddress: '',
      image: '',
      badge: 'In-Person',
      organizerName: '',
      organizerDescription: '',
      organizerGeotag: '',
      tags: '',
      registrationUrl: ''
    };
  };

  const [newEvent, setNewEvent] = useState(loadMostRecentEvent());
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');

  const organizations = [
    'GR Chamber of Commerce', 'Rotary Club', 'CREW', 'GRYP',
    'Economic Club of Grand Rapids', 'Create Great Leaders', 'Right Place', 'Bamboo',
    'Hello West Michigan', 'CARWM', 'Creative Mornings', 'Athena',
    'Inforum', 'Start Garden'
  ];

  const handleEventInputChange = (field, value) => {
    setNewEvent({ ...newEvent, [field]: value });
  };

  const handleScrapeEvent = async () => {
    if (!scrapeUrl) {
      setScrapeError('Please enter a URL');
      return;
    }

    setIsScraping(true);
    setScrapeError('');

    try {
      // Use CORS proxy for demo purposes
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const response = await fetch(proxyUrl + encodeURIComponent(scrapeUrl));
      const html = await response.text();

      // Create a DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Try to extract event data using common patterns
      let scrapedData = {
        registrationUrl: scrapeUrl
      };

      // Try Schema.org structured data first (most reliable)
      const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
      let eventData = null;

      jsonLdScripts.forEach(script => {
        try {
          const data = JSON.parse(script.textContent);
          if (data['@type'] === 'Event' || (Array.isArray(data) && data.find(item => item['@type'] === 'Event'))) {
            eventData = Array.isArray(data) ? data.find(item => item['@type'] === 'Event') : data;
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      });

      if (eventData) {
        // Extract from Schema.org Event data
        scrapedData.title = eventData.name || '';
        scrapedData.description = eventData.description || '';
        scrapedData.fullDescription = eventData.description || '';
        scrapedData.image = eventData.image || '';

        if (eventData.startDate) {
          const startDate = new Date(eventData.startDate);
          scrapedData.date = startDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
          scrapedData.time = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }

        if (eventData.location) {
          if (typeof eventData.location === 'string') {
            scrapedData.location = eventData.location;
            scrapedData.fullAddress = eventData.location;
          } else if (eventData.location.name) {
            scrapedData.location = eventData.location.name;
            scrapedData.fullAddress = eventData.location.address?.streetAddress
              ? `${eventData.location.address.streetAddress}, ${eventData.location.address.addressLocality}, ${eventData.location.address.addressRegion}`
              : eventData.location.name;
          }
        }

        if (eventData.organizer) {
          scrapedData.organizerName = typeof eventData.organizer === 'string' ? eventData.organizer : eventData.organizer.name;
        }
      } else {
        // Fallback: Try common HTML patterns
        const title = doc.querySelector('h1')?.textContent?.trim() ||
                     doc.querySelector('[class*="title"]')?.textContent?.trim() ||
                     doc.querySelector('title')?.textContent?.trim() || '';
        scrapedData.title = title;

        // Try to find description
        const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content');
        if (metaDesc) {
          scrapedData.description = metaDesc.substring(0, 200);
          scrapedData.fullDescription = metaDesc;
        }

        // Try to find image
        const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
        if (ogImage) {
          scrapedData.image = ogImage.startsWith('http') ? ogImage : new URL(ogImage, scrapeUrl).href;
        }
      }

      // Merge scraped data with existing form data (don't overwrite existing values)
      setNewEvent(prev => ({
        ...prev,
        title: scrapedData.title || prev.title,
        description: scrapedData.description || prev.description,
        fullDescription: scrapedData.fullDescription || prev.fullDescription,
        date: scrapedData.date || prev.date,
        time: scrapedData.time || prev.time,
        location: scrapedData.location || prev.location,
        fullAddress: scrapedData.fullAddress || prev.fullAddress,
        image: scrapedData.image || prev.image,
        organizerName: scrapedData.organizerName || prev.organizerName,
        registrationUrl: scrapedData.registrationUrl || prev.registrationUrl
      }));

      alert('Event data scraped! Please review and edit any missing details.');
    } catch (error) {
      console.error('Scraping error:', error);
      setScrapeError('Unable to scrape this URL. Please enter details manually or try a different URL.');
    } finally {
      setIsScraping(false);
    }
  };

  const handleSaveEvent = () => {
    // Update or save event to localStorage
    const events = JSON.parse(localStorage.getItem('adminEvents') || '[]');

    // If event already has an ID, update it; otherwise create new
    if (newEvent.id) {
      const updatedEvents = [newEvent, ...events.filter(e => e.id !== newEvent.id)];
      localStorage.setItem('adminEvents', JSON.stringify(updatedEvents));
    } else {
      const eventWithId = { ...newEvent, id: Date.now() };
      events.unshift(eventWithId); // Add to beginning
      localStorage.setItem('adminEvents', JSON.stringify(events));
      setNewEvent(eventWithId); // Update form with ID
    }

    alert('Event saved successfully!');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Events Page Content and Ads</h2>

      <div className="flex gap-6">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white rounded-lg p-8 border border-gray-200 mb-6">
            <h3 className="text-xl font-semibold mb-4">Events Page Listings</h3>

            <div className="space-y-3">
              {/* Event 1 - Input Form */}
              <div className="border-2 border-blue-300 rounded-lg p-3 bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-gray-900">Event Slot 1 - Create New Event</h4>
                  <button
                    onClick={handleSaveEvent}
                    className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
                  >
                    Save Event
                  </button>
                </div>

                <div className="space-y-2 bg-white p-3 rounded">
                  {/* URL Scraper - Optional */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded border border-blue-200 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-900">✨ Quick Add from URL (Optional)</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">Paste an event page URL to automatically fill in details. Works with Eventbrite, Meetup, and many organization websites.</p>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={scrapeUrl}
                        onChange={(e) => setScrapeUrl(e.target.value)}
                        placeholder="https://example.com/event-page"
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                        disabled={isScraping}
                      />
                      <button
                        onClick={handleScrapeEvent}
                        disabled={isScraping}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {isScraping ? 'Scraping...' : 'Scrape Event'}
                      </button>
                    </div>
                    {scrapeError && (
                      <p className="text-xs text-red-600 mt-1">{scrapeError}</p>
                    )}
                  </div>

                  {/* Event Image - First */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Event Image *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newEvent.image}
                        onChange={(e) => handleEventInputChange('image', e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                        placeholder="Image URL or upload below"
                      />
                      <label className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300 cursor-pointer flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                handleEventInputChange('image', reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {newEvent.image && (
                      <img src={newEvent.image} alt="Preview" className="mt-1 w-full h-24 object-cover rounded" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">Event Title *</label>
                      <input
                        type="text"
                        value={newEvent.title}
                        onChange={(e) => handleEventInputChange('title', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        placeholder="e.g., Tech Leaders Breakfast"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">Event Badge</label>
                      <select
                        value={newEvent.badge}
                        onChange={(e) => handleEventInputChange('badge', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      >
                        <option>In-Person</option>
                        <option>Virtual</option>
                        <option>Hybrid</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Short Description *</label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => handleEventInputChange('description', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      rows="2"
                      placeholder="Brief description for event listings"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Full Description *</label>
                    <textarea
                      value={newEvent.fullDescription}
                      onChange={(e) => handleEventInputChange('fullDescription', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      rows="3"
                      placeholder="Detailed description for event detail page"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">Date *</label>
                      <input
                        type="text"
                        value={newEvent.date}
                        onChange={(e) => handleEventInputChange('date', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        placeholder="e.g., Thursday, September 19, 2025"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">Time *</label>
                      <input
                        type="text"
                        value={newEvent.time}
                        onChange={(e) => handleEventInputChange('time', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        placeholder="e.g., 8:00 AM - 10:00 AM"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">Location Name *</label>
                      <input
                        type="text"
                        value={newEvent.location}
                        onChange={(e) => handleEventInputChange('location', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        placeholder="e.g., Bamboo Grand Rapids"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">Full Address *</label>
                      <input
                        type="text"
                        value={newEvent.fullAddress}
                        onChange={(e) => handleEventInputChange('fullAddress', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        placeholder="e.g., 33 Commerce Ave SW, Grand Rapids, MI 49503"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-2">
                    <h5 className="font-semibold text-xs text-gray-900 mb-2">Organizer Information</h5>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">Organizer Name *</label>
                          <input
                            type="text"
                            value={newEvent.organizerName}
                            onChange={(e) => handleEventInputChange('organizerName', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            placeholder="e.g., Creative Mornings GR"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-0.5">Organization *</label>
                          <select
                            value={newEvent.organizerGeotag}
                            onChange={(e) => handleEventInputChange('organizerGeotag', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          >
                            <option value="">Select organization...</option>
                            {organizations.map((org, index) => (
                              <option key={index} value={org}>{org}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Organizer Description</label>
                        <textarea
                          value={newEvent.organizerDescription}
                          onChange={(e) => handleEventInputChange('organizerDescription', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          rows="2"
                          placeholder="Brief description of the organizing entity"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">Tags (comma-separated)</label>
                      <input
                        type="text"
                        value={newEvent.tags}
                        onChange={(e) => handleEventInputChange('tags', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        placeholder="e.g., Design, Creativity, Networking"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">Registration URL *</label>
                      <input
                        type="text"
                        value={newEvent.registrationUrl}
                        onChange={(e) => handleEventInputChange('registrationUrl', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Event 2 - Placeholder */}
              <div className="border-2 border-gray-300 rounded-lg p-3 bg-gray-50">
                <h4 className="font-bold text-sm text-gray-900 mb-1">Event Slot 2</h4>
                <p className="text-gray-500 text-xs">Available for future event creation</p>
              </div>

              {/* Event 3 - Placeholder */}
              <div className="border-2 border-gray-300 rounded-lg p-3 bg-gray-50">
                <h4 className="font-bold text-sm text-gray-900 mb-1">Event Slot 3</h4>
                <p className="text-gray-500 text-xs">Available for future event creation</p>
              </div>
            </div>
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

function EventDetailAdsTab({ ads, handleImageUpload, handleUrlChange, removeAd }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Event Details Banner Ads</h2>
      <p className="text-gray-600 mb-6">
        Manage 728x160 banner ads that appear at the bottom of individual event detail pages.
        Use content tags to target specific types of events (e.g., Technology, Leadership, Networking).
      </p>

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">Banner Ad Management</h3>
        <p className="text-gray-600 mb-6">
          Upload a banner ad with targeted content tags. The ad will only display on event detail pages
          where the event's tags match your ad's tags.
        </p>

        <InlineAdEditor
          title="Event Detail Page - Banner Ad"
          slot="eventDetailBanner"
          ad={ads.eventDetailBanner}
          onImageUpload={handleImageUpload}
          onUrlChange={handleUrlChange}
          onRemove={removeAd}
          dimensions="728x160px"
          description="Banner ad at bottom of individual event detail pages"
          aspectRatio="728/160"
        />

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-sm text-blue-900 mb-2">How Tag Targeting Works:</h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Enter tags like "Technology, Innovation, AI" in the Content Tags field above</li>
            <li>Your ad will only show on events that have at least one matching tag</li>
            <li>Example: An ad tagged "Leadership, Networking" shows on leadership forums and networking events</li>
            <li>Leave tags empty to show the ad on all event detail pages</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ModerationTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Moderation & Messages</h2>
      
      {/* Reported Content Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">Reported Content</h3>
        <p className="text-gray-600 mb-4">Review and moderate reported users, messages, or content</p>
        <div className="bg-gray-100 p-8 rounded text-center text-gray-500">
          <p>No reports at this time</p>
          <p className="text-sm mt-2">Reported content will appear here for review</p>
        </div>
      </div>

      {/* Messages Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">User Messages</h3>
        <p className="text-gray-600 mb-4">View and monitor user-to-user messages if needed</p>
        <div className="bg-gray-100 p-8 rounded text-center text-gray-500">
          <p>Message monitoring interface</p>
          <p className="text-sm mt-2">Access to user messages for moderation purposes</p>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">User Management</h3>
        <p className="text-gray-600 mb-4">Search and manage user accounts</p>
        <div className="bg-gray-100 p-8 rounded text-center text-gray-500">
          <p>User search and management tools</p>
          <p className="text-sm mt-2">Ban, suspend, or manage user accounts</p>
        </div>
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