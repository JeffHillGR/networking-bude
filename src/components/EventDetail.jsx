import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Heart, ExternalLink, Share2, User, Home } from 'lucide-react';
import Sidebar from './Sidebar.jsx';

function EventDetail() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [isFavorited, setIsFavorited] = useState(false);

  // Load admin-created events from localStorage
  const adminEvents = JSON.parse(localStorage.getItem('adminEvents') || '[]');

  // Mock event data - Grand Rapids events
  const defaultEventData = {
    1: {
      id: 1,
      title: 'Creative Mornings Design Session',
      description: 'Join fellow creatives and designers for an inspiring morning session. Share ideas, discuss design trends, and build meaningful connections over coffee and breakfast.',
      fullDescription: 'Creative Mornings is a global breakfast lecture series for the creative community. Each event features a short talk, Q&A, and plenty of time for networking with fellow designers, artists, marketers, and creative professionals.\n\nThis month\'s theme explores the intersection of design and community impact. Whether you\'re a seasoned designer or just starting your creative journey, this is your opportunity to connect with Grand Rapids\' vibrant creative community in a welcoming, inspiring environment.',
      date: 'Thursday, September 19, 2025',
      time: '8:00 AM - 10:00 AM',
      location: 'Bamboo Grand Rapids',
      fullAddress: '33 Commerce Ave SW, Grand Rapids, MI 49503',
      image: 'https://images.unsplash.com/photo-1558403194-611308249627?w=800&h=600&fit=crop',
      badge: 'In-Person',
      organizer: {
        name: 'Creative Mornings GR',
        avatar: 'CM',
        description: 'Creative Mornings Grand Rapids brings together the local creative community for monthly breakfast lectures and networking.'
      },
      tags: ['Design', 'Creativity', 'Networking', 'Breakfast', 'Community'],
      registrationUrl: 'https://creativemornings.com/cities/gr'
    },
    2: {
      id: 2,
      title: 'StartGarden Entrepreneur Pitch',
      description: 'Watch promising West Michigan startups pitch their ideas and network with entrepreneurs, investors, and the local startup community.',
      fullDescription: 'StartGarden is West Michigan\'s startup accelerator and investment fund. Join us for an exciting evening of innovation as local entrepreneurs pitch their business ideas for a chance at funding and mentorship.\n\nThis event brings together the region\'s most passionate founders, investors, and startup enthusiasts. Whether you\'re building your own company, looking to invest, or simply curious about the entrepreneurial ecosystem, this is the place to be. Networking reception follows the pitches.',
      date: 'Tuesday, September 24, 2025',
      time: '6:30 PM - 9:00 PM',
      location: 'StartGarden',
      fullAddress: '38 Commerce Ave SW, Grand Rapids, MI 49503',
      image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop',
      badge: 'In-Person',
      organizer: {
        name: 'StartGarden',
        avatar: 'SG',
        description: 'StartGarden is West Michigan\'s premier startup accelerator, providing funding, mentorship, and community for entrepreneurs.'
      },
      tags: ['Startup', 'Entrepreneurship', 'Investing', 'Networking', 'Pitch'],
      registrationUrl: 'https://startgarden.com/'
    },
    3: {
      id: 3,
      title: 'Athena Leadership Workshop',
      description: 'Develop your leadership skills in this full-day workshop designed for professional women in West Michigan.',
      fullDescription: 'The Athena Leadership Workshop is a comprehensive professional development program designed to empower women leaders across all industries. Through interactive exercises, expert-led discussions, and peer networking, you\'ll develop practical leadership strategies and build lasting connections.\n\nThis intensive workshop covers leadership presence, strategic communication, negotiation skills, and building influential networks. Led by experienced executives and leadership coaches, you\'ll gain actionable insights to advance your career and make a greater impact in your organization and community.',
      date: 'Saturday, September 27, 2025',
      time: '9:00 AM - 5:00 PM',
      location: 'Grand Rapids Art Museum',
      fullAddress: '101 Monroe Center St NW, Grand Rapids, MI 49503',
      image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=600&fit=crop',
      badge: 'In-Person',
      organizer: {
        name: 'Athena Grand Rapids',
        avatar: 'AG',
        description: 'Athena Grand Rapids supports the development and recognition of women leaders through education, networking, and community engagement.'
      },
      tags: ['Leadership', 'Professional Development', 'Women in Business', 'Workshop', 'Networking'],
      registrationUrl: 'https://www.athenagr.org/'
    }
  };

  // Find admin event by ID first, fall back to default events
  const adminEvent = adminEvents.find(e => String(e.id) === String(eventId));

  // If admin event exists, format it with proper structure
  let event;
  if (adminEvent) {
    event = {
      ...adminEvent,
      organizer: {
        name: adminEvent.organizerName || 'Event Organizer',
        avatar: adminEvent.organizerName ? adminEvent.organizerName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'EO',
        description: adminEvent.organizerDescription || 'Event organization details'
      },
      tags: adminEvent.tags ? adminEvent.tags.split(',').map(t => t.trim()) : []
    };
  } else {
    event = defaultEventData[eventId] || defaultEventData[1];
  }

  // Mock suggested connections
  const suggestedConnections = [
    {
      name: 'Sarah Chen',
      title: 'VP Engineering at Stripe',
      match: '92% match',
      mutuals: '4 mutual connections',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces',
      attending: true
    },
    {
      name: 'Michael Torres',
      title: 'CTO at Airbnb',
      match: '88% match',
      mutuals: '6 mutual connections',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=faces',
      attending: true
    },
    {
      name: 'Emily Rodriguez',
      title: 'Product Director at Google',
      match: '85% match',
      mutuals: '3 mutual connections',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces',
      attending: true
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab="events" setActiveTab={() => navigate('/dashboard')} />

      <div className="flex-1 ml-64">
        {/* Header with green top bar */}
        <div className="bg-[#009900] h-2"></div>

        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Event Details</h1>
            <p className="text-gray-600 mt-1">Everything you need to know about this event</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Image */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative h-96">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
                  {event.badge}
                </div>
              </div>

              {/* Event Title and Actions */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-3xl font-bold text-gray-900 flex-1">{event.title}</h2>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setIsFavorited(!isFavorited)}
                      className={`p-2 rounded-full border transition-colors ${
                        isFavorited
                          ? 'bg-red-50 border-red-500 text-red-500'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>
                    <button className="p-2 rounded-full border border-gray-300 text-gray-600 hover:border-gray-400">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Professional Interest Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {event.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <p className="text-gray-700 text-lg">{event.description}</p>
                  <p className="text-gray-600 whitespace-pre-line">{event.fullDescription}</p>
                </div>
              </div>
            </div>

            {/* Organizer Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Organizer</h3>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {event.organizer.avatar}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg">{event.organizer.name}</h4>
                  <p className="text-gray-600 text-sm mt-1">{event.organizer.description}</p>
                  <button className="mt-3 flex items-center gap-2 text-[#009900] font-medium hover:text-[#007700] text-sm">
                    <User className="w-4 h-4" />
                    View Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Suggested Connections */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Suggested Connections Attending</h3>
              <p className="text-gray-600 text-sm mb-4">Connect with these professionals who are also attending this event</p>
              <div className="space-y-4">
                {suggestedConnections.map((person, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <img
                      src={person.image}
                      alt={person.name}
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900">{person.name}</h4>
                      <p className="text-sm text-gray-600 truncate">{person.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-red-500">d {person.match}</span>
                        <span className="text-xs text-blue-500">=e {person.mutuals}</span>
                        {person.attending && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            Attending
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-[#009900] text-white rounded-lg font-medium hover:bg-[#007700] flex-shrink-0">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Registration Card */}
              <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-200">
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-black text-white text-center py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors mb-4"
                >
                  Register Now
                </a>
                <p className="text-xs text-gray-500 text-center">
                  Redirects to organization's registration site for pricing and details
                </p>
              </div>

              {/* Event Details Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Event Details</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">{event.date}</div>
                      <div className="text-sm text-gray-600">{event.time}</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">{event.location}</div>
                      <div className="text-sm text-gray-600">{event.fullAddress}</div>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(event.fullAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#009900] hover:text-[#007700] font-medium inline-flex items-center gap-1 mt-1"
                      >
                        View on Map
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;
