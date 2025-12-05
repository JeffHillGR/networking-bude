import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, ExternalLink, X, TrendingUp, ArrowLeft, Share2, Heart, Check } from 'lucide-react';
import { supabase } from '../lib/supabase.js';
import EventCalendar from './EventCalendar';

function Events({ onBackToDashboard }) {
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
  const [allEvents, setAllEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventInterestCounts, setEventInterestCounts] = useState({});
  const [eventGoingCounts, setEventGoingCounts] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEvent, setShareEvent] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Track user engagement for share prompt
  const trackEngagement = () => {
    const currentCount = parseInt(localStorage.getItem('userEngagementCount') || '0', 10);
    localStorage.setItem('userEngagementCount', (currentCount + 1).toString());
  };

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

  // Format date string to "Wednesday, December 18, 2025" format (desktop)
  const formatEventDate = (dateString) => {
    if (!dateString) return '';
    // Handle ISO format (YYYY-MM-DD) from date picker
    const date = new Date(dateString + 'T00:00:00');
    if (isNaN(date.getTime())) return dateString; // Return original if parsing fails
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format date string to "12/18/2025" format (mobile)
  const formatShortDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };
  const [ads, setAds] = useState({
    eventsSidebar1: null,
    eventsSidebar2: null,
    eventsBottom: null
  });

  useEffect(() => {
    // Scroll to top when component loads (use setTimeout to avoid blocking)
    setTimeout(() => window.scrollTo(0, 0), 0);

    // Load ads from Supabase
    const loadAds = async () => {
      try {
        const { data, error } = await supabase
          .from('event_ads')
          .select('*');

        if (error) throw error;

        // Convert array to object keyed by id
        const adsObj = {};
        data?.forEach(ad => {
          if (ad.image) { // Only include ads that have images
            adsObj[ad.id] = ad;
          }
        });
        setAds(adsObj);
      } catch (error) {
        console.error('Error loading ads:', error);
      }
    };

    loadAds();
  }, []);

  // Load events from Supabase
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('slot_number', { ascending: true });

        if (error) throw error;

        // Load interested counts and going counts for all events
        const eventIds = data.map(e => e.id);
        let counts = {};
        let goingCounts = {};

        if (eventIds.length > 0) {
          const [likesResult, clicksResult, attendeesResult] = await Promise.all([
            supabase
              .from('event_likes')
              .select('event_id')
              .in('event_id', eventIds),
            supabase
              .from('event_registration_clicks')
              .select('event_id')
              .in('event_id', eventIds),
            supabase
              .from('event_attendees')
              .select('event_id')
              .in('event_id', eventIds)
              .eq('status', 'going')
          ]);

          // Count unique users interested in each event
          eventIds.forEach(id => {
            const likes = likesResult.data?.filter(l => l.event_id === id).length || 0;
            const clicks = clicksResult.data?.filter(c => c.event_id === id).length || 0;
            counts[id] = likes + clicks;

            // Count users going to each event
            goingCounts[id] = attendeesResult.data?.filter(a => a.event_id === id).length || 0;
          });
        }

        setEventInterestCounts(counts);
        setEventGoingCounts(goingCounts);

        // Debug: Log raw event data from database
        console.log('📊 Events from database (ordered by slot_number):', data.map(e => ({
          slot: e.slot_number,
          title: e.title,
          featured: e.is_featured
        })));

        // Transform data to match the expected format
        // Mark as trending if interested count > 5
        // Wildcard is always slot #4 (stays with the slot, not the event)
        const transformedEvents = data.map(event => ({
          id: event.id,
          title: event.title,
          description: event.short_description,
          date: event.date,
          time: event.time,
          location: event.location_name,
          organizerName: event.organization === 'Other' ? event.organization_custom : event.organization,
          image: event.image_url,
          badge: event.event_badge,
          isFeatured: event.is_featured,
          isTrending: (counts[event.id] || 0) > 5,
          slotNumber: event.slot_number,
          isWildcard: event.slot_number === 4
        }));

        setAllEvents(transformedEvents);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, []);

  // Separate featured and non-featured events
  const featuredEvents = allEvents.filter(e => e.isFeatured);
  const upcomingEvents = allEvents.filter(e => !e.isFeatured);

  // Debug: Log featured events with their positions
  console.log('⭐ Featured events:', featuredEvents.map((e, index) => ({
    position: index + 1,
    slot: e.slotNumber,
    title: e.title,
    isWildcard: e.isWildcard
  })));

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Normalize the URL - add https:// if missing
      let normalizedUrl = eventFormData.eventUrl.trim();
      if (normalizedUrl && !normalizedUrl.match(/^https?:\/\//i)) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      const submissionData = {
        ...eventFormData,
        eventUrl: normalizedUrl
      };

      console.log('📤 Submitting event suggestion:', submissionData);

      // Submit to serverless API endpoint
      const response = await fetch('/api/submitEvent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
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

  // Use upcomingEvents from Supabase (non-featured events)
  const moreEvents = upcomingEvents;

  // Show loading skeleton while data loads
  if (loadingEvents) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 md:py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-0">
              <button
                onClick={onBackToDashboard}
                className="flex items-center gap-2 text-[#009900] hover:text-[#007700] font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="text-center flex-1">
                <div className="inline-block bg-white px-4 md:px-6 py-2 md:py-3 rounded-lg border-2 border-black">
                  <h1 className="text-xl md:text-3xl font-bold text-black">Networking Events</h1>
                </div>
                <p className="text-gray-600 text-xs md:text-sm mt-2">These are real events. Check them out!</p>
              </div>
              <div className="hidden md:block w-[140px]"></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
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
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 md:py-6">
        <div className="max-w-7xl mx-auto">
          {/* Mobile: stacked layout */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-0">
            {/* Back to Dashboard Button */}
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-2 text-[#009900] hover:text-[#007700] font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            {/* Title */}
            <div className="text-center flex-1">
              <div className="inline-block bg-white px-4 md:px-6 py-2 md:py-3 rounded-lg border-2 border-black">
                <h1 className="text-xl md:text-3xl font-bold text-black">Networking Events</h1>
              </div>
              <p className="text-gray-600 text-xs md:text-sm mt-2">These are real events. Check them out!</p>
            </div>
            {/* Spacer for balance - hidden on mobile */}
            <div className="hidden md:block w-[140px]"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-8">
        {/* Search and Filters - Coming Soon */}
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
                {featuredEvents.map((event, index) => (
                  <div
                    key={event.id}
                    data-testid="event-card"
                    onClick={() => {
                      trackEngagement(); // Count viewing event as engagement
                      navigate(`/events/${event.id}`);
                    }}
                    className={`bg-white rounded-lg shadow-sm overflow-visible hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer animate-fade-in relative flex flex-col ${event.isWildcard ? 'border-2 border-[#D0ED00]' : 'border border-black'}`}
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
                  >
                    {event.isWildcard && (
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#009900] to-[#D0ED00] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg z-10 border-2 border-[#D0ED00] whitespace-nowrap">
                        🃏 Wildcard Pick of the Week
                      </div>
                    )}
                    <div className="relative h-48 bg-gray-50 rounded-t-lg overflow-hidden flex items-center justify-center p-4">
                      <img src={event.image} alt={event.title} className="max-w-full max-h-full object-contain" />
                      {event.soldOut && (
                        <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                          SOLD OUT
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      {event.isWildcard && (
                        <div className="mb-3 p-3 bg-gradient-to-r from-green-50 to-lime-50 border-l-4 border-[#D0ED00] rounded">
                          <p className="text-sm text-gray-700 italic">
                            Events that aren't necessarily "professional networking."
                          </p>
                        </div>
                      )}
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                      <div className="mb-3">
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          {event.organizerName || 'Event Organizer'}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2" title="Click to view event details">
                          <Calendar className="h-4 w-4" />
                          <span className="hidden md:inline">{formatEventDate(event.date)} • {event.time}</span>
                          <span className="md:hidden">{formatShortDate(event.date)} • {event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                        {(eventInterestCounts[event.id] > 0 || eventGoingCounts[event.id] > 0) && (
                          <div className="flex items-center gap-4 pt-2">
                            {eventInterestCounts[event.id] > 0 && (
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4 text-red-500" />
                                <span className="text-gray-700 font-medium">
                                  {eventInterestCounts[event.id]} Interested
                                </span>
                              </div>
                            )}
                            {eventGoingCounts[event.id] > 0 && (
                              <div className="flex items-center gap-1">
                                <Check className="h-4 w-4 text-[#009900]" />
                                <span className="text-[#009900] font-medium">
                                  {eventGoingCounts[event.id]} Going
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end mt-auto pt-4">
                        <span className="text-[#8AA600] font-medium flex items-center gap-1 hover:text-[#6d8300]">
                          View Details
                          <ExternalLink className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Calendar - Between Featured and More Events */}
            <div className="lg:hidden mb-8">
              <EventCalendar
                events={allEvents.map(e => ({ date: e.date, title: e.title, id: e.id }))}
                onDateClick={(events) => events.length === 1 && navigate(`/events/${events[0].id}`)}
              />
            </div>

            {/* More Events */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">More Events</h2>
              <div className="space-y-4">
                {moreEvents.map((event, index) => (
                  <div
                    key={event.id}
                    data-testid="event-card"
                    onClick={() => {
                      trackEngagement(); // Count viewing event as engagement
                      navigate(`/events/${event.id}`);
                    }}
                    className={`bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative animate-fade-in min-h-[240px] ${event.isWildcard ? 'border-2 border-[#D0ED00]' : event.isTrending ? 'border-2 border-green-200' : 'border border-black'}`}
                    style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'backwards' }}
                  >
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 h-full">
                      <div className="w-full md:w-48 h-32 md:h-32 rounded-lg flex-shrink-0 bg-gray-50 flex items-center justify-center p-3">
                        <img src={event.image} alt={event.title} className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col">
                        {event.isWildcard && (
                          <div className="mb-2 p-2 bg-gradient-to-r from-green-50 to-lime-50 border-l-4 border-[#D0ED00] rounded">
                            <p className="text-xs md:text-sm text-gray-700 italic flex items-center gap-2">
                              🃏 <span className="font-bold">Wildcard Pick of the Week:</span> Events that aren't necessarily "professional networking."
                            </p>
                          </div>
                        )}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2 gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg md:text-xl font-bold text-gray-900">{event.title}</h3>
                            <p className="text-sm md:text-base text-gray-600 mt-1">{event.description}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            {event.isWildcard && (
                              <span className="bg-gradient-to-r from-[#009900] to-[#D0ED00] text-white px-3 py-1 rounded-full text-xs font-bold border-2 border-[#D0ED00] flex items-center gap-1">
                                🃏 Wildcard
                              </span>
                            )}
                            {event.isTrending && (
                              <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-400 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Trending
                              </span>
                            )}
                            {event.price === 'Free' && (
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                Free
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs md:text-sm text-gray-600 mt-3">
                          <div className="flex items-center gap-2" title="Click to view event details">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span className="hidden md:inline">{formatEventDate(event.date)} • {event.time}</span>
                            <span className="md:hidden">{formatShortDate(event.date)} • {event.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              {event.organizerName}
                            </span>
                            {event.price !== 'Free' && (
                              <span className="text-xs text-gray-600">{event.price}</span>
                            )}
                            {eventInterestCounts[event.id] > 0 && (
                              <span className="flex items-center gap-1 text-xs">
                                <Heart className="h-3 w-3 text-red-500" />
                                <span className="text-gray-700">{eventInterestCounts[event.id]} Interested</span>
                              </span>
                            )}
                            {eventGoingCounts[event.id] > 0 && (
                              <span className="flex items-center gap-1 text-xs">
                                <Check className="h-3 w-3 text-[#009900]" />
                                <span className="text-[#009900]">{eventGoingCounts[event.id]} Going</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[#8AA600] font-medium text-sm flex items-center gap-1 flex-shrink-0 hover:text-[#6d8300]">
                            View Details
                            <ExternalLink className="h-4 w-4" />
                          </span>
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

            {/* Bottom Banner Ad - Hidden on mobile due to space constraints */}
            <div className="hidden md:block mt-8 md:mt-12 pb-4">
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
              ) : ads.eventsBottom?.image ? (
                <div
                  onClick={() => setShowAdInquiryModal(true)}
                  className="block cursor-pointer"
                >
                  <img
                    src={ads.eventsBottom.image}
                    alt="Advertisement"
                    className="w-full rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    style={{ aspectRatio: '728/160' }}
                  />
                </div>
              ) : (
                <div
                  onClick={() => setShowAdInquiryModal(true)}
                  className="rounded-lg p-6 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#D0ED00] transition-all cursor-pointer hover:shadow-md relative overflow-hidden"
                  style={{ aspectRatio: '728/160' }}
                >
                  <div
                    className="absolute inset-0 bg-cover opacity-30"
                    style={{
                      backgroundImage: 'url(My-phone-blurry-tall-2.jpg)',
                      backgroundPosition: 'center'
                    }}
                  />
                  <div className="text-center relative z-10">
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar with Calendar and Ads */}
          <div className="hidden lg:block w-[300px] flex-shrink-0 pl-6 pt-[54px] border-l border-gray-200">
            <div className="sticky top-24 space-y-6">
              {/* Event Calendar */}
              <div className="mb-[100px]">
                <EventCalendar
                  events={allEvents.map(e => ({ date: e.date, title: e.title, id: e.id }))}
                  onDateClick={(events) => events.length === 1 && navigate(`/events/${events[0].id}`)}
                  compact
                />
              </div>

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
                    style={{ aspectRatio: '300/600' }}
                  />
                </a>
              ) : ads.eventsSidebar1?.image ? (
                <div
                  onClick={() => setShowAdInquiryModal(true)}
                  className="block cursor-pointer"
                >
                  <img
                    src={ads.eventsSidebar1.image}
                    alt="Advertisement"
                    className="w-full rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    style={{ aspectRatio: '300/600' }}
                  />
                </div>
              ) : (
                <div
                  onClick={() => setShowAdInquiryModal(true)}
                  className="rounded-lg p-4 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#D0ED00] transition-all cursor-pointer hover:shadow-md relative overflow-hidden"
                  style={{ aspectRatio: '300/600' }}
                >
                  <div
                    className="absolute inset-0 bg-cover opacity-30"
                    style={{
                      backgroundImage: 'url(My-phone-blurry-tall-2.jpg)',
                      backgroundPosition: 'center'
                    }}
                  />
                  <div className="text-center relative z-10">
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
                    style={{ aspectRatio: '300/600' }}
                  />
                </a>
              ) : ads.eventsSidebar2?.image ? (
                <div
                  onClick={() => setShowAdInquiryModal(true)}
                  className="block cursor-pointer"
                >
                  <img
                    src={ads.eventsSidebar2.image}
                    alt="Advertisement"
                    className="w-full rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    style={{ aspectRatio: '300/600' }}
                  />
                </div>
              ) : (
                <div
                  onClick={() => setShowAdInquiryModal(true)}
                  className="rounded-lg p-4 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#D0ED00] transition-all cursor-pointer hover:shadow-md relative overflow-hidden"
                  style={{ aspectRatio: '300/600' }}
                >
                  <div
                    className="absolute inset-0 bg-cover opacity-30"
                    style={{
                      backgroundImage: 'url(My-phone-blurry-tall-2.jpg)',
                      backgroundPosition: 'center'
                    }}
                  />
                  <div className="text-center relative z-10">
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
                    type="text"
                    required
                    value={eventFormData.eventUrl}
                    onChange={(e) => setEventFormData({...eventFormData, eventUrl: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    placeholder="www.example.com or https://example.com/event"
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
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
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

      {/* Share Event Modal */}
      {showShareModal && shareEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setShowShareModal(false);
                setShareEvent(null);
                setLinkCopied(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-lime-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Share Event</h3>
              <p className="text-sm text-gray-600">{shareEvent.title}</p>
            </div>

            {/* Link Display with Copy Button */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm text-gray-500 mb-1">Event Link:</p>
                  <p className="text-sm font-mono text-gray-900 truncate">{`${window.location.origin}/api/share/${shareEvent.id}`}</p>
                </div>
                <button
                  onClick={() => {
                    const eventLink = `${window.location.origin}/api/share/${shareEvent.id}`;
                    try {
                      if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(eventLink).then(() => {
                          setLinkCopied(true);
                          setTimeout(() => setLinkCopied(false), 2000);
                        }).catch(() => {
                          prompt('Copy this link:', eventLink);
                        });
                      } else {
                        prompt('Copy this link:', eventLink);
                      }
                    } catch (err) {
                      prompt('Copy this link:', eventLink);
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

            {/* Share Options */}
            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Share to:</p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/api/share/' + shareEvent.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-lg hover:bg-[#006399] transition-colors text-sm"
                >
                  LinkedIn
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/api/share/' + shareEvent.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#145dbf] transition-colors text-sm"
                >
                  Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.origin + '/api/share/' + shareEvent.id)}&text=${encodeURIComponent('Check out this event: ' + shareEvent.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                >
                  X
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent('Check out this event: ' + shareEvent.title)}&body=${encodeURIComponent('I thought you might be interested in this event:\n\n' + shareEvent.title + '\n\n' + window.location.origin + '/api/share/' + shareEvent.id)}`}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Email
                </a>
              </div>
            </div>

            <button
              onClick={() => {
                setShowShareModal(false);
                setShareEvent(null);
                setLinkCopied(false);
              }}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;