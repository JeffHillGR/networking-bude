import { useState, useEffect, useRef } from 'react';
import { Home, Calendar, Users, MessageCircle, User, CreditCard, Archive, Activity, BookOpen, Lightbulb, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });
  const dropdownRef = useRef(null);
  const activityRef = useRef(null);
  const notificationsRef = useRef(null);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
  }, [isCollapsed]);

  // Fetch user data from Supabase on mount
  useEffect(() => {
    async function fetchUserData() {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('first_name, last_name, title, photo')
            .eq('id', user.id)
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (activityRef.current && !activityRef.current.contains(event.target)) {
        setShowActivity(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
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
    <aside className={`hidden md:block bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300 relative ${isCollapsed ? 'w-16' : 'w-52'}`}>
      <div className="flex flex-col h-screen">
        {/* Scrollable navigation section */}
        <div className="flex-1 overflow-y-auto">
          <div className={`${isCollapsed ? 'p-2' : 'p-4'}`}>
            {/* Logo */}
            <button
              onClick={() => {
                trackEngagement();
                setActiveTab('dashboard');
              }}
              className={`w-full flex items-center justify-center mb-4 cursor-pointer hover:opacity-80 transition-opacity ${isCollapsed ? 'px-1' : ''}`}
            >
              <img
                src={isCollapsed ? "/BudE-favicon.png" : "/BudE-Color-Logo-Rev.png"}
                alt="BudE Logo"
                className={isCollapsed ? "w-10 h-10" : "w-full h-auto"}
              />
            </button>

            {/* Collapse Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-end'} mb-4 p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-[#009900] transition-colors`}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
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
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === item.id
                     ? 'bg-[#009900] text-white border-[3px] border-[#D0ED00]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                </button>
              ))}

              {/* Resources & Insights */}
              <button
                onClick={() => {
                  trackEngagement();
                  setActiveTab('resources');
                }}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'resources'
                    ? 'bg-[#009900] text-white border-[3px] border-[#D0ED00]'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={isCollapsed ? 'Insights' : undefined}
              >
                <BookOpen className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium text-sm">Insights</span>}
              </button>

              {/* My Activity Section */}
              <div ref={activityRef} className={`relative w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors`}>
                <button
                  onClick={() => {
                    setShowActivity(!showActivity);
                    setShowNotifications(false);
                  }}
                  className="text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center"
                  title="My Activity"
                >
                  <Activity className="w-4 h-4" />
                </button>
                {!isCollapsed && (
                  <button
                    onClick={() => {
                      setShowActivity(!showActivity);
                      setShowNotifications(false);
                    }}
                    className="flex-1 text-left text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    My Activity
                  </button>
                )}

                {/* Activity Dropdown */}
                {showActivity && (
                  <div className="absolute top-full left-0 mt-1 w-40 max-h-[200px] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col z-[100]">
                    {/* Header */}
                    <div className="border-b border-gray-200 bg-gray-50 flex items-center justify-between flex-shrink-0 px-2 py-1.5">
                      <h3 className="font-semibold text-gray-900 text-xs">My Activity</h3>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto flex-1 p-2 space-y-3">
                      {/* Events Interested In */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600 font-medium">Interested In</span>
                          <span className="font-bold text-[#009900]">{interestedEvents.length}</span>
                        </div>
                        {interestedEvents.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {interestedEvents.slice(0, 4).map((event) => (
                              <div
                                key={event.id}
                                className="w-8 h-8 rounded overflow-hidden border border-gray-300"
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
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600 font-medium">Going To</span>
                          <span className="font-bold text-[#009900]">{goingEvents.length}</span>
                        </div>
                        {goingEvents.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {goingEvents.slice(0, 4).map((event) => (
                              <div
                                key={event.id}
                                className="w-8 h-8 rounded overflow-hidden border border-gray-300"
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
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <div ref={notificationsRef} className={`relative w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors`}>
                <NotificationBell
                  showDropdown={showNotifications}
                  setShowDropdown={(val) => {
                    setShowNotifications(val);
                    if (val) setShowActivity(false);
                  }}
                  dropdownPosition="sidebar"
                  onNavigate={(tab, userId) => {
                    setActiveTab(tab);
                    if (userId && setSelectedConnectionId) {
                      setSelectedConnectionId(userId);
                    }
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                />
                {!isCollapsed && (
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowActivity(false);
                    }}
                    className="flex-1 text-left text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Notifications
                  </button>
                )}
              </div>

            </nav>
          </div>
        </div>

        {/* User Profile Section - fixed at bottom */}
        <div className={`border-t border-gray-200 ${isCollapsed ? 'px-2 py-1' : 'p-4'} flex-shrink-0 relative`} ref={dropdownRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className={`w-full flex ${isCollapsed ? 'flex-col items-center justify-center py-1.5' : 'items-center gap-2 p-2'} bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors ${isCollapsed ? 'mb-1' : 'mb-2'}`}
            title={isCollapsed ? fullName : undefined}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={fullName}
                className={`${isCollapsed ? 'w-10 h-10' : 'w-8 h-8'} rounded-full object-cover border-2 border-black flex-shrink-0`}
              />
            ) : (
              <div className={`${isCollapsed ? 'w-10 h-10' : 'w-8 h-8'} bg-white rounded-full flex items-center justify-center border-2 border-black flex-shrink-0`}>
                <span className={`text-[#009900] font-bold ${isCollapsed ? 'text-sm' : 'text-xs'}`}>
                  {firstName.charAt(0).toUpperCase()}{lastName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {isCollapsed ? (
              <span className="text-xs font-medium text-gray-900 mt-1.5 truncate max-w-full">{firstName}</span>
            ) : (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-medium text-gray-900 truncate text-sm">{fullName}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform flex-shrink-0 ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

          {/* Dropdown Menu - opens upward */}
          {showProfileDropdown && (
            <div className={`absolute bottom-full ${isCollapsed ? 'left-2 right-2' : 'left-4 right-4'} mb-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-50 ${isCollapsed ? 'min-w-[160px]' : ''}`}>
              <div className="py-1">
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <User className="w-3 h-3" />
                  <span>Profile & Settings</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('payment');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <CreditCard className="w-3 h-3" />
                  <span>Account & Billing</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('privacy');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Privacy & Security</span>
                </button>
                <button
                  onClick={() => {
                    onContactUsClick();
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#009900] font-semibold hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}

          {!isCollapsed && <p className="text-xs text-gray-900 text-center">© 2025 The BudE System™</p>}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
