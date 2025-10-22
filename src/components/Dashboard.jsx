import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Heart, MessageCircle, User, ChevronLeft, ChevronRight, Users, ExternalLink } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import Events from './Events';
import Connections from './Connections';
import Messages from './Messages';
import Settings from './Settings';
import Subscription from './Subscription';
import Account from './Account';
import TermsPage from './TermsPage';
import PrivacyPage from './PrivacyPage';
import ArchivePage from './ArchivePage';
import FeedbackWidget from './FeedbackWidget';
function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'dashboard');
const [selectedPlan, setSelectedPlan] = useState(null);
const [featuredContentIndex, setFeaturedContentIndex] = useState(0);
const [showSponsorModal, setShowSponsorModal] = useState(false);
const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
const [showAdInquiryModal, setShowAdInquiryModal] = useState(false);
const [adInquirySubmitted, setAdInquirySubmitted] = useState(false);
const [phoneNumber, setPhoneNumber] = useState('');
const [isSubmittingAd, setIsSubmittingAd] = useState(false);
const [showScientistModal, setShowScientistModal] = useState(false);
const [showFeedbackModal, setShowFeedbackModal] = useState(false);
const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
const [showContactModal, setShowContactModal] = useState(false);
const [contactSubmitted, setContactSubmitted] = useState(false);
const [isSubmittingContact, setIsSubmittingContact] = useState(false);
const [contactData, setContactData] = useState({
  name: '',
  email: '',
  message: ''
});
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

// Format phone number as user types: (XXX) XXX-XXXX
const formatPhoneNumber = (value) => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (match) {
    const parts = [];
    if (match[1]) parts.push('(', match[1]);
    if (match[2]) parts.push(') ', match[2]);
    if (match[3]) parts.push('-', match[3]);
    return parts.join('');
  }
  return value;
};

// Handle feedback form submission
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to submit feedback');
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

    // Check if we're on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      alert('API endpoints are not available on localhost. Please test feedback submission on the Vercel deployment at your live URL.\n\nFor local testing, the form validation and UI work correctly - only the actual Google Sheets submission requires the production environment.');
    } else {
      alert('There was an error submitting your feedback. Please try again or contact support if the problem persists.');
    }
  }
};

// Handle contact form submission
const handleSubmitContact = async (e) => {
  e.preventDefault();
  setIsSubmittingContact(true);

  try {
    const response = await fetch('/api/submitContact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...contactData,
        submittedAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to submit contact form');
    }

    // Show success message in modal
    setContactSubmitted(true);

    // Reset form after 3 seconds and close modal
    setTimeout(() => {
      setContactSubmitted(false);
      setShowContactModal(false);
      setContactData({
        name: '',
        email: '',
        message: ''
      });
    }, 3000);
  } catch (error) {
    console.error('Error submitting contact form:', error);

    // Check if we're on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      alert('API endpoints are not available on localhost. Please test on the Vercel deployment.\n\nFor now, please email grjeff@gmail.com directly.');
    } else {
      alert('There was an error submitting your message. Please email grjeff@gmail.com directly.');
    }
  } finally {
    setIsSubmittingContact(false);
  }
};

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

