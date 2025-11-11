// One-time migration script to populate events table with existing event data
// Run this with: node migrate-events.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vwxqgjkvypxugwtqglzk.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3eHFnamt2eXB4dWd3dHFnbHprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NjkyNDgsImV4cCI6MjA0ODE0NTI0OH0.xVXK-U7K4BXTJnP7dNt3EkMaPYB3d2fghfJKkXXL5CU';

const supabase = createClient(supabaseUrl, supabaseKey);

const events = [
  {
    slot_number: 1,
    title: 'Bamboo Grand Rapids: Grand Opening Celebration',
    short_description: 'Celebrate the grand opening of Bamboo Grand Rapids, a new center for entrepreneurship, creativity, and innovation in downtown Grand Rapids.',
    full_description: 'Join us for the grand opening celebration of Bamboo Grand Rapids - a transformative new entrepreneurship hub in the heart of downtown Grand Rapids!\n\nAfter a year of renovations, the former art gallery at 2 Fulton Street West has been reimagined as a vibrant center for entrepreneurship, creativity, and innovation. This free event offers the first look at our newly reopened gallery, theater, and the new Start Garden incubator facility.\n\nBamboo Grand Rapids is open to everyone - members, neighbors, students, artists, founders, and funders. This celebration marks the beginning of a statewide collaborative entrepreneurship ecosystem, connecting West Michigan to communities across Michigan.\n\nCome meet the tenants and members who will make Bamboo their home, explore the transformed space, and be part of this exciting new chapter in Grand Rapids\' entrepreneurial community.\n\nThis event is made possible through partnerships with the City of Grand Rapids, Michigan Economic Development Corporation, and multiple regional organizations committed to fostering innovation and creativity.',
    date: 'Thursday, December 4, 2025',
    time: '4:00 PM - 8:00 PM',
    location_name: '2 Fulton Street West',
    full_address: '2 Fulton Street West, Grand Rapids, MI 49503',
    image_url: 'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1120287333%2F84709515697%2F1%2Foriginal.20250910-174858?crop=focalpoint&fit=crop&w=940&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.208333333333&fp-y=0.621848739496&s=9f37de221b0249dee8dd7ee347395056',
    event_badge: 'In-Person',
    organization: 'Bamboo',
    organizer_description: 'Bamboo Detroit creates spaces and programs that support entrepreneurs, artists, and innovators across Michigan, fostering a collaborative ecosystem for creativity and business growth.',
    tags: 'Entrepreneurship, Innovation, Startup',
    registration_url: 'https://www.eventbrite.com/e/bamboo-grand-rapids-grand-opening-celebration-tickets-1685330421659',
    is_featured: true
  },
  {
    slot_number: 2,
    title: 'Talent & Inclusion Summit',
    short_description: 'This signature Chamber event brings together executives, HR professionals, and thought leaders focused on workforce development. The 2025 theme is "Unlocking Talent, Inclusion, and Retention for a Stronger West Michigan."',
    full_description: 'Join the Grand Rapids Chamber for the Talent & Inclusion Summit, bringing together executives, HR professionals, and thought leaders focused on workforce development.\n\nThe 2025 theme is "Unlocking Talent, Inclusion, and Retention for a Stronger West Michigan." This signature event explores critical topics including talent acquisition and retention strategies, inclusive leadership and high-performing teams, multi-generational workforce engagement, and navigating difficult workplace conversations.\n\nFeatured Speakers:\n• Isabel Medellin (Steelcase)\n• Jan Harrington Davis (Corewell Health)\n• Ken Bogard (Know Honesty)\n• Ovell Barbee (Ask Ovell)\n\nThe summit features a panel discussion focusing on attraction, retention, and workforce success strategies. This is an essential event for leaders committed to building inclusive, thriving workplace cultures.\n\nPricing: Members $250, Non-Members $300, Corporate Table (10 seats) $2,250',
    date: 'Tuesday, November 11, 2025',
    time: '8:00 AM - 1:00 PM',
    location_name: 'JW Marriott Grand Rapids',
    full_address: '235 Louis St NW, Grand Rapids, MI 49503',
    image_url: 'https://grandrapids.org/wp-content/uploads/2024/10/GRC_TIS-1-2048x1152.jpg',
    event_badge: 'In-Person',
    organization: 'GR Chamber of Commerce',
    organizer_description: 'The Grand Rapids Chamber advocates for business growth, economic development, and inclusive workplace cultures throughout West Michigan.',
    tags: 'Leadership, Diversity & Inclusion, HR, Talent Development, Workforce Development',
    registration_url: 'https://grandrapids.org/event/talent-inclusion-summit/',
    is_featured: true
  },
  {
    slot_number: 3,
    title: '17th Annual Jay & Betty Van Andel Legacy Awards Gala',
    short_description: 'A Prehistoric Party - Annual fundraising gala honoring outstanding leaders throughout West Michigan.',
    full_description: 'Join the Grand Rapids Public Museum for an unforgettable evening at the 17th Annual Jay & Betty Van Andel Legacy Awards Gala, themed "A Prehistoric Party."\n\nThis prestigious event celebrates exceptional leaders who have made lasting contributions to West Michigan\'s business community and quality of life. Hosted at the elegant JW Marriott Grand Rapids, the gala features dinner, entertainment, and recognition of this year\'s honorees.\n\nThe Van Andel Legacy Awards continue the tradition of Jay and Betty Van Andel\'s commitment to community leadership and philanthropy. Proceeds support the Grand Rapids Public Museum\'s education programs and community initiatives.\n\nEvent Co-Chairs: David & Carol Van Andel, Linsey Gleason',
    date: 'Wednesday, November 12, 2025',
    time: 'Evening Event',
    location_name: 'JW Marriott Grand Rapids',
    full_address: 'JW Marriott Grand Rapids, MI',
    image_url: 'https://i0.wp.com/www.grpm.org/wp-content/uploads/2025/06/2025_Gala_Web-Header_Option-05.png',
    event_badge: 'In-Person',
    organization: 'Other',
    organization_custom: 'Grand Rapids Public Museum',
    organizer_description: 'The Grand Rapids Public Museum preserves and celebrates the history, science, and culture of West Michigan through engaging exhibits and community programs.',
    tags: 'Gala, Fundraiser, Leadership, Community, Networking',
    registration_url: 'https://www.grpm.org/gala/',
    is_featured: true
  },
  {
    slot_number: 4,
    title: '2026 Economic Outlook',
    short_description: 'Join economic experts and business leaders for insights into the 2026 economic forecast. Discuss trends, challenges, and opportunities shaping West Michigan\'s business landscape.',
    full_description: 'Join The Right Place for the annual Economic Outlook event, bringing together economic experts and business leaders to discuss the 2026 economic forecast for West Michigan and beyond.\n\nThis essential event provides valuable insights into:\n• National and regional economic trends for 2026\n• Labor market projections and workforce development\n• Industry-specific forecasts and opportunities\n• Real estate and development outlook\n• Key challenges and strategic opportunities for businesses\n\nFeaturing expert presentations and panel discussions with economists, business leaders, and industry analysts who will help you make informed decisions for the year ahead.\n\nWhether you\'re a CEO, business owner, investor, or community leader, the Economic Outlook provides the intelligence you need to navigate the evolving economic landscape and position your organization for success in 2026.\n\nNetworking lunch included. This annual event consistently draws 300+ regional business leaders and typically sells out.\n\nOrganized by The Right Place, the regional economic development organization serving Greater Grand Rapids.',
    date: 'Monday, December 9, 2025',
    time: '11:30 AM - 1:30 PM',
    location_name: 'Amway Grand Plaza Hotel',
    full_address: 'Amway Grand Plaza Hotel, Grand Rapids, MI',
    image_url: 'https://rightplace.nyc3.cdn.digitaloceanspaces.com/production/uploads/images/Economic-Outlook-2026-Email-Header.png',
    event_badge: 'In-Person',
    organization: 'Right Place',
    organizer_description: 'The Right Place is the regional economic development organization serving Greater Grand Rapids, focused on business growth, talent attraction, and community development.',
    tags: 'Economic Forecast, Business Strategy, Leadership, Networking, Regional Development',
    registration_url: 'https://www.rightplace.org/events/economic-outlook-for-2026',
    is_featured: true
  },
  {
    slot_number: 5,
    title: 'WMHCC Conecta Membership Meeting',
    short_description: 'Join the West Michigan Hispanic Chamber of Commerce for the monthly Conecta membership meeting. Network with fellow chamber members and celebrate Hispanic business community achievements.',
    full_description: 'The West Michigan Hispanic Chamber of Commerce invites you to the monthly Conecta membership meeting, hosted by Acrisure.\n\nConecta meetings are designed to bring together Hispanic business owners, entrepreneurs, and professionals from across West Michigan to:\n\n• Network with fellow chamber members\n• Learn about upcoming chamber initiatives and programs\n• Share business opportunities and resources\n• Celebrate achievements within the Hispanic business community\n• Build meaningful connections that drive economic growth\n\nThis month\'s meeting is graciously hosted by Acrisure, a leader in insurance brokerage and risk management. Enjoy light refreshments while connecting with West Michigan\'s vibrant Hispanic business community.\n\nWhether you\'re a long-time member or considering joining the chamber, Conecta meetings provide an excellent opportunity to expand your professional network and contribute to the economic vitality of our region.\n\nFree for WMHCC members. Guest registration available.',
    date: 'Monday, November 25, 2025',
    time: '5:00 PM - 7:00 PM',
    location_name: 'Acrisure',
    full_address: 'Acrisure, Grand Rapids, MI',
    image_url: 'https://chambermaster.blob.core.windows.net/userfiles/UserFiles/chambers/2018/Image/November25Conecta.png',
    event_badge: 'In-Person',
    organization: 'Other',
    organization_custom: 'West Michigan Hispanic Chamber of Commerce',
    organizer_description: 'The West Michigan Hispanic Chamber of Commerce promotes economic development and advocates for Hispanic-owned businesses throughout the region.',
    tags: 'Networking, Hispanic Business, Community, Chamber, Professional Development',
    registration_url: 'https://members.westmihcc.org/events/details/wmhcc-conecta-membership-meeting-hosted-by-acrisure-2908',
    is_featured: false
  },
  {
    slot_number: 6,
    title: 'Gabe Karp – Best-selling Author and Keynote Speaker',
    short_description: 'Globally recognized expert in leadership and high-performance teams. Author of "Don\'t Get Mad at Penguins," presenting his proprietary system for leveraging conflict effectively.',
    full_description: 'Join the Economic Club of Grand Rapids for an insightful luncheon featuring Gabe Karp, globally recognized expert in leadership and high-performance teams.\n\nGabe Karp is the author of the bestselling book "Don\'t Get Mad at Penguins," which presents his proprietary system for leveraging conflict effectively, developed through three decades of research and real-world application.\n\nCurrently serving as an Operating Partner at Detroit Venture Partners, Gabe brings extensive experience from his role as Executive Vice President and General Counsel at ePrize (now Merkle). In 2011, Crain\'s Business named him General Counsel of the Year for Michigan.\n\nHis career began as a trial lawyer specializing in complex commercial and class-action litigation, giving him unique insights into conflict resolution and team dynamics.\n\nThis engaging presentation will explore how leaders can transform workplace conflict into a catalyst for innovation, stronger teams, and organizational success. Perfect for executives, managers, and professionals seeking to enhance their leadership effectiveness.\n\nRegistration includes lunch and networking opportunities. Available in-person or via Zoom livestream. Corporate table packages available.',
    date: 'Monday, November 17, 2025',
    time: '11:30 AM - 1:30 PM',
    location_name: 'JW Marriott Grand Rapids',
    full_address: '235 Louis St NW, Grand Rapids, MI 49503',
    image_url: 'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*x7S7Iiz737OW5qXQGSpy3w.jpeg',
    event_badge: 'In-Person',
    organization: 'Economic Club of Grand Rapids',
    organizer_description: 'The Economic Club of Grand Rapids brings world-class speakers and thought leaders to West Michigan, fostering informed discussion on business, leadership, and economic issues.',
    tags: 'Leadership, Conflict Resolution, Business Strategy, Team Building, Professional Development',
    registration_url: 'https://econclub.net/gabe-karp/',
    is_featured: false
  },
  {
    slot_number: 7,
    title: 'West Michigan Capstone Dinner 2025',
    short_description: 'Celebrating 20 years of Inforum helping women lead and succeed in West Michigan. Featuring fireside chat with Andi Owen, CEO of MillerKnoll.',
    full_description: 'Join Inforum for a milestone celebration marking 20 years of helping women lead and succeed in West Michigan.\n\nThis special Capstone Dinner features an inspiring fireside chat with Andi Owen, President and CEO of MillerKnoll, a collective of dynamic brands with more than 10,000 employees and $3.6 billion in annual revenue.\n\nAndi will share insights from her remarkable leadership journey, discussing how she navigated challenges, built high-performing teams, and created an inclusive culture that drives business success.\n\nThe conversation will be moderated by Tiffany Eubanks-Saunders, Head of Diverse Segments for the Private Bank business at Bank of America.\n\nThis elegant evening celebrates two decades of Inforum\'s impact on women\'s leadership development in West Michigan, while inspiring the next generation of female leaders.\n\nEvent Schedule:\n• 5:30-6:00 PM: Check-in and networking\n• 6:00-7:45 PM: Dinner and program\n\nRegistration required. Visit the event website for pricing and details.\n\nDress: Business professional',
    date: 'Thursday, November 20, 2025',
    time: '5:30 PM - 7:45 PM',
    location_name: 'JW Marriott Grand Rapids',
    full_address: '235 Louis St NW, Grand Rapids, MI 49503',
    image_url: 'https://npr.brightspotcdn.com/dims4/default/ec2181b/2147483647/strip/true/crop/383x214%2B0%2B0/resize/880x492!/quality/90/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2Flegacy%2Fsites%2Fwgvu%2Ffiles%2F201511%2FInforum.jpg',
    event_badge: 'In-Person',
    organization: 'Inforum',
    organizer_description: 'Inforum is Michigan\'s leading membership organization for professional women, dedicated to helping women lead and succeed through connections, programs, and advocacy.',
    tags: 'Women in Leadership, Networking, CEO Insights, Professional Development, Celebration',
    registration_url: 'https://myinforum.app.neoncrm.com/np/clients/myinforum/event.jsp?event=54120',
    is_featured: false
  }
];

async function migrateEvents() {
  console.log('Starting event migration...\n');

  for (const event of events) {
    console.log(`Migrating: ${event.title} (Slot ${event.slot_number})`);

    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select();

    if (error) {
      console.error(`  ❌ Error: ${error.message}`);
    } else {
      console.log(`  ✅ Successfully migrated to slot ${event.slot_number}`);
    }
  }

  console.log('\n✨ Migration complete!');
  process.exit(0);
}

migrateEvents();
