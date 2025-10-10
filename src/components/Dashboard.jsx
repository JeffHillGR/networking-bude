import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, Heart, MessageCircle, User, CreditCard, Archive, ChevronLeft, ChevronRight, Users, ExternalLink } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import Events from './Events';
import Connections from './Connections';
import Messages from './Messages';
import Profile from './Profile';
import { Settings as SettingsIcon } from 'lucide-react';
import Settings from './Settings';
import Subscription from './Subscription';
import UpgradeModal from './UpgradeModal';
import PaymentPortal from './PaymentPortal';
import TermsPage from './TermsPage';
import PrivacyPage from './PrivacyPage';
import ArchivePage from './ArchivePage';
function Dashboard() {
  const navigate = useNavigate();
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
const [selectedPlan, setSelectedPlan] = useState(null);
const [featuredContentIndex, setFeaturedContentIndex] = useState(0);

// Scroll to top when dashboard loads
useEffect(() => {
  window.scrollTo(0, 0);
}, []);

// Get user's first name and time-based greeting
const userFirstName = localStorage.getItem('userFirstName') || 'there';
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};
const shouldShowUpgradePrompt = (feature) => {
  if (isDevMode) return false; // Dev mode bypasses all gates
  return true; // Preview mode shows upgrade prompts
};

  // Load admin-created featured content from localStorage
  const adminContent1 = localStorage.getItem('featuredContent1');
  const adminFeaturedContent1 = adminContent1 ? JSON.parse(adminContent1) : null;

  const adminContent2 = localStorage.getItem('featuredContent2');
  const adminFeaturedContent2 = adminContent2 ? JSON.parse(adminContent2) : null;

  const adminContent3 = localStorage.getItem('featuredContent3');
  const adminFeaturedContent3 = adminContent3 ? JSON.parse(adminContent3) : null;

  const defaultFeaturedContent = [
    {
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop',
      title: 'Building Meaningful Professional Networks',
      description: 'Learn strategies for authentic networking that leads to lasting professional relationships.',
      url: 'https://example.com',
      tags: 'Leadership, Networking',
      sponsoredBy: ''
    },
    {
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200&h=200&fit=crop',
      title: 'Leadership in the Modern Workplace',
      description: 'Discover how to lead effectively in hybrid work environments and build resilient teams.',
      url: 'https://example.com',
      tags: 'Leadership, Management',
      sponsoredBy: ''
    },
    {
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop',
      title: 'Personal Branding for Professionals',
      description: 'Master the art of showcasing your unique value and building your professional reputation.',
      url: 'https://example.com',
      tags: 'Marketing, Career Growth',
      sponsoredBy: ''
    }
  ];

  // Build featured content array: use admin content where available, otherwise use defaults
  const slot1 = (adminFeaturedContent1 && adminFeaturedContent1.title) ? adminFeaturedContent1 : defaultFeaturedContent[0];
  const slot2 = (adminFeaturedContent2 && adminFeaturedContent2.title) ? adminFeaturedContent2 : defaultFeaturedContent[1];
  const slot3 = (adminFeaturedContent3 && adminFeaturedContent3.title) ? adminFeaturedContent3 : defaultFeaturedContent[2];

  const featuredContent = [slot1, slot2, slot3];

  const connections = [
    { name: 'Maria Rodriguez', title: 'Marketing Director at Spotify', similarity: '88%', mutuals: '5 mutual connections', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces' },
    { name: 'Alex Chen', title: 'Senior Developer at Google', similarity: '95%', mutuals: '3 mutual connections', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=faces' },
    { name: 'David Kim', title: 'Product Manager at Meta', similarity: '92%', mutuals: '2 mutual connections', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces' }
  ];

  // Load admin-created events from localStorage
  const adminEvents = JSON.parse(localStorage.getItem('adminEvents') || '[]');

  // Mock events for slots 2, 3, and 4 (always shown for demo)
  const mockEvents = [
    { id: 2, title: 'StartGarden Entrepreneur Pitch', date: '9/24/2025', time: '6:30 PM - 9:00 PM', location: 'StartGarden', organizerName: 'Start Garden', fullAddress: '38 Commerce Ave SW, Grand Rapids, MI', image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=300&fit=crop', badge: 'In-Person' },
    { id: 3, title: 'Athena Leadership Workshop', date: '9/27/2025', time: '9:00 AM - 5:00 PM', location: 'Grand Rapids Art Museum', organizerName: 'Athena', fullAddress: '101 Monroe Center St NW, Grand Rapids, MI', image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400&h=300&fit=crop', badge: 'In-Person' },
    { id: 4, title: 'Sponsored Event', date: 'Coming Soon', time: 'TBA', location: 'Your Event Here', organizerName: 'Your Organization', fullAddress: 'Grand Rapids, MI', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop', badge: 'Sponsored', isSponsored: true }
  ];

  // First event from admin (if exists), then always show mock events in slots 2, 3, & 4
  const events = adminEvents.length > 0
    ? [adminEvents[0], ...mockEvents]
    : [
        { id: 1, title: 'Creative Mornings Design Session', date: '9/19/2025', time: '8:00 AM - 10:00 AM', location: 'Bamboo Grand Rapids', organizerName: 'Creative Mornings GR', fullAddress: '33 Commerce Ave SW, Grand Rapids, MI', image: 'https://images.unsplash.com/photo-1558403194-611308249627?w=400&h=300&fit=crop', badge: 'In-Person' },
        ...mockEvents
      ];

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'connections', icon: Heart, label: 'Connections' },
    { id: 'messages', icon: MessageCircle, label: 'Messages' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  const renderContent = () => {

  console.log('Current activeTab:', activeTab);
  
    switch(activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="relative h-48 md:h-56 rounded-lg overflow-hidden shadow-lg">
              <img 
                src="/Tech-Week-rooftop.jpg"
                alt="Networking Event at Sunset" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-6 h-6" />
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Discover. Connect. Grow.</h2>
                </div>
                <p className="text-sm md:text-base opacity-90">Join professionals making meaningful connections</p>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">{getGreeting()}, {userFirstName}!</h1>
              <p className="text-gray-600 mt-1">Here's what's happening in your professional network today.</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">Featured Content</h3>
                  <p className="text-sm text-gray-600">Thoughtfully curated content to help you grow professionally (and personally)</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFeaturedContentIndex((featuredContentIndex - 1 + featuredContent.length) % featuredContent.length)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-600">{featuredContentIndex + 1} of {featuredContent.length}</span>
                  <button
                    onClick={() => setFeaturedContentIndex((featuredContentIndex + 1) % featuredContent.length)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div
                onClick={() => {
                  if (featuredContent[featuredContentIndex].url) {
                    window.open(featuredContent[featuredContentIndex].url, '_blank');
                  }
                }}
                className="flex gap-4 hover:bg-gray-50 p-2 rounded-lg transition-colors -m-2 cursor-pointer"
              >
                <img
                  src={featuredContent[featuredContentIndex].image}
                  alt={featuredContent[featuredContentIndex].title}
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2">{featuredContent[featuredContentIndex].title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{featuredContent[featuredContentIndex].description}</p>
                  <div className="flex items-center justify-between">
                    {featuredContent[featuredContentIndex].tags && (
                      <div className="flex gap-1">
                        {featuredContent[featuredContentIndex].tags.split(',').slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    {featuredContent[featuredContentIndex].sponsoredBy && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400">Sponsored by</span>
                        <span className="text-xs font-medium text-gray-700">{featuredContent[featuredContentIndex].sponsoredBy}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">Check Out Your Potential Connections</h3>
                  <p className="text-sm text-gray-600">People you might want to connect with</p>
                </div>
                <button 
  onClick={() => {
  if (shouldShowUpgradePrompt('connections')) {
    setShowUpgradePopup(true);
  } else {
    setActiveTab('connections');
  }
}}
  className="text-sm text-green-600 font-medium hover:underline"
>
  View All
</button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {connections.map((person, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex flex-col">
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={person.image}
                        alt={person.name}
                        className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm">{person.name}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{person.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-600">{person.similarity} compatible</span>
                        <span className="text-xs text-blue-500">👥 {person.mutuals}</span>
                      </div>
                      <button className="px-3 py-1.5 bg-[#009900] text-white text-xs rounded hover:bg-[#007700] flex-shrink-0">
                        Connect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">See What Events Are Coming Up</h3>
                  <p className="text-sm text-gray-600">Networking events happening near you</p>
                </div>
<button 
  onClick={() => {
    if (shouldShowUpgradePrompt('events')) {
      setShowUpgradePopup(true);
    } else {
      setActiveTab('events');
    }
  }}
  className="text-sm text-green-600 font-medium hover:underline"
>
  View All Events
</button>              </div>
              <div className="grid grid-cols-2 gap-3">
                {events.map((event, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {event.image && (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <div className="p-3">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <span className="inline-block bg-black text-white text-xs px-2 py-1 rounded mb-1">{event.badge || 'In-Person'}</span>
                          <h4 className="font-bold text-gray-900 text-sm">{event.title}</h4>
                        </div>
                      </div>
                      <div className="space-y-0.5 text-xs text-gray-600 mb-2">
                        <p className="font-semibold text-gray-700">🏢 {event.organizerName || 'Event Organizer'}</p>
                        <p>📅 {event.date}</p>
                        <p>🕐 {event.time}</p>
                        <p>📍 {event.fullAddress || event.location}</p>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            if (shouldShowUpgradePrompt('eventDetails')) {
                              setShowUpgradePopup(true);
                            } else {
                              navigate(`/events/${event.id}`);
                            }
                          }}
                          className="text-[#009900] font-medium hover:text-[#007700] flex items-center gap-1 text-xs"
                        >
                          View Details
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                    {/* Bottom Banner Ad */}
            <div className="mt-12">
              {(() => {
                const dashboardAd = JSON.parse(localStorage.getItem('ad_dashboardBottom') || 'null');
                return dashboardAd?.image && dashboardAd?.url ? (<a
                  
                    href={dashboardAd.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={dashboardAd.image}
                      alt="Advertisement"
                      className="w-full rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      style={{ aspectRatio: '1200/300' }}
                    />
                  </a>
                ) : (
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-12 flex items-center justify-center border-2 border-dashed border-gray-300" style={{ aspectRatio: '1200/300' }}>
                    <div className="text-center">
                      <p className="text-gray-600 font-medium">Dashboard Bottom Banner</p>
                      <p className="text-sm text-gray-500 mt-2">1200 x 300 • Add via Admin Panel</p>
                    </div>
                  </div>
                );
              })()}
            </div>
            </div>
          </div>
        );
      
  case 'events':
  return <Events />;

 case 'connections':
  if (shouldShowUpgradePrompt('connections')) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Premium Feature</h2>
          <p className="text-gray-600 mb-6">Upgrade to BudE+ to access Connections</p>
          <button 
            onClick={() => setActiveTab('subscription')}
        className="bg-[#009900] text-white px-6 py-3 rounded-lg border-[3px] border-[#D0ED00] hover:bg-green-700"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }
  return <Connections />;

  case 'messages':
  if (shouldShowUpgradePrompt('messages')) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Premium Feature</h2>
          <p className="text-gray-600 mb-6">Upgrade to BudE+ to access Messages</p>
          <button 
            onClick={() => setActiveTab('subscription')}
           className="bg-[#009900] text-white px-6 py-3 rounded-lg border-[3px] border-[#D0ED00] hover:bg-green-700"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }
  return <Messages />;

  case 'profile':
  return <Profile />;

  case 'settings':
  return <Settings />;

  case 'subscription':
  return <Subscription onSelectPlan={(planId, isYearly) => {
    setSelectedPlan({ planId, isYearly });
      setActiveTab('payment');
  }} />;

  case 'payment':
  return <PaymentPortal />;

  case 'terms':
  return <TermsPage />;

  case 'privacy':
  return <PrivacyPage />;

  case 'archive':
  return <ArchivePage />;

default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Content for {activeTab} coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
    <div className="bg-gradient-to-r from-green-600 via-lime-400 to-yellow-400 text-white px-4 py-2 text-center text-sm md:text-base">
      <span className="font-medium">
        {isDevMode ? '🔧 Dev Mode' : '🎨 Preview Mode'}
      </span>
      <span className="mx-2">•</span>
      <span>Upgrade $9.99/month to unlock features</span>
      <span className="mx-2">•</span>
      <button 
        onClick={() => setIsDevMode(!isDevMode)} 
        className="underline hover:no-underline font-medium"
      >
        {isDevMode ? 'Switch to Preview' : 'Enter Dev Mode'}
      </button>
      {isDevMode && (
        <>
          <span className="mx-2">•</span>
         <button 
  onClick={() => {
    localStorage.removeItem('onboardingCompleted');
    window.location.href = '/';
  }}
  className="underline hover:no-underline font-medium"
>
  Reset to Onboarding
</button>
        </>
      )}
    </div>
    <div className="md:flex md:h-screen">
  
    <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
          <main className="flex-1 md:overflow-y-auto">
          <div className="md:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
            <div className="flex items-center justify-center">
              <img 
                src="/BudE-Logo-Final.png"
                alt="BudE Logo" 
                className="h-10 w-auto"
              />
            </div>
          </div>

          <div className="p-4 md:p-8 max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-20">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <button
              key
              ={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
      {showUpgradePopup && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowUpgradePopup(false)}>
    <div className="bg-white rounded-lg p-8 max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Premium Feature</h2>
      <p className="text-gray-600 mb-6">Upgrade to a paid BudE Subscriber to access this feature</p>
      <div className="flex gap-3">
        <button 
          onClick={() => {
            setShowUpgradePopup(false);
            setActiveTab('subscription');
          }}
          className="flex-1 bg-[#009900] text-white px-6 py-3 rounded-lg border-[3px] border-[#D0ED00] hover:bg-green-700"        >
          Upgrade Now
        </button>
        <button 
          onClick={() => setShowUpgradePopup(false)}
          className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
        >
          Maybe Later
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}



export default Dashboard;