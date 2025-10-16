import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, ExternalLink, X, TrendingUp } from 'lucide-react';

function Events() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedOrg, setSelectedOrg] = useState('All Organizations');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [eventSubmitted, setEventSubmitted] = useState(false);
  const [showAdInquiryModal, setShowAdInquiryModal] = useState(false);
  const [adInquirySubmitted, setAdInquirySubmitted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [eventFormData, setEventFormData] = useState({
    submitterName: '',
    submitterEmail: '',
    eventUrl: ''
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
      title: 'Salim Ismail – Founder, OpenExO and Author',
      description: 'Join us for an inspiring lunch with Salim Ismail, entrepreneur, author, and global innovation expert. Hear insights on exponential technologies and organizational transformation.',
      date: '10/20/2025',
      time: '11:30 AM - 1:30 PM',
      location: 'JW Marriott Grand Rapids',
      organizerName: 'The Economic Club of Grand Rapids',
      attendees: '250+',
      image: 'https://econclub.net/wp-content/uploads/2025/06/Salim-Ismail-cropped.jpg',
      badge: 'In-Person'
    },
    {
      id: 2,
      title: 'Leadership Lesson Breakfast',
      description: 'Join community leaders for valuable insights and networking. Features Joe Dyer (DISHER) on Steward Leadership and Lynne Ferrell-Robinson (Midwest Giving Strategies) on Leadership Lessons from the Field.',
      date: '10/28/2025',
      time: '7:30 AM - 9:00 AM',
      location: 'Grand Rapids Chamber',
      organizerName: 'Grand Rapids Chamber',
      attendees: '100+',
      image: 'https://grandrapids.org/wp-content/uploads/2025/01/GRC_LLB-October-e1737397882767.jpg',
      badge: 'In-Person'
    },
    {
      id: 3,
      title: '17th Annual Jay & Betty Van Andel Legacy Awards Gala',
      description: 'Celebrate community leadership and impact at this elegant gala honoring the Van Andel legacy and supporting the Grand Rapids Public Museum.',
      date: '11/12/2025',
      time: '6:00 PM - 10:00 PM',
      location: 'JW Marriott Grand Rapids',
      organizerName: 'Grand Rapids Public Museum',
      attendees: '300+',
      image: 'https://www.grpm.org/wp-content/uploads/2025/06/2025_Gala_Web-Header_Option-05.png',
      badge: 'In-Person'
    },
    {
      id: 4,
      title: 'Place Matters Summit 2025',
      description: 'Join community leaders from government, business, and nonprofits for meaningful discussions on nurturing vibrant communities and neighborhoods.',
      date: '11/6/2025',
      time: '12:00 PM - 5:00 PM',
      location: 'The Rockford Corner Bar',
      organizerName: 'The Right Place',
      attendees: '150+',
      image: 'https://web.cvent.com/event_guestside_app/_next/image?url=https%3A%2F%2Fimages.cvent.com%2Fc49e750ef94b4a73879b4e57ae9c1393%2Fa261375d7d47fd2cd2c68c3a86dd821f%2Fd978795e378242b5af5233c775c250e4%2Ff65bb8e0f27745f5bcf821b889bc6407!_!eb5aa18403450c956b23c2a0b455af07.jpeg&w=3840&q=75',
      badge: 'In-Person'
    }
  ];

  // Always use default featured events (real Grand Rapids events)
  const featuredEvents = defaultFeaturedEvents;

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      console.log('📤 Submitting event suggestion:', eventFormData);

      // Submit to serverless API endpoint
      const response = await fetch('/api/submitEvent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit event suggestion');
      }

      const result = await response.json();
      console.log('✅ Event suggestion submitted successfully:', result);

      // Show success message in modal
      setEventSubmitted(true);
      setEventFormData({
        submitterName: '',
        submitterEmail: '',
        eventUrl: ''
      });

      // Close modal after 3 seconds
      setTimeout(() => {
        setEventSubmitted(false);
        setShowSubmitModal(false);
      }, 3000);
    } catch (error) {
      console.error('❌ Error submitting event suggestion:', error);
      alert('There was an error submitting your suggestion. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const moreEvents = [
    {
      id: 5,
      title: 'UNFILTERED Gen3: Unapologetic Underdogs Unleashed',
      description: 'Born underground. Built on grit. Back, and louder than ever. Experience fearless storytelling with zero filter at this unique evening event.',
      date: '10/24/2025',
      time: '7:00 PM - 9:00 PM',
      location: 'City Built Brewing Company',
      attendees: '100+',
      organizer: 'UNFILTERED',
      price: 'Free',
      badge: 'In-Person',
      isTrending: true,
      image: 'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1115649073%2F978818167483%2F1%2Foriginal.20250905-182811?crop=focalpoint&fit=crop&w=940&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.557271596548&fp-y=0.544888875326&s=f63fa760ac5800775ace7493cbe92039'
    },
    {
      id: 6,
      title: 'Fuel on the Fire Pitch Competition',
      description: 'Watch seven Black-owned businesses pitch for capital and support. A live competition empowering Kent County entrepreneurs with growth resources and visibility.',
      date: '10/29/2025',
      time: '5:00 PM - 8:00 PM',
      location: 'ICCF Community Homes HQ',
      attendees: '150+',
      organizer: 'Grand Rapids Area Black Businesses',
      price: 'Free',
      badge: 'In-Person',
      image: 'https://grabblocal.com/wp-content/uploads/FOF.jpeg'
    },
    {
      id: 7,
      title: 'Mastering The Matrix: AI, Innovation & Public Safety',
      description: 'A groundbreaking full-day gathering with national experts, community leaders, tech innovators, and public safety professionals exploring how AI is reshaping our lives, laws, and liberties.',
      date: '10/30/2025',
      time: '7:30 AM - 5:00 PM',
      location: 'GVSU Eberhard Center',
      attendees: '200+',
      organizer: 'Scales Consulting LLC',
      price: 'Free',
      badge: 'In-Person',
      image: 'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1150451263%2F2284555542733%2F1%2Foriginal.20251010-230321?crop=focalpoint&fit=crop&w=940&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.506&fp-y=0.098&s=99803e3fd6bb96e6dee48880e089b619'
    },
    {
      id: 8,
      title: 'Crain\'s Grand Rapids Business 40 Under 40 Celebration',
      description: 'Join us to celebrate 40 outstanding business professionals under 40 in the Grand Rapids area. An evening of networking and recognition.',
      date: '10/22/2025',
      time: '5:30 PM - 9:00 PM',
      location: 'Amway Grand Plaza Hotel',
      attendees: '200+',
      organizer: 'Crain\'s Grand Rapids Business',
      price: 'Registration Required',
      badge: 'In-Person',
      image: 'https://images.cvent.com/81fd802d90fc4485ad7e62818fc2f0f4/pix/cea3e653a8704097b40d96720419d46e!_!ece8983ef528374c785e8d0c594591f1.png?f=webp'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Networking Events</h1>
        <p className="text-gray-600 mt-2">These are real events. Check them out!</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* BETA: Search and Filters Hidden - Re-enable for production */}
        {/* <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
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
        </div> */}

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
                  <div
                    key={event.id}
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="relative h-48 bg-white">
                      <img src={event.image} alt={event.title} className="w-full h-full object-contain" />
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
                          <span className="text-[#009900] font-medium">Coming Soon</span>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/events/${event.id}`);
                          }}
                          className="text-[#009900] font-medium hover:text-[#007700] flex items-center gap-1"
                        >
                          See Details & Who's Going
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* More Events */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">More Events</h2>
              <div className="space-y-4">
                {moreEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => navigate(`/events/${event.id}`)}
                    className={`bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow cursor-pointer relative ${event.isTrending ? 'border-2 border-green-200' : ''}`}
                  >
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                      <img src={event.image} alt={event.title} className="w-full md:w-48 h-48 md:h-32 object-contain rounded-lg flex-shrink-0 bg-white" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2 gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg md:text-xl font-bold text-gray-900">{event.title}</h3>
                            <p className="text-sm md:text-base text-gray-600 mt-1">{event.description}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            {event.isTrending && (
                              <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-400 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Trending
                              </span>
                            )}
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
                            <span className="truncate text-[#009900] font-medium">Coming Soon</span>
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 mt-3 md:mt-4">
                          <span className="text-xs md:text-sm text-gray-600 truncate">by {event.organizer} {event.price !== 'Free' && `• ${event.price}`}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/events/${event.id}`);
                            }}
                            className="flex items-center gap-2 text-[#009900] font-medium hover:text-[#007700] text-sm md:text-base whitespace-nowrap"
                          >
                            See Details & Who's Going
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
                <div
                  onClick={() => setShowAdInquiryModal(true)}
                  className="rounded-lg p-6 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#D0ED00] transition-all cursor-pointer hover:shadow-md relative overflow-hidden"
                  style={{ aspectRatio: '728/160' }}
                >
                  <div
                    className="absolute inset-0 bg-cover opacity-30"
                    style={{
                      backgroundImage: 'url(https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/My-phone-blurry-tall-2.jpg)',
                      backgroundPosition: 'center',
                      filter: 'blur(12px)',
                      transform: 'scale(1.1)'
                    }}
                  />
                  <div className="text-center relative z-10">
                    <p className="text-gray-700 font-bold text-lg">Banner Ad Spot: Click to Inquire</p>
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
                <div
                  onClick={() => setShowAdInquiryModal(true)}
                  className="rounded-lg p-4 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#D0ED00] transition-all cursor-pointer hover:shadow-md relative overflow-hidden"
                  style={{ aspectRatio: '160/600' }}
                >
                  <div
                    className="absolute inset-0 bg-cover opacity-30"
                    style={{
                      backgroundImage: 'url(https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/My-phone-blurry-tall-2.jpg)',
                      backgroundPosition: 'center',
                      filter: 'blur(12px)',
                      transform: 'scale(1.1)'
                    }}
                  />
                  <div className="text-center relative z-10">
                    <p className="text-gray-700 font-bold text-sm">Banner Ad Spot: Click to Inquire</p>
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
                <div
                  onClick={() => setShowAdInquiryModal(true)}
                  className="rounded-lg p-4 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#D0ED00] transition-all cursor-pointer hover:shadow-md relative overflow-hidden"
                  style={{ aspectRatio: '160/600' }}
                >
                  <div
                    className="absolute inset-0 bg-cover opacity-30"
                    style={{
                      backgroundImage: 'url(https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/My-phone-blurry-tall-2.jpg)',
                      backgroundPosition: 'center',
                      filter: 'blur(12px)',
                      transform: 'scale(1.1)'
                    }}
                  />
                  <div className="text-center relative z-10">
                    <p className="text-gray-700 font-bold text-sm">Banner Ad Spot: Click to Inquire</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Event Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => !eventSubmitted && setShowSubmitModal(false)}>
          <div className="bg-white rounded-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            {eventSubmitted ? (
              // Success Message
              <div className="text-center py-12 px-6">
                <div className="mb-6">
                  <svg className="w-20 h-20 mx-auto text-[#009900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
                <p className="text-lg text-gray-600 mb-2">Thank you for submitting.</p>
                <p className="text-gray-500">We'll check it out.</p>
              </div>
            ) : (
              <>
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
                  {submitting ? 'Submitting...' : 'Suggest an Event'}
                </button>
              </div>
            </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Ad Inquiry Modal */}
      {showAdInquiryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !adInquirySubmitted && setShowAdInquiryModal(false)}>
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 relative border-4 border-[#D0ED00]" onClick={(e) => e.stopPropagation()}>
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
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Advertise with BudE</h3>
              <p className="text-gray-600 mb-6 text-center">
                Interested in advertising? Fill out this quick form and we'll get back to you soon!
              </p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);

                  try {
                    const response = await fetch('/api/submitAdInquiry', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        name: formData.get('name'),
                        email: formData.get('email'),
                        company: formData.get('company'),
                        phone: phoneNumber,
                        adType: formData.get('adType'),
                        message: formData.get('message')
                      })
                    });

                    if (!response.ok) {
                      throw new Error('Failed to submit inquiry');
                    }

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
                    console.error('Error:', error);
                    alert('There was an error submitting your inquiry. Please email grjeff@gmail.com directly.');
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    name="company"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                    placeholder="(555) 123-4567"
                    maxLength="14"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ad Type of Interest</label>
                  <select
                    name="adType"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    name="message"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    placeholder="Tell us about your advertising goals..."
                  ></textarea>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#009900] text-white py-3 rounded-lg font-medium hover:bg-[#007700] transition-colors border-2 border-[#D0ED00]"
                  >
                    Submit Inquiry
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdInquiryModal(false)}
                    className="px-6 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
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
    </div>
  );
}

export default Events;