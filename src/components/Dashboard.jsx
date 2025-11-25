import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Heart, MessageCircle, User, Users, ExternalLink, Menu, X as XIcon, BookOpen, CreditCard } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import Events from './Events';
import Connections from './Connections';
import Messages from './Messages';
import ResourcesInsights from './ResourcesInsights';
import Settings from './Settings';
import Account from './Account';
import TermsPage from './TermsPage';
import PrivacyPage from './PrivacyPage';
import ArchivePage from './ArchivePage';
import FeedbackWidget from './FeedbackWidget';
import NotificationBell from './NotificationBell.jsx';
import HeroBannerCarousel from './HeroBannerCarousel.jsx';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize activeTab from URL search params for persistence across refreshes
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || location.state?.activeTab || 'dashboard');
  const [connections, setConnections] = useState([]);

  // Update URL when activeTab changes to persist tab state across refreshes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentTab = params.get('tab');

    if (activeTab === 'dashboard') {
      // For dashboard, remove the tab param to keep URL clean
      params.delete('tab');
    } else {
      // For other tabs, set the tab param
      params.set('tab', activeTab);
    }

    const newSearch = params.toString();
    const newUrl = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;

    // Only update if the URL actually changed
    // Don't preserve location.state since URL params are now the source of truth
    if (currentTab !== (activeTab === 'dashboard' ? null : activeTab)) {
      navigate(newUrl, { replace: true });
    }
  }, [activeTab, navigate, location.pathname, location.search]);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [connectionLikedEvents, setConnectionLikedEvents] = useState({});
  const [connectionGoingEvents, setConnectionGoingEvents] = useState({});
  const [userFirstName, setUserFirstName] = useState('');
  const [selectedConnectionId, setSelectedConnectionId] = useState(null);
  const [selectedMessageUserId, setSelectedMessageUserId] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
const [loadedFeaturedContent, setLoadedFeaturedContent] = useState([null, null, null]);
const [showSponsorModal, setShowSponsorModal] = useState(false);
const [showSharePrompt, setShowSharePrompt] = useState(false);
const [linkCopied, setLinkCopied] = useState(false);
const [showAdInquiryModal, setShowAdInquiryModal] = useState(false);
const [adInquirySubmitted, setAdInquirySubmitted] = useState(false);
const [phoneNumber, setPhoneNumber] = useState('');
const [isSubmittingAd, setIsSubmittingAd] = useState(false);
const [showFeedbackModal, setShowFeedbackModal] = useState(false);
const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
const [showContactModal, setShowContactModal] = useState(false);
const [contactSubmitted, setContactSubmitted] = useState(false);
const [isSubmittingContact, setIsSubmittingContact] = useState(false);
const [showMobileMenu, setShowMobileMenu] = useState(false);
const [contactData, setContactData] = useState({
  name: '',
  email: '',
  message: ''
});
const [feedbackData, setFeedbackData] = useState({
  name: '',
  email: '',
  loveFeatures: '',
  improveFeatures: '',
  newFeatures: ''
});

// Bottom banner ads rotation state
const [availableBottomBannerAds, setAvailableBottomBannerAds] = useState([]);
const [currentBottomAdIndex, setCurrentBottomAdIndex] = useState(0);

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

    // Show success message
    setFeedbackSubmitted(true);

    // Reset form after 2 seconds and close modal
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
    }, 2000);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    alert('There was an error submitting your feedback. Please try again.');
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
    alert('There was an error submitting your message. Please email grjeff@gmail.com directly.');
  } finally {
    setIsSubmittingContact(false);
  }
};

// Load bottom banner ads from Supabase
useEffect(() => {
  const loadBottomBannerAds = async () => {
    try {
      const { data: banners, error } = await supabase
        .from('dashboard_bottom_banners')
        .select('*')
        .eq('is_active', true)
        .order('slot_number');

      if (error) {
        console.error('Error loading bottom banner ads:', error);
        return;
      }

      // Transform to expected format
      const availableAds = (banners || []).map(banner => ({
        image: banner.image_url,
        url: banner.click_url
      }));

      setAvailableBottomBannerAds(availableAds);

      // Set random initial index if we have ads
      if (availableAds.length > 0) {
        setCurrentBottomAdIndex(Math.floor(Math.random() * availableAds.length));
      }
    } catch (error) {
      console.error('Error loading bottom banner ads:', error);
    }
  };

  loadBottomBannerAds();

  // Reload ads when returning to dashboard tab
  if (activeTab === 'dashboard') {
    loadBottomBannerAds();
  }
}, [activeTab]);

