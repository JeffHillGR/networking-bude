# Social Media Sharing - Meta Tags Fix

## Current Status: ✅ WORKING

The meta tags are now correctly pulling event data from Supabase database including:
- Event title
- Event description
- Event image from Supabase storage

## For NEW Events (Going Forward)

**No action needed!** When you share a new event on Facebook or LinkedIn for the FIRST time, it will automatically show:
- Correct event title
- Correct description
- Correct event image from your database

The sharing works perfectly out of the box for any event that hasn't been shared before.

## For Previously Shared Events (One-Time Fix)

If an event was shared BEFORE we fixed the meta tags (and is showing the old generic BudE logo), you need to clear the cache once:

### Facebook Cache Clear
1. Go to: https://developers.facebook.com/tools/debug/
2. Paste your event URL (e.g., `https://www.networkingbude.com/events/[event-id]`)
3. Click "Debug"
4. Click "Scrape Again" button
5. Done! Future shares will show the correct preview

### LinkedIn Cache Clear
1. Go to: https://www.linkedin.com/post-inspector/
2. Paste your event URL
3. Click "Inspect"
4. Done! LinkedIn will now show the correct preview

## How It Works

1. When Facebook/LinkedIn crawl your event URL, Vercel's server-side rendering kicks in
2. The `/api/meta-tags.js` function queries Supabase for the event data
3. It injects proper Open Graph meta tags with event-specific title, description, and image
4. Social platforms read these tags and display a rich preview

## Testing a Share

To test if an event will share correctly:
1. Use the Facebook Debugger tool above
2. Paste your event URL
3. You should see:
   - `og:title`: Your event title (not "Networking BudE - Find Your Networking Buddy")
   - `og:description`: Your event description
   - `og:image`: URL starting with `https://moqhghbqapcppzydgqyt.supabase.co/storage/v1/object/public/event-images/`

## Verified Working Examples

✅ WMHCC Event: Shows correct title, description, and Supabase image
✅ Bamboo GR Event: Shows correct title, description, and Supabase image

The system is working correctly!
