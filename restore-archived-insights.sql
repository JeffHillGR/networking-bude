-- Restore archived insights items (slots 4-8)
-- Slots 1-3 already exist as featured content
-- Slots 4+ are archived content (shown in Content Archive section)

-- Insert the archived content items
INSERT INTO insights (slot_number, title, description, image, tags, url, sponsored_by, full_content, author, created_at)
VALUES
  -- Slot 4: Travis Chappell Podcast
  (4,
   'How to Lose Everything and Come Back Even Stronger with Annette Raynor',
   'Travis Chappell interviews Annette Raynor, who brings two decades of IT experience. Learn about resilience through economic downturns, building enterprises, and the lessons learned from overcoming significant financial setbacks.',
   'https://travischappell.com/wp-content/uploads/2023/08/phone-img-podcast.png',
   'Resilience, Entrepreneurship',
   'https://travischappell.com/travis_podcast/047-how-to-lose-everything-and-come-back-even-stronger-with-annette-raynor/',
   NULL,
   NULL,
   NULL,
   NOW()),

  -- Slot 5: Never Eat Alone Book
  (5,
   'Never Eat Alone: The Power of Relationship Building',
   'Keith Ferrazzi''s groundbreaking book on building authentic professional relationships and mastering the art of networking to advance your career and enrich your life.',
   'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1320417949i/84699.jpg',
   'Networking, Relationships, Career Growth',
   'https://www.goodreads.com/book/show/84699.Never_Eat_Alone',
   NULL,
   NULL,
   NULL,
   NOW()),

  -- Slot 6: Harvard Business Review Article
  (6,
   'Learn to Love Networking',
   'Harvard Business Review explores why networking feels uncomfortable and provides research-backed strategies to make professional networking more authentic and effective.',
   'https://hbr.org/resources/images/article_assets/2016/04/R1605J_NIEMI_TOC.jpg',
   'Networking, Professional Development',
   'https://hbr.org/2016/05/learn-to-love-networking',
   NULL,
   NULL,
   NULL,
   NOW()),

  -- Slot 7: Navigating Career Transitions
  (7,
   'Navigating Career Transitions with Confidence',
   'Strategic approaches to changing careers while maintaining your professional momentum.',
   'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
   'Career Development',
   NULL,
   NULL,
   NULL,
   NULL,
   NOW()),

  -- Slot 8: Building a Strong Professional Support System
  (8,
   'Building a Strong Professional Support System',
   'Create a network of mentors, peers, and supporters to accelerate your career growth.',
   'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
   'Mentorship',
   NULL,
   NULL,
   NULL,
   NULL,
   NOW())
ON CONFLICT (slot_number) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  url = EXCLUDED.url,
  sponsored_by = EXCLUDED.sponsored_by,
  full_content = EXCLUDED.full_content,
  author = EXCLUDED.author;

-- Verify the inserts
SELECT slot_number, title, tags, url FROM insights WHERE slot_number >= 4 ORDER BY slot_number;
