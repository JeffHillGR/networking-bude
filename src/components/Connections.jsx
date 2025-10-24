import { useState, useEffect } from 'react';
import { X, Clock, User, TrendingUp, ArrowLeft, Send } from 'lucide-react';

function Connections({ onBackToDashboard }) {
  const [activeTab, setActiveTab] = useState('recommended');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');

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

  const connections = [
    {
      id: 1,
      name: 'Maria Rodriguez',
      title: 'Marketing Director',
      company: 'Spotify',
      email: 'grjeff@gmail.com',
      industry: 'media',
      connectionScore: 88,
      tags: ['Marketing', 'Media'],
      orgsAttend: 'GR Chamber of Commerce, Inforum',
      orgsCheckOut: 'Economic Club of Grand Rapids, Creative Mornings',
      professionalInterests: 'Marketing, Design, Media, Leadership',
      professionalInterestsOther: '',
      personalInterests: 'Love connecting with creative professionals, exploring new restaurants, and traveling.',
      networkingGoals: 'Experienced marketing leader focused on brand strategy and digital transformation. Looking to connect with other marketing professionals and creative leaders.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces',
      isOnline: false
    },
    {
      id: 2,
      name: 'Alex Chen',
      title: 'Senior Software Engineer',
      company: 'Google',
      email: 'grjeff@gmail.com',
      industry: 'technology',
      connectionScore: 95,
      tags: ['Technology', 'AI/ML'],
      orgsAttend: 'Start Garden, Right Place',
      orgsCheckOut: 'Bamboo, Hello West Michigan',
      professionalInterests: 'Technology, AI/ML, Engineering, Product Management',
      professionalInterestsOther: '',
      personalInterests: 'Building scalable systems, cloud architecture, hiking, and playing guitar.',
      networkingGoals: 'Passionate about leading engineering teams and discussing the latest in cloud architecture and AI applications. Looking to mentor junior engineers.',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=faces',
      isOnline: true
    },
    {
      id: 3,
      name: 'David Kim',
      title: 'Product Manager',
      company: 'Meta',
      email: 'grjeff@gmail.com',
      industry: 'technology',
      connectionScore: 92,
      tags: ['Product Management', 'Design'],
      orgsAttend: 'Economic Club of Grand Rapids, AIGA - WM',
      orgsCheckOut: 'Rotary Club, Crain\'s GR Business',
      professionalInterests: 'Product Management, Design, Technology, Leadership',
      professionalInterestsOther: '',
      personalInterests: 'Building user-centric products, mentoring aspiring PMs, cycling, and photography.',
      networkingGoals: 'Product leader with 10+ years experience. Passionate about mentoring aspiring PMs and sharing product development insights.',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces',
      isOnline: true
    },
    {
      id: 4,
      name: 'Jennifer Walsh',
      title: 'VP of Sales',
      company: 'Salesforce',
      email: 'grjeff@gmail.com',
      industry: 'technology',
      connectionScore: 85,
      tags: ['Sales', 'Leadership'],
      orgsAttend: 'GR Chamber of Commerce, Athena',
      orgsCheckOut: 'Inforum, Create Great Leaders',
      professionalInterests: 'Sales, Leadership, Finance, Consulting',
      professionalInterestsOther: '',
      personalInterests: 'Building high-performing sales teams, golf, and community volunteering.',
      networkingGoals: 'Sales executive specializing in enterprise SaaS. Always happy to share insights on building high-performing sales teams and SaaS sales strategies.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces',
      isOnline: false
    }
  ];

  // Filter connections based on active tab and actions taken
  const getFilteredConnections = () => {
    if (activeTab === 'recommended') {
      // Show connections that haven't been passed, saved, or pending
      return connections.filter(conn =>
        !passedConnections.includes(conn.id) &&
        !savedConnections.some(s => s.id === conn.id) &&
        !pendingConnections.some(p => p.id === conn.id)
      );
    } else if (activeTab === 'saved') {
      return savedConnections;
    } else if (activeTab === 'pending') {
      return pendingConnections;
    }
    return connections;
  };

  const filteredConnections = getFilteredConnections();
  const currentCard = filteredConnections[currentCardIndex];

  const handleConnect = () => {
    // Open modal to send connection request
    setShowConnectModal(true);
  };

  const handleSendConnectionRequest = async () => {
    try {
      // Get user's info from localStorage
      const onboardingData = localStorage.getItem('onboardingData');
      const userData = onboardingData ? JSON.parse(onboardingData) : {};

      const senderName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'BudE User';
      const senderEmail = userData.email || '';

      // Send connection request email (will implement API later)
      // For now, just add to pending and show success

      // Add to pending connections
      setPendingConnections(prev => [...prev, {
        id: currentCard.id,
        email: currentCard.email,
        name: currentCard.name,
        title: currentCard.title,
        company: currentCard.company,
        image: currentCard.image,
        message: connectionMessage,
        sentAt: new Date().toISOString()
      }]);

      // Close modal and move to next card
      setShowConnectModal(false);
      setConnectionMessage('');
      nextCard();

      // TODO: Actually send email via API
      console.log('Connection request sent to:', currentCard.email);
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const handlePerhaps = () => {
    // Add to saved connections
    setSavedConnections(prev => [...prev, {
      id: currentCard.id,
      email: currentCard.email,
      name: currentCard.name,
      title: currentCard.title,
      company: currentCard.company,
      image: currentCard.image,
      connectionScore: currentCard.connectionScore,
      tags: currentCard.tags
    }]);
    nextCard();
  };

  const handleNoThanks = () => {
    // Add to passed connections
    setPassedConnections(prev => [...prev, currentCard.id]);
    nextCard();
  };

  const nextCard = () => {
    if (currentCardIndex < connections.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setCurrentCardIndex(0);
    }
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
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('recommended')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
              activeTab === 'recommended'
                ? 'bg-[#009900] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Recommended
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
              activeTab === 'saved'
                ? 'bg-[#009900] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Saved
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-[#009900] text-white shadow-sm'
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

              {filteredConnections.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                  <p className="text-gray-500 text-lg">No more recommendations right now. Check back later!</p>
                </div>
              ) : (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden relative group">
              {/* Card Header */}
              <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 p-8 pb-16">
                {currentCard.isOnline && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">New</span>
                  </div>
                )}
                
                <div className="flex flex-col items-center">
                  <img
                    src={currentCard.image}
                    alt={currentCard.name}
                    className="w-32 h-32 rounded-full object-cover mb-4 shadow-lg border-4 border-white"
                  />
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

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleNoThanks}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#009900] text-[#009900] rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    <X className="w-5 h-5" />
                    No Thanks
                  </button>
                  <button
                    onClick={handlePerhaps}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#D0ED00] bg-[#D0ED00] text-black rounded-lg hover:bg-[#bfd400] transition-colors font-medium"
                  >
                    <Clock className="w-5 h-5" />
                    Perhaps
                  </button>
                  <button
                    onClick={handleConnect}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#009900] border-2 border-[#D0ED00] text-white rounded-lg hover:bg-[#007700] transition-colors font-medium"
                  >
                    <User className="w-5 h-5" />
                    Connect
                  </button>
                </div>
              </div>

            </div>
            )}
          </div>

          {/* All Recommendations List */}
          <div className="relative">
            <div className="text-center mb-4">
              <div className="inline-block bg-white px-4 py-2 rounded-lg border-2 border-black">
                <h2 className="text-xl font-bold text-black">All Recommendations</h2>
              </div>
            </div>
            <div className="space-y-3 relative">
              {filteredConnections.map((person, index) => (
                <div
                  key={person.id}
                  onClick={() => setCurrentCardIndex(index)}
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative">
                      <img
                        src={person.image}
                        alt={person.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
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
                      <img
                        src={person.image}
                        alt={person.name}
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover flex-shrink-0"
                      />
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
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => {
                                // Remove from saved
                                setSavedConnections(prev => prev.filter(c => c.id !== person.id));
                              }}
                              className="px-4 py-2 text-sm border-2 border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                            >
                              Remove
                            </button>
                            <button
                              onClick={() => {
                                setCurrentCardIndex(connections.findIndex(c => c.id === person.id));
                                setShowConnectModal(true);
                              }}
                              className="flex-1 px-4 py-2 text-sm bg-[#009900] border-2 border-[#D0ED00] text-white rounded hover:bg-[#007700] transition-colors font-medium"
                            >
                              Connect
                            </button>
                          </div>
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
      {showConnectModal && currentCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <img
                src={currentCard.image}
                alt={currentCard.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">{currentCard.name}</h3>
                <p className="text-sm text-gray-600">{currentCard.title}</p>
                <p className="text-sm text-gray-500">{currentCard.company}</p>
              </div>
              <button
                onClick={() => {
                  setShowConnectModal(false);
                  setConnectionMessage('');
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
      )}
    </div>
  );
}

export default Connections;