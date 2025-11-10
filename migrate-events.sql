-- Migration SQL to populate events table with existing event data
-- Run this in Supabase SQL Editor

INSERT INTO events (slot_number, title, short_description, full_description, date, time, location_name, full_address, image_url, event_badge, organization, organization_custom, organizer_description, tags, registration_url, is_featured) VALUES

(1, 'Bamboo Grand Rapids: Grand Opening Celebration',
'Celebrate the grand opening of Bamboo Grand Rapids, a new center for entrepreneurship, creativity, and innovation in downtown Grand Rapids.',
'Join us for the grand opening celebration of Bamboo Grand Rapids - a transformative new entrepreneurship hub in the heart of downtown Grand Rapids!

After a year of renovations, the former art gallery at 2 Fulton Street West has been reimagined as a vibrant center for entrepreneurship, creativity, and innovation. This free event offers the first look at our newly reopened gallery, theater, and the new Start Garden incubator facility.

Bamboo Grand Rapids is open to everyone - members, neighbors, students, artists, founders, and funders. This celebration marks the beginning of a statewide collaborative entrepreneurship ecosystem, connecting West Michigan to communities across Michigan.

Come meet the tenants and members who will make Bamboo their home, explore the transformed space, and be part of this exciting new chapter in Grand Rapids'' entrepreneurial community.

This event is made possible through partnerships with the City of Grand Rapids, Michigan Economic Development Corporation, and multiple regional organizations committed to fostering innovation and creativity.',
'Thursday, December 4, 2025', '4:00 PM - 8:00 PM', '2 Fulton Street West', '2 Fulton Street West, Grand Rapids, MI 49503',
'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1120287333%2F84709515697%2F1%2Foriginal.20250910-174858?crop=focalpoint&fit=crop&w=940&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.208333333333&fp-y=0.621848739496&s=9f37de221b0249dee8dd7ee347395056',
'In-Person', 'Bamboo', NULL, 'Bamboo Detroit creates spaces and programs that support entrepreneurs, artists, and innovators across Michigan, fostering a collaborative ecosystem for creativity and business growth.',
'Entrepreneurship, Innovation, Startup', 'https://www.eventbrite.com/e/bamboo-grand-rapids-grand-opening-celebration-tickets-1685330421659', true),

(2, 'Talent & Inclusion Summit',
'This signature Chamber event brings together executives, HR professionals, and thought leaders focused on workforce development. The 2025 theme is "Unlocking Talent, Inclusion, and Retention for a Stronger West Michigan."',
'Join the Grand Rapids Chamber for the Talent & Inclusion Summit, bringing together executives, HR professionals, and thought leaders focused on workforce development.

The 2025 theme is "Unlocking Talent, Inclusion, and Retention for a Stronger West Michigan." This signature event explores critical topics including talent acquisition and retention strategies, inclusive leadership and high-performing teams, multi-generational workforce engagement, and navigating difficult workplace conversations.

Featured Speakers:
• Isabel Medellin (Steelcase)
• Jan Harrington Davis (Corewell Health)
• Ken Bogard (Know Honesty)
• Ovell Barbee (Ask Ovell)

The summit features a panel discussion focusing on attraction, retention, and workforce success strategies. This is an essential event for leaders committed to building inclusive, thriving workplace cultures.

Pricing: Members $250, Non-Members $300, Corporate Table (10 seats) $2,250',
'Tuesday, November 11, 2025', '8:00 AM - 1:00 PM', 'JW Marriott Grand Rapids', '235 Louis St NW, Grand Rapids, MI 49503',
'https://grandrapids.org/wp-content/uploads/2024/10/GRC_TIS-1-2048x1152.jpg',
'In-Person', 'GR Chamber of Commerce', NULL, 'The Grand Rapids Chamber advocates for business growth, economic development, and inclusive workplace cultures throughout West Michigan.',
'Leadership, Diversity & Inclusion, HR, Talent Development, Workforce Development', 'https://grandrapids.org/event/talent-inclusion-summit/', true),