// Rotate bottom banner ads every 8 seconds
useEffect(() => {
  if (availableBottomBannerAds.length <= 1) {
    return; // No need to rotate if 0 or 1 ads
  }

  const interval = setInterval(() => {
    setCurrentBottomAdIndex(prev => (prev + 1) % availableBottomBannerAds.length);
  }, 8000); // Rotate every 8 seconds

  return () => clearInterval(interval);
}, [availableBottomBannerAds.length]);

// Check if user should see share prompt based on engagement or time
useEffect(() => {
  const checkEngagement = () => {
    const hasSeenSharePrompt = localStorage.getItem('hasSeenSharePrompt');
    const lastSharePromptDate = localStorage.getItem('lastSharePromptDate');
    const engagementCount = parseInt(localStorage.getItem('userEngagementCount') || '0', 10);

    if (!hasSeenSharePrompt) {
      // First time: Show after 2 meaningful interactions
      if (engagementCount >= 2) {
        setShowSharePrompt(true);
        localStorage.setItem('hasSeenSharePrompt', 'true');
        localStorage.setItem('lastSharePromptDate', new Date().toISOString());
      }
    } else if (lastSharePromptDate) {
      // Returning users: Show every Tuesday (aligns with email cadence)
      const now = new Date();
      const lastShown = new Date(lastSharePromptDate);
      const daysSinceLastPrompt = Math.floor((now - lastShown) / (1000 * 60 * 60 * 24));
      const isTuesday = now.getDay() === 2; // 0 = Sunday, 2 = Tuesday

      // Get week number for comparison (simple week calculation)
      const getWeekNumber = (date) => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      };

      const currentWeek = getWeekNumber(now);
      const lastShownWeek = getWeekNumber(lastShown);

      // Show if it's Tuesday and we haven't shown it this week, OR if it's been 7+ days as fallback
      if ((isTuesday && currentWeek !== lastShownWeek) || daysSinceLastPrompt >= 7) {
        setShowSharePrompt(true);
        localStorage.setItem('lastSharePromptDate', new Date().toISOString());
      }
    }
  };

  // Check on mount
  checkEngagement();

  // Also check periodically (every 3 seconds) in case user navigates back to dashboard
  const interval = setInterval(checkEngagement, 3000);
  return () => clearInterval(interval);
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

// Load user's first name from Supabase
useEffect(() => {
  async function loadUserName() {
    if (!user) return;

    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('first_name')
        .eq('email', user.email)
        .single();

      if (error) {
        console.error('Error loading user name:', error);
        return;
      }

      if (userData && userData.first_name) {
        setUserFirstName(userData.first_name);
      }
    } catch (error) {
      console.error('Error loading user name:', error);
    }
  }

  loadUserName();
}, [user]);

