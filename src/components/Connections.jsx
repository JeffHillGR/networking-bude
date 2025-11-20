import { useState, useEffect, useRef } from 'react';
import { X, Clock, User, TrendingUp, ArrowLeft, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function Connections({ onBackToDashboard, onNavigateToSettings, onNavigateToMessages, selectedConnectionId }) {
  const { user } = useAuth();
  const featuredCardRef = useRef(null);
  const [activeTab, setActiveTab] = useState('recommended');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');
  const [selectedConnection, setSelectedConnection] = useState(null); // For Saved tab connections
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showMondayBanner, setShowMondayBanner] = useState(false);
  const [connectionLikedEvents, setConnectionLikedEvents] = useState({});
  const [connectionGoingEvents, setConnectionGoingEvents] = useState({});
  const [sessionDecisionCount, setSessionDecisionCount] = useState(0); // Track decisions THIS session (max 10)
  const [hasAnyMatchesInDB, setHasAnyMatchesInDB] = useState(true); // Did DB return ANY rows at all?

  // localStorage state for tracking actions
  const [passedConnections, setPassedConnections] = useState(() => {
    const saved = localStorage.getItem('connections_passed');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedConnections, setSavedConnections] = useState(() => {
    const saved = localStorage.getItem('connections_saved');
    return saved ? JSON.parse(saved) : [];
  });

  const [pendingConnections, setPendingConnections] = useState(() => {
    const saved = localStorage.getItem('connections_pending');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('connections_passed', JSON.stringify(passedConnections));
  }, [passedConnections]);

  useEffect(() => {
    localStorage.setItem('connections_saved', JSON.stringify(savedConnections));
  }, [savedConnections]);

  useEffect(() => {
    localStorage.setItem('connections_pending', JSON.stringify(pendingConnections));
  }, [pendingConnections]);

  // Fetch matches from Supabase
  useEffect(() => {
    async function fetchMatches() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Optimized: Fetch only user ID once, with minimal data
        const { data: userData, error: userError} = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (userError) throw userError;

        // Store current user ID for sending connection requests
        setCurrentUserId(userData.id);

        // Reset stale pending connections (10+ days old)
        await supabase
          .from('connection_flow')
          .update({
            status: 'recommended',
            pending_since: null
          })
          .eq('user_id', userData.id)
          .eq('status', 'pending')
          .lt('pending_since', new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString());

        // Reset "perhaps" connections after 1 week (7 days)
        await supabase
          .from('connection_flow')
          .update({
            status: 'recommended',
            perhaps_since: null
          })
          .eq('user_id', userData.id)
          .eq('status', 'perhaps')
          .lt('perhaps_since', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        // Fetch all matches where current user is user_id (their recommendations)
        const { data: allMatchesData, error: matchesError } = await supabase
          .from('connection_flow')
          .select(`
            matched_user_id,
            compatibility_score,
            status,
            updated_at,
            initiated_by_user_id,
            matched_user:users!connection_flow_matched_user_id_fkey (
              first_name,
              last_name,
              name,
              email,
              title,
              company,
              industry,
              photo,
              organizations_current,
              organizations_interested,
              professional_interests,
              personal_interests,
              networking_goals
            )
          `)
          .eq('user_id', userData.id)
          .in('status', ['recommended', 'perhaps', 'pending', 'saved', 'connected'])
          .order('compatibility_score', { ascending: false });

        if (matchesError) throw matchesError;

        // Check if user has ANY matches in DB at all (key for profile overlay)
        setHasAnyMatchesInDB(allMatchesData && allMatchesData.length > 0);

        // Transform Supabase data to component format and separate by status
        const recommended = [];
        const pending = [];
        const saved = [];

        allMatchesData.forEach((match) => {
          const matchedUser = match.matched_user;
          const fullName = matchedUser.name || `${matchedUser.first_name} ${matchedUser.last_name}`;
          const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

          const connectionData = {
            id: match.matched_user_id,
            userId: match.matched_user_id, // Add userId for liked events query
            name: fullName,
            email: matchedUser.email || '',
            title: matchedUser.title || '',
            company: matchedUser.company || '',
            industry: matchedUser.industry || '',
            photo: matchedUser.photo || null,
            connectionScore: match.compatibility_score,
            orgsAttend: Array.isArray(matchedUser.organizations_current)
              ? matchedUser.organizations_current.join(', ')
              : matchedUser.organizations_current || '',
            orgsCheckOut: Array.isArray(matchedUser.organizations_interested)
              ? matchedUser.organizations_interested.join(', ')
              : matchedUser.organizations_interested || '',
            professionalInterests: Array.isArray(matchedUser.professional_interests)
              ? matchedUser.professional_interests.join(', ')
              : matchedUser.professional_interests || '',
            personalInterests: (matchedUser.personal_interests || '').replace(/^{|}$/g, '').replace(/^"|"$/g, ''),
            networkingGoals: matchedUser.networking_goals || '',
            initials: initials,
            isOnline: false,
            isMutual: match.status === 'connected',
            initiatedByUserId: match.initiated_by_user_id
          };

          // Separate by status
          if (match.status === 'recommended') {
            recommended.push(connectionData);
          } else if (match.status === 'perhaps') {
            // "Perhaps" connections are hidden for 1 week - don't show them
            // They will automatically return to recommended after 7 days (handled above)
          } else if (match.status === 'pending') {
            pending.push(connectionData);
          } else if (match.status === 'saved' || match.status === 'connected') {
            saved.push(connectionData);
          }
        });

        // Prioritize selected connection if provided
        if (selectedConnectionId) {
          // Find the selected connection in recommended
          const selectedIndex = recommended.findIndex(conn => conn.id === selectedConnectionId);

          if (selectedIndex > 0) {
            // Move selected connection to the front
            const selectedConn = recommended.splice(selectedIndex, 1)[0];
            recommended.unshift(selectedConn);
          }

          // Also check in saved connections
          const savedIndex = saved.findIndex(conn => conn.id === selectedConnectionId);
          if (savedIndex > 0) {
            const selectedConn = saved.splice(savedIndex, 1)[0];
            saved.unshift(selectedConn);
          }
        }

        // Fetch liked events for all connections (same as Dashboard)
        const likedEventsMap = {};
        const allConnections = [...recommended, ...saved, ...pending];
        if (allConnections.length > 0) {
          try {
            const connectionIds = allConnections.map(c => c.userId);

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
        if (allConnections.length > 0) {
          try {
            const connectionUserIds = allConnections.map(c => c.userId);
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
              .in('user_id', connectionUserIds)
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

            // Sort by date and limit to 2 upcoming events per user
            Object.keys(userGoingEvents).forEach(userId => {
              goingEventsMap[userId] = userGoingEvents[userId]
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 2);
            });
          } catch (error) {
            console.error('Error loading going events:', error);
          }
        }

        setConnectionGoingEvents(goingEventsMap);

        // Only show recommended (perhaps are hidden for 1 week)
        // Cap recommendations at 10 per session
        setConnections(recommended.slice(0, 10));
        setPendingConnections(pending);
        setSavedConnections(saved);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setConnections([]);
        setLoading(false);
      }
    }

    fetchMatches();
  }, [user, selectedConnectionId]);

  // Auto-open modal for selected connection from notification
  useEffect(() => {
    if (selectedConnectionId && (savedConnections.length > 0 || connections.length > 0 || pendingConnections.length > 0)) {
      // Find the connection in saved connections first
      const savedConn = savedConnections.find(conn => conn.id === selectedConnectionId);
      if (savedConn) {
        setActiveTab('saved');
        setSelectedConnection(savedConn);
        return;
      }

      // Check in pending connections
      const pendingConn = pendingConnections.find(conn => conn.id === selectedConnectionId);
      if (pendingConn) {
        setActiveTab('pending');
        setSelectedConnection(pendingConn);
        return;
      }

      // Then check in recommended connections
      const recommendedConn = connections.find(conn => conn.id === selectedConnectionId);
      if (recommendedConn) {
        setActiveTab('recommended');
        // For recommended tab, we don't use modal, just scroll to it
        // The connection will be at the front of the list due to the prioritization logic
      }
    }
  }, [selectedConnectionId, savedConnections, connections, pendingConnections]);

  // Check if today is Monday and show banner
  useEffect(() => {
    const today = new Date();
    const isMonday = today.getDay() === 1; // 0 = Sunday, 1 = Monday
    const hasSeenMondayBanner = localStorage.getItem('hasSeenMondayBanner');
    const lastBannerDate = localStorage.getItem('lastMondayBannerDate');
    const todayString = today.toDateString();

    // Show banner if it's Monday and they haven't seen it today
    if (isMonday && lastBannerDate !== todayString) {
      setShowMondayBanner(true);
    }
  }, []);

  // Filter connections based on active tab and actions taken
  const getFilteredConnections = () => {
    if (activeTab === 'recommended') {
      // Show connections that haven't been passed, saved, or pending
      // Limit to top 5 by compatibility score to avoid overwhelming users
      return connections
        .filter(conn =>
          !passedConnections.includes(conn.id) &&
          !savedConnections.some(s => s.id === conn.id) &&
          !pendingConnections.some(p => p.id === conn.id)
        )
        .slice(0, 5); // Show top 5 at a time
    } else if (activeTab === 'saved') {
      return savedConnections;
    } else if (activeTab === 'pending') {
      return pendingConnections;
    }
    return connections;
  };

  const filteredConnections = getFilteredConnections();

  // Calculate how many placeholders to show (minimum 3 cards total)
  const MIN_CARDS = 3;
  const realConnectionsCount = filteredConnections.length;
  const placeholdersNeeded = Math.max(0, MIN_CARDS - realConnectionsCount);

  // Create array combining real connections and placeholders
  const allCards = [
    ...filteredConnections,
    ...Array(placeholdersNeeded).fill({ isPlaceholder: true })
  ];

  const currentCard = allCards[currentCardIndex];

  // Track user engagement for share prompt
  const trackEngagement = () => {
    const currentCount = parseInt(localStorage.getItem('userEngagementCount') || '0', 10);
    localStorage.setItem('userEngagementCount', (currentCount + 1).toString());
  };

  const handleConnect = () => {
    // Open modal to send connection request
    setShowConnectModal(true);
    trackEngagement(); // Count opening connection modal as engagement
  };

  const handleSendConnectionRequest = async () => {
    const person = selectedConnection || currentCard;

    try {
      // First, check the current status - need to check BOTH directions since only one row exists
      const { data: matches, error: fetchError } = await supabase
        .from('connection_flow')
        .select('status, user_id, matched_user_id, initiated_by_user_id')
        .or(`and(user_id.eq.${currentUserId},matched_user_id.eq.${person.id}),and(user_id.eq.${person.id},matched_user_id.eq.${currentUserId})`);

      if (fetchError) throw fetchError;

      // Check if someone already initiated (initiated_by_user_id exists)
      const alreadyInitiated = matches && matches.some(m => m.initiated_by_user_id);
      const currentMatch = matches && matches.length > 0 ? matches[0] : null;

      let connectionResult = 'pending';

      // If someone already initiated, receiver is accepting → make it mutual
      // Update both rows to 'connected' (initiated_by_user_id stays for record-keeping)
      if (alreadyInitiated) {
        // Update Row 1: Current user's row
        const { error: error1 } = await supabase
          .from('connection_flow')
          .update({ status: 'connected' })
          .eq('user_id', currentUserId)
          .eq('matched_user_id', person.id);

        if (error1) {
          throw error1;
        }

        // Update Row 2: Other person's row
        const { error: error2 } = await supabase
          .from('connection_flow')
          .update({ status: 'connected' })
          .eq('user_id', person.id)
          .eq('matched_user_id', currentUserId);

        if (error2) {
          throw error2;
        }

        connectionResult = 'connected';
      } else if (currentMatch) {
        // Status is 'recommended' or something else, so this is the first request

        // Update BOTH rows to 'pending' (both users should see it in Pending tab)
        // But ONLY set initiated_by_user_id in the INITIATOR'S row

        // Row 1: Current user's row (INITIATOR - gets the initiated_by_user_id)
        const { error: error1 } = await supabase
          .from('connection_flow')
          .update({
            status: 'pending',
            pending_since: new Date().toISOString(),
            initiated_by_user_id: currentUserId
          })
          .eq('user_id', currentUserId)
          .eq('matched_user_id', person.id);

        if (error1) {
          throw error1;
        }

        // Row 2: Other person's row (RECEIVER - NO initiated_by_user_id, just pending status)
        const { error: error2 } = await supabase
          .from('connection_flow')
          .update({
            status: 'pending',
            pending_since: new Date().toISOString()
            // NOTE: initiated_by_user_id stays NULL for receiver
          })
          .eq('user_id', person.id)
          .eq('matched_user_id', currentUserId);

        if (error2) {
          throw error2;
        }

        connectionResult = 'pending';
      }

      // Get current user's profile info
      const { data: currentUserData } = await supabase
        .from('users')
        .select('name, title, company')
        .eq('id', currentUserId)
        .single();

      const senderName = currentUserData?.name || user?.user_metadata?.full_name || user?.email;

      // Note: Notifications are now created automatically via database trigger
      // The trigger 'notify_mutual_connection' handles this when status changes to 'connected'
      // Connection request notifications are handled here in the code
      if (connectionResult === 'pending') {
        // Pending connection - only recipient gets notified (in-app)
        await supabase
          .from('notifications')
          .insert({
            user_id: person.id,
            type: 'connection_request',
            title: `${senderName} wants to connect!`,
            message: connectionMessage || `${senderName} sent you a connection request.`,
            action_url: `/connections?userId=${currentUserId}`
          });

        // Also send email notification
        try {
          await fetch('/api/sendConnectionEmail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipientEmail: person.email,
              recipientName: person.name,
              senderName: senderName,
              senderEmail: user.email,
              senderId: currentUserId,
              senderTitle: currentUserData?.title || '',
              senderCompany: currentUserData?.company || '',
              message: connectionMessage || '',
              connectionScore: person.connectionScore || 85
            })
          });
        } catch (emailError) {
          // Don't fail the connection request if email fails
        }
      }
      // Note: 'connected' status notifications are handled by database trigger

      // Check if connection became mutual
      if (connectionResult === 'connected') {
        // Mutual connection! Remove from pending and add to saved
        setPendingConnections(prev => prev.filter(c => c.id !== person.id));
        setSavedConnections(prev => [...prev, {
          id: person.id,
          email: person.email,
          name: person.name,
          title: person.title,
          company: person.company,
          photo: person.photo,
          initials: person.initials,
          connectionScore: person.connectionScore,
          professionalInterests: person.professionalInterests,
          isMutual: true
        }]);
      } else {
        // Add to pending connections (waiting for them to connect back)
        setPendingConnections(prev => [...prev, {
          id: person.id,
          email: person.email,
          name: person.name,
          title: person.title,
          company: person.company,
          photo: person.photo,
          initials: person.initials,
          connectionScore: person.connectionScore,
          professionalInterests: person.professionalInterests,
          initiatedByUserId: currentUserId  // Track who initiated for correct UI display
        }]);
      }

      // Close modal and reset
      setShowConnectModal(false);
      setConnectionMessage('');
      setSelectedConnection(null);

      // Track session decision and move to next card
      setSessionDecisionCount(prev => prev + 1); // Track session decisions (max 10)
      nextCard();

    } catch (error) {
      console.error('Error sending connection request:', error);
      // Show error modal
      setShowConnectModal(false);
      setConnectionMessage('');
      setSelectedConnection(null);
      setShowComingSoonModal(true);
    }
  };

  const handlePerhaps = async () => {
    // Safety check: ensure currentCard exists and has an ID
    if (!currentCard || !currentCard.id || !currentUserId) {
      console.warn('Cannot mark as perhaps: missing required data', {
        hasCurrentCard: !!currentCard,
        isPlaceholder: currentCard?.isPlaceholder,
        hasId: !!currentCard?.id,
        currentUserId
      });
      return;
    }

    trackEngagement(); // Count saving for later as engagement

    try {
      // Update match status to 'perhaps' with timestamp (hidden for 1 week)
      const { error } = await supabase
        .from('connection_flow')
        .update({
          status: 'perhaps',
          perhaps_since: new Date().toISOString(), // Track when marked as perhaps
          updated_at: new Date().toISOString()
        })
        .eq('user_id', currentUserId)
        .eq('matched_user_id', currentCard.id);

      if (error) {
        console.error('Supabase error in handlePerhaps:', error);
        throw error;
      }

      // Remove from local connections array
      setConnections(prev => prev.filter(conn => conn.id !== currentCard.id));

      // Track session decision and move to next card
      setSessionDecisionCount(prev => prev + 1); // Track session decisions (max 10)
      nextCard();
    } catch (error) {
      console.error('Error marking as perhaps:', error);
    }
  };

  const handleNoThanks = async () => {
    // Safety check: ensure currentCard exists and has an ID
    if (!currentCard || !currentCard.id || !currentUserId) {
      console.warn('Cannot mark as no thanks: missing required data', {
        hasCurrentCard: !!currentCard,
        isPlaceholder: currentCard?.isPlaceholder,
        hasId: !!currentCard?.id,
        currentUserId
      });
      return;
    }

    try {
      // Update match status to 'passed' in database
      const { error } = await supabase
        .from('connection_flow')
        .update({
          status: 'passed',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', currentUserId)
        .eq('matched_user_id', currentCard.id);

      if (error) throw error;

      // Remove from local connections array
      setConnections(prev => prev.filter(conn => conn.id !== currentCard.id));

      // Add to passed connections
      setPassedConnections(prev => [...prev, currentCard.id]);
      setSessionDecisionCount(prev => prev + 1); // Track session decisions (max 10)
      nextCard();
    } catch (error) {
      console.error('Error passing connection:', error);
    }
  };

  const nextCard = () => {
    // After filtering, we need to check against the filtered connections
    const filtered = getFilteredConnections();

    // If current index is now out of bounds or at the last card, reset to 0
    if (currentCardIndex >= filtered.length - 1) {
      setCurrentCardIndex(0);
    }
    // Otherwise just stay at the same index (the next card will naturally show)
    // No need to increment because filtering removes the current card
  };

  // Show loading skeleton while data loads
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-8">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 text-[#009900] hover:text-[#007700] font-medium mb-4 md:mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="text-center">
            <div className="inline-block bg-white px-6 py-3 rounded-lg mb-3 border-2 border-black">
              <h1 className="text-3xl font-bold text-black">Connections</h1>
            </div>
            <p className="text-gray-600 mt-2">Discover and connect with people who share your interests and goals</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        {/* Back to Dashboard Button - Mobile friendly */}
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-[#009900] hover:text-[#007700] font-medium mb-4 md:mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
        <div className="text-center">
          <div className="inline-block bg-white px-6 py-3 rounded-lg mb-3 border-2 border-black">
            <h1 className="text-3xl font-bold text-black">Connections</h1>
          </div>
          <p className="text-gray-600 mt-2">Discover and connect with people who share your interests and goals</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Monday Reset Banner */}
        {showMondayBanner && (
          <div className="mb-6 bg-gradient-to-r from-[#D0ED00] via-[#009900] to-[#D0ED00] rounded-lg p-4 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-1">Fresh Start Monday!</h3>
                  <p className="text-white text-sm">
                    Your saved-for-later connections are back in Recommended for a second look.
                    Take another look before Tuesday's email blast!
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowMondayBanner(false);
                  localStorage.setItem('lastMondayBannerDate', new Date().toDateString());
                }}
                className="flex-shrink-0 ml-3 text-white hover:text-gray-200 transition-colors"
                aria-label="Dismiss"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('recommended')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'recommended'
                ? 'bg-[#009900] text-white shadow-sm border-2 border-[#D0ED00]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Recommended
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'saved'
                ? 'bg-[#009900] text-white shadow-sm border-2 border-[#D0ED00]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Saved
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'pending'
                ? 'bg-[#009900] text-white shadow-sm border-2 border-[#D0ED00]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
        </div>

        {/* Conditional layout based on active tab */}
        {activeTab === 'recommended' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {/* Large Card View for Recommended */}
            <div className="lg:col-span-2" ref={featuredCardRef}>
              <div className="text-center mb-4">
                <div className="inline-block bg-white px-4 py-2 rounded-lg border-2 border-black">
                  <h2 className="text-xl font-bold text-black">Discover New Connections</h2>
                </div>
              </div>

              {currentCard?.isPlaceholder || (filteredConnections.length === 0 && hasAnyMatchesInDB) ? (
                /* Show overlay when no recommendations available OR placeholder card */
                <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
                  {/* Blurred Mock Card Content */}
                  <div className="filter blur-sm pointer-events-none">
                    {/* Card Header */}
                    <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 p-8 pb-16">
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full bg-gray-300 mb-4 shadow-lg border-4 border-white"></div>
                        <div className="h-6 w-48 bg-gray-300 rounded mb-2"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded mb-1"></div>
                        <div className="h-4 w-40 bg-gray-200 rounded"></div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-center gap-6 mb-6 pb-6 border-b border-gray-200">
                        <div className="text-center">
                          <div className="h-8 w-20 bg-gray-300 rounded mb-1 mx-auto"></div>
                          <div className="h-3 w-32 bg-gray-200 rounded"></div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                        <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>

                  {/* Overlay Message - Different message based on match history */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    {!hasAnyMatchesInDB ? (
                      /* Never been matched - encourage profile completion */
                      <div className="bg-white rounded-xl p-8 shadow-2xl border-2 border-[#D0ED00] max-w-md mx-4 text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          Help Us Find Your Compatible Connections
                        </h3>
                        <p className="text-gray-700 text-base mb-4 leading-relaxed">
                          Complete your profile to unlock meaningful connections with other professionals in your community.
                        </p>
                        <p className="text-[#009900] font-semibold text-base mb-6">
                          💡 Networking Goals is the most important aspect of making meaningful connections
                        </p>
                        <button
                          onClick={onNavigateToSettings}
                          className="bg-[#009900] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#007700] transition-colors"
                        >
                          Complete Your Profile
                        </button>
                      </div>
                    ) : (
                      /* Has been matched but reviewed all suggestions - polite end message */
                      <div className="bg-white rounded-xl p-8 shadow-2xl border-2 border-[#D0ED00] max-w-md mx-4 text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          You've Reviewed Your Suggestions!
                        </h3>
                        <p className="text-gray-600 text-base mb-4">
                          Great job! You've gone through your current batch of recommendations.
                        </p>
                        <p className="text-gray-700 text-sm">
                          Check back later for new connection opportunities, or explore your Pending and Saved connections.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : currentCard ? (
            <div
              className="bg-white rounded-lg shadow-lg overflow-hidden relative group"
            >
              {/* Card Header */}
              <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 p-8 pb-16">
                {currentCard.isOnline && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">New</span>
                  </div>
                )}
                
                <div className="flex flex-col items-center">
                  {currentCard.photo ? (
                    <img
                      src={currentCard.photo}
                      alt={currentCard.name}
                      loading="lazy"
                      className="w-32 h-32 rounded-full object-cover mb-4 shadow-lg border-4 border-black"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center mb-4 shadow-lg border-4 border-black">
                      <span className="text-[#009900] font-bold text-4xl">
                        {currentCard.initials}
                      </span>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900">{currentCard.name}</h3>
                  <p className="text-gray-600 mt-1">{currentCard.title}</p>
                  <p className="text-gray-500 text-sm">{currentCard.company}</p>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <div className="flex items-center justify-center gap-6 mb-6 pb-6 border-b border-gray-200">
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-green-600 mb-1">
                      <TrendingUp className="w-5 h-5" />
                      <span className="text-2xl font-bold">{currentCard.connectionScore}%</span>
                    </div>
                    <p className="text-xs text-gray-600">BudE Compatibility</p>
                  </div>
                </div>

                <div className="mb-6 space-y-4">
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {currentCard.professionalInterests && currentCard.professionalInterests.split(',').slice(0, 3).map((interest, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        {interest.trim()}
                      </span>
                    ))}
                  </div>

                  {/* Profile Fields - matching connection cards */}
                  {currentCard.email && currentCard.isMutual && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Email:</p>
                      <p className="text-gray-600 text-sm">{currentCard.email}</p>
                    </div>
                  )}

                  {currentCard.industry && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Industry:</p>
                      <p className="text-gray-600 text-sm capitalize">{currentCard.industry}</p>
                    </div>
                  )}

                  {currentCard.orgsAttend && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Organizations That Have Events I Like To Attend:</p>
                      <p className="text-gray-600 text-sm">{currentCard.orgsAttend}</p>
                    </div>
                  )}

                  {currentCard.orgsCheckOut && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Organizations I've Wanted to Check Out:</p>
                      <p className="text-gray-600 text-sm">{currentCard.orgsCheckOut}</p>
                    </div>
                  )}

                  {currentCard.professionalInterests && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Professional Interests:</p>
                      <p className="text-gray-600 text-sm">{currentCard.professionalInterests}</p>
                    </div>
                  )}

                  {currentCard.professionalInterestsOther && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Professional Interests Other:</p>
                      <p className="text-gray-600 text-sm">{currentCard.professionalInterestsOther}</p>
                    </div>
                  )}

                  {currentCard.personalInterests && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Personal Interests:</p>
                      <p className="text-gray-600 text-sm">{currentCard.personalInterests}</p>
                    </div>
                  )}

                  {currentCard.networkingGoals && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Networking Goals:</p>
                      <p className="text-gray-600 text-sm">{currentCard.networkingGoals}</p>
                    </div>
                  )}

                  {/* Liked Events */}
                  {connectionLikedEvents[currentCard.userId]?.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Interested in:</p>
                      <div className="flex gap-2">
                        {connectionLikedEvents[currentCard.userId].map((event, idx) => (
                          <div
                            key={idx}
                            className="w-16 h-16 rounded overflow-hidden border border-gray-200"
                            title={event.title}
                          >
                            {event.image_url ? (
                              <img
                                src={event.image_url}
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <span className="text-xs text-gray-400">Event</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Going Events */}
                  {connectionGoingEvents[currentCard.userId]?.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-2">📅 Going to:</p>
                      <div className="space-y-2">
                        {connectionGoingEvents[currentCard.userId].map((event, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                            {event.image_url && (
                              <img
                                src={event.image_url}
                                alt={event.title}
                                className="w-12 h-12 rounded object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                              <p className="text-xs text-gray-500">{event.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons - Reading left to right: Connect is primary action */}
                <div className="flex gap-2">
                  <button
                    onClick={handleConnect}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-3 bg-[#009900] border-2 border-[#D0ED00] text-white rounded-lg hover:bg-[#007700] transition-colors font-medium text-sm"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Connect</span>
                  </button>
                  <button
                    onClick={handlePerhaps}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-3 border-2 border-[#D0ED00] bg-[#D0ED00] text-black rounded-lg hover:bg-[#bfd400] transition-colors font-medium text-sm"
                  >
                    <Clock className="w-4 h-4" />
                    <span className="hidden sm:inline">Perhaps</span>
                  </button>
                  <button
                    onClick={handleNoThanks}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-3 border-2 border-[#009900] text-[#009900] rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">No Thanks</span>
                  </button>
                </div>
              </div>


            </div>
              ) : null}
          </div>

          {/* All Recommendations List */}
          <div className="relative">
            <div className="text-center mb-4">
              <div className="inline-block bg-white px-4 py-2 rounded-lg border-2 border-black">
                <h2 className="text-xl font-bold text-black">All Recommendations</h2>
              </div>
            </div>
            <div className="space-y-3 relative">
              {allCards.map((person, index) => (
                <div
                  key={person.isPlaceholder ? `placeholder-${index}` : person.id}
                  onClick={() => {
                    setCurrentCardIndex(index);
                    trackEngagement(); // Count viewing a connection card as engagement
                    // Scroll to featured card on mobile
                    if (featuredCardRef.current) {
                      featuredCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className={`bg-white rounded-lg p-4 shadow-sm transition-shadow ${person.isPlaceholder ? 'cursor-default opacity-60' : 'hover:shadow-md cursor-pointer'}`}
                >
                  {person.isPlaceholder ? (
                    /* Placeholder sidebar card */
                    <div className="filter blur-sm pointer-events-none">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                      <div className="flex gap-2 mb-3">
                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                        <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  ) : (
                    /* Real connection sidebar card */
                    <>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="relative">
                          {person.photo ? (
                            <img
                              src={person.photo}
                              alt={person.name}
                              loading="lazy"
                              className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-black"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 border-2 border-black">
                              <span className="text-[#009900] font-bold text-sm">
                                {person.initials}
                              </span>
                            </div>
                          )}
                          {person.isOnline && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900">{person.name}</h3>
                          <p className="text-sm text-gray-600 truncate">{person.title}</p>
                          <p className="text-xs text-gray-500">{person.company}</p>
                        </div>
                        <button className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full">
                          <User className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>

                      <div className="flex gap-2 mb-3 flex-wrap">
                        {person.professionalInterests && person.professionalInterests.split(',').slice(0, 3).map((interest, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {interest.trim()}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center text-xs text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-green-600" />
                          {person.connectionScore}% compatible
                        </span>
                      </div>

                      <p className="text-xs text-gray-500">Click to view full profile</p>
                    </>
                  )}
                </div>
              ))}

              {/* Beta Testing Blur Overlay for Sidebar */}
            </div>
          </div>
        </div>
        ) : (
          /* Centered Card List Layout for Saved and Pending */
          <div className="max-w-2xl mx-auto">
            {filteredConnections.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <p className="text-gray-500 text-lg">
                  {activeTab === 'saved' && "You haven't saved any connections yet. Mark someone as 'Perhaps' to review them later."}
                  {activeTab === 'pending' && "No pending connection requests. Send a connection request to see it here."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredConnections.map((person) => (
                  <div
                    key={person.id}
                    onClick={() => {
                      setSelectedConnection(person);
                      trackEngagement(); // Count viewing saved/pending connection details as engagement
                    }}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex gap-4">
                      {person.photo ? (
                        <img
                          src={person.photo}
                          alt={person.name}
                          loading="lazy"
                          className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover flex-shrink-0 border-2 border-black"
                        />
                      ) : (
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center flex-shrink-0 border-2 border-black">
                          <span className="text-[#009900] font-bold text-xl md:text-2xl">
                            {person.initials}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-lg">{person.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{person.title} at {person.company}</p>
                        <div className="flex items-center gap-2 text-xs flex-wrap mb-2">
                          <span className="font-medium whitespace-nowrap text-[#009900]">{person.connectionScore}% compatible</span>
                          {person.professionalInterests && person.professionalInterests.split(',').slice(0, 2).map((interest, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {interest.trim()}
                            </span>
                          ))}
                        </div>

                        {activeTab === 'saved' && (
                          <>
                            {person.isMutual ? (
                              /* Mutual Connection - Show badge and messaging option */
                              <div className="mt-3">
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border-2 border-[#009900] text-[#009900] rounded text-sm font-semibold">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Mutual Connection
                                </span>
                                <p className="text-xs text-gray-500 mt-2">Both of you clicked Connect!</p>
                              </div>
                            ) : (
                              /* Saved for Later - Show connect button */
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={async () => {
                                    // Remove from saved (update database)
                                    await supabase
                                      .from('connection_flow')
                                      .update({ status: 'recommended' })
                                      .eq('user_id', currentUserId)
                                      .eq('matched_user_id', person.id);
                                    setSavedConnections(prev => prev.filter(c => c.id !== person.id));
                                  }}
                                  className="px-4 py-2 text-sm border-2 border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                                >
                                  Remove
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedConnection(person);
                                    setShowConnectModal(true);
                                  }}
                                  className="flex-1 px-4 py-2 text-sm bg-[#009900] border-2 border-[#D0ED00] text-white rounded hover:bg-[#007700] transition-colors font-medium"
                                >
                                  Connect
                                </button>
                              </div>
                            )}
                          </>
                        )}

                        {activeTab === 'pending' && (
                          <div className="mt-3">
                            {person.initiatedByUserId === currentUserId ? (
                              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded text-sm">
                                <Clock className="w-4 h-4" />
                                Request Sent
                              </span>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedConnection(person);
                                  setShowConnectModal(true);
                                }}
                                className="px-4 py-2 bg-[#009900] border-2 border-[#D0ED00] text-white rounded-lg hover:bg-[#007700] transition-colors font-medium text-sm"
                              >
                                Accept Connection
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded Profile View Modal for Saved/Pending */}
      {selectedConnection && (activeTab === 'saved' || activeTab === 'pending') && !showConnectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedConnection(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Card Header */}
            <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 p-8 pb-16">
              <button
                onClick={() => setSelectedConnection(null)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 bg-white rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center">
                {selectedConnection.photo ? (
                  <img
                    src={selectedConnection.photo}
                    alt={selectedConnection.name}
                    loading="lazy"
                    className="w-32 h-32 rounded-full object-cover mb-4 shadow-lg border-4 border-black"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center mb-4 shadow-lg border-4 border-black">
                    <span className="text-[#009900] font-bold text-4xl">
                      {selectedConnection.initials}
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900">{selectedConnection.name}</h3>
                <p className="text-gray-600 mt-1">{selectedConnection.title}</p>
                <p className="text-gray-500 text-sm">{selectedConnection.company}</p>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6">
              <div className="flex items-center justify-center gap-6 mb-6 pb-6 border-b border-gray-200">
                <div className="text-center">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-2xl font-bold">{selectedConnection.connectionScore}%</span>
                  </div>
                  <p className="text-xs text-gray-600">BudE Compatibility</p>
                </div>
              </div>

              <div className="mb-6 space-y-4">
                <div className="flex gap-2 mb-4 flex-wrap">
                  {selectedConnection.professionalInterests && selectedConnection.professionalInterests.split(',').slice(0, 3).map((interest, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {interest.trim()}
                    </span>
                  ))}
                </div>

                {/* Profile Fields */}
                {selectedConnection.email && selectedConnection.isMutual && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Email:</p>
                    <p className="text-gray-600 text-sm">{selectedConnection.email}</p>
                  </div>
                )}

                {selectedConnection.industry && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Industry:</p>
                    <p className="text-gray-600 text-sm capitalize">{selectedConnection.industry}</p>
                  </div>
                )}

                {selectedConnection.orgsAttend && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Organizations That Have Events I Like To Attend:</p>
                    <p className="text-gray-600 text-sm">{selectedConnection.orgsAttend}</p>
                  </div>
                )}

                {selectedConnection.orgsCheckOut && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Organizations I've Wanted to Check Out:</p>
                    <p className="text-gray-600 text-sm">{selectedConnection.orgsCheckOut}</p>
                  </div>
                )}

                {selectedConnection.professionalInterests && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Professional Interests:</p>
                    <p className="text-gray-600 text-sm">{selectedConnection.professionalInterests}</p>
                  </div>
                )}

                {selectedConnection.professionalInterestsOther && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Professional Interests Other:</p>
                    <p className="text-gray-600 text-sm">{selectedConnection.professionalInterestsOther}</p>
                  </div>
                )}

                {selectedConnection.personalInterests && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Personal Interests:</p>
                    <p className="text-gray-600 text-sm">{selectedConnection.personalInterests}</p>
                  </div>
                )}

                {selectedConnection.networkingGoals && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Networking Goals:</p>
                    <p className="text-gray-600 text-sm">{selectedConnection.networkingGoals}</p>
                  </div>
                )}

                {/* Going Events */}
                {connectionGoingEvents[selectedConnection.userId]?.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">📅 Going to:</p>
                    <div className="space-y-2">
                      {connectionGoingEvents[selectedConnection.userId].map((event, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          {event.image_url && (
                            <img
                              src={event.image_url}
                              alt={event.title}
                              className="w-12 h-12 rounded object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                            <p className="text-xs text-gray-500">{event.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons based on tab */}
              {activeTab === 'saved' && !selectedConnection.isMutual && (
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      await supabase
                        .from('connection_flow')
                        .update({ status: 'recommended' })
                        .eq('user_id', currentUserId)
                        .eq('matched_user_id', selectedConnection.id);
                      setSavedConnections(prev => prev.filter(c => c.id !== selectedConnection.id));
                      setSelectedConnection(null);
                    }}
                    className="px-4 py-2 text-sm border-2 border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => {
                      setShowConnectModal(true);
                    }}
                    className="flex-1 px-4 py-2 text-sm bg-[#009900] border-2 border-[#D0ED00] text-white rounded hover:bg-[#007700] transition-colors font-medium"
                  >
                    Connect
                  </button>
                </div>
              )}

              {activeTab === 'saved' && selectedConnection.isMutual && (
                <div className="text-center space-y-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border-2 border-[#009900] text-[#009900] rounded text-sm font-semibold">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Mutual Connection
                  </span>
                  <p className="text-xs text-gray-500">Both of you clicked Connect!</p>
                  <button
                    onClick={async () => {
                      // Create or find conversation and navigate to messages
                      try {
                        // Ensure user IDs are ordered correctly (smaller first)
                        const userId1 = currentUserId < selectedConnection.id ? currentUserId : selectedConnection.id;
                        const userId2 = currentUserId < selectedConnection.id ? selectedConnection.id : currentUserId;

                        // Check if conversation already exists
                        const { data: existingConvs, error: findError } = await supabase
                          .from('conversations')
                          .select('id')
                          .eq('user1_id', userId1)
                          .eq('user2_id', userId2)
                          .limit(1);

                        if (findError) throw findError;

                        const existingConv = existingConvs && existingConvs.length > 0 ? existingConvs[0] : null;

                        let conversationId;

                        if (existingConv) {
                          // Conversation exists
                          conversationId = existingConv.id;
                        } else {
                          // Create new conversation
                          const { data: newConv, error: createError } = await supabase
                            .from('conversations')
                            .insert({
                              user1_id: userId1,
                              user2_id: userId2
                            })
                            .select('id')
                            .single();

                          if (createError) throw createError;
                          conversationId = newConv.id;
                        }

                        // Navigate to messages
                        if (onNavigateToMessages) {
                          onNavigateToMessages();
                        }
                        setSelectedConnection(null);
                      } catch (error) {
                        console.error('Error creating conversation:', error);
                        alert('Failed to start conversation. Please try again.');
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#009900] border-2 border-[#D0ED00] text-white rounded-lg hover:bg-[#007700] transition-colors font-medium"
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </div>
              )}

              {activeTab === 'pending' && (
                <div className="text-center">
                  {selectedConnection.initiatedByUserId === currentUserId ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded text-sm">
                      <Clock className="w-4 h-4" />
                      Request Sent
                    </span>
                  ) : (
                    <button
                      onClick={() => setShowConnectModal(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#009900] border-2 border-[#D0ED00] text-white rounded-lg hover:bg-[#007700] transition-colors font-medium"
                    >
                      <User className="w-4 h-4" />
                      Accept Connection
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Connect Modal */}
      {showConnectModal && (selectedConnection || currentCard) && (() => {
        const person = selectedConnection || currentCard;
        return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              {person.photo ? (
                <img
                  src={person.photo}
                  alt={person.name}
                  loading="lazy"
                  className="w-16 h-16 rounded-full object-cover border-2 border-black"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-2 border-black">
                  <span className="text-[#009900] font-bold text-xl">
                    {person.initials}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">{person.name}</h3>
                <p className="text-sm text-gray-600">{person.title}</p>
                <p className="text-sm text-gray-500">{person.company}</p>
              </div>
              <button
                onClick={() => {
                  setShowConnectModal(false);
                  setConnectionMessage('');
                  setSelectedConnection(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add a personal message (optional)
              </label>
              <textarea
                value={connectionMessage}
                onChange={(e) => setConnectionMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                placeholder="Introduce yourself and explain why you'd like to connect..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConnectModal(false);
                  setConnectionMessage('');
                  setSelectedConnection(null);
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendConnectionRequest}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#009900] text-white rounded-lg hover:bg-[#007700] transition-colors font-medium"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Coming Soon Modal */}
      {showComingSoonModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-xl text-gray-900">Feature Coming Soon</h3>
              <button
                onClick={() => setShowComingSoonModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-700 mb-4">
              Messaging/connect function coming soon. In the meantime email us at{' '}
              <a
                href="mailto:connections@networkingbude.com"
                className="text-[#009900] hover:text-[#007700] font-medium"
              >
                connections@networkingbude.com
              </a>
            </p>

            <button
              onClick={() => setShowComingSoonModal(false)}
              className="w-full px-4 py-2 bg-[#009900] text-white rounded-lg hover:bg-[#007700] transition-colors font-medium"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Connections;// Trigger redeploy
