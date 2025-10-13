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
import Account from './Account';
import TermsPage from './TermsPage';
import PrivacyPage from './PrivacyPage';
import ArchivePage from './ArchivePage';
function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
const [selectedPlan, setSelectedPlan] = useState(null);
const [featuredContentIndex, setFeaturedContentIndex] = useState(0);
const [showSponsorModal, setShowSponsorModal] = useState(false);
const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);

// Check if user should see feedback prompt (after 24 hours of usage)
useEffect(() => {
  const firstLoginDate = localStorage.getItem('firstLoginDate');
  const feedbackPromptShown = localStorage.getItem('feedbackPromptShown');

  if (!firstLoginDate) {
    // Set first login date if not already set
    localStorage.setItem('firstLoginDate', new Date().toISOString());
  } else if (!feedbackPromptShown) {
    // Check if 24 hours have passed
    const hoursSinceFirstLogin = Math.floor((new Date() - new Date(firstLoginDate)) / (1000 * 60 * 60));
    if (hoursSinceFirstLogin >= 24) {
      setShowFeedbackPrompt(true);
      localStorage.setItem('feedbackPromptShown', 'true');
    }
  }
}, []);

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

  // Load admin-created featured content from localStorage
  const adminContent1 = localStorage.getItem('featuredContent1');
  const adminFeaturedContent1 = adminContent1 ? JSON.parse(adminContent1) : null;

  const adminContent2 = localStorage.getItem('featuredContent2');
  const adminFeaturedContent2 = adminContent2 ? JSON.parse(adminContent2) : null;

  const adminContent3 = localStorage.getItem('featuredContent3');
  const adminFeaturedContent3 = adminContent3 ? JSON.parse(adminContent3) : null;

  const defaultFeaturedContent = [
    {
      image: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts125/v4/64/64/19/646419d8-0249-3aa6-22e1-cf481814a28d/mza_16901703840593164642.png/540x540bb.webp',
      title: 'Networking For People Who Hate Networking',
      description: 'Listen to this episode from Worklife with Adam Grant on Spotify. Ditch your business cards. There are more effective, less awkward strategies for building your connections. This episode is made possible with the support of Bonobos, Accenture, Hilton, and JPMorgan Chase & Co.',
      url: 'https://open.spotify.com/episode/4RiIYoe4tBKgzPoN2IZezV?si=lwRhg5HVTh-7LmDu4JUWKg&dl_branch=1&nd=1&dlsi=4f0333bb1555420b',
      tags: 'Networking, Professional Development',
      sponsoredBy: ''
    },
    {
      image: 'https://m.media-amazon.com/images/I/411o1ZnXQsL._SY445_SX342_ControlCacheEqualizer_.jpg',
      title: 'Superconnector: Stop Networking And Start Building Relationships',
      description: 'By Scott Gerber and Ryan Paugh. Learn how to build, manage, and maximize the value of a professional community. Discover the secrets to creating meaningful relationships that drive business success.',
      url: 'https://superconnectorbook.com/',
      tags: 'Networking, Relationship Building',
      sponsoredBy: ''
    },
    {
      image: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/aa/8e/72/aa8e72f7-643a-f98e-f929-3586a8c3ef62/mza_10593625707581288470.jpg/540x540bb.webp',
      title: 'How to Build Systems to Actually Achieve Your Goals',
      description: "Are your goals holding you back? In this episode, I'll show you why focusing on big, long-term results can actually demotivate you—and how shifting to daily, actionable systems can help you achieve real progress.",
      url: 'https://podcasts.apple.com/us/podcast/how-to-build-systems-to-actually-achieve-your-goals/id1033048640?i=1000728624111',
      tags: 'Goal Setting, Personal Growth',
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

  // Featured events - Real Grand Rapids networking events
  const events = [
    { id: 1, title: 'Salim Ismail – Founder, OpenExO and Author', date: '10/20/2025', time: '11:30 AM - 1:30 PM', location: 'JW Marriott Grand Rapids', organizerName: 'The Economic Club of Grand Rapids', fullAddress: 'International Ballroom, JW Marriott, Grand Rapids, MI', image: 'https://econclub.net/wp-content/uploads/2025/06/Salim-Ismail-cropped.jpg', badge: 'In-Person' },
    { id: 2, title: 'OutPro Forum', date: '10/22/2025', time: '11:00 AM - 1:00 PM', location: 'Grand Rapids Chamber', organizerName: 'Grand Rapids Chamber', fullAddress: '250 Monroe Ave, Grand Rapids, MI 49503', image: 'https://grandrapids.org/wp-content/uploads/2025/01/Graphic-OutPro-10.22.25-1-1024x576.jpg', badge: 'In-Person' },
    { id: 3, title: '17th Annual Jay & Betty Van Andel Legacy Awards Gala', date: '11/12/2025', time: 'Evening Event', location: 'JW Marriott Grand Rapids', organizerName: 'Grand Rapids Public Museum', fullAddress: 'JW Marriott Grand Rapids, MI', image: 'https://i0.wp.com/www.grpm.org/wp-content/uploads/2025/06/2025_Gala_Web-Header_Option-05.png', badge: 'In-Person' },
    { id: 4, title: 'Sponsored Event', date: 'Coming Soon', time: 'TBA', location: 'Your Event Here', organizerName: 'Your Organization', fullAddress: 'Grand Rapids, MI', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop', badge: 'Sponsored', isSponsored: true }
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
          <div className="space-y-4">
            <div className="relative h-32 rounded-lg overflow-hidden shadow-lg">
              <img
                src="/Tech-Week-rooftop.jpg"
                alt="Networking Event at Sunset"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight">Discover. Connect. Grow.</h2>
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900">{getGreeting()}, {userFirstName}!</h1>
              <p className="text-sm text-gray-600">Here's what's happening in your professional network today.</p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">Featured Content</h3>
                  <p className="text-xs text-gray-600">Curated content to help you grow</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFeaturedContentIndex((featuredContentIndex - 1 + featuredContent.length) % featuredContent.length)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-gray-600">{featuredContentIndex + 1} of {featuredContent.length}</span>
                  <button
                    onClick={() => setFeaturedContentIndex((featuredContentIndex + 1) % featuredContent.length)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div
                onClick={() => {
                  if (featuredContent[featuredContentIndex].url) {
                    window.open(featuredContent[featuredContentIndex].url, '_blank');
                  }
                }}
                className="flex gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors -m-2 cursor-pointer"
              >
                <img
                  src={featuredContent[featuredContentIndex].image}
                  alt={featuredContent[featuredContentIndex].title}
                  className="w-20 h-20 rounded-lg object-contain flex-shrink-0 bg-white"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 mb-1 text-sm">{featuredContent[featuredContentIndex].title}</h4>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{featuredContent[featuredContentIndex].description}</p>
                  <div className="flex items-center justify-between">
                    {featuredContent[featuredContentIndex].tags && (
                      <div className="flex gap-1">
                        {featuredContent[featuredContentIndex].tags.split(',').slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
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

            <div className="relative group">
              <div className="mb-3">
                <h3 className="font-bold text-gray-900 text-sm md:text-base">Check Out Your Potential Connections</h3>
                <p className="text-xs text-gray-600">People you might want to connect with</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <button className="px-3 py-1.5 bg-[#009900] border-2 border-[#D0ED00] text-white text-xs rounded hover:bg-[#007700] flex-shrink-0 font-medium">
                        Connect
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Connections Button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setActiveTab('connections')}
                  className="px-4 py-2 bg-[#009900] text-white rounded-lg font-medium hover:bg-[#007700] transition-colors flex items-center gap-2 border-[3px] border-[#D0ED00] text-sm"
                >
                  View All Connections
                  <img src="/BudE-favicon.png" alt="BudE" className="w-4 h-4" />
                </button>
              </div>

              {/* Beta Testing Hover Message */}
              <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none z-10">
                <div className="bg-gradient-to-r from-green-100 to-lime-50 rounded-2xl p-4 md:p-6 max-w-2xl mx-4 flex flex-col md:flex-row items-center gap-3 md:gap-4 shadow-2xl border-4 border-[#D0ED00]">
                  <img
                    src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/main/public/scientist-chalkboard.jpg"
                    alt="Scientist at work"
                    className="h-16 md:h-24 w-auto flex-shrink-0 rounded-lg object-cover"
                  />
                  <p className="text-green-800 font-medium text-sm md:text-base text-center md:text-left">
                    Our scientists are hard at work finding connections for you. Look for an email from us soon!
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 text-sm md:text-base">See What Events Are Coming Up</h3>
                <p className="text-xs md:text-sm text-gray-600">Networking events happening near you</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((event, index) => (
                  <div
                    key={index}
                    onClick={() => event.isSponsored ? setShowSponsorModal(true) : navigate(`/events/${event.id}`)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-200"
                  >
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
                          onClick={(e) => {
                            e.stopPropagation();
                            event.isSponsored ? setShowSponsorModal(true) : navigate(`/events/${event.id}`);
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

              {/* View All Events Button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setActiveTab('events')}
                  className="px-4 py-2 bg-[#009900] text-white rounded-lg font-medium hover:bg-[#007700] transition-colors flex items-center gap-2 border-[3px] border-[#D0ED00] text-sm"
                >
                  View All Events
                  <img src="/BudE-favicon.png" alt="BudE" className="w-4 h-4" />
                </button>
              </div>
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
        );
      
  case 'events':
  return <Events />;

 case 'connections':
  return <Connections />;

  case 'messages':
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
  return <Account />;

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
    <div className="bg-gradient-to-r from-green-600 via-lime-400 to-yellow-400 text-white px-4 py-1 text-center text-sm md:text-base">
      <span className="font-medium">
        Beta Testing - All Features Unlocked
      </span>
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
    </div>
    <div className="md:flex">

    <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          <main className="flex-1 w-full overflow-x-hidden">
          <div className="md:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
            <div className="flex items-center justify-center">
              <img
                src="/BudE-Logo-Final.png"
                alt="BudE Logo"
                className="h-16 w-auto"
              />
            </div>
          </div>

          <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
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

      {/* Sponsored Event Modal */}
      {showSponsorModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSponsorModal(false)}>
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowSponsorModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-lime-500 rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sponsored Event Opportunity</h3>
              <p className="text-gray-600 mb-6">
                For sponsored event or advertising inquiries, please email Jeff Hill at{' '}
                <a href="mailto:grjeff@gmail.com" className="text-[#009900] font-semibold hover:underline">
                  grjeff@gmail.com
                </a>
              </p>
              <button
                onClick={() => setShowSponsorModal(false)}
                className="w-full bg-[#009900] text-white py-3 rounded-lg font-medium hover:bg-[#007700] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Beta Feedback Prompt Modal */}
      {showFeedbackPrompt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowFeedbackPrompt(false)}>
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative border-4 border-[#D0ED00]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowFeedbackPrompt(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-lime-500 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">How's your BudE experience so far?</h3>
              <p className="text-gray-600 mb-6">
                We'd love to hear your thoughts! Your feedback helps us make BudE better for everyone.
                It only takes a few minutes.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowFeedbackPrompt(false);
                    setActiveTab('settings');
                    // Scroll to settings after a brief delay
                    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                  }}
                  className="w-full bg-[#009900] text-white py-3 rounded-lg font-medium hover:bg-[#007700] transition-colors border-[3px] border-[#D0ED00]"
                >
                  Give Feedback
                </button>
                <button
                  onClick={() => setShowFeedbackPrompt(false)}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



export default Dashboard;