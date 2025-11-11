import { useState, useEffect } from 'react';
import { Upload, Trash2, ChevronDown, ChevronUp, ArrowDown } from 'lucide-react';
import { supabase } from '../lib/supabase.js';

function EventSlotsManager() {
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedSlot, setExpandedSlot] = useState(null);
  const [saving, setSaving] = useState({});
  const [scrapeUrls, setScrapeUrls] = useState({});
  const [scraping, setScraping] = useState({});
  const [scrapeErrors, setScrapeErrors] = useState({});

  const organizations = [
    'GR Chamber of Commerce', 'Rotary Club', 'CREW', 'GRYP',
    'Economic Club of Grand Rapids', 'Create Great Leaders', 'Right Place', 'Bamboo',
    'Hello West Michigan', 'CARWM', 'Creative Mornings', 'Athena',
    'Inforum', 'Start Garden', 'Other'
  ];

  const emptyEvent = {
    title: '',
    short_description: '',
    full_description: '',
    date: '',
    time: '',
    location_name: '',
    full_address: '',
    image_url: '',
    event_badge: 'In-Person',
    organization: '',
    organization_custom: '',
    organizer_description: '',
    tags: '',
    registration_url: ''
  };

  // Load events from Supabase on mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('slot_number', { ascending: true });

      if (error) throw error;

      // Convert array to object keyed by slot_number
      const eventsObj = {};
      data.forEach(event => {
        eventsObj[event.slot_number] = event;
      });
      setEvents(eventsObj);
    } catch (error) {
      console.error('Error loading events:', error);
      alert('Failed to load events from database');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (slotNumber, field, value) => {
    setEvents(prev => ({
      ...prev,
      [slotNumber]: {
        ...(prev[slotNumber] || { ...emptyEvent, slot_number: slotNumber }),
        [field]: value
      }
    }));
  };

  const handleImageUpload = (slotNumber, file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleInputChange(slotNumber, 'image_url', reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEvent = async (slotNumber) => {
    const event = events[slotNumber];

    if (!event || !event.title || !event.date || !event.time || !event.location_name || !event.registration_url) {
      alert('Please fill in all required fields (Title, Date, Time, Location, Registration URL)');
      return;
    }

    setSaving(prev => ({ ...prev, [slotNumber]: true }));

    try {
      console.log('Starting save for slot', slotNumber);
      console.log('Event data:', event);

      const eventData = {
        ...event,
        slot_number: slotNumber,
        is_featured: slotNumber <= 4 // Slots 1-4 are featured
      };

      console.log('Checking if event exists...');
      // Check if event exists
      const { data: existing, error: checkError } = await supabase
        .from('events')
        .select('id')
        .eq('slot_number', slotNumber)
        .maybeSingle(); // Use maybeSingle instead of single to avoid error if not found

      if (checkError) {
        console.error('Error checking existing event:', checkError);
        throw checkError;
      }

      console.log('Existing event:', existing);

      if (existing) {
        // Update existing
        console.log('Updating existing event...');
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('slot_number', slotNumber);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        console.log('Update successful');
      } else {
        // Insert new
        console.log('Inserting new event...');
        const { error } = await supabase
          .from('events')
          .insert(eventData);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        console.log('Insert successful');
      }

      alert(`Event Slot ${slotNumber} saved successfully!`);
      await loadEvents(); // Reload to get latest data
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event: ' + error.message);
    } finally {
      setSaving(prev => ({ ...prev, [slotNumber]: false }));
    }
  };

  const handleDeleteEvent = async (slotNumber) => {
    if (!confirm(`Are you sure you want to delete Event Slot ${slotNumber}? This cannot be undone.`)) {
      return;
    }

    setSaving(prev => ({ ...prev, [slotNumber]: true }));

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('slot_number', slotNumber);

      if (error) throw error;

      setEvents(prev => {
        const newEvents = { ...prev };
        delete newEvents[slotNumber];
        return newEvents;
      });

      alert(`Event Slot ${slotNumber} deleted successfully!`);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event: ' + error.message);
    } finally {
      setSaving(prev => ({ ...prev, [slotNumber]: false }));
    }
  };

  const handleMoveDown = async (slotNumber) => {
    if (slotNumber >= 7) return; // Can't move down from slot 7

    const currentEvent = events[slotNumber];
    const nextEvent = events[slotNumber + 1];

    if (!currentEvent) {
      alert('Cannot move an empty slot');
      return;
    }

    setSaving(prev => ({ ...prev, [slotNumber]: true, [slotNumber + 1]: true }));

    try {
      console.log('Moving down from slot', slotNumber);

      if (nextEvent) {
        // Both slots have events - swap them by deleting and reinserting
        console.log('Swapping two events');

        // Step 1: Fetch both complete event records
        const { data: currentData, error: fetchError1 } = await supabase
          .from('events')
          .select('*')
          .eq('slot_number', slotNumber)
          .single();

        if (fetchError1) throw fetchError1;

        const { data: nextData, error: fetchError2 } = await supabase
          .from('events')
          .select('*')
          .eq('slot_number', slotNumber + 1)
          .single();

        if (fetchError2) throw fetchError2;

        console.log('Fetched both events, now deleting...');

        // Step 2: Delete both events
        const { error: deleteError } = await supabase
          .from('events')
          .delete()
          .in('slot_number', [slotNumber, slotNumber + 1]);

        if (deleteError) {
          console.error('Error deleting events:', deleteError);
          throw deleteError;
        }

        console.log('Deleted both events, now reinserting with swapped slot numbers...');

        // Step 3: Reinsert with swapped slot numbers (remove id and timestamps)
        const { id: currentId, created_at: currentCreated, updated_at: currentUpdated, ...currentEventData } = currentData;
        const { id: nextId, created_at: nextCreated, updated_at: nextUpdated, ...nextEventData } = nextData;

        const { error: insertError } = await supabase
          .from('events')
          .insert([
            { ...currentEventData, slot_number: slotNumber + 1 },
            { ...nextEventData, slot_number: slotNumber }
          ]);

        if (insertError) {
          console.error('Error reinserting events:', insertError);
          throw insertError;
        }

        console.log('Successfully swapped events');
      } else {
        // Only current slot has event - just move it down
        console.log(`Moving slot ${slotNumber} to ${slotNumber + 1}`);

        // Fetch the complete event
        const { data: eventData, error: fetchError } = await supabase
          .from('events')
          .select('*')
          .eq('slot_number', slotNumber)
          .single();

        if (fetchError) throw fetchError;

        // Delete the old one
        const { error: deleteError } = await supabase
          .from('events')
          .delete()
          .eq('slot_number', slotNumber);

        if (deleteError) throw deleteError;

        // Reinsert with new slot number (remove id and timestamps)
        const { id, created_at, updated_at, ...cleanEventData } = eventData;
        const { error: insertError } = await supabase
          .from('events')
          .insert({ ...cleanEventData, slot_number: slotNumber + 1 });

        if (insertError) throw insertError;
      }

      // Reload events to reflect changes
      await loadEvents();
      alert(`Event moved from Slot ${slotNumber} to Slot ${slotNumber + 1}`);
    } catch (error) {
      console.error('Error moving event:', error);
      alert('Failed to move event: ' + error.message);
      // Reload to ensure UI is in sync with database
      await loadEvents();
    } finally {
      setSaving(prev => ({ ...prev, [slotNumber]: false, [slotNumber + 1]: false }));
    }
  };

  const handleScrapeUrl = async (slotNumber) => {
    const url = scrapeUrls[slotNumber];
    if (!url) {
      setScrapeErrors(prev => ({ ...prev, [slotNumber]: 'Please enter a URL' }));
      return;
    }

    setScraping(prev => ({ ...prev, [slotNumber]: true }));
    setScrapeErrors(prev => ({ ...prev, [slotNumber]: '' }));

    try {
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const response = await fetch(proxyUrl + encodeURIComponent(url));
      const html = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      let scrapedData = { registration_url: url };

      // Try to find title
      const title = doc.querySelector('h1')?.textContent?.trim() ||
                   doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                   doc.querySelector('title')?.textContent?.trim() || '';
      scrapedData.title = title;

      // Try to find description
      const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
                      doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
      if (metaDesc) {
        scrapedData.short_description = metaDesc;
        scrapedData.full_description = metaDesc;
      }

      // Try to find image
      const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
      if (ogImage) {
        scrapedData.image_url = ogImage.startsWith('http') ? ogImage : new URL(ogImage, url).href;
      }

      // Update the event with scraped data
      setEvents(prev => ({
        ...prev,
        [slotNumber]: {
          ...(prev[slotNumber] || { ...emptyEvent, slot_number: slotNumber }),
          ...scrapedData,
          title: scrapedData.title || prev[slotNumber]?.title || '',
          short_description: scrapedData.short_description || prev[slotNumber]?.short_description || '',
          full_description: scrapedData.full_description || prev[slotNumber]?.full_description || '',
          image_url: scrapedData.image_url || prev[slotNumber]?.image_url || '',
          registration_url: scrapedData.registration_url
        }
      }));

      alert('Content scraped! Please review and fill in remaining details.');
    } catch (error) {
      console.error('Scraping error:', error);
      setScrapeErrors(prev => ({ ...prev, [slotNumber]: 'Unable to scrape this URL. Please enter details manually.' }));
    } finally {
      setScraping(prev => ({ ...prev, [slotNumber]: false }));
    }
  };

  const toggleSlot = (slotNumber) => {
    setExpandedSlot(expandedSlot === slotNumber ? null : slotNumber);
  };

  const renderEventSlot = (slotNumber) => {
    const event = events[slotNumber] || { ...emptyEvent, slot_number: slotNumber };
    const isExpanded = expandedSlot === slotNumber;
    const hasEvent = !!events[slotNumber]?.title;
    const isFeatured = slotNumber <= 4;

    return (
      <div key={slotNumber} className="border-2 border-gray-300 rounded-lg p-4 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleSlot(slotNumber)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            <div>
              <h4 className="font-bold text-sm text-gray-900">
                Event Slot {slotNumber}
                {isFeatured && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Featured</span>}
              </h4>
              {hasEvent && !isExpanded && (
                <p className="text-xs text-gray-600 mt-0.5">{event.title}</p>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Form */}
        {isExpanded && (
          <div className="space-y-3 bg-gray-50 p-4 rounded">
            {/* URL Scraper */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded border border-blue-200">
              <p className="text-xs font-semibold text-gray-900 mb-2">✨ Quick Add from URL (Optional)</p>
              <p className="text-xs text-gray-600 mb-2">Paste an Eventbrite or event URL to auto-fill details</p>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={scrapeUrls[slotNumber] || ''}
                  onChange={(e) => setScrapeUrls(prev => ({ ...prev, [slotNumber]: e.target.value }))}
                  placeholder="https://www.eventbrite.com/e/..."
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                  disabled={scraping[slotNumber]}
                />
                <button
                  onClick={() => handleScrapeUrl(slotNumber)}
                  disabled={scraping[slotNumber]}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {scraping[slotNumber] ? 'Scraping...' : 'Scrape'}
                </button>
              </div>
              {scrapeErrors[slotNumber] && <p className="text-xs text-red-600 mt-1">{scrapeErrors[slotNumber]}</p>}
            </div>

            {/* Event Image */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Event Image *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={event.image_url || ''}
                  onChange={(e) => handleInputChange(slotNumber, 'image_url', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Image URL or upload below"
                />
                <label className="px-3 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300 cursor-pointer flex items-center gap-1">
                  <Upload className="w-4 h-4" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(slotNumber, e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
              {event.image_url && (
                <img src={event.image_url} alt="Preview" className="mt-2 w-full h-32 object-cover rounded" />
              )}
            </div>

            {/* Title and Badge */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  value={event.title || ''}
                  onChange={(e) => handleInputChange(slotNumber, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="e.g., Tech Leaders Breakfast"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Event Badge</label>
                <select
                  value={event.event_badge || 'In-Person'}
                  onChange={(e) => handleInputChange(slotNumber, 'event_badge', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option>In-Person</option>
                  <option>Virtual</option>
                  <option>Hybrid</option>
                </select>
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Short Description *</label>
              <textarea
                value={event.short_description || ''}
                onChange={(e) => handleInputChange(slotNumber, 'short_description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                rows="2"
                placeholder="Brief description for event listings"
              />
            </div>

            {/* Full Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Description *</label>
              <textarea
                value={event.full_description || ''}
                onChange={(e) => handleInputChange(slotNumber, 'full_description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                rows="4"
                placeholder="Detailed description for event detail page"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="text"
                  value={event.date || ''}
                  onChange={(e) => handleInputChange(slotNumber, 'date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="e.g., Thursday, September 19, 2025"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Time *</label>
                <input
                  type="text"
                  value={event.time || ''}
                  onChange={(e) => handleInputChange(slotNumber, 'time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="e.g., 8:00 AM - 10:00 AM"
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location Name *</label>
                <input
                  type="text"
                  value={event.location_name || ''}
                  onChange={(e) => handleInputChange(slotNumber, 'location_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="e.g., Bamboo Grand Rapids"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Address *</label>
                <input
                  type="text"
                  value={event.full_address || ''}
                  onChange={(e) => handleInputChange(slotNumber, 'full_address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="e.g., 33 Commerce Ave SW, Grand Rapids, MI 49503"
                />
              </div>
            </div>

            {/* Organization and Custom Org */}
            <div className="border-t pt-3">
              <h5 className="font-semibold text-sm text-gray-900 mb-2">Organizer Information</h5>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Organization *</label>
                  <select
                    value={event.organization || ''}
                    onChange={(e) => handleInputChange(slotNumber, 'organization', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="">Select organization...</option>
                    {organizations.map((org, index) => (
                      <option key={index} value={org}>{org}</option>
                    ))}
                  </select>
                </div>

                {/* Show custom field if "Other" is selected */}
                {event.organization === 'Other' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Custom Organization Name *</label>
                    <input
                      type="text"
                      value={event.organization_custom || ''}
                      onChange={(e) => handleInputChange(slotNumber, 'organization_custom', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      placeholder="Enter organization name"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Organizer Description</label>
                  <textarea
                    value={event.organizer_description || ''}
                    onChange={(e) => handleInputChange(slotNumber, 'organizer_description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    rows="2"
                    placeholder="Brief description of the organizing entity"
                  />
                </div>
              </div>
            </div>

            {/* Tags and Registration URL */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={event.tags || ''}
                  onChange={(e) => handleInputChange(slotNumber, 'tags', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="e.g., Design, Creativity, Networking"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Registration URL *</label>
                <input
                  type="url"
                  value={event.registration_url || ''}
                  onChange={(e) => handleInputChange(slotNumber, 'registration_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t">
              <div className="flex gap-2">
                {/* Delete Button */}
                {hasEvent && (
                  <button
                    onClick={() => handleDeleteEvent(slotNumber)}
                    disabled={saving[slotNumber]}
                    className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}

                {/* Move Down Button */}
                {hasEvent && slotNumber < 7 && (
                  <button
                    onClick={() => handleMoveDown(slotNumber)}
                    disabled={saving[slotNumber]}
                    className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ArrowDown className="w-4 h-4" />
                    Move Down
                  </button>
                )}

                {/* Save Button */}
                <button
                  onClick={() => handleSaveEvent(slotNumber)}
                  disabled={saving[slotNumber]}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving[slotNumber] ? 'Saving...' : `Save Event Slot ${slotNumber}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="p-8 text-center">Loading events...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-sm text-blue-900 mb-1">Events Page Listings (7 Slots)</h3>
        <p className="text-xs text-blue-700">
          Slots 1-4 are <strong>Featured Events</strong> (displayed in 2x2 grid). Slots 5-7 are standard events (displayed below).
          Empty slots won't appear on the public events page.
        </p>
      </div>

      {[1, 2, 3, 4, 5, 6, 7].map(slotNumber => renderEventSlot(slotNumber))}
    </div>
  );
}

export default EventSlotsManager;
