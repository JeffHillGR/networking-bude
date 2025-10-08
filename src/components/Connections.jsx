import { useState } from 'react';
import { X, Clock, User, Users, TrendingUp } from 'lucide-react';

function Connections() {
  const [activeTab, setActiveTab] = useState('recommended');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const connections = [
    {
      id: 1,
      name: 'Maria Rodriguez',
      title: 'Marketing Director',
      company: 'Spotify',
      location: 'New York, NY',
      connectionScore: 88,
      mutualConnections: 5,
      tags: ['Marketing', 'Media'],
      bio: 'Experienced marketing leader focused on brand strategy and digital transformation. Love connecting with creative professionals.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces',
      isOnline: false
    },
    {
      id: 2,
      name: 'Alex Chen',
      title: 'Senior Software Engineer',
      company: 'Google',
      location: 'San Francisco, CA',
      connectionScore: 95,
      mutualConnections: 3,
      tags: ['Technology', 'AI/ML'],
      bio: 'Passionate about building scalable systems and leading engineering teams. Always interested in discussing the latest in cloud architecture and AI applications.',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=faces',
      isOnline: true
    },
    {
      id: 3,
      name: 'David Kim',
      title: 'Product Manager',
      company: 'Meta',
      location: 'Menlo Park, CA',
      connectionScore: 92,
      mutualConnections: 2,
      tags: ['Product Management', 'Design'],
      bio: 'Product leader with 10+ years experience building user-centric products. Passionate about mentoring aspiring PMs.',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces',
      isOnline: true
    },
    {
      id: 4,
      name: 'Jennifer Walsh',
      title: 'VP of Sales',
      company: 'Salesforce',
      location: 'Chicago, IL',
      connectionScore: 85,
      mutualConnections: 4,
      tags: ['Sales', 'Leadership'],
      bio: 'Sales executive specializing in enterprise SaaS. Always happy to share insights on building high-performing sales teams.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces',
      isOnline: false
    }
  ];

  const currentCard = connections[currentCardIndex];

  const handleConnect = () => {
    console.log('Connected with:', currentCard.name);
    nextCard();
  };

  const handlePerhaps = () => {
    console.log('Perhaps later:', currentCard.name);
    nextCard();
  };

  const handleNoThanks = () => {
    console.log('No thanks:', currentCard.name);
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
        <h1 className="text-3xl font-bold text-gray-900">Connections</h1>
        <p className="text-gray-600 mt-2">Discover and connect with professionals who share your interests</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('recommended')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
              activeTab === 'recommended'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Recommended
          </button>
          <button
            onClick={() => setActiveTab('matched')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
              activeTab === 'matched'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Connected (3)
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Large Card View */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Discover New Connections</h2>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
                  <p className="text-gray-500 text-sm mt-1">{currentCard.location}</p>
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
                  <div className="w-px h-12 bg-gray-200"></div>
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-blue-500 mb-1">
                      <Users className="w-5 h-5" />
                      <span className="text-2xl font-bold">{currentCard.mutualConnections}</span>
                    </div>
                    <p className="text-xs text-gray-600">mutual connections</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex gap-2 mb-4">
                    {currentCard.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed">{currentCard.bio}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleNoThanks}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    <X className="w-5 h-5" />
                    No Thanks
                  </button>
                  <button
                    onClick={handlePerhaps}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
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
          </div>

          {/* All Recommendations List */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">All Recommendations</h2>
            <div className="space-y-3">
              {connections.map((person) => (
                <div key={person.id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
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
                  
                  <div className="flex gap-2 mb-3">
                    {person.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      {person.connectionScore}% compatible
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-blue-500" />
                      {person.mutualConnections} mutual
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-1.5 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                      No Thanks
                    </button>
                    <button className="flex-1 px-3 py-1.5 text-xs border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors">
                      Perhaps
                    </button>
                    <button className="flex-1 px-3 py-1.5 text-xs bg-[#009900] text-white rounded hover:bg-[#007700] transition-colors font-medium">
                      Connect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Connections;