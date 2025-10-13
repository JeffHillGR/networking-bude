import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Heart, ExternalLink, Share2, User, Home, TrendingUp, Users } from 'lucide-react';
import Sidebar from './Sidebar.jsx';

function EventDetail() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [isFavorited, setIsFavorited] = useState(false);

  // Load admin-created events from localStorage
  const adminEvents = JSON.parse(localStorage.getItem('adminEvents') || '[]');

  // Real event data - Grand Rapids networking events
  const defaultEventData = {
    1: {
      id: 1,
      title: 'Salim Ismail – Founder, OpenExO and Author',
      description: 'Business strategist speaking about innovation and exponential technologies. Founder of OpenExO with experience working with Procter & Gamble, HP, and Visa.',
      fullDescription: 'Join The Economic Club of Grand Rapids for an inspiring presentation by Salim Ismail, a leading voice in exponential technologies and business innovation.\n\nSalim Ismail speaks globally about how organizations can leverage exponential technologies to transform their business models. As Founder of OpenExO, he helps companies understand and implement strategies for exponential growth. This is a rare opportunity to learn from someone who has advised Fortune 500 companies on navigating rapid technological change and building future-ready organizations.\n\nAvailable in-person at the JW Marriott or via Zoom livestream.',
      date: 'Monday, October 20, 2025',
      time: '11:30 AM - 1:30 PM',
      location: 'JW Marriott Grand Rapids',
      fullAddress: 'International Ballroom, JW Marriott, Grand Rapids, MI',
      image: 'https://econclub.net/wp-content/uploads/2025/06/Salim-Ismail-cropped.jpg',
      badge: 'In-Person',
      organizer: {
        name: 'The Economic Club of Grand Rapids',
        avatar: 'EC',
        description: 'The Economic Club brings world-class speakers to Grand Rapids to inspire business leaders and drive community dialogue on critical issues.'
      },
      tags: ['Innovation', 'Technology', 'Leadership', 'Business Strategy', 'Networking'],
      registrationUrl: 'https://econclub.net/salim-ismail/'
    },
    2: {
      id: 2,
      title: 'OutPro Forum',
      description: 'Building Belonging: The OutPro Journey - A networking forum featuring Rick Baker discussing the history and impact of OutPro for LGBTQIA+ professionals.',
      fullDescription: 'Join the Grand Rapids Chamber for "Building Belonging: The OutPro Journey," a powerful networking forum exploring workplace inclusion and professional development for LGBTQIA+ professionals.\n\nRick Baker, President & CEO of the Grand Rapids Chamber, will share insights on OutPro\'s evolution and its vital role in creating more inclusive workplaces across West Michigan. This forum brings together business leaders, HR professionals, and community members committed to fostering belonging in professional environments.\n\nConnect with allies and advocates while learning practical strategies for building truly inclusive organizations.',
      date: 'Wednesday, October 22, 2025',
      time: '11:00 AM - 1:00 PM',
      location: 'Grand Rapids Chamber',
      fullAddress: '250 Monroe Ave, Grand Rapids, MI 49503',
      image: 'https://grandrapids.org/wp-content/uploads/2025/01/Graphic-OutPro-10.22.25-1-1024x576.jpg',
      badge: 'In-Person',
      organizer: {
        name: 'Grand Rapids Chamber',
        avatar: 'GR',
        description: 'The Grand Rapids Chamber advocates for business growth, economic development, and inclusive workplace cultures throughout West Michigan.'
      },
      tags: ['Diversity', 'Inclusion', 'LGBTQIA+', 'Networking', 'Leadership'],
      registrationUrl: 'https://grandrapids.org/event/outpro-forum-2025-10-22/'
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
      title: 'The Work Continues: Practical Strategies for Moving Forward',
      description: 'Interactive panel with leaders from law, economic development, HR, and corporate DEI discussing practical DEIB strategies.',
      fullDescription: '"The Work Continues" brings together diverse leaders for an interactive panel discussion on advancing diversity, equity, inclusion, accessibility, and belonging in today\'s workplace.\n\nFeaturing experts from law, economic development, human resources, and corporate DEI, this session focuses on practical, solutions-driven approaches that organizations can implement immediately. This isn\'t about theory—it\'s about actionable strategies that create real change.\n\nWhether you\'re a business leader, HR professional, or passionate about workplace equity, you\'ll leave with concrete tools and renewed commitment to building truly inclusive organizations.\n\nHosted by WMPRSA at GVSU\'s Eberhard Center. Networking reception follows the panel discussion.',
      date: 'Thursday, November 20, 2025',
      time: '4:00 PM - 6:30 PM',
      location: 'GVSU LV Eberhard Center',
      fullAddress: '301 Fulton Street West, Grand Rapids, MI 49504',
      image: 'http://static1.squarespace.com/static/611fc8eea9a27a5d31b728c2/t/68a8ada0fe9c916beba849cf/1757706567516/SaboPR-Logo-Blue.png?format=1500w',
      badge: 'In-Person',
      organizer: {
        name: 'WMPRSA',
        avatar: 'WP',
        description: 'West Michigan Public Relations Society of America connects PR professionals and advocates for diversity, equity, and inclusion in communications.'
      },
      tags: ['DEI', 'Leadership', 'HR', 'Workplace Culture', 'Professional Development'],
      registrationUrl: 'https://lp.constantcontactpages.com/ev/reg/a7a5tp8'
    },
    8: {
      id: 8,
      title: 'Swing Dance at the Public Museum',
      description: 'Swing dancing returns to the Grand Rapids Public Museum featuring two dance areas, beginner lessons, and special guest instructors.',
      fullDescription: 'Swing dancing is back at the Grand Rapids Public Museum! Join hundreds of dancers every Tuesday evening for West Michigan\'s premier swing dance social.\n\nThis isn\'t your typical networking event—it\'s a chance to connect through movement, music, and shared joy. With two dance areas accommodating different skill levels, beginner lessons included, and special guest instructors, everyone is welcome regardless of experience.\n\nNo partner needed, all ages welcome. Whether you\'re a seasoned dancer or have two left feet, you\'ll find a welcoming community ready to show you the ropes. It\'s networking with a twist—literally!\n\nThis weekly event runs every Tuesday through April 2026. Come for the dancing, stay for the connections.',
      date: 'Tuesday, October 28, 2025',
      time: '7:00 PM - 9:00 PM',
      location: 'Grand Rapids Public Museum',
      fullAddress: '272 Pearl St NW, Grand Rapids, MI 49503',
      image: 'https://secure.meetupstatic.com/photos/event/a/4/3/6/highres_530382038.webp?w=3840',
      badge: 'In-Person',
      organizer: {
        name: 'GR Swing Society',
        avatar: 'GS',
        description: 'GR Swing Society promotes swing dancing in West Michigan through weekly socials, workshops, and special events, building community through dance.'
      },
      tags: ['Social', 'Dancing', 'Community', 'All Ages', 'Networking'],
      registrationUrl: 'https://www.meetup.com/grswing/events/311448849/'
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
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-[#009900] text-white rounded-lg font-medium hover:bg-[#007700] transition-colors border-[3px] border-[#D0ED00] mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
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
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 relative group">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Suggested Connections Attending</h3>
              <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4">Connect with these professionals who are also attending this event</p>
              <div className="space-y-3 md:space-y-4">
                {suggestedConnections.map((person, index) => (
                  <div key={index} className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <img
                      src={person.image}
                      alt={person.name}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm md:text-base">{person.name}</h4>
                      <p className="text-xs md:text-sm text-gray-600 truncate">{person.title}</p>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
                        <span className="text-xs text-green-600 flex items-center gap-1"><TrendingUp className="w-3 h-3" />{person.compatibility} compatible</span>
                        <span className="text-xs text-blue-500 flex items-center gap-1"><Users className="w-3 h-3" />{person.mutualConnections} mutual</span>
                        {person.attending && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            Attending
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="w-full md:w-auto px-4 py-2 bg-[#009900] text-white rounded-lg font-medium hover:bg-[#007700] flex-shrink-0 text-sm md:text-base">
                      Connect
                    </button>
                  </div>
                ))}
              </div>

              {/* Beta Testing Hover Message */}
              <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none z-10">
                <div className="bg-gradient-to-r from-green-100 to-lime-50 rounded-2xl p-4 md:p-6 max-w-2xl mx-4 flex flex-col md:flex-row items-center gap-3 md:gap-4 shadow-2xl border-4 border-[#D0ED00]">
                  <img
                    src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/main/public/scientist-chalkboard.jpg"
                    alt="Scientist at work"
                    className="h-16 md:h-24 w-auto flex-shrink-0 rounded-lg object-cover"
                  />
                  <p className="text-green-800 font-medium text-sm md:text-base text-center md:text-left">
                    Our scientists are hard at work finding connections for you. Look for an email from us soon!
                  </p>
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
