import React, { useState } from 'react';
import { Home, Calendar, Heart, MessageCircle, User, CreditCard, Archive, ChevronLeft, ChevronRight, Users } from 'lucide-react';
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
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
const [selectedPlan, setSelectedPlan] = useState(null);
const [showStats, setShowStats] = useState(false);
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

  const connections = [
    { name: 'Alex Chen', title: 'Senior Developer at Google', match: '95% match', mutuals: '3 mutual connections', image: '👨‍💼' },
    { name: 'Maria Rodriguez', title: 'Marketing Director at Spotify', match: '88% match', mutuals: '5 mutual connections', image: '👩‍💼' },
    { name: 'David Kim', title: 'Product Manager at Meta', match: '92% match', mutuals: '2 mutual connections', image: '👨‍💻' }
  ];

  const events = [
    { title: 'Creative Mornings Design Session', date: '9/19/2025', time: '8:00 AM - 10:00 AM', location: 'Bamboo Grand Rapids', attendees: '45 attending' },
    { title: 'StartGarden Entrepreneur Pitch', date: '9/24/2025', time: '6:30 PM - 9:00 PM', location: 'StartGarden', attendees: '80 attending' },
    { title: 'Athena Leadership Workshop', date: '9/27/2025', time: '9:00 AM - 5:00 PM', location: 'Grand Rapids Art Museum', attendees: '150 attending' }
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
              <h1 className="text-2xl font-bold text-gray-900">Good evening, there!</h1>
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
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-600">1 of 3</span>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-12 h-12 border-4 border-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2">Building Meaningful Professional Networks</h4>
                  <p className="text-sm text-gray-600 mb-3">Learn strategies for authentic networking that leads to lasting professional relationships.</p>
                  <p className="text-xs text-gray-500">Career Growth Podcast • 32 min</p>
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
                  <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                      {person.image}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900">{person.name}</h4>
                      <p className="text-sm text-gray-600 truncate">{person.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-red-500">❤️ {person.match}</span>
                        <span className="text-xs text-blue-500">👥 {person.mutuals}</span>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0">
                      <User className="w-5 h-5 text-gray-600" />
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
              <div className="grid grid-cols-3 gap-4">
                {events.map((event, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <span className="inline-block bg-black text-white text-xs px-2 py-1 rounded mb-2">In-Person</span>
                        <h4 className="font-bold text-gray-900">{event.title}</h4>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>📅 {event.date}</p>
                      <p>🕐 {event.time}</p>
                      <p>📍 {event.location}</p>
                      <p>👥 {event.attendees}</p>
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