// Prevent scroll restoration and bounce-to-top on mobile
useEffect(() => {
  // Disable automatic scroll restoration
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  // Scroll to top only on first mount
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
      image: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/52/2c/26/522c2689-01a0-f2c4-37b9-20034b428603/mza_15419489958704245485.jpg/540x540bb.webp',
      title: 'The Not Perfect Networking Podcast',
      description: 'Networking doesn\'t have to be perfect to be powerful. Join us for real conversations about building genuine connections in business and life. Perfect for professionals who want to network authentically.',
      url: 'https://podcasts.apple.com/us/podcast/the-not-perfect-networking-podcast/id1802926391',
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
    { id: 1, title: 'Bamboo Grand Rapids: Grand Opening Celebration', date: '12/4/2025', time: '4:00 PM - 8:00 PM', location: '2 Fulton Street West', organizerName: 'Bamboo Detroit', fullAddress: '2 Fulton Street West, Grand Rapids, MI 49503', image: 'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1120287333%2F84709515697%2F1%2Foriginal.20250910-174858?crop=focalpoint&fit=crop&w=940&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.208333333333&fp-y=0.621848739496&s=9f37de221b0249dee8dd7ee347395056', badge: 'In-Person', tags: ['Entrepreneurship', 'Innovation', 'Startup'] },
    { id: 2, title: 'Leadership Lesson Breakfast', date: '10/28/2025', time: '7:30 AM - 9:00 AM', location: 'Grand Rapids Chamber', organizerName: 'Grand Rapids Chamber', fullAddress: '250 Monroe Ave, Grand Rapids, MI 49503', image: 'https://grandrapids.org/wp-content/uploads/2025/01/GRC_LLB-October-e1737397882767.jpg', badge: 'In-Person' },
    { id: 3, title: '17th Annual Jay & Betty Van Andel Legacy Awards Gala', date: '11/12/2025', time: 'Evening Event', location: 'JW Marriott Grand Rapids', organizerName: 'Grand Rapids Public Museum', fullAddress: 'JW Marriott Grand Rapids, MI', image: 'https://i0.wp.com/www.grpm.org/wp-content/uploads/2025/06/2025_Gala_Web-Header_Option-05.png', badge: 'In-Person' },
    { id: 4, title: 'Place Matters Summit 2025', date: '11/6/2025', time: '12:00 PM - 5:00 PM', location: 'The Rockford Corner Bar', organizerName: 'The Right Place', fullAddress: 'The Rockford Corner Bar, Rockford, MI', image: 'https://web.cvent.com/event_guestside_app/_next/image?url=https%3A%2F%2Fimages.cvent.com%2Fc49e750ef94b4a73879b4e57ae9c1393%2Fa261375d7d47fd2cd2c68c3a86dd821f%2Fd978795e378242b5af5233c775c250e4%2Ff65bb8e0f27745f5bcf821b889bc6407!_!eb5aa18403450c956b23c2a0b455af07.jpeg&w=3840&q=75', badge: 'In-Person' }
  ];

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'connections', icon: Heart, label: 'Connections' },
    { id: 'messages', icon: MessageCircle, label: 'Messages' },
    { id: 'settings', icon: User, label: 'Profile' }
  ];

  const renderContent = () => {

  console.log('Current activeTab:', activeTab);
  
    switch(activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-4">
            <div className="relative h-48 rounded-lg overflow-hidden shadow-lg bg-gradient-to-r from-green-600 to-lime-400">
              <img
                src="/Tech-Week-rooftop.jpg"
                alt="Networking Event at Sunset"
                className="w-full h-full object-cover"
                loading="eager"
                fetchpriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">Discover. Connect. Grow.</h2>
              </div>
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900">{getGreeting()}, {userFirstName}!</h1>
            </div>

            {/* Events and Connections Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Events - Left Side */}
              <div className="flex flex-col">
                <div className="mb-4 text-center">
                  <div className="inline-block bg-white px-4 py-2 rounded-lg border-2 border-black mb-2">
                    <h3 className="font-bold text-black text-lg">Upcoming Events</h3>
                  </div>
                  <p className="text-sm text-gray-600">Networking events happening near you</p>
                </div>
                <div className="space-y-4 flex-grow">
                  {events.slice(0, 3).map((event, index) => (
                  <div
                    key={index}
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-200 flex min-h-[136px]"
                  >
                    {event.image && (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-32 h-32 object-cover flex-shrink-0"
                      />
                    )}
                    <div className="p-3 flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <span className="inline-block bg-black text-white text-xs px-2 py-0.5 rounded mb-1">{event.badge || 'In-Person'}</span>
                          <h4 className="font-bold text-gray-900 text-sm line-clamp-2">{event.title}</h4>
                        </div>
                      </div>
                      <div className="space-y-0.5 text-xs text-gray-600">
                        <p className="font-semibold text-gray-700 truncate">{event.organizerName || 'Event Organizer'}</p>
                        <p>{event.date} • {event.time}</p>
                        <p className="truncate">{event.fullAddress || event.location}</p>
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

              {/* Potential Connections - Right Side */}
              <div className="flex flex-col relative group">
                <div className="mb-4 text-center">
                  <div className="inline-block bg-white px-4 py-2 rounded-lg border-2 border-black mb-2">
                    <h3 className="font-bold text-black text-lg">Potential Connections</h3>
                  </div>
                  <p className="text-sm text-gray-600">People you might want to connect with first</p>
                </div>
                <div className="space-y-4 flex-grow">
                  {connections.map((person, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 min-h-[136px]">
                      <div className="flex gap-3 md:gap-4">
                        <img
                          src={person.image}
                          alt={person.name}
                          className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-base md:text-lg">{person.name}</h4>
                          <p className="text-xs md:text-sm text-gray-600 mb-2">{person.title}</p>
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm flex-wrap">
                              <span className="font-medium whitespace-nowrap">{person.similarity} compatible</span>
                              <span className="text-blue-600 whitespace-nowrap">👥 {person.mutuals}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowScientistModal(true);
                              }}
                              className="px-3 md:px-4 py-1.5 md:py-2 bg-[#009900] border-2 border-[#D0ED00] text-white text-xs md:text-sm rounded-lg hover:bg-[#007700] font-medium flex-shrink-0 w-full md:w-auto"
                            >
                              Connect
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All Connections Button */}
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => {
                      setActiveTab('connections');
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }}
                    className="px-4 py-2 bg-[#009900] text-white rounded-lg font-medium hover:bg-[#007700] transition-colors flex items-center gap-2 border-[3px] border-[#D0ED00] text-sm"
                  >
                    View All Connections
                    <img src="/BudE-favicon.png" alt="BudE" className="w-4 h-4" />
                  </button>
                </div>

                {/* Beta Testing Overlay for Connections - Fades in on hover */}
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="bg-gradient-to-r from-green-100 to-lime-50 rounded-2xl p-6 md:p-8 mx-4 text-center shadow-2xl border-4 border-[#D0ED00] max-w-sm">
                    <img
                      src="/BudE-favicon.png"
                      alt="BudE"
                      className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-4 object-contain"
                    />
                    <p className="text-green-800 font-bold text-lg md:text-xl mb-2">
                      Beta Version
                    </p>
                    <p className="text-green-700 font-medium text-sm md:text-base">
                      You'll get an email from us with suggested connections soon!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Content - Below Events and Connections */}
            <div>
              <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-200">
                <div className="mb-1 text-center">
                  <div className="inline-block bg-white px-4 py-2 rounded-lg border-2 border-black">
                    <h3 className="font-bold text-black text-lg">Featured Content</h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Curated content to help you grow</p>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFeaturedContentIndex((featuredContentIndex - 1 + featuredContent.length) % featuredContent.length)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-600 font-medium">{featuredContentIndex + 1} of {featuredContent.length}</span>
                  <button
                    onClick={() => setFeaturedContentIndex((featuredContentIndex + 1) % featuredContent.length)}
                    className="p-2 hover:bg-gray-100 rounded"
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
                className="flex flex-col md:flex-row gap-4 md:gap-6 hover:bg-gray-50 p-3 md:p-4 rounded-lg transition-colors -m-3 md:-m-4 cursor-pointer"
              >
                <img
                  src={featuredContent[featuredContentIndex].image}
                  alt={featuredContent[featuredContentIndex].title}
                  className="w-full md:w-48 h-48 md:h-48 rounded-lg object-cover flex-shrink-0 bg-white shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 mb-2 md:mb-3 text-base md:text-lg">{featuredContent[featuredContentIndex].title}</h4>
                  <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 line-clamp-4">{featuredContent[featuredContentIndex].description}</p>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    {featuredContent[featuredContentIndex].tags && (
                      <div className="flex gap-2 flex-wrap">
                        {featuredContent[featuredContentIndex].tags.split(',').slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 md:px-3 py-1 rounded">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    {featuredContent[featuredContentIndex].sponsoredBy && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Sponsored by</span>
                        <span className="text-xs md:text-sm font-medium text-gray-700">{featuredContent[featuredContentIndex].sponsoredBy}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Bottom Banner Ad */}
            <div className="mt-8">
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
                      className="w-full rounded-lg shadow-sm hover:shadow-md transition-shadow object-cover"
                      style={{ maxHeight: '180px' }}
                    />
                  </a>
                ) : (
                  <div
                    onClick={() => setShowAdInquiryModal(true)}
                    className="rounded-lg p-8 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#D0ED00] transition-all cursor-pointer hover:shadow-md relative overflow-hidden"
                    style={{ height: '180px' }}
                  >
                    <div
                      className="absolute inset-0 bg-cover opacity-30"
                      style={{
                        backgroundImage: 'url(https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/My-phone-blurry-tall-2.jpg)',
                        backgroundPosition: 'center 90%',
                        filter: 'blur(12px)',
                        transform: 'scale(1.1)'
                      }}
                    />
                    <div className="text-center relative z-10">
                      <p className="text-gray-700 font-bold text-base">Banner Ad Spot: Click to Inquire</p>
                      <p className="text-gray-600 text-sm mt-1">Recommended: 1200×180px</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Beta Feedback Form Button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setShowFeedbackPrompt(true)}
                className="px-6 py-3 bg-[#009900] text-white rounded-lg font-bold hover:bg-[#007700] transition-colors border-[3px] border-[#D0ED00] flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Beta Feedback Form
              </button>
            </div>
          </div>
        );

  case 'events':
  return <Events onBackToDashboard={() => {
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }} />;

 case 'connections':
  return <Connections onBackToDashboard={() => {
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }} />;

  case 'messages':
  return <Messages onBackToDashboard={() => {
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }} />;

  case 'settings':
  return <Settings autoOpenFeedback={showFeedbackPrompt} onFeedbackClose={() => setShowFeedbackPrompt(false)} onBackToDashboard={() => {
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }} />;

  case 'subscription':
  return <Subscription onSelectPlan={(planId, isYearly) => {
    setSelectedPlan({ planId, isYearly });
      setActiveTab('payment');
  }} />;

  case 'payment':
  return <Account onBackToDashboard={() => {
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }} />;

  case 'terms':
  return <TermsPage />;

  case 'privacy':
  return <PrivacyPage />;

  case 'archive':
  return <ArchivePage onBackToDashboard={() => {
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }} />;

default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Content for {activeTab} coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-50 pb-32 md:pb-0" style={{ minHeight: '100dvh', WebkitOverflowScrolling: 'touch' }}>
    <div className="bg-gradient-to-r from-[#009900] to-[#D0ED00] text-white px-4 py-1 text-center text-sm md:text-base">
      <span className="font-medium">
        Beta Testing • All Features Unlocked • <button
        onClick={() => {
          localStorage.removeItem('onboardingCompleted');
          window.location.href = '/';
        }}
        className="underline hover:no-underline font-medium"
      >
        Reset to Onboarding
      </button>
      </span>
    </div>
    <div className="md:flex">

    <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onContactUsClick={() => setShowContactModal(true)} />

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

      {/* Ad Inquiry Modal */}
      {showAdInquiryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !adInquirySubmitted && setShowAdInquiryModal(false)}>
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-4 relative border-4 border-[#D0ED00]" onClick={(e) => e.stopPropagation()}>
            {adInquirySubmitted ? (
              // Success Message
              <div className="text-center py-12">
                <div className="mb-6">
                  <svg className="w-20 h-20 mx-auto text-[#009900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
                <p className="text-lg text-gray-600 mb-2">Your inquiry has been submitted successfully.</p>
                <p className="text-gray-500">We'll be in touch soon!</p>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowAdInquiryModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
                <div>
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-lime-500 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Advertise with BudE</h3>
                  <p className="text-gray-600 text-sm mb-4 text-center">
                    Interested in advertising? Fill out this quick form and we'll get back to you soon!
                  </p>
                  <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmittingAd(true);
                  const formData = new FormData(e.target);

                  try {
                    console.log('📤 Submitting ad inquiry...');
                    const payload = {
                      name: formData.get('name'),
                      email: formData.get('email'),
                      company: formData.get('company'),
                      phone: phoneNumber,
                      adType: formData.get('adType'),
                      message: formData.get('message')
                    };
                    console.log('Payload:', payload);

                    const response = await fetch('/api/submitAdInquiry', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(payload)
                    });

                    console.log('Response status:', response.status);

                    if (!response.ok) {
                      const errorData = await response.json().catch(() => ({ message: 'Unknown server error' }));
                      console.error('❌ Server error response:', errorData);
                      alert(`Server Error: ${errorData.message || 'Failed to submit inquiry'}\n\nPlease email grjeff@gmail.com directly.`);
                      return;
                    }

                    const result = await response.json();
                    console.log('✅ Success:', result);

                    // Show success message in modal
                    setAdInquirySubmitted(true);
                    e.target.reset();
                    setPhoneNumber('');

                    // Close modal after 3 seconds
                    setTimeout(() => {
                      setAdInquirySubmitted(false);
                      setShowAdInquiryModal(false);
                    }, 3000);
                  } catch (error) {
                    console.error('❌ Error submitting ad inquiry:', error);
                    alert(`Error: ${error.message}\n\nPlease email grjeff@gmail.com directly.`);
                  } finally {
                    setIsSubmittingAd(false);
                  }
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    name="company"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                    placeholder="(555) 123-4567"
                    maxLength="14"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ad Type of Interest</label>
                  <select
                    name="adType"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                  >
                    <option value="">Select one...</option>
                    <option value="Dashboard Banner">Dashboard Banner</option>
                    <option value="Events Page Sidebar">Events Page Sidebar</option>
                    <option value="Events Page Banner">Events Page Banner</option>
                    <option value="Event Detail Banner">Event Detail Banner</option>
                    <option value="Sponsored Event">Sponsored Event</option>
                    <option value="Sponsored Content">Sponsored Content</option>
                    <option value="Multiple Placements">Multiple Placements</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    name="message"
                    rows="2"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    placeholder="Tell us about your advertising goals..."
                  ></textarea>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingAd}
                    className="flex-1 bg-[#009900] text-white py-3 rounded-lg font-medium hover:bg-[#007700] transition-colors border-2 border-[#D0ED00] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmittingAd ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Submit Inquiry'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdInquiryModal(false)}
                    disabled={isSubmittingAd}
                    className="px-6 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
                </div>
              </>
            )}
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
                    // Close prompt and open feedback modal without changing page
                    setShowFeedbackPrompt(false);
                    setShowFeedbackModal(true);
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

      {/* Scientist Modal - Shown when clicking Connect */}
      {showScientistModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowScientistModal(false)}>
          <div className="bg-gradient-to-r from-green-100 to-lime-50 rounded-2xl p-6 md:p-8 max-w-xl w-full shadow-2xl border-4 border-[#D0ED00] relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowScientistModal(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-3xl font-bold leading-none"
            >
              ×
            </button>
            <div className="flex items-center justify-center gap-6 mb-6">
              <img
                src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/main/public/scientist-chalkboard.jpg"
                alt="Scientist at work"
                className="h-24 md:h-32 w-auto flex-shrink-0 rounded-lg object-cover shadow-lg"
              />
            </div>
            <p className="text-green-800 font-medium text-base md:text-lg text-center mb-6">
              Our scientists are hard at work finding connections for you. Look for an email from us during Beta testing!
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowScientistModal(false)}
                className="px-6 md:px-8 py-2 md:py-3 bg-[#009900] text-white rounded-lg font-bold hover:bg-[#007700] transition-colors border-2 border-[#D0ED00]"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Beta Feedback Form Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => !feedbackSubmitted && setShowFeedbackModal(false)}>
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {feedbackSubmitted ? (
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
                  <button onClick={() => setShowFeedbackModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-600 mb-4">Thank you for testing BudE! Your feedback is invaluable in helping us create the best networking platform.</p>
                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input type="text" required value={feedbackData.name} onChange={(e) => setFeedbackData({...feedbackData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input type="email" required value={feedbackData.email} onChange={(e) => setFeedbackData({...feedbackData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Onboarding & First Impressions</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">How smooth was the sign-up or login process?</label>
                        <textarea value={feedbackData.signUpSmoothness} onChange={(e) => setFeedbackData({...feedbackData, signUpSmoothness: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent text-sm" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">User Experience (UX)</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">How easy or intuitive is it to navigate the app?</label>
                        <textarea value={feedbackData.navigationEase} onChange={(e) => setFeedbackData({...feedbackData, navigationEase: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Any steps that felt confusing or frustrating?</label>
                        <textarea value={feedbackData.confusingSteps} onChange={(e) => setFeedbackData({...feedbackData, confusingSteps: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent text-sm" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Design & Branding</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Visual appeal of the app (colors, fonts, imagery)</label>
                        <textarea value={feedbackData.visualAppeal} onChange={(e) => setFeedbackData({...feedbackData, visualAppeal: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Does the brand feel clear, memorable, and consistent?</label>
                        <textarea value={feedbackData.brandClarity} onChange={(e) => setFeedbackData({...feedbackData, brandClarity: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent text-sm" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Performance & Speed</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loading times, responsiveness, lag</label>
                        <textarea value={feedbackData.performance} onChange={(e) => setFeedbackData({...feedbackData, performance: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Any crashes, bugs, or slowdowns?</label>
                        <textarea value={feedbackData.crashesOrBugs} onChange={(e) => setFeedbackData({...feedbackData, crashesOrBugs: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent text-sm" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Features & Functionality</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Which features were most useful or enjoyable?</label>
                        <textarea value={feedbackData.usefulFeatures} onChange={(e) => setFeedbackData({...feedbackData, usefulFeatures: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Anything missing or not working as expected?</label>
                        <textarea value={feedbackData.missingFeatures} onChange={(e) => setFeedbackData({...feedbackData, missingFeatures: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent text-sm" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Value Proposition & Relevance</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Did you understand the core purpose of the app right away?</label>
                        <textarea value={feedbackData.corePurposeUnderstood} onChange={(e) => setFeedbackData({...feedbackData, corePurposeUnderstood: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Does the app solve a real problem for you?</label>
                        <textarea value={feedbackData.solvesRealProblem} onChange={(e) => setFeedbackData({...feedbackData, solvesRealProblem: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Would you realistically use it or recommend it?</label>
                        <textarea value={feedbackData.wouldUseOrRecommend} onChange={(e) => setFeedbackData({...feedbackData, wouldUseOrRecommend: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Does the app give you a reason to come back?</label>
                        <textarea value={feedbackData.reasonToComeBack} onChange={(e) => setFeedbackData({...feedbackData, reasonToComeBack: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent text-sm" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Overall Rating</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Overall rating (1–10)</label>
                        <div className="flex flex-wrap gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                            <button key={rating} type="button" onClick={() => setFeedbackData({...feedbackData, overallRating: rating.toString()})} className={`w-12 h-12 rounded-lg font-bold text-lg transition-all ${feedbackData.overallRating === rating.toString() ? 'bg-[#009900] text-white border-2 border-[#D0ED00] shadow-md scale-105' : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-[#009900] hover:bg-gray-50'}`}>{rating}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Would you recommend this app to a friend or colleague? (1-10 scale)</label>
                        <div className="flex flex-wrap gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                            <button key={score} type="button" onClick={() => setFeedbackData({...feedbackData, netPromoterScore: score.toString()})} className={`w-12 h-12 rounded-lg font-bold text-lg transition-all ${feedbackData.netPromoterScore === score.toString() ? 'bg-[#009900] text-white border-2 border-[#D0ED00] shadow-md scale-105' : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-[#009900] hover:bg-gray-50'}`}>{score}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowFeedbackModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-3 bg-[#009900] text-white rounded-lg font-medium hover:bg-[#007700] transition-colors border-[3px] border-[#D0ED00]">Submit Feedback</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Contact Us Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !contactSubmitted && setShowContactModal(false)}>
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative border-4 border-[#D0ED00]" onClick={(e) => e.stopPropagation()}>
            {contactSubmitted ? (
              <div className="text-center py-12">
                <div className="mb-6">
                  <svg className="w-20 h-20 mx-auto text-[#009900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Message Sent!</h2>
                <p className="text-lg text-gray-600 mb-2">Thank you for contacting us.</p>
                <p className="text-gray-500">We'll get back to you soon!</p>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-lime-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Contact Us</h3>
                  <p className="text-gray-600">Have a question or feedback? We'd love to hear from you!</p>
                </div>
                <form onSubmit={handleSubmitContact} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      value={contactData.name}
                      onChange={(e) => setContactData({...contactData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={contactData.email}
                      onChange={(e) => setContactData({...contactData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                    <textarea
                      required
                      rows="5"
                      value={contactData.message}
                      onChange={(e) => setContactData({...contactData, message: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowContactModal(false)}
                      disabled={isSubmittingContact}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingContact}
                      className="flex-1 px-4 py-3 bg-[#009900] text-white rounded-lg font-medium hover:bg-[#007700] transition-colors border-[3px] border-[#D0ED00] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmittingContact ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Feedback Widget */}
      <FeedbackWidget
        onOpenFeedback={() => {
          // Open feedback prompt without changing active tab
          setShowFeedbackPrompt(true);
        }}
      />
    </div>
  );
}



export default Dashboard;