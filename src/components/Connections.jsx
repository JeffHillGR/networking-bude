import { useState, useEffect } from 'react';
import { X, Clock, User, TrendingUp, ArrowLeft, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function Connections({ onBackToDashboard, onNavigateToSettings }) {
  const { user } = useAuth();
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
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (userError) throw userError;

        // Store current user ID for sending connection requests
        setCurrentUserId(userData.id);

        // Fetch all matches with different statuses
        const { data: allMatchesData, error: matchesError } = await supabase
          .from('matches')
          .select(`
            matched_user_id,
            compatibility_score,
            status,
            matched_user:users!matches_matched_user_id_fkey (
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
          .in('status', ['recommended', 'pending', 'saved', 'connected'])
          .order('compatibility_score', { ascending: false });

        if (matchesError) throw matchesError;

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
            isMutual: match.status === 'connected'
          };

          // Separate by status
          if (match.status === 'recommended') {
            recommended.push(connectionData);
          } else if (match.status === 'pending') {
            pending.push(connectionData);
          } else if (match.status === 'saved' || match.status === 'connected') {
            saved.push(connectionData);
          }
        });

        setConnections(recommended);
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
  }, [user]);

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

  const handleConnect = () => {
    // Open modal to send connection request
    setShowConnectModal(true);
  };

  const handleSendConnectionRequest = async () => {
    const person = selectedConnection || currentCard;

    try {
      // Call Supabase function to handle mutual connection logic
      const { data: connectionResult, error: dbError } = await supabase
        .rpc('handle_connection_request', {
          p_user_id: currentUserId,
          p_matched_user_id: person.id
        });

      if (dbError) throw dbError;

      // Send email notification
      const response = await fetch('/api/sendConnectionEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderName: user?.user_metadata?.full_name || user?.email,
          senderEmail: user?.email,
          senderId: currentUserId,
          recipientName: person.name,
          recipientEmail: person.email,
          message: connectionMessage,
          connectionScore: person.connectionScore
        })
      });

      if (!response.ok) {
        console.error('Failed to send email, but connection status updated');
      }

      // Create in-app notification for the recipient
      try {
        const senderName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Someone';

        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: person.id,
            type: 'connection_request',
            title: 'New Connection Request',
            message: `${senderName} wants to connect with you`,
            related_user_id: currentUserId,
            is_read: false
          });

        if (notificationError) {
          console.error('Failed to create notification:', notificationError);
        }
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }

      // Check if connection became mutual
      if (connectionResult === 'connected') {
        // Mutual connection! Add to saved connections
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
          professionalInterests: person.professionalInterests
        }]);
      }

      // Close modal and reset
      setShowConnectModal(false);
      setConnectionMessage('');
      setSelectedConnection(null);

      // Move to next card
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
    try {
      // Update match status to 'saved' in database
      const { error } = await supabase
        .from('matches')
        .update({ status: 'saved' })
        .eq('user_id', currentUserId)
        .eq('matched_user_id', currentCard.id);

      if (error) throw error;

      // Add to saved connections
      setSavedConnections(prev => [...prev, {
        id: currentCard.id,
        email: currentCard.email,
        name: currentCard.name,
        title: currentCard.title,
        company: currentCard.company,
        photo: currentCard.photo,
        initials: currentCard.initials,
        connectionScore: currentCard.connectionScore,
        professionalInterests: currentCard.professionalInterests,
        isMutual: false
      }]);
      nextCard();
    } catch (error) {
      console.error('Error saving connection:', error);
    }
  };

  const handleNoThanks = async () => {
    try {
      // Update match status to 'passed' in database
      const { error } = await supabase
        .from('matches')
        .update({ status: 'passed' })
        .eq('user_id', currentUserId)
        .eq('matched_user_id', currentCard.id);

      if (error) throw error;

      // Add to passed connections
      setPassedConnections(prev => [...prev, currentCard.id]);
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
          <p className="text-gray-600 mt-2">Discover and connect with professionals who share your interests</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Monday Reset Banner */}
        {showMondayBanner && (
          <div className="mb-6 bg-gradient-to-r from-[#009900] to-[#D0ED00] rounded-lg p-4 shadow-lg">
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
            <div className="lg:col-span-2">
              <div className="text-center mb-4">
                <div className="inline-block bg-white px-4 py-2 rounded-lg border-2 border-black">
                  <h2 className="text-xl font-bold text-black">Discover New Connections</h2>
                </div>
              </div>

              {currentCard?.isPlaceholder ? (
                /* Blurred Placeholder Card */
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

                  {/* Overlay Message - Different message for zero vs few connections */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    {connections.length === 0 ? (
                      /* Zero connections - encourage profile completion */
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
                      /* Has some connections, just showing placeholders */
                      <div className="bg-white rounded-xl p-8 shadow-2xl border-2 border-[#D0ED00] max-w-md mx-4 text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          We're building more connections for you
                        </h3>
                        <p className="text-gray-600 text-lg">
                          Stay tuned!
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
                  <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center mb-4 shadow-lg border-4 border-black">
                    <span className="text-[#009900] font-bold text-4xl">
                      {currentCard.initials}
                    </span>
                  </div>
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
                  {currentCard.email && (
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
                  onClick={() => setCurrentCardIndex(index)}
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
                          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0 border-2 border-black">
                            <span className="text-[#009900] font-bold text-sm">
                              {person.initials}
                            </span>
                          </div>
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
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="flex gap-4">
                      {person.photo ? (
                        <img
                          src={person.photo}
                          alt={person.name}
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
                                      .from('matches')
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
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded text-sm">
                              <Clock className="w-4 h-4" />
                              Request Sent
                            </span>
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

      {/* Connect Modal */}
      {showConnectModal && (selectedConnection || currentCard) && (() => {
        const person = selectedConnection || currentCard;
        return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-2 border-black">
                <span className="text-[#009900] font-bold text-xl">
                  {person.initials}
                </span>
              </div>
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
                Send Request
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

export default Connections;