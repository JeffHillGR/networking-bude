import { useState, useEffect, useRef } from 'react';
import { Home, Calendar, Users, MessageCircle, User, CreditCard, Archive, Activity, BookOpen, Lightbulb, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import NotificationBell from './NotificationBell.jsx';

// Helper function to track user engagement across the app
function trackEngagement() {
  const currentCount = parseInt(localStorage.getItem('userEngagementCount') || '0', 10);
  localStorage.setItem('userEngagementCount', (currentCount + 1).toString());
}

function Sidebar({ activeTab, setActiveTab, onContactUsClick, onNotificationNavigate, selectedConnectionId, setSelectedConnectionId }) {
  const { user, signOut } = useAuth();
  const [firstName, setFirstName] = useState(localStorage.getItem('userFirstName') || 'User');
  const [lastName, setLastName] = useState(localStorage.getItem('userLastName') || 'Name');
  const [jobTitle, setJobTitle] = useState(localStorage.getItem('userJobTitle') || 'Job Title');
  const fullName = `${firstName} ${lastName}`;
  const [photoUrl, setPhotoUrl] = useState(localStorage.getItem('userPhotoUrl') || null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch user data from Supabase on mount
  useEffect(() => {
    async function fetchUserData() {
      if (user?.email) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('first_name, last_name, title, photo')
            .eq('email', user.email.toLowerCase())
            .single();

          if (error) {
            console.log('Error fetching user data:', error);
            return;
          }

          if (data) {
            const userFirstName = data.first_name || 'User';
            const userLastName = data.last_name || 'Name';
            const userJobTitle = data.title || 'Job Title';
            const userPhoto = data.photo || null;

            // Update state
            setFirstName(userFirstName);
            setLastName(userLastName);
            setJobTitle(userJobTitle);
            setPhotoUrl(userPhoto);

            // Update localStorage so it's available for other components
            localStorage.setItem('userFirstName', userFirstName);
            localStorage.setItem('userLastName', userLastName);
            localStorage.setItem('userJobTitle', userJobTitle);
            if (userPhoto) {
              localStorage.setItem('userPhotoUrl', userPhoto);
            } else {
              localStorage.removeItem('userPhotoUrl');
            }
          }
        } catch (err) {
          console.error('Error in fetchUserData:', err);
        }
      }
    }
    fetchUserData();
  }, [user]);

  const [showActivity, setShowActivity] = useState(false);
  const [interestedEvents, setInterestedEvents] = useState([]);
  const [goingEvents, setGoingEvents] = useState([]);

  // Fetch user's interested and going events
  useEffect(() => {
    async function fetchUserEvents() {
      if (user?.id) {
        try {
          // Fetch events user is interested in (from heart/likes)
          const { data: likesData } = await supabase
            .from('event_likes')
            .select('event_id')
            .eq('user_id', user.id);

          if (likesData && likesData.length > 0) {
            const interestedEventIds = likesData.map(l => l.event_id).filter(id => id != null);

            if (interestedEventIds.length > 0) {
              // Build query - use .eq() for single item, .in() for multiple
              let query = supabase
                .from('events')
                .select('id, title, image_url, date');

              if (interestedEventIds.length === 1) {
                query = query.eq('id', interestedEventIds[0]);
              } else {
                query = query.in('id', interestedEventIds);
              }

              const { data: eventsData, error: eventsError } = await query
                .order('date', { ascending: true })
                .limit(4);

              if (eventsError) {
                console.error('[Sidebar] Error fetching interested events:', eventsError);
              }
              setInterestedEvents(eventsData || []);
            } else {
              setInterestedEvents([]);
            }
          } else {
            setInterestedEvents([]);
          }

          // Fetch events user is going to (only this week's upcoming events)
          const { data: goingData } = await supabase
            .from('event_attendees')
            .select('event_id')
            .eq('user_id', user.id)
            .eq('status', 'going');

          if (goingData && goingData.length > 0) {
            const goingEventIds = goingData.map(a => a.event_id).filter(id => id != null);

            if (goingEventIds.length > 0) {
              // Build query - use .eq() for single item, .in() for multiple
              let query = supabase
                .from('events')
                .select('id, title, image_url, date');

              if (goingEventIds.length === 1) {
                query = query.eq('id', goingEventIds[0]);
              } else {
                query = query.in('id', goingEventIds);
              }

              const { data: eventsData, error: eventsError } = await query
                .order('date', { ascending: true })
                .limit(7);

              if (eventsError) {
                console.error('[Sidebar] Error fetching going events:', eventsError);
              }
              setGoingEvents(eventsData || []);
            } else {
              setGoingEvents([]);
            }
          } else {
            setGoingEvents([]);
          }
        } catch (err) {
          console.error('Error fetching user events:', err);
        }
      }
    }

    fetchUserEvents();

    if (!user?.id) return;

    // Subscribe to event_likes changes for real-time updates
    const likesChannel = supabase
      .channel('event-likes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_likes',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refetch when likes change
          fetchUserEvents();
        }
      )
      .subscribe();

    // Subscribe to event_attendees changes for real-time updates
    const attendeesChannel = supabase
      .channel('event-attendees-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_attendees',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refetch when attendance changes
          fetchUserEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(attendeesChannel);
    };
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'connections', icon: Users, label: 'Connections' },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'messages', icon: MessageCircle, label: 'Messages' }
  ];

  return (
    <aside className="hidden md:block w-64 bg-white border-r border-gray-200 flex-shrink-0">
      <div className="flex flex-col h-screen">
        {/* Scrollable navigation section */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {/* Logo */}
            <button
              onClick={() => {
                trackEngagement();
                setActiveTab('dashboard');
              }}
              className="w-full flex items-center justify-center mb-4 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img
                src="BudE-Color-Logo-Rev.png"
                alt="BudE Logo"
                className="w-full h-auto"
              />
            </button>

            {/* Navigation */}
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    trackEngagement();
                    setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === item.id
                     ? 'bg-[#009900] text-white border-[3px] border-[#D0ED00]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              ))}

              {/* Resources & Insights */}
              <button
                onClick={() => {
                  trackEngagement();
                  setActiveTab('resources');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'resources'
                    ? 'bg-[#009900] text-white border-[3px] border-[#D0ED00]'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span className="font-medium text-sm">Insights</span>
              </button>

              {/* My Activity Section */}
              <div className="border-t border-gray-200 my-3 pt-3">
                {/* My Activity */}
                <button
                  onClick={() => setShowActivity(!showActivity)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Activity className="w-4 h-4" />
                  <span className="flex-1 text-left text-sm font-medium">My Activity</span>
                  <span className="text-xs">{showActivity ? '▼' : '▶'}</span>
                </button>

                {showActivity && (
                  <div className="ml-4 mt-2 space-y-3 px-3 py-2 bg-gray-50 rounded-lg">
                    {/* Events Interested In */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-gray-600 font-medium">Events Interested In</span>
                        <span className="font-bold text-[#009900]">{interestedEvents.length}</span>
                      </div>
                      {interestedEvents.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {interestedEvents.slice(0, 4).map((event) => (
                            <div
                              key={event.id}
                              className="w-10 h-10 rounded overflow-hidden border border-gray-300"
                              title={event.title}
                            >
                              <img
                                src={event.image_url}
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Events Going To */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-gray-600 font-medium">Events Going To</span>
                        <span className="font-bold text-[#009900]">{goingEvents.length}</span>
                      </div>
                      {goingEvents.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {goingEvents.slice(0, 4).map((event) => (
                            <div
                              key={event.id}
                              className="w-10 h-10 rounded overflow-hidden border border-gray-300"
                              title={event.title}
                            >
                              <img
                                src={event.image_url}
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <div className="mt-3 w-full flex items-center gap-3 px-3 py-2 pl-4">
                <NotificationBell
                  showDropdown={showNotifications}
                  setShowDropdown={setShowNotifications}
                  onNavigate={(tab, userId) => {
                    setActiveTab(tab);
                    if (userId && setSelectedConnectionId) {
                      setSelectedConnectionId(userId);
                    }
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                />
                <span className="font-medium text-sm">Notifications</span>
              </div>
            </nav>
          </div>
        </div>

        {/* Fixed user profile section at bottom */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0 relative" ref={dropdownRef}>
          {/* Clickable Profile Section */}
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="w-full flex items-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors mb-2"
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={fullName}
                className="w-8 h-8 rounded-full object-cover border-2 border-black"
              />
            ) : (
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-black">
                <span className="text-[#009900] font-bold text-xs">
                  {firstName.charAt(0).toUpperCase()}{lastName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0 text-left">
              <p className="font-medium text-gray-900 truncate text-sm">{fullName}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showProfileDropdown && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-50">
              <div className="py-2">
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Profile & Settings</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('payment');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Account & Billing</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('privacy');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Privacy & Security</span>
                </button>
                <button
                  onClick={() => {
                    onContactUsClick();
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Contact Us</span>
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={async () => {
                    await signOut();
                    window.location.href = '/';
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#009900] font-semibold hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-900 text-center">© 2025 The BudE System™</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;