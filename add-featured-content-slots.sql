-- Add featured content slots 2 and 3 to the featured_content table
-- This allows the admin panel to manage all 3 content slots
-- Uses UPSERT to insert or update existing rows

-- Upsert slot 2 - The Not Perfect Networking Podcast
INSERT INTO featured_content (
  slot_number,
  title,
  description,
  image,
  url,
  tags,
  sponsored_by,
  full_content,
  author
)
VALUES (
  2,
  'The Not Perfect Networking Podcast',
  'Networking doesn''t have to be perfect to be powerful. Join us for real conversations about building genuine connections in business and life. Perfect for professionals who want to network authentically.',
  'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/52/2c/26/522c2689-01a0-f2c4-37b9-20034b428603/mza_15419489958704245485.jpg/540x540bb.webp',
  'https://podcasts.apple.com/us/podcast/the-not-perfect-networking-podcast/id1802926391',
  ARRAY['Networking', 'Professional Development']::text[],
  NULL,
  NULL,
  NULL
)
ON CONFLICT (slot_number)
DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  url = EXCLUDED.url,
  tags = EXCLUDED.tags,
  sponsored_by = EXCLUDED.sponsored_by,
  full_content = EXCLUDED.full_content,
  author = EXCLUDED.author;

-- Upsert slot 3 - How to Build Systems to Actually Achieve Your Goals
INSERT INTO featured_content (
  slot_number,
  title,
  description,
  image,
  url,
  tags,
  sponsored_by,
  full_content,
  author
)
VALUES (
  3,
  'How to Build Systems to Actually Achieve Your Goals',
  'Are your goals holding you back? In this episode, I''ll show you why focusing on big, long-term results can actually demotivate you—and how shifting to daily, actionable systems can help you achieve real progress.',
  'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/aa/8e/72/aa8e72f7-643a-f98e-f929-3586a8c3ef62/mza_10593625707581288470.jpg/540x540bb.webp',
  'https://podcasts.apple.com/us/podcast/how-to-build-systems-to-actually-achieve-your-goals/id1033048640?i=1000728624111',
  ARRAY['Goal Setting', 'Personal Growth']::text[],
  NULL,
  NULL,
  NULL
)
ON CONFLICT (slot_number)
DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  url = EXCLUDED.url,
  tags = EXCLUDED.tags,
  sponsored_by = EXCLUDED.sponsored_by,
  full_content = EXCLUDED.full_content,
  author = EXCLUDED.author;

-- Verify the inserts
SELECT slot_number, title, description
FROM featured_content
ORDER BY slot_number;
