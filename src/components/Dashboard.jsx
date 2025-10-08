import React, { useState } from 'react';
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
const [showStats, setShowStats] = useState(false);
const [featuredContentIndex, setFeaturedContentIndex] = useState(0);

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
  const stats = [
    { icon: Users, label: 'New Connections', value: '47', change: '+24% this week', color: 'text-green-600' },
    { icon: Calendar, label: 'Upcoming Events', value: '8', change: '3 this week', color: 'text-blue-600' },
    { icon: MessageCircle, label: 'Active Conversations', value: '12', change: '89% response rate', color: 'text-purple-600' },
    { icon: User, label: 'Profile Views', value: '342', change: '+67% this month', color: 'text-orange-600' }
  ];

  const featuredContent = [
    {
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop',
      title: 'Building Meaningful Professional Networks',
      description: 'Learn strategies for authentic networking that leads to lasting professional relationships.',
      type: 'Career Growth Podcast',
      duration: '32 min',
      sponsor: { name: 'Lake Michigan Credit Union', logo: 'LMCU' }
    },
    {
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200&h=200&fit=crop',
      title: 'Leadership in the Modern Workplace',
      description: 'Discover how to lead effectively in hybrid work environments and build resilient teams.',
      type: 'Video Course',
      duration: '45 min',
      sponsor: { name: 'Mercantile Bank', logo: 'MB' }
    },
    {
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop',
      title: 'Personal Branding for Professionals',
      description: 'Master the art of showcasing your unique value and building your professional reputation.',
      type: 'Article Series',
      duration: '15 min read',
      sponsor: { name: 'First National Bank', logo: 'FNB' }
    }
  ];

  const connections = [
    { name: 'Maria Rodriguez', title: 'Marketing Director at Spotify', match: '88% match', mutuals: '5 mutual connections', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces' },
    { name: 'Alex Chen', title: 'Senior Developer at Google', match: '95% match', mutuals: '3 mutual connections', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=faces' },
    { name: 'David Kim', title: 'Product Manager at Meta', match: '92% match', mutuals: '2 mutual connections', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces' }
  ];

  const events = [
    { id: 1, title: 'Creative Mornings Design Session', date: '9/19/2025', time: '8:00 AM - 10:00 AM', location: 'Bamboo Grand Rapids', attendees: '45 attending', image: 'https://images.unsplash.com/photo-1558403194-611308249627?w=400&h=300&fit=crop' },
    { id: 2, title: 'StartGarden Entrepreneur Pitch', date: '9/24/2025', time: '6:30 PM - 9:00 PM', location: 'StartGarden', attendees: '80 attending', image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=300&fit=crop' },
    { id: 3, title: 'Athena Leadership Workshop', date: '9/27/2025', time: '9:00 AM - 5:00 PM', location: 'Grand Rapids Art Museum', attendees: '150 attending', image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400&h=300&fit=crop' }
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

            {/* Stats Toggle Button */}
<div className="mb-6">
  <button
    onClick={() => setShowStats(!showStats)}
    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
  >
    {showStats ? '▼' : '▶'} My Activity
  </button>
</div>

{/* Collapsible Stats Grid */}
{showStats && (
  <div className="grid grid-cols-2 gap-4 mb-6">
    {stats.map((stat, index) => (
      <div key={index} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <stat.icon className={`w-4 h-4 ${stat.color}`} />
          <span className="text-xl font-bold text-gray-900">{stat.value}</span>
        </div>
        <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
        <p className="text-xs text-green-600 font-medium">{stat.change}</p>
      </div>
    ))}
  </div>
)}

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">Featured Content</h3>
                  <p className="text-sm text-gray-600">Curated content to help you grow professionally</p>
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
              <div className="flex gap-4">
                <img
                  src={featuredContent[featuredContentIndex].image}
                  alt={featuredContent[featuredContentIndex].title}
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2">{featuredContent[featuredContentIndex].title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{featuredContent[featuredContentIndex].description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{featuredContent[featuredContentIndex].type} • {featuredContent[featuredContentIndex].duration}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">Sponsored by</span>
                      <span className="text-xs font-medium text-gray-700">{featuredContent[featuredContentIndex].sponsor.name}</span>
                    </div>
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
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex items-center gap-4">
                    <img
                      src={person.image}
                      alt={person.name}
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-base">{person.name}</h4>
                      <p className="text-sm text-gray-600 truncate">{person.title}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-red-500">❤️ {person.match}</span>
                        <span className="text-xs text-blue-500">👥 {person.mutuals}</span>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0">
                      <User className="w-6 h-6 text-gray-600" />
                    </button>
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
              <div className="grid grid-cols-3 gap-3">
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
                          <span className="inline-block bg-black text-white text-xs px-2 py-1 rounded mb-1">In-Person</span>
                          <h4 className="font-bold text-gray-900 text-sm">{event.title}</h4>
                        </div>
                      </div>
                      <div className="space-y-0.5 text-xs text-gray-600 mb-2">
                        <p>📅 {event.date}</p>
                        <p>🕐 {event.time}</p>
                        <p>📍 {event.location}</p>
                        <p>👥 {event.attendees}</p>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => navigate(`/events/${event.id}`)}
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