import { useState } from 'react';
import { Upload, X, Link2 } from 'lucide-react';

function AdminPanel() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ads, setAds] = useState({
    eventsSidebar1: JSON.parse(localStorage.getItem('ad_eventsSidebar1') || 'null'),
    eventsSidebar2: JSON.parse(localStorage.getItem('ad_eventsSidebar2') || 'null'),
    eventsBottom: JSON.parse(localStorage.getItem('ad_eventsBottom') || 'null')
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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
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
        {activeTab === 'dashboard' && <DashboardSetupTab />}
        {activeTab === 'events' && (
          <EventsAdsTab
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

function DashboardSetupTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard Layout Setup</h2>
      
      {/* Top Banner Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">Top Banner (Geotagged)</h3>
        <p className="text-gray-600 mb-4">
          Upload a banner image that will display at the top of user dashboards. You can geotag this to show location-specific content.
        </p>
        <div className="max-w-3xl">
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
        <h3 className="text-xl font-semibold mb-4">Featured Content (3 items)</h3>
        <p className="text-gray-600 mb-4">
          Add up to 3 featured pieces of content (podcasts, blogs, articles, etc.)
        </p>
        <div className="space-y-4">
          {[1, 2, 3].map((num) => (
            <div key={num} className="bg-gray-50 p-4 rounded border border-gray-300">
              <h4 className="font-semibold mb-2">Featured Item {num}</h4>
              <p className="text-sm text-gray-500">Content editor coming soon...</p>
            </div>
          ))}
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
        <div className="bg-gray-100 p-4 rounded border-2 border-dashed border-gray-300 text-center">
          <p className="text-gray-500">Dashboard Ad Upload - Coming Soon</p>
          <p className="text-sm text-gray-400 mt-2">Recommended size: 728x90px</p>
        </div>
      </div>
    </div>
  );
}

function EventsAdsTab({ ads, handleImageUpload, handleUrlChange, removeAd }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Events Page Banner Ad Placement</h2>
      
      <div className="flex gap-6">
        {/* Main Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-lg p-8 border border-gray-200 mb-6">
            <h3 className="text-xl font-semibold mb-4">Events Page Content</h3>
            <div className="space-y-4 text-gray-500">
              <p>Your events listing displays here...</p>
              <div className="h-32 bg-gray-100 rounded"></div>
              <div className="h-32 bg-gray-100 rounded"></div>
              <div className="h-32 bg-gray-100 rounded"></div>
            </div>
          </div>

          {/* Bottom Banner Ad */}
          <div className="mt-8">
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