(3, '17th Annual Jay & Betty Van Andel Legacy Awards Gala',
'A Prehistoric Party - Annual fundraising gala honoring outstanding leaders throughout West Michigan.',
'Join the Grand Rapids Public Museum for an unforgettable evening at the 17th Annual Jay & Betty Van Andel Legacy Awards Gala, themed "A Prehistoric Party."

This prestigious event celebrates exceptional leaders who have made lasting contributions to West Michigan''s business community and quality of life. Hosted at the elegant JW Marriott Grand Rapids, the gala features dinner, entertainment, and recognition of this year''s honorees.

The Van Andel Legacy Awards continue the tradition of Jay and Betty Van Andel''s commitment to community leadership and philanthropy. Proceeds support the Grand Rapids Public Museum''s education programs and community initiatives.

Event Co-Chairs: David & Carol Van Andel, Linsey Gleason',
'Wednesday, November 12, 2025', 'Evening Event', 'JW Marriott Grand Rapids', 'JW Marriott Grand Rapids, MI',
'https://i0.wp.com/www.grpm.org/wp-content/uploads/2025/06/2025_Gala_Web-Header_Option-05.png',
'In-Person', 'Other', 'Grand Rapids Public Museum', 'The Grand Rapids Public Museum preserves and celebrates the history, science, and culture of West Michigan through engaging exhibits and community programs.',
'Gala, Fundraiser, Leadership, Community, Networking', 'https://www.grpm.org/gala/', true),

(4, '2026 Economic Outlook',
'Join economic experts and business leaders for insights into the 2026 economic forecast. Discuss trends, challenges, and opportunities shaping West Michigan''s business landscape.',
'Join The Right Place for the annual Economic Outlook event, bringing together economic experts and business leaders to discuss the 2026 economic forecast for West Michigan and beyond.

This essential event provides valuable insights into:
• National and regional economic trends for 2026
• Labor market projections and workforce development
• Industry-specific forecasts and opportunities
• Real estate and development outlook
• Key challenges and strategic opportunities for businesses

Featuring expert presentations and panel discussions with economists, business leaders, and industry analysts who will help you make informed decisions for the year ahead.

Whether you''re a CEO, business owner, investor, or community leader, the Economic Outlook provides the intelligence you need to navigate the evolving economic landscape and position your organization for success in 2026.

Networking lunch included. This annual event consistently draws 300+ regional business leaders and typically sells out.

Organized by The Right Place, the regional economic development organization serving Greater Grand Rapids.',
'Monday, December 9, 2025', '11:30 AM - 1:30 PM', 'Amway Grand Plaza Hotel', 'Amway Grand Plaza Hotel, Grand Rapids, MI',
'https://rightplace.nyc3.cdn.digitaloceanspaces.com/production/uploads/images/Economic-Outlook-2026-Email-Header.png',
'In-Person', 'Right Place', NULL, 'The Right Place is the regional economic development organization serving Greater Grand Rapids, focused on business growth, talent attraction, and community development.',
'Economic Forecast, Business Strategy, Leadership, Networking, Regional Development', 'https://www.rightplace.org/events/economic-outlook-for-2026', true),

(5, 'WMHCC Conecta Membership Meeting',
'Join the West Michigan Hispanic Chamber of Commerce for the monthly Conecta membership meeting. Network with fellow chamber members and celebrate Hispanic business community achievements.',
'The West Michigan Hispanic Chamber of Commerce invites you to the monthly Conecta membership meeting, hosted by Acrisure.

Conecta meetings are designed to bring together Hispanic business owners, entrepreneurs, and professionals from across West Michigan to:

• Network with fellow chamber members
• Learn about upcoming chamber initiatives and programs
• Share business opportunities and resources
• Celebrate achievements within the Hispanic business community
• Build meaningful connections that drive economic growth

This month''s meeting is graciously hosted by Acrisure, a leader in insurance brokerage and risk management. Enjoy light refreshments while connecting with West Michigan''s vibrant Hispanic business community.

Whether you''re a long-time member or considering joining the chamber, Conecta meetings provide an excellent opportunity to expand your professional network and contribute to the economic vitality of our region.

Free for WMHCC members. Guest registration available.',
'Monday, November 25, 2025', '5:00 PM - 7:00 PM', 'Acrisure', 'Acrisure, Grand Rapids, MI',
'https://chambermaster.blob.core.windows.net/userfiles/UserFiles/chambers/2018/Image/November25Conecta.png',
'In-Person', 'Other', 'West Michigan Hispanic Chamber of Commerce', 'The West Michigan Hispanic Chamber of Commerce promotes economic development and advocates for Hispanic-owned businesses throughout the region.',
'Networking, Hispanic Business, Community, Chamber, Professional Development', 'https://members.westmihcc.org/events/details/wmhcc-conecta-membership-meeting-hosted-by-acrisure-2908', false),

