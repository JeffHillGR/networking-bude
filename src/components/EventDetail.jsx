import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Heart, ExternalLink, Share2, User, Home, TrendingUp, Users } from 'lucide-react';
import Sidebar from './Sidebar.jsx';

function EventDetail() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAdInquiryModal, setShowAdInquiryModal] = useState(false);
  const [adInquirySubmitted, setAdInquirySubmitted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showScientistModal, setShowScientistModal] = useState(false);

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

  // Load admin-created events from localStorage
  const adminEvents = JSON.parse(localStorage.getItem('adminEvents') || '[]');

  // Real event data - Grand Rapids networking events
  const defaultEventData = {
    1: {
      id: 1,
      title: 'Bamboo Grand Rapids: Grand Opening Celebration',
      description: 'Celebrate the grand opening of Bamboo Grand Rapids, a new center for entrepreneurship, creativity, and innovation in downtown Grand Rapids.',
      fullDescription: 'Join us for the grand opening celebration of Bamboo Grand Rapids - a transformative new entrepreneurship hub in the heart of downtown Grand Rapids!\n\nAfter a year of renovations, the former art gallery at 2 Fulton Street West has been reimagined as a vibrant center for entrepreneurship, creativity, and innovation. This free event offers the first look at our newly reopened gallery, theater, and the new Start Garden incubator facility.\n\nBamboo Grand Rapids is open to everyone - members, neighbors, students, artists, founders, and funders. This celebration marks the beginning of a statewide collaborative entrepreneurship ecosystem, connecting West Michigan to communities across Michigan.\n\nCome meet the tenants and members who will make Bamboo their home, explore the transformed space, and be part of this exciting new chapter in Grand Rapids\' entrepreneurial community.\n\nThis event is made possible through partnerships with the City of Grand Rapids, Michigan Economic Development Corporation, and multiple regional organizations committed to fostering innovation and creativity.',
      date: 'Thursday, December 4, 2025',
      time: '4:00 PM - 8:00 PM',
      location: '2 Fulton Street West',
      fullAddress: '2 Fulton Street West, Grand Rapids, MI 49503',
      image: 'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1120287333%2F84709515697%2F1%2Foriginal.20250910-174858?crop=focalpoint&fit=crop&w=940&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.208333333333&fp-y=0.621848739496&s=9f37de221b0249dee8dd7ee347395056',
      badge: 'In-Person',
      organizer: {
        name: 'Bamboo Detroit',
        avatar: 'BD',
        description: 'Bamboo Detroit creates spaces and programs that support entrepreneurs, artists, and innovators across Michigan, fostering a collaborative ecosystem for creativity and business growth.'
      },
      tags: ['Entrepreneurship', 'Innovation', 'Startup'],
      registrationUrl: 'https://www.eventbrite.com/e/bamboo-grand-rapids-grand-opening-celebration-tickets-1685330421659'
    },
    2: {
      id: 2,
      title: 'Leadership Lesson Breakfast',
      description: 'Community leaders sharing valuable leadership insights at this networking breakfast featuring two powerful presentations on leadership strategies.',
      fullDescription: 'Join the Grand Rapids Chamber for the Leadership Lesson Breakfast, featuring two exceptional speakers sharing their leadership wisdom.\n\nJoe Dyer, President of DISHER, will present "Steward Leadership: Learning, Listening, and Influence," offering insights on servant leadership and building organizational culture through influence and active listening.\n\nLynne Ferrell-Robinson, CEO of Midwest Giving Strategies, will share "Leadership: Lessons from the Field," drawing on her extensive experience in non-profit leadership and strategic philanthropy.\n\nThese breakfast events offer strong community trustees and leaders sharing valuable leadership lessons along with networking opportunities. Cost: Members $40, Non-Members $55.\n\nOrganized by the Grand Rapids Chamber for talent development and professional growth.',
      date: 'Tuesday, October 28, 2025',
      time: '7:30 AM - 9:00 AM',
      location: 'Grand Rapids Chamber',
      fullAddress: '250 Monroe Ave, Grand Rapids, MI 49503',
      image: 'https://grandrapids.org/wp-content/uploads/2025/01/GRC_LLB-October-e1737397882767.jpg',
      badge: 'In-Person',
      organizer: {
        name: 'Grand Rapids Chamber',
        avatar: 'GR',
        description: 'The Grand Rapids Chamber advocates for business growth, economic development, and inclusive workplace cultures throughout West Michigan.'
      },
      tags: ['Leadership', 'Networking', 'Professional Development', 'Business', 'Talent Development'],
      registrationUrl: 'https://grandrapids.org/event/leadership-lesson-breakfast-2025-10-28/'
    },
    3: {
      id: 3,
      title: '17th Annual Jay & Betty Van Andel Legacy Awards Gala',
      description: 'A Prehistoric Party - Annual fundraising gala honoring outstanding leaders throughout West Michigan.',
      fullDescription: 'Join the Grand Rapids Public Museum for an unforgettable evening at the 17th Annual Jay & Betty Van Andel Legacy Awards Gala, themed "A Prehistoric Party."\n\nThis prestigious event celebrates exceptional leaders who have made lasting contributions to West Michigan\'s business community and quality of life. Hosted at the elegant JW Marriott Grand Rapids, the gala features dinner, entertainment, and recognition of this year\'s honorees.\n\nThe Van Andel Legacy Awards continue the tradition of Jay and Betty Van Andel\'s commitment to community leadership and philanthropy. Proceeds support the Grand Rapids Public Museum\'s education programs and community initiatives.\n\nEvent Co-Chairs: David & Carol Van Andel, Linsey Gleason',
      date: 'Wednesday, November 12, 2025',
      time: 'Evening Event',
      location: 'JW Marriott Grand Rapids',
      fullAddress: 'JW Marriott Grand Rapids, MI',
      image: 'https://i0.wp.com/www.grpm.org/wp-content/uploads/2025/06/2025_Gala_Web-Header_Option-05.png',
      badge: 'In-Person',
      organizer: {
        name: 'Grand Rapids Public Museum',
        avatar: 'GP',
        description: 'The Grand Rapids Public Museum preserves and celebrates the history, science, and culture of West Michigan through engaging exhibits and community programs.'
      },
      tags: ['Gala', 'Fundraiser', 'Leadership', 'Community', 'Networking'],
      registrationUrl: 'https://www.grpm.org/gala/'
    },
    5: {
      id: 5,
      title: 'UNFILTERED Gen3: Unapologetic Underdogs Unleashed',
      description: 'Born underground. Built on grit. Back, and louder than ever - fearless storytelling with zero vulnerability.',
      fullDescription: 'UNFILTERED returns with Gen3—an evening of raw, authentic storytelling that breaks down barriers and celebrates the underdog spirit.\n\nThis unique event features speakers sharing their unfiltered journeys, struggles, and triumphs. No polish, no pretense—just real stories from real people who\'ve overcome adversity and built something meaningful.\n\nJoin fellow entrepreneurs, creatives, and change-makers at City Built Brewing Company for an evening of connection, inspiration, and community. Tickets are free, with optional donations supporting local non-profits.\n\nCome ready to be inspired, challenged, and reminded that your story matters.',
      date: 'Friday, October 24, 2025',
      time: '7:00 PM - 9:00 PM',
      location: 'City Built Brewing Company',
      fullAddress: '820 Monroe Avenue Northwest #STE 155, Grand Rapids, MI 49503',
      image: 'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1115649073%2F978818167483%2F1%2Foriginal.20250905-182811?crop=focalpoint&fit=crop&w=940&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.557271596548&fp-y=0.544888875326&s=f63fa760ac5800775ace7493cbe92039',
      badge: 'In-Person',
      soldOut: true,
      organizer: {
        name: 'UNFILTERED',
        avatar: 'UF',
        description: 'UNFILTERED creates spaces for authentic storytelling and community connection, celebrating the underdog spirit and real human experiences.'
      },
      tags: ['Storytelling', 'Community', 'Entrepreneurship', 'Inspiration', 'Networking'],
      registrationUrl: 'https://www.eventbrite.com/e/unfiltered-gen3-unapologetic-underdogs-unleashed-tickets-1669603973429'
    },
    6: {
      id: 6,
      title: 'Fuel on the Fire Pitch Competition',
      description: 'A live pitch competition empowering Black-owned businesses with capital, expert support, and visibility.',
      fullDescription: 'Fuel on the Fire is a transformative pitch competition designed to empower Black-owned, for-profit businesses in Kent County.\n\nWatch seven inspiring founders pitch their business growth plans to a panel of expert judges and a live audience. This isn\'t just a competition—it\'s a celebration of Black entrepreneurship and a commitment to economic equity in our community.\n\nWinners receive capital investment, mentorship, and ongoing support to help scale their businesses. Whether you\'re an entrepreneur, investor, or community supporter, this event offers powerful insights into the innovation happening in Grand Rapids\' Black business community.\n\nHosted by Grand Rapids Area Black Businesses at ICCF Community Homes HQ. Free admission.',
      date: 'Wednesday, October 29, 2025',
      time: '5:00 PM - 8:00 PM',
      location: 'ICCF Community Homes HQ',
      fullAddress: '415 M.L.K Jr St SE, Grand Rapids, MI 49507',
      image: 'https://grabblocal.com/wp-content/uploads/FOF.jpeg',
      badge: 'In-Person',
      organizer: {
        name: 'Grand Rapids Area Black Businesses',
        avatar: 'GB',
        description: 'GRABB supports Black-owned businesses through networking, resources, and advocacy, building economic strength in the Grand Rapids community.'
      },
      tags: ['Entrepreneurship', 'Diversity', 'Investment', 'Community', 'Pitch Competition'],
      registrationUrl: 'https://grabblocal.com/event/fuel-on-the-fire2025/'
    },
    7: {
      id: 7,
      title: 'Mastering The Matrix: AI, Innovation & Public Safety',
      description: 'A groundbreaking full-day gathering with national experts exploring how artificial intelligence is reshaping our lives, laws, and liberties.',
      fullDescription: 'Join Scales Consulting LLC, the Michigan Department of Civil Rights, and Kent County ALPACT for "Mastering The Matrix," a transformative full-day conference exploring the intersection of artificial intelligence, innovation, and public safety.\n\nKeynote Address: Renée Cummings, AI Ethicist and Professor at the University of Virginia, will share insights on ethical AI development and its implications for civil rights and justice.\n\nThis comprehensive event features expert panels on AI technology, law enforcement applications, civil rights considerations, and policy development. Attend interactive breakout sessions covering practical AI implementation, ethical frameworks, and community impact.\n\nWhether you\'re a tech leader, public safety official, educator, policy maker, or concerned community member, this conference offers critical insights into how AI is transforming our society. Network with national experts, local leaders, and fellow attendees during the vendor expo.\n\nIncludes breakfast, lunch, networking opportunities, and giveaways. Ages 18+.',
      date: 'Thursday, October 30, 2025',
      time: '7:30 AM - 5:00 PM',
      location: 'GVSU Eberhard Center',
      fullAddress: '301 Fulton St W, Grand Rapids, MI 49504',
      image: 'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1150451263%2F2284555542733%2F1%2Foriginal.20251010-230321?crop=focalpoint&fit=crop&w=940&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.506&fp-y=0.098&s=99803e3fd6bb96e6dee48880e089b619',
      badge: 'In-Person',
      organizer: {
        name: 'Scales Consulting LLC',
        avatar: 'SC',
        description: 'Scales Consulting LLC partners with the Michigan Department of Civil Rights and Kent County ALPACT to advance conversations on AI, innovation, and social justice.'
      },
      tags: ['AI', 'Technology', 'Public Safety', 'Civil Rights', 'Innovation', 'Policy'],
      registrationUrl: 'https://www.eventbrite.com/e/mastering-the-matrix-ai-innovation-public-safety-tickets-1752250060099'
    },
    4: {
      id: 4,
      title: 'Place Matters Summit 2025',
      description: 'Join community leaders from government, business, and nonprofits for meaningful discussions on nurturing vibrant communities and neighborhoods.',
      fullDescription: 'The Place Matters Summit brings together community leaders from government, business, non-profit, and association industries for meaningful discussions on creating vibrant communities.\n\nFeatured Keynote: "Redefining Community: People, Places, Purpose" by Allyson Brunette. This powerful presentation addresses how social institutions are deteriorating due to digital-induced isolation and poor urban design, and offers solutions for rebuilding authentic community connections.\n\nAdditional Session: "Growth, Development, and Community Character: You Can Have it All!" presented by Dan Leonard, Redevelopment Services Director at Michigan Economic Development Corporation. Learn how communities can balance growth with preserving their unique character.\n\nThis summit provides valuable insights and inspiration to take proactive steps in nurturing vibrant communities and neighborhoods across West Michigan. Previous summits have sold out, demonstrating strong community interest in place-making and community development.\n\nOrganized by The Right Place, the regional economic development organization serving Greater Grand Rapids.',
      date: 'Thursday, November 6, 2025',
      time: '12:00 PM - 5:00 PM',
      location: 'The Rockford Corner Bar',
      fullAddress: 'The Rockford Corner Bar, Rockford, MI',
      image: 'https://web.cvent.com/event_guestside_app/_next/image?url=https%3A%2F%2Fimages.cvent.com%2Fc49e750ef94b4a73879b4e57ae9c1393%2Fa261375d7d47fd2cd2c68c3a86dd821f%2Fd978795e378242b5af5233c775c250e4%2Ff65bb8e0f27745f5bcf821b889bc6407!_!eb5aa18403450c956b23c2a0b455af07.jpeg&w=3840&q=75',
      badge: 'In-Person',
      organizer: {
        name: 'The Right Place',
        avatar: 'RP',
        description: 'The Right Place is the regional economic development organization serving Greater Grand Rapids, focused on business growth, talent attraction, and community development.'
      },
      tags: ['Community Development', 'Leadership', 'Networking', 'Urban Planning', 'Economic Development'],
      registrationUrl: 'https://web.cvent.com/event/d978795e-3782-42b5-af52-33c775c250e4/summary'
    },
    8: {
      id: 8,
      title: 'Crain\'s Grand Rapids Business 40 Under 40 Celebration',
      description: 'Join us to celebrate 40 outstanding business professionals under 40 in the Grand Rapids area. An evening of networking and recognition.',
      fullDescription: 'Celebrate the achievements of 40 exceptional business professionals under 40 years old who are shaping the future of Grand Rapids.\n\nThis prestigious evening brings together the region\'s rising leaders, innovators, and change-makers for an unforgettable celebration at the historic Amway Grand Plaza Hotel. Connect with honorees, community leaders, and fellow professionals who are driving economic growth and innovation across West Michigan.\n\nThe event features networking opportunities, recognition of this year\'s honorees, and insights into the trends shaping our business community. Whether you\'re an honoree, business leader, or aspiring professional, this is a must-attend event for anyone invested in the future of Grand Rapids business.\n\nRegistration required. Visit the event website for ticket information and full details.',
      date: 'Wednesday, October 22, 2025',
      time: '5:30 PM - 9:00 PM',
      location: 'Amway Grand Plaza Hotel',
      fullAddress: '187 Monroe Ave NW, Grand Rapids, MI 49503',
      image: 'https://images.cvent.com/81fd802d90fc4485ad7e62818fc2f0f4/pix/cea3e653a8704097b40d96720419d46e!_!ece8983ef528374c785e8d0c594591f1.png?f=webp',
      badge: 'In-Person',
      organizer: {
        name: 'Crain\'s Grand Rapids Business',
        avatar: 'CR',
        description: 'Crain\'s Grand Rapids Business recognizes and celebrates business excellence, leadership, and innovation throughout the Grand Rapids region.'
      },
      tags: ['Business', 'Leadership', 'Networking', 'Awards', 'Young Professionals'],
      registrationUrl: 'https://web.cvent.com/event/585ab6ca-993b-4083-bb73-6a51684dc89a/summary'
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
      compatibility: '92%',
      mutualConnections: 4,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces',
      attending: true
    },
    {
      name: 'Michael Torres',
      title: 'CTO at Airbnb',
      compatibility: '88%',
      mutualConnections: 6,
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=faces',
      attending: true
    },
    {
      name: 'Emily Rodriguez',
      title: 'Product Director at Google',
      compatibility: '85%',
      mutualConnections: 3,
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces',
      attending: true
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab="events" setActiveTab={() => navigate('/dashboard')} />

      <div className="flex-1">
        {/* Header with BudE gradient top bar */}
        <div className="bg-gradient-to-r from-green-600 via-lime-400 to-yellow-400 h-2"></div>

        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-4">
            <button
              onClick={() => navigate('/dashboard', { state: { activeTab: 'events' } })}
              className="flex items-center gap-2 px-4 py-2 bg-[#009900] text-white rounded-lg font-medium hover:bg-[#007700] transition-colors border-[3px] border-[#D0ED00] mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Events</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Event Details</h1>
            <p className="text-gray-600 mt-1">This is a real event. Check it out!</p>
          </div>
        </div>

        <div className="px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Image */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative h-96 bg-gray-100">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
                  {event.badge}
                </div>
                {event.soldOut && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                    SOLD OUT
                  </div>
                )}
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
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="p-2 rounded-full border border-gray-300 text-gray-600 hover:border-gray-400"
                    >
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
                </div>
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

                  <div className="flex gap-3">
                    <Users className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-900">Attendees</div>
                      <div className="text-sm text-[#009900] font-medium">Coming Soon</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggested Connections */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Connect Before the Event</h3>
                <p className="text-gray-600 text-sm mb-4">These people share your interests, take a look</p>
                <div className="space-y-3">
                  {suggestedConnections.map((person, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={person.image}
                        alt={person.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm">{person.name}</h4>
                        <p className="text-xs text-gray-600 line-clamp-1">{person.title}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1 mb-2">
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />{person.compatibility}
                          </span>
                          <span className="text-xs text-blue-500 flex items-center gap-1">
                            <Users className="w-3 h-3" />{person.mutualConnections}
                          </span>
                          {person.attending && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              Attending
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setShowScientistModal(true)}
                          className="w-full px-3 py-1.5 bg-[#009900] text-white rounded-lg text-xs font-medium hover:bg-[#007700] transition-colors border-2 border-[#D0ED00]"
                        >
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

        {/* Banner Ad Section */}
        {(() => {
          const bannerAd = JSON.parse(localStorage.getItem('ad_eventDetailBanner') || 'null');
          if (bannerAd?.image && bannerAd?.url) {
            // Check if ad tags match event tags (if tags exist)
            if (bannerAd.tags) {
              const adTags = bannerAd.tags.split(',').map(t => t.trim().toLowerCase());
              const eventTags = event.tags.map(t => t.toLowerCase());
              const hasMatchingTag = adTags.some(adTag => eventTags.includes(adTag));

              // Only show ad if tags match
              if (!hasMatchingTag) {
                return null;
              }
            }

            return (
              <div className="mt-8 flex justify-center">
                <a
                  href={bannerAd.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={bannerAd.image}
                    alt="Sponsored"
                    className="w-full max-w-[728px] h-auto rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    style={{ aspectRatio: '728/160' }}
                  />
                </a>
              </div>
            );
          }

          // Show placeholder if no ad
          return (
            <div className="mt-8 flex justify-center">
              <div
                onClick={() => setShowAdInquiryModal(true)}
                className="w-full max-w-[728px] rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#D0ED00] transition-all cursor-pointer hover:shadow-md relative overflow-hidden"
                style={{ aspectRatio: '728/160' }}
              >
                <div
                  className="absolute inset-0 bg-cover opacity-30"
                  style={{
                    backgroundImage: 'url(https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/My-phone-blurry-tall-2.jpg)',
                    backgroundPosition: 'center 90%',
                    filter: 'blur(12px)',
                    transform: 'scale(1.1)'
                  }}
                />
                <div className="text-center relative z-10">
                  <p className="text-gray-700 font-bold text-lg">Banner Ad Spot: Click to Inquire</p>
                </div>
              </div>
            </div>
          );
        })()}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Share Event</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-600 mb-6">Share this event with your network</p>

            <div className="space-y-3">
              {/* LinkedIn Share */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-[#0A66C2] text-white rounded-lg hover:bg-[#004182] transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <div className="flex-1">
                  <div className="font-semibold">Share on LinkedIn</div>
                  <div className="text-sm opacity-90">Share with your professional network</div>
                </div>
              </a>

              {/* Facebook Share */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-[#1877F2] text-white rounded-lg hover:bg-[#145dbf] transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <div className="flex-1">
                  <div className="font-semibold">Share on Facebook</div>
                  <div className="text-sm opacity-90">Share with friends and family</div>
                </div>
              </a>

              {/* Copy Link */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                className="flex items-center gap-4 p-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors w-full text-left"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <div className="flex-1">
                  <div className="font-semibold">Copy Link</div>
                  <div className="text-sm text-gray-600">Copy event link to clipboard</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ad Inquiry Modal - matches Dashboard modal */}
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

      {/* Scientist Modal */}
      {showScientistModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowScientistModal(false)}>
          <div className="bg-gradient-to-r from-green-100 to-lime-50 rounded-2xl p-6 max-w-md w-full shadow-2xl border-4 border-[#D0ED00]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowScientistModal(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold"
            >
              ×
            </button>
            <div className="flex items-center justify-center gap-6 mb-6">
              <img
                src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/main/public/scientist-chalkboard.jpg"
                alt="Scientist at work"
                className="h-24 md:h-32 w-auto flex-shrink-0 rounded-lg object-cover shadow-lg"
              />
            </div>
            <p className="text-green-800 font-medium text-base md:text-lg text-center mb-6">
              Our scientists are hard at work finding connections for you. Look for an email from us during Beta testing!
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowScientistModal(false)}
                className="px-6 md:px-8 py-2 md:py-3 bg-[#009900] text-white rounded-lg font-bold hover:bg-[#007700] transition-colors border-2 border-[#D0ED00]"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventDetail;