// Get time-based greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

  // Load featured content from Supabase on mount
  useEffect(() => {
    const loadFeaturedContent = async () => {
      try {
        const { data, error } = await supabase
          .from('featured_content')
          .select('*')
          .order('slot_number', { ascending: true });

        if (error) {
          console.error('Error loading featured content:', error);
          return;
        }

        if (data && data.length > 0) {
          const contentArray = [null, null, null];

          data.forEach(item => {
            const index = item.slot_number - 1;
            if (index >= 0 && index < 3) {
              contentArray[index] = {
                image: item.image,
                title: item.title,
                description: item.description,
                url: item.url,
                tags: item.tags,
                sponsoredBy: item.sponsored_by,
                fullContent: item.full_content,
                author: item.author
              };
            }
          });

          setLoadedFeaturedContent(contentArray);
        }
      } catch (err) {
        console.error('Error in loadFeaturedContent:', err);
      }
    };

    loadFeaturedContent();
  }, []);

  const defaultFeaturedContent = [
    {
      image: 'https://travischappell.com/wp-content/uploads/2023/08/phone-img-podcast.png',
      title: 'How to Lose Everything and Come Back Even Stronger with Annette Raynor',
      description: 'Travis Chappell interviews Annette Raynor, who brings two decades of IT experience. Learn about resilience through economic downturns, building enterprises, and the lessons learned from overcoming significant financial setbacks.',
      url: 'https://travischappell.com/travis_podcast/047-how-to-lose-everything-and-come-back-even-stronger-with-annette-raynor/',
      tags: 'Resilience, Entrepreneurship',
      sponsoredBy: ''
    },
    {
      image: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/52/2c/26/522c2689-01a0-f2c4-37b9-20034b428603/mza_15419489958704245485.jpg/540x540bb.webp',
      title: 'The Not Perfect Networking Podcast',
      description: 'Networking doesn\'t have to be perfect to be powerful. Join us for real conversations about building genuine connections in business and life. Perfect for professionals who want to network authentically.',
      url: 'https://podcasts.apple.com/us/podcast/the-not-perfect-networking-podcast/id1802926391',
      tags: 'Networking, Professional Development',
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

  // Build featured content array: use database content where available, otherwise use defaults (only first 3 for dashboard)
  const featuredContent = loadedFeaturedContent.slice(0, 3).map((content, index) => {
    if (content && content.title) {
      return content;
    }
    return defaultFeaturedContent[index];
  });

  // Fetch real connections from database
  useEffect(() => {
    async function fetchConnections() {
      if (!user) {
        setLoadingConnections(false);
        return;
      }

      try {
        // Get user ID
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (userError) throw userError;

        // Fetch top 3 matches
        const { data: matchesData, error: matchesError } = await supabase
          .from('connection_flow')
          .select(`
            matched_user_id,
            compatibility_score,
            matched_user:users!connection_flow_matched_user_id_fkey (
              first_name,
              last_name,
              name,
              title,
              company,
              photo,
              professional_interests
            )
          `)
          .eq('user_id', userData.id)
          .eq('status', 'recommended')
          .order('compatibility_score', { ascending: false })
          .limit(3);

        if (matchesError) throw matchesError;

        // Transform to component format
        const transformedConnections = matchesData.map((match) => {
          const matchedUser = match.matched_user;
          const fullName = matchedUser.name || `${matchedUser.first_name} ${matchedUser.last_name}`;
          const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

          return {
            userId: match.matched_user_id,
            name: fullName,
            title: `${matchedUser.title || ''} at ${matchedUser.company || ''}`.trim(),
            similarity: `${match.compatibility_score}%`,
            professionalInterests: Array.isArray(matchedUser.professional_interests)
              ? matchedUser.professional_interests.join(', ')
              : matchedUser.professional_interests || '',
            photo: matchedUser.photo || null,
            initials: initials,
            isReal: true
          };
        });

        // Fetch liked events for all connections in bulk (optimized)
        const likedEventsMap = {};
        if (transformedConnections.length > 0) {
          try {
            const connectionIds = transformedConnections.map(c => c.userId);

            // Fetch all likes and clicks for all connections at once
            const [allLikesResult, allClicksResult] = await Promise.all([
              supabase
                .from('event_likes')
                .select('event_id, user_id, created_at')
                .in('user_id', connectionIds),
              supabase
                .from('event_registration_clicks')
                .select('event_id, user_id, created_at')
                .in('user_id', connectionIds)
            ]);

            // Group interactions by user
            const userInteractions = {};
            [...(allLikesResult.data || []), ...(allClicksResult.data || [])].forEach(interaction => {
              if (!userInteractions[interaction.user_id]) {
                userInteractions[interaction.user_id] = [];
              }
              userInteractions[interaction.user_id].push(interaction);
            });

            // Get unique event IDs for each user (max 3)
            const allEventIds = new Set();
            const userEventIdsMap = {};

            Object.keys(userInteractions).forEach(userId => {
              const sorted = userInteractions[userId].sort((a, b) =>
                new Date(b.created_at) - new Date(a.created_at)
              );
              const uniqueEventIds = [...new Set(sorted.map(i => i.event_id))].slice(0, 3);
              userEventIdsMap[userId] = uniqueEventIds;
              uniqueEventIds.forEach(id => allEventIds.add(id));
            });

            // Fetch all event details in one query
            if (allEventIds.size > 0) {
              const { data: eventsData } = await supabase
                .from('events')
                .select('id, title, image_url')
                .in('id', Array.from(allEventIds));

              const eventsMap = {};
              (eventsData || []).forEach(event => {
                eventsMap[event.id] = event;
              });

              // Map events to users
              Object.keys(userEventIdsMap).forEach(userId => {
                likedEventsMap[userId] = userEventIdsMap[userId]
                  .map(eventId => eventsMap[eventId])
                  .filter(Boolean);
              });
            }
          } catch (error) {
            console.error('Error loading liked events:', error);
          }
        }

        setConnectionLikedEvents(likedEventsMap);

        // Fetch "going" events for all connections in bulk
        const goingEventsMap = {};
        if (transformedConnections.length > 0) {
          try {
            const connectionIds = transformedConnections.map(c => c.userId);

            // Fetch all attendees for all connections at once
            const { data: attendeesData } = await supabase
              .from('event_attendees')
              .select(`
                event_id,
                user_id,
                created_at,
                events!event_attendees_event_id_fkey (
                  id,
                  title,
                  image_url,
                  date
                )
              `)
              .in('user_id', connectionIds)
              .eq('status', 'going');

            // Group events by user
            const userGoingEvents = {};
            (attendeesData || []).forEach(attendee => {
              if (!userGoingEvents[attendee.user_id]) {
                userGoingEvents[attendee.user_id] = [];
              }
              if (attendee.events) {
                userGoingEvents[attendee.user_id].push({
                  id: attendee.events.id,
                  title: attendee.events.title,
                  image_url: attendee.events.image_url,
                  date: attendee.events.date,
                  created_at: attendee.created_at
                });
              }
            });

            // Sort by created_at and limit to 2 upcoming events per user
            Object.keys(userGoingEvents).forEach(userId => {
              goingEventsMap[userId] = userGoingEvents[userId]
                .sort((a, b) => new Date(a.date) - new Date(b.date)) // Sort by event date
                .slice(0, 2); // Show max 2 upcoming events
            });
          } catch (error) {
            console.error('Error loading going events:', error);
          }
        }

        setConnectionGoingEvents(goingEventsMap);

        // Only set connections if we got data, otherwise keep empty array
        if (transformedConnections.length > 0) {
          setConnections(transformedConnections);
        } else {
          setConnections([]);
        }
        setLoadingConnections(false);
      } catch (error) {
        console.error('Error fetching connections:', error);
        setConnections([]);
        setLoadingConnections(false);
      }
    }

    fetchConnections();
  }, [user, activeTab]); // Refetch when returning to dashboard tab

  // Load events from Supabase
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('slot_number', { ascending: true });

        if (error) throw error;

        // Transform data to match the expected format
        const transformedEvents = data.map(event => ({
          id: event.id,
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.location_name,
          organizerName: event.organization === 'Other' ? event.organization_custom : event.organization,
          fullAddress: event.full_address,
          image: event.image_url,
          badge: event.event_badge,
          tags: event.tags ? event.tags.split(',').map(t => t.trim()) : [],
          description: event.short_description,
          fullDescription: event.full_description,
          organizerDescription: event.organizer_description,
          registrationUrl: event.registration_url,
          isFeatured: event.is_featured
        }));

        setEvents(transformedEvents);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, []);

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'connections', icon: Users, label: 'Connections' },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'resources', icon: BookOpen, label: 'Insights', isLink: true, href: '/resources-insights' },
    { id: 'messages', icon: MessageCircle, label: 'Messages' }
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-4">
            {/* Hero Banner Carousel - Rotating promotional banners */}
            <HeroBannerCarousel />

            {/* Desktop greeting - show below hero banner on desktop only */}
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-gray-900">{getGreeting()}{userFirstName ? `, ${userFirstName}` : ''}!</h1>
              <p className="text-sm text-gray-600 mt-1">Let's make some meaningful connections today</p>
            </div>

            {/* Events and Connections Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Potential Connections - Left Side */}
              <div className="flex flex-col relative group">
                <div className="mb-4 text-center">
                  <button
                    onClick={() => {
                      setActiveTab('connections');
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }}
                    className="inline-block bg-white px-4 py-2 rounded-lg border-2 border-black mb-2 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <h3 className="font-bold text-black text-lg">All Potential Connections →</h3>
                  </button>
                  <p className="text-sm text-gray-600">People you might want to connect with <span className="font-bold">first</span></p>
                </div>
                <div className="space-y-4 flex-grow">
                  {/* Show loading state, then real connections, then placeholders */}
                  {(loadingConnections || loadingEvents) ? (
                    // Loading skeleton
                    [0, 1, 2].map((index) => (
                      <div
                        key={`loading-${index}`}
                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 min-h-[136px] animate-pulse"
                      >
                        <div className="flex gap-3 md:gap-4">
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    [0, 1, 2].map((index) => {
                      const person = connections[index];
                      const isPlaceholder = !person;

                      if (isPlaceholder) {
                        // Blurred placeholder card
                      return (
                        <div
                          key={`placeholder-${index}`}
                          onClick={() => {
                            setActiveTab('settings');
                            window.scrollTo({ top: 0, behavior: 'instant' });
                          }}
                          className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 min-h-[136px] cursor-pointer hover:shadow-md hover:border-[#009900] transition-all relative overflow-hidden"
                        >
                          <div className="absolute inset-0 backdrop-blur-sm bg-white/60 flex items-center justify-center z-10">
                            <div className="text-center px-4">
                              <p className="font-bold text-gray-900 text-sm mb-1">Add To Your Profile</p>
                              <p className="text-xs text-gray-600">to find more connections</p>
                            </div>
                          </div>
                          <div className="flex gap-3 md:gap-4 filter blur-[3px]">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                              <div className="h-3 bg-gray-200 rounded w-1/2" />
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Real connection card
                    const likedEvents = connectionLikedEvents[person.userId] || [];
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          setSelectedConnectionId(person.userId);
                          setActiveTab('connections');
                          window.scrollTo({ top: 0, behavior: 'instant' });
                        }}
                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 min-h-[136px] cursor-pointer hover:shadow-md hover:border-[#009900] transition-all animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
                      >
                        <div className="flex gap-3 md:gap-4">
                          {/* Profile photo or initials */}
                          {person.photo ? (
                            <img
                              src={person.photo}
                              alt={person.name}
                              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover flex-shrink-0 border-4 border-black"
                            />
                          ) : (
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center flex-shrink-0 border-4 border-black">
                              <span className="text-[#009900] font-bold text-2xl md:text-3xl">
                                {person.initials}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-base md:text-lg">{person.name}</h4>
                            <p className="text-xs md:text-sm text-gray-600 mb-2">{person.title}</p>
                            <div className="flex items-center gap-2 text-xs flex-wrap mb-2">
                              <span className="font-medium whitespace-nowrap text-[#009900]">{person.similarity} compatible</span>
                              {person.professionalInterests && person.professionalInterests.split(',').slice(0, 2).map((interest, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                  {interest.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                    })
                  )}
                </div>
              </div>

              {/* Upcoming Events - Right Side */}
              <div className="flex flex-col">
                <div className="mb-4 text-center">
                  <button
                    onClick={() => setActiveTab('events')}
                    className="inline-block bg-white px-4 py-2 rounded-lg border-2 border-black mb-2 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <h3 className="font-bold text-black text-lg">All Upcoming Events →</h3>
                  </button>
                  <p className="text-sm text-gray-600">Then check out some events <span className="font-bold">together</span></p>
                </div>
                <div className="space-y-4 flex-grow">
                  {(loadingConnections || loadingEvents) ? (
                    // Loading skeleton
                    [0, 1, 2].map((index) => (
                      <div
                        key={`loading-event-${index}`}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex min-h-[136px] animate-pulse"
                      >
                        <div className="w-32 h-32 bg-gray-200 flex-shrink-0" />
                        <div className="p-3 flex-1 min-w-0">
                          <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                          <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                          <div className="h-3 bg-gray-200 rounded w-2/3" />
                        </div>
                      </div>
                    ))
                  ) : (
                    events.slice(0, 3).map((event, index) => (
                  <div
                    key={index}
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-200 flex min-h-[136px] animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
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
                ))
                  )}
              </div>
              </div>
            </div>

            {/* Featured Content - Below Events and Connections */}
            <div>
              <div className="bg-white rounded-lg p-4 md:p-5 shadow-sm border border-gray-200">
                <div className="mb-2 text-center">
                  <div className="inline-block bg-white px-4 py-2 rounded-lg border-2 border-black">
                    <h3 className="font-bold text-black text-lg">Insights</h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Curated content to help you grow</p>
                </div>

                {/* Featured Content - All 3 Cards */}
                <div className="space-y-4">
                  {featuredContent.map((content, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        // Track engagement when viewing featured content
                        const currentCount = parseInt(localStorage.getItem('userEngagementCount') || '0', 10);
                        localStorage.setItem('userEngagementCount', (currentCount + 1).toString());
                        navigate('/resources-insights');
                      }}
                      className="flex flex-col md:flex-row items-start gap-4 hover:bg-gray-50 p-2 md:p-3 rounded-lg transition-colors cursor-pointer"
                    >
                      {/* Thumbnail Image */}
                      <img
                        src={content.image}
                        alt={content.title}
                        className="w-32 h-32 md:w-36 md:h-36 rounded-lg object-cover flex-shrink-0 bg-white shadow-sm"
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 mb-2 text-lg leading-tight">{content.title}</h4>
                        {content.author && (
                          <p className="text-xs text-gray-500 italic mb-2">By {content.author}</p>
                        )}
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed">{content.description}</p>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          {content.tags && (
                            <div className="flex gap-2 flex-wrap">
                              {content.tags.split(',').slice(0, 2).map((tag, i) => (
                                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded">
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                          {content.sponsoredBy && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">Sponsored by</span>
                              <span className="text-xs font-medium text-gray-700">{content.sponsoredBy}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All Button */}
                <div className="mt-4 text-center">
                  <button
                    onClick={() => navigate('/resources-insights')}
                    className="w-full bg-[#D0ED00] text-[#009900] font-bold py-3 px-6 rounded-lg hover:bg-[#c4e000] transition-colors"
                  >
                    View All Insights
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Banner Ad - Rotating */}
            <div className="mt-6 mb-4">
              {availableBottomBannerAds.length === 0 ? (
                // No ads available - show inquiry prompt
                <div
                  onClick={() => setShowAdInquiryModal(true)}
                  className="rounded-lg p-8 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#D0ED00] transition-all cursor-pointer hover:shadow-md relative overflow-hidden"
                  style={{ height: '180px' }}
                >
                  <div
                    className="absolute inset-0 bg-cover opacity-30"
                    style={{
                      backgroundImage: 'url(My-phone-blurry-tall-2.jpg)',
                      backgroundPosition: 'center 90%'
                    }}
                  />
                  <div className="text-center relative z-10">
                  </div>
                </div>
              ) : (
                // Display current ad with rotation
                <a
                  href={availableBottomBannerAds[currentBottomAdIndex].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={availableBottomBannerAds[currentBottomAdIndex].image}
                    alt="Advertisement"
                    className="w-full rounded-lg shadow-sm hover:shadow-md transition-shadow object-cover"
                    style={{ maxHeight: '180px' }}
                  />
                </a>
              )}
            </div>

            {/* Feedback Form Button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="px-6 py-3 bg-[#009900] text-white rounded-lg font-bold hover:bg-[#007700] transition-colors border-2 border-[#D0ED00] flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Share Feedback
              </button>
            </div>

            {/* Copyright - Mobile only */}
            <div className="md:hidden text-center mt-4">
              <p className="text-xs text-gray-500">© 2025 The BudE System™</p>
            </div>
          </div>
        );

  case 'events':
  return <Events onBackToDashboard={() => {
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }} />;

 case 'connections':
  return <Connections
    selectedConnectionId={selectedConnectionId}
    onBackToDashboard={() => {
      setActiveTab('dashboard');
      setSelectedConnectionId(null);
      setSelectedMessageUserId(null);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }}
    onNavigateToSettings={() => {
      setActiveTab('settings');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }}
    onNavigateToMessages={(userId) => {
      setSelectedMessageUserId(userId);
      setActiveTab('messages');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }}
  />;

  case 'messages':
  return <Messages
    onBackToDashboard={() => {
      setActiveTab('dashboard');
      setSelectedMessageUserId(null);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }}
    autoSelectUserId={selectedMessageUserId}
  />;

  case 'resources':
  return <ResourcesInsights onBackToDashboard={() => {
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }} />;

  case 'settings':
  return <Settings onBackToDashboard={() => setActiveTab('dashboard')} />;

  case 'privacy':
  return <Settings initialTab="privacy" onBackToDashboard={() => setActiveTab('dashboard')} />;

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
    <div className="bg-gradient-to-r from-[#D0ED00] via-[#009900] to-[#D0ED00] text-white px-4 py-1 text-center text-sm md:text-base relative z-20">
      <span className="font-medium">
        Welcome to Networking BudE
      </span>
    </div>
    <div className="md:flex">

    <Sidebar
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onContactUsClick={() => setShowContactModal(true)}
      selectedConnectionId={selectedConnectionId}
      setSelectedConnectionId={setSelectedConnectionId}
    />

          <main className="flex-1 w-full overflow-x-hidden">
          {/* Mobile Header */}
          <div className="md:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-gray-600 hover:text-gray-900"
                aria-label="Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <img
                src="BudE-Color-Logo-Rev.png"
                alt="BudE Logo"
                className="h-16 w-auto"
              />
              <NotificationBell
                onNavigate={(tab, userId) => {
                  setActiveTab(tab);
                  if (userId) {
                    setSelectedConnectionId(userId);
                  }
                  setShowMobileMenu(false);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
              />
            </div>
          </div>

          <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
            {renderContent()}
          </div>
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-1 py-2 z-20">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            if (item.isLink) {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className="flex flex-col items-center px-1 py-2 rounded-lg transition-colors min-w-0 text-gray-600 hover:text-gray-900"
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-[10px] mt-1 truncate max-w-full">{item.label}</span>
                </a>
              );
            }
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center px-1 py-2 rounded-lg transition-colors min-w-0 ${
                  activeTab === item.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-[10px] mt-1 truncate max-w-full">{item.label}</span>
              </button>
            );
          })}
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
                    const payload = {
                      name: formData.get('name'),
                      email: formData.get('email'),
                      company: formData.get('company'),
                      phone: phoneNumber,
                      adType: formData.get('adType'),
                      message: formData.get('message')
                    };

                    const response = await fetch('/api/submitAdInquiry', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                      alert('Unable to submit inquiry. Please email grjeff@gmail.com directly.');
                      return;
                    }

                    const result = await response.json();

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
                    console.error('Error submitting ad inquiry:', error);
                    alert('Unable to submit inquiry. Please email grjeff@gmail.com directly.');
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

      {/* Share Prompt Modal */}
      {showSharePrompt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSharePrompt(false)}>
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative border-4 border-[#D0ED00]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowSharePrompt(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-lime-500 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Loving BudE? Share it!</h3>
              <p className="text-gray-600 mb-6">
                Help grow our networking community! Copy the link below and share with friends and colleagues.
              </p>

              {/* Link Display with Copy Button */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm text-gray-500 mb-1">Share Link:</p>
                    <p className="text-sm font-mono text-gray-900 truncate">https://www.networkingbude.com</p>
                  </div>
                  <button
                    onClick={() => {
                      const shareUrl = 'https://www.networkingbude.com';
                      try {
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                          navigator.clipboard.writeText(shareUrl).then(() => {
                            setLinkCopied(true);
                            setTimeout(() => setLinkCopied(false), 2000);
                          }).catch(() => {
                            prompt('Copy this link:', shareUrl);
                          });
                        } else {
                          prompt('Copy this link:', shareUrl);
                        }
                      } catch (err) {
                        prompt('Copy this link:', shareUrl);
                      }
                    }}
                    className="flex-shrink-0 bg-[#009900] text-white px-4 py-2 rounded-lg hover:bg-[#007700] transition-colors border-[3px] border-[#D0ED00] flex items-center gap-2"
                  >
                    {linkCopied ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowSharePrompt(false);
                  setLinkCopied(false);
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Beta Feedback Form Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => !feedbackSubmitted && setShowFeedbackModal(false)}>
          <div className="bg-white rounded-lg p-3 md:p-4 max-w-sm w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {feedbackSubmitted ? (
              <div className="text-center py-8">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-[#009900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Thank You!</h2>
                <p className="text-base text-gray-600 mb-2">Your feedback has been submitted successfully.</p>
                <p className="text-sm text-gray-500">This helps us make BudE better for everyone!</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-gray-900">Share Feedback</h2>
                  <button onClick={() => setShowFeedbackModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Name (optional)</label>
                      <input
                        type="text"
                        value={feedbackData.name}
                        onChange={(e) => setFeedbackData({...feedbackData, name: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Email (optional)</label>
                      <input
                        type="email"
                        value={feedbackData.email}
                        onChange={(e) => setFeedbackData({...feedbackData, email: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                      <span className="text-base">👍</span>
                      I love these features
                    </label>
                    <textarea
                      value={feedbackData.loveFeatures}
                      onChange={(e) => setFeedbackData({...feedbackData, loveFeatures: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent resize-none"
                      placeholder="Tell us what you love about BudE..."
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                      <span className="text-base">💡</span>
                      These features could use some work
                    </label>
                    <textarea
                      value={feedbackData.improveFeatures}
                      onChange={(e) => setFeedbackData({...feedbackData, improveFeatures: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent resize-none"
                      placeholder="What could we improve?"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                      <span className="text-base">❤️</span>
                      I'd love to see this feature
                    </label>
                    <textarea
                      value={feedbackData.newFeatures}
                      onChange={(e) => setFeedbackData({...feedbackData, newFeatures: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent resize-none"
                      placeholder="What new features would you like?"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setShowFeedbackModal(false)} className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                    <button type="submit" className="flex-1 px-3 py-2 text-sm bg-[#009900] text-white rounded-lg font-medium hover:bg-[#007700] transition-colors border-2 border-[#D0ED00]">Submit Feedback</button>
                  </div>
                </form>
              </>
            )}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">Networking BudE by The BudE System™</p>
            </div>
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
                      className="flex-1 px-4 py-3 bg-[#009900] text-white rounded-lg font-medium hover:bg-[#007700] transition-colors border-2 border-[#D0ED00] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="fixed top-20 left-4 w-[240px] bg-white border border-gray-200 shadow-lg rounded-lg z-50 md:hidden max-h-[80vh] overflow-hidden">
            <div className="p-3 space-y-2 overflow-y-auto" style={{ maxHeight: '80vh' }}>
              {/* Account Settings */}
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Profile & Settings</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('payment');
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
              >
                <CreditCard className="w-5 h-5" />
                <span>Account & Billing</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('privacy');
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Privacy & Security</span>
              </button>
              <button
                onClick={() => {
                  setShowContactModal(true);
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Contact Us</span>
              </button>
              <div className="border-t border-gray-200 my-3"></div>
              <button
                onClick={async () => {
                  setShowMobileMenu(false);
                  await signOut();
                  window.location.href = '/';
                }}
                className="w-full text-left px-4 py-3 text-[#009900] font-semibold hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Log Out</span>
              </button>
            </div>
        </div>
      )}

      {/* Floating Feedback Widget */}
      <FeedbackWidget
        onOpenFeedback={() => {
          // Open feedback modal directly without changing active tab
          setShowFeedbackModal(true);
        }}
      />
    </div>
  );
}



export default Dashboard;