(6, 'Gabe Karp – Best-selling Author and Keynote Speaker',
'Globally recognized expert in leadership and high-performance teams. Author of "Don''t Get Mad at Penguins," presenting his proprietary system for leveraging conflict effectively.',
'Join the Economic Club of Grand Rapids for an insightful luncheon featuring Gabe Karp, globally recognized expert in leadership and high-performance teams.

Gabe Karp is the author of the bestselling book "Don''t Get Mad at Penguins," which presents his proprietary system for leveraging conflict effectively, developed through three decades of research and real-world application.

Currently serving as an Operating Partner at Detroit Venture Partners, Gabe brings extensive experience from his role as Executive Vice President and General Counsel at ePrize (now Merkle). In 2011, Crain''s Business named him General Counsel of the Year for Michigan.

His career began as a trial lawyer specializing in complex commercial and class-action litigation, giving him unique insights into conflict resolution and team dynamics.

This engaging presentation will explore how leaders can transform workplace conflict into a catalyst for innovation, stronger teams, and organizational success. Perfect for executives, managers, and professionals seeking to enhance their leadership effectiveness.

Registration includes lunch and networking opportunities. Available in-person or via Zoom livestream. Corporate table packages available.',
'Monday, November 17, 2025', '11:30 AM - 1:30 PM', 'JW Marriott Grand Rapids', '235 Louis St NW, Grand Rapids, MI 49503',
'https://miro.medium.com/v2/resize:fit:1100/format:webp/1*x7S7Iiz737OW5qXQGSpy3w.jpeg',
'In-Person', 'Economic Club of Grand Rapids', NULL, 'The Economic Club of Grand Rapids brings world-class speakers and thought leaders to West Michigan, fostering informed discussion on business, leadership, and economic issues.',
'Leadership, Conflict Resolution, Business Strategy, Team Building, Professional Development', 'https://econclub.net/gabe-karp/', false),

(7, 'West Michigan Capstone Dinner 2025',
'Celebrating 20 years of Inforum helping women lead and succeed in West Michigan. Featuring fireside chat with Andi Owen, CEO of MillerKnoll.',
'Join Inforum for a milestone celebration marking 20 years of helping women lead and succeed in West Michigan.

This special Capstone Dinner features an inspiring fireside chat with Andi Owen, President and CEO of MillerKnoll, a collective of dynamic brands with more than 10,000 employees and $3.6 billion in annual revenue.

Andi will share insights from her remarkable leadership journey, discussing how she navigated challenges, built high-performing teams, and created an inclusive culture that drives business success.

The conversation will be moderated by Tiffany Eubanks-Saunders, Head of Diverse Segments for the Private Bank business at Bank of America.

This elegant evening celebrates two decades of Inforum''s impact on women''s leadership development in West Michigan, while inspiring the next generation of female leaders.

Event Schedule:
• 5:30-6:00 PM: Check-in and networking
• 6:00-7:45 PM: Dinner and program

Registration required. Visit the event website for pricing and details.

Dress: Business professional',
'Thursday, November 20, 2025', '5:30 PM - 7:45 PM', 'JW Marriott Grand Rapids', '235 Louis St NW, Grand Rapids, MI 49503',
'https://npr.brightspotcdn.com/dims4/default/ec2181b/2147483647/strip/true/crop/383x214%2B0%2B0/resize/880x492!/quality/90/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2Flegacy%2Fsites%2Fwgvu%2Ffiles%2F201511%2FInforum.jpg',
'In-Person', 'Inforum', NULL, 'Inforum is Michigan''s leading membership organization for professional women, dedicated to helping women lead and succeed through connections, programs, and advocacy.',
'Women in Leadership, Networking, CEO Insights, Professional Development, Celebration', 'https://myinforum.app.neoncrm.com/np/clients/myinforum/event.jsp?event=54120', false);
