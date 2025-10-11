import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, ExternalLink, X } from 'lucide-react';

function Events() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedOrg, setSelectedOrg] = useState('All Organizations');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    submitterName: '',
    submitterEmail: '',
    eventUrl: ''
  });
  const [ads, setAds] = useState({
    eventsSidebar1: null,
    eventsSidebar2: null,
    eventsBottom: null
  });

  useEffect(() => {
    // Scroll to top when component loads
    window.scrollTo(0, 0);

    // Load ads from localStorage
    setAds({
      eventsSidebar1: JSON.parse(localStorage.getItem('ad_eventsSidebar1') || 'null'),
      eventsSidebar2: JSON.parse(localStorage.getItem('ad_eventsSidebar2') || 'null'),
      eventsBottom: JSON.parse(localStorage.getItem('ad_eventsBottom') || 'null')
    });
  }, []);

  // Load admin-created events from localStorage
  const adminEvents = JSON.parse(localStorage.getItem('adminEvents') || '[]');

  const defaultFeaturedEvents = [
    {
      id: 1,
      title: 'Creative Mornings Design Session',
      description: 'Join fellow creatives for an inspiring morning session.',
      date: '9/19/2025',
      time: '8:00 AM - 10:00 AM',
      location: 'Bamboo Grand Rapids',
      organizerName: 'Creative Mornings GR',
      attendees: '45/60',
      image: 'https://images.unsplash.com/photo-1558403194-611308249627?w=800&h=600&fit=crop',
      badge: 'In-Person'
    },
    {
      id: 2,
      title: 'StartGarden Entrepreneur Pitch',
      description: 'Watch promising West Michigan startups pitch their ideas.',
      date: '9/24/2025',
      time: '6:30 PM - 9:00 PM',
      location: 'StartGarden',
      organizerName: 'Start Garden',
      attendees: '80/100',
      image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop',
      badge: 'In-Person'
    },
    {
      id: 3,
      title: 'Athena Leadership Workshop',
      description: 'Develop your leadership skills in this full-day workshop.',
      date: '9/27/2025',
      time: '9:00 AM - 5:00 PM',
      location: 'Grand Rapids Art Museum',
      organizerName: 'Athena',
      attendees: '150/200',
      image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=600&fit=crop',
      badge: 'In-Person'
    },
    {
      id: 4,
      isSponsored: true,
      title: 'Sponsored Event Slot',
      description: 'Your premium event can appear here',
      organizerName: 'Your Organization',
      badge: 'Sponsored'
    }
  ];

  // Mock events for slots 2 and 3 (always shown for demo)
  const mockFeaturedEvents = [
    defaultFeaturedEvents[1], // StartGarden
    defaultFeaturedEvents[2], // Athena
    defaultFeaturedEvents[3]  // Sponsored slot
  ];

  // First event from admin (if exists), then always show mock events
  const featuredEvents = adminEvents.length > 0
    ? [adminEvents[0], ...mockFeaturedEvents]
    : defaultFeaturedEvents;

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Create email body
    const emailBody = `
New Event Submission to BudE

Submitted by: ${eventFormData.submitterName}
Email: ${eventFormData.submitterEmail}
Event URL: ${eventFormData.eventUrl}
    `;

    try {
      // Send email using mailto (opens user's email client)
      const mailtoLink = `mailto:grjeff@gmail.com?subject=${encodeURIComponent('BudE Event Suggestion')}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoLink;

      setSubmitSuccess(true);
      setTimeout(() => {
        setShowSubmitModal(false);
        setSubmitSuccess(false);
        setEventFormData({
          submitterName: '',
          submitterEmail: '',
          eventUrl: ''
        });
      }, 2000);
    } catch (error) {
      console.error('Error submitting event:', error);
      alert('There was an error submitting your event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const moreEvents = [
    {
      id: 5,
      title: 'Virtual Product Management Panel',
      description: 'Learn from experienced PMs at top tech companies. Interactive Q&A session included.',
      date: '9/21/2025',
      time: '2:00 PM - 3:30 PM',
      location: 'Zoom',
      attendees: '120',
      organizer: 'PM Community',
      price: 'Free',
      badge: 'Virtual',
      image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400'
    },
    {
      id: 6,
      title: 'AI & Machine Learning Mixer',
      description: 'Connect with AI researchers, engineers, and enthusiasts in a casual setting.',
      date: '10/1/2025',
      time: '7:00 PM - 10:00 PM',
      location: 'Tech Cafe',
      attendees: '65',
      organizer: 'AI Community Bay Area',
      price: '$20',
      badge: 'In-Person',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400'
    },
    {
      id: 7,
      title: 'Remote Work Best Practices Webinar',
      description: 'Learn strategies for effective remote collaboration and networking in distributed teams.',
      date: '10/4/2025',
      time: '12:00 PM - 1:00 PM',
      location: 'Microsoft Teams',
      attendees: '95',
      organizer: 'Remote Workers United',
      price: 'Free',
      badge: 'Virtual',
      image: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=400'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Networking Events</h1>
        <p className="text-gray-600 mt-2">Discover and join professional networking events and see who else is going!</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
            >
              <option>All Types</option>
              <option>In-Person</option>
              <option>Virtual</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
            >
              <option>All Categories</option>
              <option>Networking</option>
              <option>Technology</option>
              <option>Leadership</option>
              <option>Startup</option>
            </select>

            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
            >
              <option>All Organizations</option>
              <option>Tech Network SF</option>
              <option>PM Community</option>
              <option>AI Community Bay Area</option>
            </select>
          </div>
        </div>

        {/* Main content with sidebar */}
        <div className="flex gap-6">
          {/* Main Events Content */}
          <div className="flex-1">
            {/* Featured Events */}
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-yellow-500 text-2xl">⭐</span>
                <h2 className="text-2xl font-bold text-gray-900">Featured Events</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredEvents.map((event) => (
                  <div key={event.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {event.isSponsored ? (
                      <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-8">
                        <div className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                          {event.badge}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">{event.title}</h3>
                        <p className="text-gray-600 text-center">{event.description}</p>
                      </div>
                    ) : (
                      <>
                        <div className="relative h-48">
                          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                          <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
                            {event.badge}
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                          <p className="text-gray-600 mb-4">{event.description}</p>
                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <p className="font-semibold text-gray-700">🏢 {event.organizerName || 'Event Organizer'}</p>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{event.date} • {event.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{event.attendees} attending</span>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => navigate(`/events/${event.id}`)}
                              className="text-[#009900] font-medium hover:text-[#007700] flex items-center gap-1"
                            >
                              View Details
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* More Events */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">More Events</h2>
              <div className="space-y-4">
                {moreEvents.map((event) => (
                  <div key={event.id} className="bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                      <img src={event.image} alt={event.title} className="w-full md:w-48 h-48 md:h-32 object-cover rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2 gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg md:text-xl font-bold text-gray-900">{event.title}</h3>
                            <p className="text-sm md:text-base text-gray-600 mt-1">{event.description}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-medium">
                              {event.badge}
                            </span>
                            {event.price === 'Free' && (
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                Free
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-1 text-xs md:text-sm text-gray-600 mt-3 md:mt-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{event.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{event.attendees} attending</span>
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 mt-3 md:mt-4">
                          <span className="text-xs md:text-sm text-gray-600 truncate">by {event.organizer} {event.price !== 'Free' && `• ${event.price}`}</span>
                          <button className="flex items-center gap-2 text-[#009900] font-medium hover:text-[#007700] text-sm md:text-base whitespace-nowrap">
                            View Details
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Events Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="bg-[#D0ED00] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#bfd400] transition-colors inline-flex items-center gap-2"
              >
                <span className="text-xl">+</span>
                Suggest an Event
              </button>
            </div>

            {/* Bottom Banner Ad */}
            <div className="mt-12">
              {ads.eventsBottom?.image && ads.eventsBottom?.url ? (
                <a
                  href={ads.eventsBottom.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={ads.eventsBottom.image}
                    alt="Advertisement"
                    className="w-full rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    style={{ aspectRatio: '728/160' }}
                  />
                </a>
              ) : (
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-6 flex items-center justify-center border-2 border-dashed border-gray-300" style={{ aspectRatio: '728/160' }}>
                  <div className="text-center">
                    <p className="text-gray-600 font-medium">Sample Bottom Banner</p>
                    <p className="text-sm text-gray-500 mt-2">728 x 160</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Ads */}
          <div className="hidden lg:block w-44 flex-shrink-0">
            <div className="sticky top-6 space-y-6">
              {/* Sidebar Ad 1 */}
              {ads.eventsSidebar1?.image && ads.eventsSidebar1?.url ? (
                <a
                  href={ads.eventsSidebar1.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={ads.eventsSidebar1.image}
                    alt="Advertisement"
                    className="w-full rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    style={{ aspectRatio: '160/600' }}
                  />
                </a>
              ) : (
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-4 flex items-center justify-center border-2 border-dashed border-gray-300" style={{ aspectRatio: '160/600' }}>
                  <div className="text-center">
                    <p className="text-gray-600 font-medium text-sm">Banner Ad</p>
                    <p className="text-xs text-gray-500 mt-2">160 x 600</p>
                  </div>
                </div>
              )}

              {/* Sidebar Ad 2 */}
              {ads.eventsSidebar2?.image && ads.eventsSidebar2?.url ? (
                <a
                  href={ads.eventsSidebar2.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={ads.eventsSidebar2.image}
                    alt="Advertisement"
                    className="w-full rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    style={{ aspectRatio: '160/600' }}
                  />
                </a>
              ) : (
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-4 flex items-center justify-center border-2 border-dashed border-gray-300" style={{ aspectRatio: '160/600' }}>
                  <div className="text-center">
                    <p className="text-gray-600 font-medium text-sm">Banner Ad</p>
                    <p className="text-xs text-gray-500 mt-2">160 x 600</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Event Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-2xl font-bold text-gray-900">Suggest an Event</h2>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitEvent} className="p-6">
              <p className="text-gray-600 mb-6">
                Let us know if there's an event you'd like us to add and we'll take a look!
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventFormData.submitterName}
                    onChange={(e) => setEventFormData({...eventFormData, submitterName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={eventFormData.submitterEmail}
                    onChange={(e) => setEventFormData({...eventFormData, submitterEmail: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={eventFormData.eventUrl}
                    onChange={(e) => setEventFormData({...eventFormData, eventUrl: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    placeholder="https://example.com/event"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-[#009900] text-white rounded-lg font-medium hover:bg-[#007700] disabled:bg-gray-400"
                >
                  {submitting ? 'Submitting...' : submitSuccess ? 'Success!' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;