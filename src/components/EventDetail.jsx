import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, MapPin, Heart, ExternalLink, Share2, User, Home, TrendingUp, Users, X, Check } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../contexts/AuthContext.jsx';

function EventDetail() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showAdInquiryModal, setShowAdInquiryModal] = useState(false);
  const [adInquirySubmitted, setAdInquirySubmitted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showScientistModal, setShowScientistModal] = useState(false);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [interestedCount, setInterestedCount] = useState(0);
  const [connectionsInterestedCount, setConnectionsInterestedCount] = useState(0);
  const [isGoing, setIsGoing] = useState(false);
  const [goingCount, setGoingCount] = useState(0);
  const [goingAttendees, setGoingAttendees] = useState([]);
  const [showGoingList, setShowGoingList] = useState(false);
  const [showGoingDisclaimer, setShowGoingDisclaimer] = useState(false);

  // Track user engagement when viewing event details
  useEffect(() => {
    const currentCount = parseInt(localStorage.getItem('userEngagementCount') || '0', 10);
    localStorage.setItem('userEngagementCount', (currentCount + 1).toString());
  }, [eventId]); // Track once per event view

  // Check if non-authenticated user has already viewed content
  useEffect(() => {
    if (!user) {
      const hasViewedPublicContent = sessionStorage.getItem('hasViewedPublicContent');
      if (!hasViewedPublicContent) {
        // First view is free, mark it
        sessionStorage.setItem('hasViewedPublicContent', 'true');
      }
      // Don't show prompt immediately - wait for them to try to navigate
    }
  }, [user, eventId]);

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

  // Load event from Supabase and check if user liked it
  useEffect(() => {
    const loadEvent = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (error) throw error;

        if (data) {
          // Transform data to match expected format
          const transformedEvent = {
            id: data.id,
            title: data.title,
            description: data.short_description,
            fullDescription: data.full_description,
            date: data.date,
            time: data.time,
            location: data.location_name,
            fullAddress: data.full_address,
            image: data.image_url,
            badge: data.event_badge,
            organizer: {
              name: data.organization === 'Other' ? data.organization_custom : data.organization,
              avatar: (data.organization === 'Other' ? data.organization_custom : data.organization)
                ?.split(' ')
                .map(w => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'EO',
              description: data.organizer_description || 'Event organization details'
            },
            tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
            registrationUrl: data.registration_url
          };

          setEvent(transformedEvent);

          // Check if user has liked this event
          if (user) {
            const { data: likeData } = await supabase
              .from('event_likes')
              .select('id')
              .eq('event_id', eventId)
              .eq('user_id', user.id)
              .maybeSingle();

            setIsFavorited(!!likeData);

            // Check if user is marked as "going"
            const { data: attendeeData } = await supabase
              .from('event_attendees')
              .select('id')
              .eq('event_id', eventId)
              .eq('user_id', user.id)
              .maybeSingle();

            setIsGoing(!!attendeeData);
          }

          // Fetch interested count (likes + registration clicks)
          const [likesResult, clicksResult] = await Promise.all([
            supabase
              .from('event_likes')
              .select('id')
              .eq('event_id', eventId),
            supabase
              .from('event_registration_clicks')
              .select('id')
              .eq('event_id', eventId)
          ]);

          const totalInterested = (likesResult.data?.length || 0) + (clicksResult.data?.length || 0);
          setInterestedCount(totalInterested);

          // Fetch "going" count and attendees
          const { data: attendeesData } = await supabase
            .from('event_attendees')
            .select(`
              user_id,
              users!event_attendees_user_id_fkey (
                id,
                first_name,
                last_name,
                name,
                photo
              )
            `)
            .eq('event_id', eventId)
            .eq('status', 'going');

          setGoingCount(attendeesData?.length || 0);

          // Transform attendees data
          const attendeesList = attendeesData?.map(a => ({
            id: a.users.id,
            name: a.users.name || `${a.users.first_name} ${a.users.last_name}`,
            photo: a.users.photo,
            isConnection: false // Will update this below
          })) || [];

          // If user is logged in, mark which attendees are connections
          if (user && attendeesList.length > 0) {
            const { data: connectionsData } = await supabase
              .from('connection_flow')
              .select('matched_user_id')
              .eq('user_id', user.id)
              .eq('status', 'connected');

            const connectionIds = new Set(connectionsData?.map(c => c.matched_user_id) || []);

            attendeesList.forEach(attendee => {
              attendee.isConnection = connectionIds.has(attendee.id);
            });

            // Sort: connections first, then others
            attendeesList.sort((a, b) => {
              if (a.isConnection && !b.isConnection) return -1;
              if (!a.isConnection && b.isConnection) return 1;
              return 0;
            });
          }

          setGoingAttendees(attendeesList);

          // Fetch user's connections who are interested in this event
          if (user) {
            // Get user's connection IDs
            const { data: matchesData } = await supabase
              .from('connection_flow')
              .select('matched_user_id')
              .eq('user_id', user.id);

            const connectionIds = matchesData?.map(m => m.matched_user_id) || [];

            if (connectionIds.length > 0) {
              // Check which connections liked or registered for this event
              const [connLikesResult, connClicksResult] = await Promise.all([
                supabase
                  .from('event_likes')
                  .select('user_id')
                  .eq('event_id', eventId)
                  .in('user_id', connectionIds),
                supabase
                  .from('event_registration_clicks')
                  .select('user_id')
                  .eq('event_id', eventId)
                  .in('user_id', connectionIds)
              ]);

              // Get unique connection IDs who are interested
              const interestedConnectionIds = new Set([
                ...(connLikesResult.data?.map(l => l.user_id) || []),
                ...(connClicksResult.data?.map(c => c.user_id) || [])
              ]);

              setConnectionsInterestedCount(interestedConnectionIds.size);
            }
          }
        }
      } catch (error) {
        console.error('Error loading event:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId, user]);

  // Handle like/unlike
  const handleToggleLike = async () => {
    if (!user) {
      alert('Please sign in to like events');
      return;
    }

    try {
      if (isFavorited) {
        // Unlike: remove from database
        const { error } = await supabase
          .from('event_likes')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (error) throw error;
        setIsFavorited(false);
        setInterestedCount(prev => Math.max(0, prev - 1)); // Update count
      } else {
        // Like: add to database
        const { error } = await supabase
          .from('event_likes')
          .insert({
            event_id: eventId,
            user_id: user.id
          });

        if (error) throw error;
        setIsFavorited(true);
        setInterestedCount(prev => prev + 1); // Update count
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to update like status');
    }
  };

  // Handle going/not going
  const handleToggleGoing = async () => {
    if (!user) {
      alert('Please sign in to mark yourself as going');
      return;
    }

    try {
      if (isGoing) {
        // Remove from attendees
        const { error } = await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (error) throw error;
        setIsGoing(false);
        setGoingCount(prev => Math.max(0, prev - 1));

        // Remove from attendees list
        setGoingAttendees(prev => prev.filter(a => a.id !== user.id));
      } else {
        // Add to attendees
        const { error } = await supabase
          .from('event_attendees')
          .insert({
            event_id: eventId,
            user_id: user.id,
            status: 'going'
          });

        if (error) throw error;
        setIsGoing(true);
        setGoingCount(prev => prev + 1);

        // Show disclaimer
        setShowGoingDisclaimer(true);
        setTimeout(() => setShowGoingDisclaimer(false), 5000);

        // Add to attendees list (fetch user data to display)
        const { data: userData } = await supabase
          .from('users')
          .select('id, first_name, last_name, name, photo')
          .eq('id', user.id)
          .single();

        if (userData) {
          const newAttendee = {
            id: userData.id,
            name: userData.name || `${userData.first_name} ${userData.last_name}`,
            photo: userData.photo,
            isConnection: false // Current user
          };
          setGoingAttendees(prev => [newAttendee, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error toggling going status:', error);
      alert('Failed to update going status');
    }
  };

  // Track Register Now button clicks
  const handleRegisterClick = async () => {
    if (user) {
      try {
        // Record the click (will be ignored if already exists due to unique constraint)
        await supabase
          .from('event_registration_clicks')
          .insert({
            event_id: eventId,
            user_id: user.id
          });
      } catch (error) {
        // Silently fail - don't block user from registering
        console.log('Registration click already recorded or error:', error);
      }
    }
    // Button will open the registration URL via its href
  };

  // Fallback event data for backward compatibility (can be removed after migration)
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
      title: 'Talent & Inclusion Summit',
      description: 'This signature Chamber event brings together executives, HR professionals, and thought leaders focused on workforce development. The 2025 theme is "Unlocking Talent, Inclusion, and Retention for a Stronger West Michigan."',
      fullDescription: 'Join the Grand Rapids Chamber for the Talent & Inclusion Summit, bringing together executives, HR professionals, and thought leaders focused on workforce development.\n\nThe 2025 theme is "Unlocking Talent, Inclusion, and Retention for a Stronger West Michigan." This signature event explores critical topics including talent acquisition and retention strategies, inclusive leadership and high-performing teams, multi-generational workforce engagement, and navigating difficult workplace conversations.\n\nFeatured Speakers:\n• Isabel Medellin (Steelcase)\n• Jan Harrington Davis (Corewell Health)\n• Ken Bogard (Know Honesty)\n• Ovell Barbee (Ask Ovell)\n\nThe summit features a panel discussion focusing on attraction, retention, and workforce success strategies. This is an essential event for leaders committed to building inclusive, thriving workplace cultures.\n\nPricing: Members $250, Non-Members $300, Corporate Table (10 seats) $2,250',
      date: 'Tuesday, November 11, 2025',
      time: '8:00 AM - 1:00 PM',
      location: 'JW Marriott Grand Rapids',
      fullAddress: '235 Louis St NW, Grand Rapids, MI 49503',
      image: 'https://grandrapids.org/wp-content/uploads/2024/10/GRC_TIS-1-2048x1152.jpg',
      badge: 'In-Person',
      organizer: {
        name: 'Grand Rapids Chamber',
        avatar: 'GR',
        description: 'The Grand Rapids Chamber advocates for business growth, economic development, and inclusive workplace cultures throughout West Michigan.'
      },
      tags: ['Leadership', 'Diversity & Inclusion', 'HR', 'Talent Development', 'Workforce Development'],
      registrationUrl: 'https://grandrapids.org/event/talent-inclusion-summit/'
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
      title: 'WMHCC Conecta Membership Meeting',
      description: 'Join the West Michigan Hispanic Chamber of Commerce for the monthly Conecta membership meeting. Network with fellow chamber members and celebrate Hispanic business community achievements.',
      fullDescription: 'The West Michigan Hispanic Chamber of Commerce invites you to the monthly Conecta membership meeting, hosted by Acrisure.\n\nConecta meetings are designed to bring together Hispanic business owners, entrepreneurs, and professionals from across West Michigan to:\n\n• Network with fellow chamber members\n• Learn about upcoming chamber initiatives and programs\n• Share business opportunities and resources\n• Celebrate achievements within the Hispanic business community\n• Build meaningful connections that drive economic growth\n\nThis month\'s meeting is graciously hosted by Acrisure, a leader in insurance brokerage and risk management. Enjoy light refreshments while connecting with West Michigan\'s vibrant Hispanic business community.\n\nWhether you\'re a long-time member or considering joining the chamber, Conecta meetings provide an excellent opportunity to expand your professional network and contribute to the economic vitality of our region.\n\nFree for WMHCC members. Guest registration available.',
      date: 'Monday, November 25, 2025',
      time: '5:00 PM - 7:00 PM',
      location: 'Acrisure',
      fullAddress: 'Acrisure, Grand Rapids, MI',
      image: 'https://chambermaster.blob.core.windows.net/userfiles/UserFiles/chambers/2018/Image/November25Conecta.png',
      badge: 'In-Person',
      organizer: {
        name: 'West Michigan Hispanic Chamber of Commerce',
        avatar: 'WM',
        description: 'The West Michigan Hispanic Chamber of Commerce promotes economic development and advocates for Hispanic-owned businesses throughout the region.'
      },
      tags: ['Networking', 'Hispanic Business', 'Community', 'Chamber', 'Professional Development'],
      registrationUrl: 'https://members.westmihcc.org/events/details/wmhcc-conecta-membership-meeting-hosted-by-acrisure-2908'
    },
    6: {
      id: 6,
      title: 'Gabe Karp – Best-selling Author and Keynote Speaker',
      description: 'Globally recognized expert in leadership and high-performance teams. Author of "Don\'t Get Mad at Penguins," presenting his proprietary system for leveraging conflict effectively.',
      fullDescription: 'Join the Economic Club of Grand Rapids for an insightful luncheon featuring Gabe Karp, globally recognized expert in leadership and high-performance teams.\n\nGabe Karp is the author of the bestselling book "Don\'t Get Mad at Penguins," which presents his proprietary system for leveraging conflict effectively, developed through three decades of research and real-world application.\n\nCurrently serving as an Operating Partner at Detroit Venture Partners, Gabe brings extensive experience from his role as Executive Vice President and General Counsel at ePrize (now Merkle). In 2011, Crain\'s Business named him General Counsel of the Year for Michigan.\n\nHis career began as a trial lawyer specializing in complex commercial and class-action litigation, giving him unique insights into conflict resolution and team dynamics.\n\nThis engaging presentation will explore how leaders can transform workplace conflict into a catalyst for innovation, stronger teams, and organizational success. Perfect for executives, managers, and professionals seeking to enhance their leadership effectiveness.\n\nRegistration includes lunch and networking opportunities. Available in-person or via Zoom livestream. Corporate table packages available.',
      date: 'Monday, November 17, 2025',
      time: '11:30 AM - 1:30 PM',
      location: 'JW Marriott Grand Rapids',
      fullAddress: '235 Louis St NW, Grand Rapids, MI 49503',
      image: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*x7S7Iiz737OW5qXQGSpy3w.jpeg',
      badge: 'In-Person',
      organizer: {
        name: 'Economic Club of Grand Rapids',
        avatar: 'EC',
        description: 'The Economic Club of Grand Rapids brings world-class speakers and thought leaders to West Michigan, fostering informed discussion on business, leadership, and economic issues.'
      },
      tags: ['Leadership', 'Conflict Resolution', 'Business Strategy', 'Team Building', 'Professional Development'],
      registrationUrl: 'https://econclub.net/gabe-karp/'
    },
    7: {
      id: 7,
      title: 'West Michigan Capstone Dinner 2025',
      description: 'Celebrating 20 years of Inforum helping women lead and succeed in West Michigan. Featuring fireside chat with Andi Owen, CEO of MillerKnoll.',
      fullDescription: 'Join Inforum for a milestone celebration marking 20 years of helping women lead and succeed in West Michigan.\n\nThis special Capstone Dinner features an inspiring fireside chat with Andi Owen, President and CEO of MillerKnoll, a collective of dynamic brands with more than 10,000 employees and $3.6 billion in annual revenue.\n\nAndi will share insights from her remarkable leadership journey, discussing how she navigated challenges, built high-performing teams, and created an inclusive culture that drives business success.\n\nThe conversation will be moderated by Tiffany Eubanks-Saunders, Head of Diverse Segments for the Private Bank business at Bank of America.\n\nThis elegant evening celebrates two decades of Inforum\'s impact on women\'s leadership development in West Michigan, while inspiring the next generation of female leaders.\n\nEvent Schedule:\n• 5:30-6:00 PM: Check-in and networking\n• 6:00-7:45 PM: Dinner and program\n\nRegistration required. Visit the event website for pricing and details.\n\nDress: Business professional',
      date: 'Thursday, November 20, 2025',
      time: '5:30 PM - 7:45 PM',
      location: 'JW Marriott Grand Rapids',
      fullAddress: '235 Louis St NW, Grand Rapids, MI 49503',
      image: 'https://npr.brightspotcdn.com/dims4/default/ec2181b/2147483647/strip/true/crop/383x214%2B0%2B0/resize/880x492!/quality/90/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2Flegacy%2Fsites%2Fwgvu%2Ffiles%2F201511%2FInforum.jpg',
      badge: 'In-Person',
      organizer: {
        name: 'Inforum',
        avatar: 'IF',
        description: 'Inforum is Michigan\'s leading membership organization for professional women, dedicated to helping women lead and succeed through connections, programs, and advocacy.'
      },
      tags: ['Women in Leadership', 'Networking', 'CEO Insights', 'Professional Development', 'Celebration'],
      registrationUrl: 'https://myinforum.app.neoncrm.com/np/clients/myinforum/event.jsp?event=54120'
    },
    4: {
      id: 4,
      title: '2026 Economic Outlook',
      description: 'Join economic experts and business leaders for insights into the 2026 economic forecast. Discuss trends, challenges, and opportunities shaping West Michigan\'s business landscape.',
      fullDescription: 'Join The Right Place for the annual Economic Outlook event, bringing together economic experts and business leaders to discuss the 2026 economic forecast for West Michigan and beyond.\n\nThis essential event provides valuable insights into:\n• National and regional economic trends for 2026\n• Labor market projections and workforce development\n• Industry-specific forecasts and opportunities\n• Real estate and development outlook\n• Key challenges and strategic opportunities for businesses\n\nFeaturing expert presentations and panel discussions with economists, business leaders, and industry analysts who will help you make informed decisions for the year ahead.\n\nWhether you\'re a CEO, business owner, investor, or community leader, the Economic Outlook provides the intelligence you need to navigate the evolving economic landscape and position your organization for success in 2026.\n\nNetworking lunch included. This annual event consistently draws 300+ regional business leaders and typically sells out.\n\nOrganized by The Right Place, the regional economic development organization serving Greater Grand Rapids.',
      date: 'Monday, December 9, 2025',
      time: '11:30 AM - 1:30 PM',
      location: 'Amway Grand Plaza Hotel',
      fullAddress: 'Amway Grand Plaza Hotel, Grand Rapids, MI',
      image: 'https://rightplace.nyc3.cdn.digitaloceanspaces.com/production/uploads/images/Economic-Outlook-2026-Email-Header.png',
      badge: 'In-Person',
      organizer: {
        name: 'The Right Place',
        avatar: 'RP',
        description: 'The Right Place is the regional economic development organization serving Greater Grand Rapids, focused on business growth, talent attraction, and community development.'
      },
      tags: ['Economic Forecast', 'Business Strategy', 'Leadership', 'Networking', 'Regional Development'],
      registrationUrl: 'https://www.rightplace.org/events/economic-outlook-for-2026'
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Show error if event not found
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Suggested connections - currently disabled (will show real connections in future)
  const suggestedConnections = [];

  return (
    <>
      {/* Dynamic Meta Tags for Social Sharing */}
      {event && (
        <Helmet>
          <title>{event.title} | Networking BudE</title>
          <meta name="description" content={event.description || `Join us for ${event.title} - Find your networking buddy and never attend events alone!`} />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content={`https://www.networkingbude.com/events/${eventId}`} />
          <meta property="og:title" content={event.title} />
          <meta property="og:description" content={event.description || `Join us for ${event.title} on Networking BudE`} />
          <meta property="og:image" content={event.image || 'https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/BudE-Color-Logo-Rev.png'} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:site_name" content="Networking BudE" />

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:url" content={`https://www.networkingbude.com/events/${eventId}`} />
          <meta name="twitter:title" content={event.title} />
          <meta name="twitter:description" content={event.description || `Join us for ${event.title} on Networking BudE`} />
          <meta name="twitter:image" content={event.image || 'https://raw.githubusercontent.com/JeffHillGR/networking-bude/refs/heads/main/public/BudE-Color-Logo-Rev.png'} />

          {/* LinkedIn - uses Open Graph tags */}
        </Helmet>
      )}

      {/* Top banner matching site header - spans full width */}
      <div className="bg-gradient-to-r from-[#D0ED00] via-[#009900] to-[#D0ED00] text-white px-4 py-1 text-center text-sm md:text-base">
        <span className="font-medium">
          Welcome to Networking BudE
        </span>
      </div>

      <div className="flex min-h-screen bg-gray-50">
        <Sidebar activeTab="events" setActiveTab={(tab) => {
          if (!user && sessionStorage.getItem('hasViewedPublicContent')) {
            setShowSignupPrompt(true);
          } else {
            navigate('/dashboard');
          }
        }} />

        <div className="flex-1">
          <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-4">
            <button
              onClick={() => {
                if (!user && sessionStorage.getItem('hasViewedPublicContent')) {
                  setShowSignupPrompt(true);
                } else {
                  navigate('/dashboard', { state: { activeTab: 'events' } });
                }
              }}
              className="flex items-center gap-2 text-[#009900] hover:text-[#007700] font-medium mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to All Events</span>
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
                      onClick={handleToggleLike}
                      className={`p-2 rounded-full border transition-colors ${
                        isFavorited
                          ? 'bg-red-50 border-red-500 text-red-500'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                      title={isFavorited ? 'Unlike event' : 'Like event'}
                    >
                      <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={handleToggleGoing}
                      className={`p-2 rounded-full border transition-all group relative ${
                        isGoing
                          ? 'bg-green-50 border-[#009900] text-[#009900]'
                          : 'border-gray-300 text-gray-600 hover:border-[#009900] hover:bg-green-50 hover:text-[#009900] hover:scale-110'
                      }`}
                      title={isGoing ? 'Not going' : "I'm going"}
                    >
                      <Check className={`w-5 h-5 ${isGoing ? 'stroke-2' : ''}`} />
                      {/* Custom tooltip */}
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-[#009900] text-white text-base font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {isGoing ? 'Not going' : "I'm going"}
                      </span>
                    </button>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="p-2 rounded-full border border-gray-300 text-gray-600 hover:border-gray-400"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Going Disclaimer */}
                {showGoingDisclaimer && (
                  <div className="mb-4 p-3 bg-gray-100 rounded-lg border border-gray-300">
                    <p className="text-sm text-gray-600 text-center">
                      This does not register you for the event. Please use the organizer's REGISTER button for registration details.
                    </p>
                  </div>
                )}

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
                  onClick={handleRegisterClick}
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

                  {/* Trending Badge */}
                  {(interestedCount >= 5 || goingCount >= 5) && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                      <span className="text-sm font-semibold text-orange-700">Trending Event</span>
                    </div>
                  )}

                  {interestedCount > 0 && (
                    <div className="flex gap-3">
                      <Heart className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-gray-900">{interestedCount} Interested</div>
                        {connectionsInterestedCount > 0 && (
                          <div className="text-sm text-gray-600">
                            {connectionsInterestedCount} Of Your Connections Showed Interest
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {goingCount > 0 && (
                    <div className="flex gap-3">
                      <Check className="w-5 h-5 text-[#009900] flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <button
                          onClick={() => setShowGoingList(!showGoingList)}
                          className="font-semibold text-[#009900] hover:text-[#007700] transition-colors text-left flex items-center gap-2"
                        >
                          {goingCount === 1 ? '1 person is going' : `${goingCount} people are going`}
                          <span className="text-xs text-gray-500">▼</span>
                        </button>
                        {showGoingList && goingAttendees.length > 0 && (
                          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                            {goingAttendees.slice(0, 10).map((attendee, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                {attendee.photo ? (
                                  <img
                                    src={attendee.photo}
                                    alt={attendee.name}
                                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-[#009900] flex items-center justify-center text-white text-xs font-bold">
                                    {attendee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </div>
                                )}
                                <span className="text-gray-900">
                                  {attendee.name}
                                  {attendee.isConnection && (
                                    <span className="ml-2 text-xs text-[#009900]">(Your connection)</span>
                                  )}
                                </span>
                              </div>
                            ))}
                            {goingAttendees.length > 10 && (
                              <div className="text-sm text-gray-500 italic">
                                + {goingAttendees.length - 10} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Suggested Connections - Hidden for now, will add when event attendance tracking is live */}
              {suggestedConnections.length > 0 && (
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
              )}
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
                    backgroundPosition: 'center 90%'
                  }}
                />
                <div className="text-center relative z-10">
                </div>
              </div>
            </div>
          );
        })()}
        </div>
        </div>
      </div>

      {/* Share Event Modal */}
      {showShareModal && event && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setShowShareModal(false);
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
              <p className="text-sm text-gray-600">{event.title}</p>
            </div>

            {/* Link Display with Copy Button */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm text-gray-500 mb-1">Event Link:</p>
                  <p className="text-sm font-mono text-gray-900 truncate">{`https://www.networkingbude.com/api/share/${eventId}`}</p>
                </div>
                <button
                  onClick={() => {
                    try {
                      const shareUrl = `https://www.networkingbude.com/api/share/${eventId}`;
                      if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(shareUrl).then(() => {
                          setLinkCopied(true);
                          setTimeout(() => setLinkCopied(false), 2000);
                        }).catch(() => {
                          prompt('Copy this link:', shareUrl);
                        });
                      } else {
                        prompt('Copy this link:', shareUrl);
                      }
                    } catch (err) {
                      const shareUrl = `https://www.networkingbude.com/api/share/${eventId}`;
                      prompt('Copy this link:', shareUrl);
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
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://www.networkingbude.com/api/share/${eventId}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-lg hover:bg-[#006399] transition-colors text-sm"
                >
                  LinkedIn
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://www.networkingbude.com/api/share/${eventId}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#145dbf] transition-colors text-sm"
                >
                  Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://www.networkingbude.com/api/share/${eventId}`)}&text=${encodeURIComponent('Check out this event: ' + event.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                >
                  X
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent('Check out this event: ' + event.title)}&body=${encodeURIComponent('I thought you might be interested in this event:\n\n' + event.title + '\n\n' + `https://www.networkingbude.com/api/share/${eventId}`)}`}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Email
                </a>
              </div>
            </div>

            <button
              onClick={() => {
                setShowShareModal(false);
                setLinkCopied(false);
              }}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
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

      {/* Signup Prompt Modal for Non-Authenticated Users */}
      {showSignupPrompt && !user && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl border-4 border-[#D0ED00]">
            <div className="text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-lime-500 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Create an Account for Full Access</h2>
              <p className="text-gray-600 mb-6">
                It only takes 2 minutes to join our networking community and unlock all events and content!
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-[#009900] text-white py-3 rounded-lg font-bold hover:bg-[#007700] transition-colors border-[3px] border-[#D0ED00] mb-3"
              >
                Create Account
              </button>
              <button
                onClick={() => setShowSignupPrompt(false)}
                className="text-gray-500 text-sm hover:text-gray-700"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EventDetail;
