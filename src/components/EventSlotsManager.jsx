import { useState, useEffect } from 'react';
import { Upload, Trash2, ChevronDown, ChevronUp, ArrowDown, ArrowUp } from 'lucide-react';
import { supabase } from '../lib/supabase.js';
import { REGIONS, getOrganizationsForRegion, getScrapeUrlsForRegion } from '../lib/regions.js';

function EventSlotsManager() {
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedSlot, setExpandedSlot] = useState(null);
  const [saving, setSaving] = useState({});
  const [scrapeUrls, setScrapeUrls] = useState({});
  const [scraping, setScraping] = useState({});
  const [scrapeErrors, setScrapeErrors] = useState({});
  const [batchScraping, setBatchScraping] = useState(false);
  const [batchResults, setBatchResults] = useState(null);

  // Region selection - persisted in localStorage
  const [selectedRegion, setSelectedRegion] = useState(
    localStorage.getItem('adminRegion') || 'grand-rapids'
  );

  // Handle region change
  const handleRegionChange = (region) => {
    setSelectedRegion(region);
    localStorage.setItem('adminRegion', region);
  };

  // Get organizations for current region (dynamically)
  const organizations = [...getOrganizationsForRegion(selectedRegion), 'Other'];

  // Get scrape URLs for current region (dynamically)
  const organizationEventPages = getScrapeUrlsForRegion(selectedRegion);

  const emptyEvent = {
    title: '',
    short_description: '',
    full_description: '',
    date: '',
    time: '8:00 AM - 10:00 AM',
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

  // Load events from Supabase on mount and when region changes
  useEffect(() => {
    loadEvents();
  }, [selectedRegion]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('region_id', selectedRegion)
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

  const handleImageUpload = async (slotNumber, file) => {
    if (!file) return;

    // Validate file size (1.5MB max)
    const maxSize = 1.5 * 1024 * 1024; // 1.5MB in bytes
    if (file.size > maxSize) {
      alert('Image must be smaller than 1.5MB. Please compress or resize the image.');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    try {
      // Show temporary preview while uploading
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange(slotNumber, 'image_url', reader.result);
      };
      reader.readAsDataURL(file);

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `event-${slotNumber}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('event-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting if same filename
        });

      if (error) {
        console.error('Upload error:', error);
        alert('Failed to upload image: ' + error.message);
        return;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      // Update with the actual Supabase URL
      handleInputChange(slotNumber, 'image_url', publicUrlData.publicUrl);

      console.log('Image uploaded successfully:', publicUrlData.publicUrl);
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
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
        is_featured: slotNumber <= 4, // Slots 1-4 are featured
        region_id: selectedRegion
      };

      console.log('Checking if event exists...');
      // Check if event exists (for this slot AND region)
      const { data: existing, error: checkError } = await supabase
        .from('events')
        .select('id')
        .eq('slot_number', slotNumber)
        .eq('region_id', selectedRegion)
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
        .eq('slot_number', slotNumber)
        .eq('region_id', selectedRegion);

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

  const handleMoveUp = async (slotNumber) => {
    if (slotNumber <= 1) return; // Can't move up from slot 1

    const currentEvent = events[slotNumber];
    const prevEvent = events[slotNumber - 1];

    if (!currentEvent) {
      alert('Cannot move an empty slot');
      return;
    }

    setSaving(prev => ({ ...prev, [slotNumber]: true, [slotNumber - 1]: true }));

    try {
      console.log('Moving up from slot', slotNumber);

      if (prevEvent) {
        // Both slots have events - swap using event IDs to avoid constraint issues
        console.log('Swapping two events by ID');

        const currentEventId = currentEvent.id;
        const prevEventId = prevEvent.id;

        // Use a temporary slot number (99) to avoid unique constraint violation
        const tempSlot = 99;

        // Step 1: Move current event to temp slot
        const { error: error1 } = await supabase
          .from('events')
          .update({ slot_number: tempSlot })
          .eq('id', currentEventId);

        if (error1) throw error1;

        // Step 2: Move prev event to current slot
        const { error: error2 } = await supabase
          .from('events')
          .update({ slot_number: slotNumber, is_featured: slotNumber <= 4 })
          .eq('id', prevEventId);

        if (error2) throw error2;

        // Step 3: Move current event (from temp) to prev slot
        const { error: error3 } = await supabase
          .from('events')
          .update({ slot_number: slotNumber - 1, is_featured: (slotNumber - 1) <= 4 })
          .eq('id', currentEventId);

        if (error3) throw error3;

        console.log('Successfully swapped events');
      } else {
        // Only current slot has event - just update its slot_number
        console.log(`Moving slot ${slotNumber} to ${slotNumber - 1}`);

        const { error } = await supabase
          .from('events')
          .update({ slot_number: slotNumber - 1, is_featured: (slotNumber - 1) <= 4 })
          .eq('id', currentEvent.id);

        if (error) throw error;
      }

      // Reload events to reflect changes
      await loadEvents();
      // Update expanded slot to follow the moved event
      setExpandedSlot(slotNumber - 1);
    } catch (error) {
      console.error('Error moving event:', error);
      alert('Failed to move event: ' + error.message);
      // Reload to ensure UI is in sync with database
      await loadEvents();
    } finally {
      setSaving(prev => ({ ...prev, [slotNumber]: false, [slotNumber - 1]: false }));
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
        // Both slots have events - swap using event IDs to avoid constraint issues
        console.log('Swapping two events by ID');

        const currentEventId = currentEvent.id;
        const nextEventId = nextEvent.id;

        // Use a temporary slot number (99) to avoid unique constraint violation
        const tempSlot = 99;

        // Step 1: Move current event to temp slot
        const { error: error1 } = await supabase
          .from('events')
          .update({ slot_number: tempSlot })
          .eq('id', currentEventId);

        if (error1) throw error1;

        // Step 2: Move next event to current slot
        const { error: error2 } = await supabase
          .from('events')
          .update({ slot_number: slotNumber, is_featured: slotNumber <= 4 })
          .eq('id', nextEventId);

        if (error2) throw error2;

        // Step 3: Move current event (from temp) to next slot
        const { error: error3 } = await supabase
          .from('events')
          .update({ slot_number: slotNumber + 1, is_featured: (slotNumber + 1) <= 4 })
          .eq('id', currentEventId);

        if (error3) throw error3;

        console.log('Successfully swapped events');
      } else {
        // Only current slot has event - just update its slot_number
        console.log(`Moving slot ${slotNumber} to ${slotNumber + 1}`);

        const { error } = await supabase
          .from('events')
          .update({ slot_number: slotNumber + 1, is_featured: (slotNumber + 1) <= 4 })
          .eq('id', currentEvent.id);

        if (error) throw error;
      }

      // Reload events to reflect changes
      await loadEvents();
      // Update expanded slot to follow the moved event
      setExpandedSlot(slotNumber + 1);
    } catch (error) {
      console.error('Error moving event:', error);
      alert('Failed to move event: ' + error.message);
      // Reload to ensure UI is in sync with database
      await loadEvents();
    } finally {
      setSaving(prev => ({ ...prev, [slotNumber]: false, [slotNumber + 1]: false }));
    }
  };

  // Helper function to scrape a single URL and extract event data
  const scrapeEventFromUrl = async (url) => {
    try {
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const response = await fetch(proxyUrl + encodeURIComponent(url));

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      let scrapedData = { registration_url: url };

      // Try to find JSON-LD structured data (used by Eventbrite and many event sites)
      const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
      let eventData = null;

      for (const script of jsonLdScripts) {
        try {
          const data = JSON.parse(script.textContent);
          const items = Array.isArray(data) ? data : [data];

          eventData = items.find(item => item && item['@type'] === 'Event');

          if (!eventData) {
            for (const item of items) {
              if (item && typeof item === 'object') {
                for (const key in item) {
                  if (item[key] && typeof item[key] === 'object' && item[key]['@type'] === 'Event') {
                    eventData = item[key];
                    break;
                  }
                }
                if (item['@type'] && typeof item['@type'] === 'string' && item['@type'].includes('Event')) {
                  eventData = item;
                  break;
                }
              }
              if (eventData) break;
            }
          }

          if (eventData) break;
        } catch (e) {
          console.warn('Failed to parse JSON-LD script');
        }
      }

      if (eventData) {
        if (eventData.name) scrapedData.title = eventData.name;
        if (eventData.description) {
          scrapedData.short_description = eventData.description.substring(0, 200);
          scrapedData.full_description = eventData.description;
        }
        if (eventData.startDate) {
          try {
            const startDate = new Date(eventData.startDate);
            // Use ISO format (YYYY-MM-DD) for date picker compatibility
            scrapedData.date = startDate.toISOString().split('T')[0];
            scrapedData.time = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            scrapedData.dateObj = startDate; // Keep for sorting
          } catch (e) {
            console.warn('Failed to parse event date');
          }
        }
        if (eventData.location) {
          if (typeof eventData.location === 'string') {
            scrapedData.location_name = eventData.location;
          } else if (eventData.location.name) {
            scrapedData.location_name = eventData.location.name;
            if (eventData.location.address) {
              const addr = eventData.location.address;
              if (typeof addr === 'string') {
                scrapedData.full_address = addr;
              } else if (addr.streetAddress || addr.addressLocality) {
                scrapedData.full_address = [addr.streetAddress, addr.addressLocality, addr.addressRegion].filter(Boolean).join(', ');
              }
            }
          }
        }
        if (eventData.organizer) {
          if (typeof eventData.organizer === 'string') {
            scrapedData.organizer_name = eventData.organizer;
          } else if (eventData.organizer.name) {
            scrapedData.organizer_name = eventData.organizer.name;
          }
        }
        if (eventData.image) {
          try {
            const imageUrl = typeof eventData.image === 'string' ? eventData.image :
                           (eventData.image.url || (Array.isArray(eventData.image) ? eventData.image[0] : null));
            if (imageUrl) {
              scrapedData.image_url = imageUrl.startsWith('http') ? imageUrl : new URL(imageUrl, url).href;
            }
          } catch (e) {
            console.warn('Failed to parse image URL from structured data');
          }
        }
      }

      // Fallback chains
      if (!scrapedData.title) {
        scrapedData.title =
          doc.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim() ||
          doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content')?.trim() ||
          doc.querySelector('h1')?.textContent?.trim() ||
          '';
      }

      if (!scrapedData.short_description) {
        const metaDesc =
          doc.querySelector('meta[property="og:description"]')?.getAttribute('content')?.trim() ||
          doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ||
          '';
        if (metaDesc) {
          scrapedData.short_description = metaDesc.substring(0, 200);
          scrapedData.full_description = metaDesc;
        }
      }

      if (!scrapedData.image_url) {
        const ogImage =
          doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
          doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
          '';
        if (ogImage) {
          try {
            scrapedData.image_url = ogImage.startsWith('http') ? ogImage : new URL(ogImage, url).href;
          } catch (e) {
            console.warn('Failed to construct absolute image URL');
          }
        }
      }

      return scrapedData;
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
      return null;
    }
  };

  // Batch scrape from all organizations
  const handleBatchScrape = async () => {
    setBatchScraping(true);
    setBatchResults(null);

    try {
      // STEP 1: Delete past events (events that have already happened or are happening today)
      console.log('Step 1: Cleaning up past events...');
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today

      let deletedCount = 0;
      for (const [slotNumber, event] of Object.entries(events)) {
        if (event && event.date) {
          try {
            // Parse the event date
            const eventDate = new Date(event.date);

            // If event is today or in the past, delete it
            if (eventDate <= today) {
              console.log(`Deleting past event in slot ${slotNumber}: ${event.title}`);
              await supabase
                .from('events')
                .delete()
                .eq('slot_number', slotNumber);
              deletedCount++;
            }
          } catch (e) {
            console.warn(`Failed to parse date for slot ${slotNumber}:`, event.date);
          }
        }
      }

      console.log(`Deleted ${deletedCount} past events`);

      // Reload events to get fresh state
      await loadEvents();

      // STEP 2: Scrape and fill empty slots
      console.log('Step 2: Scraping new events...');
      const allEvents = [];
      const twoWeeksFromNow = new Date();
      twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

      // Scrape from each organization
      for (const [orgName, url] of Object.entries(organizationEventPages)) {
        console.log(`Scraping ${orgName}...`);
        const scrapedData = await scrapeEventFromUrl(url);

        if (scrapedData && scrapedData.title && scrapedData.dateObj) {
          // Only include events within next 2 weeks
          if (scrapedData.dateObj >= new Date() && scrapedData.dateObj <= twoWeeksFromNow) {
            allEvents.push({
              ...scrapedData,
              organization: orgName,
              organization_custom: orgName === 'Other' ? scrapedData.organizer_name : ''
            });
          }
        }
      }

      console.log(`Found ${allEvents.length} events within next 2 weeks`);

      // Sort by date (earliest first)
      allEvents.sort((a, b) => a.dateObj - b.dateObj);

      // Take max 1 event per organization
      const selectedEvents = [];
      const usedOrgs = new Set();

      for (const event of allEvents) {
        if (!usedOrgs.has(event.organization)) {
          selectedEvents.push(event);
          usedOrgs.add(event.organization);
        }
      }

      console.log(`Selected ${selectedEvents.length} events from different orgs`);

      // Fill only empty slots (after reload)
      const updatedEvents = { ...events };
      let filledCount = 0;

      for (let slotNumber = 1; slotNumber <= 7; slotNumber++) {
        // Check if slot is empty
        const existingEvent = updatedEvents[slotNumber];
        const isEmpty = !existingEvent || !existingEvent.title;

        if (isEmpty && selectedEvents.length > 0) {
          // Fill this empty slot with the next available event
          const nextEvent = selectedEvents.shift();
          updatedEvents[slotNumber] = {
            ...emptyEvent,
            slot_number: slotNumber,
            ...nextEvent,
            // Remove the dateObj (it was just for sorting)
            dateObj: undefined
          };
          filledCount++;
          console.log(`Filled slot ${slotNumber} with: ${nextEvent.title}`);
        }
      }

      setEvents(updatedEvents);
      setBatchResults({
        total: allEvents.length,
        selected: selectedEvents.length + filledCount,
        orgs: Array.from(usedOrgs),
        deleted: deletedCount,
        filled: filledCount
      });

      alert(`✓ Cleanup & Auto-Fill Complete!\n\n• Removed ${deletedCount} past event(s)\n• Found ${allEvents.length} upcoming events\n• Filled ${filledCount} empty slot(s)\n\nPlease review and save each slot.`);
    } catch (error) {
      console.error('Batch scrape error:', error);
      alert('Failed to auto-fill events. Please try again or add events manually.');
    } finally {
      setBatchScraping(false);
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

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      let scrapedData = { registration_url: url };

      // Try to find JSON-LD structured data (used by Eventbrite and many event sites)
      const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
      let eventData = null;

      for (const script of jsonLdScripts) {
        try {
          const data = JSON.parse(script.textContent);
          // Handle both single Event objects and arrays
          const items = Array.isArray(data) ? data : [data];

          // Look for Event type first
          eventData = items.find(item => item && item['@type'] === 'Event');

          // If not found, check for other types that might contain event info
          if (!eventData) {
            // Some sites nest Event inside other types or use variations
            for (const item of items) {
              if (item && typeof item === 'object') {
                // Check if any property is an Event
                for (const key in item) {
                  if (item[key] && typeof item[key] === 'object' && item[key]['@type'] === 'Event') {
                    eventData = item[key];
                    break;
                  }
                }
                // Check for EducationEvent, BusinessEvent, etc. (Event subtypes)
                if (item['@type'] && typeof item['@type'] === 'string' && item['@type'].includes('Event')) {
                  eventData = item;
                  break;
                }
              }
              if (eventData) break;
            }
          }

          if (eventData) {
            console.log('Found structured event data');
            break;
          }
        } catch (e) {
          console.warn('Failed to parse JSON-LD script');
        }
      }

      if (eventData) {
        // Extract title from structured data
        if (eventData.name) {
          scrapedData.title = eventData.name;
        }

        // Extract description from structured data
        if (eventData.description) {
          scrapedData.short_description = eventData.description.substring(0, 200);
          scrapedData.full_description = eventData.description;
        }

        // Extract date and time from structured data
        if (eventData.startDate) {
          try {
            const startDate = new Date(eventData.startDate);
            // Use ISO format (YYYY-MM-DD) for date picker compatibility
            scrapedData.date = startDate.toISOString().split('T')[0];
            scrapedData.time = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
          } catch (e) {
            console.warn('Failed to parse event date');
          }
        }

        // Extract location from structured data
        if (eventData.location) {
          if (typeof eventData.location === 'string') {
            scrapedData.location_name = eventData.location;
          } else if (eventData.location.name) {
            scrapedData.location_name = eventData.location.name;
            if (eventData.location.address) {
              const addr = eventData.location.address;
              if (typeof addr === 'string') {
                scrapedData.full_address = addr;
              } else if (addr.streetAddress || addr.addressLocality) {
                scrapedData.full_address = [addr.streetAddress, addr.addressLocality, addr.addressRegion].filter(Boolean).join(', ');
              }
            }
          }
        }

        // Extract organizer from structured data
        if (eventData.organizer) {
          if (typeof eventData.organizer === 'string') {
            scrapedData.organization = 'Other';
            scrapedData.organization_custom = eventData.organizer;
          } else if (eventData.organizer.name) {
            scrapedData.organization = 'Other';
            scrapedData.organization_custom = eventData.organizer.name;
          }
        }

        // Extract image from structured data
        if (eventData.image) {
          try {
            const imageUrl = typeof eventData.image === 'string' ? eventData.image :
                           (eventData.image.url || (Array.isArray(eventData.image) ? eventData.image[0] : null));
            if (imageUrl) {
              scrapedData.image_url = imageUrl.startsWith('http') ? imageUrl : new URL(imageUrl, url).href;
            }
          } catch (e) {
            console.warn('Failed to parse image URL from structured data');
          }
        }
      }

      // Fallback chain for title
      if (!scrapedData.title) {
        scrapedData.title =
          doc.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim() ||
          doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content')?.trim() ||
          doc.querySelector('h1')?.textContent?.trim() ||
          doc.querySelector('title')?.textContent?.trim() ||
          '';
      }

      // Fallback chain for description
      if (!scrapedData.short_description) {
        const metaDesc =
          doc.querySelector('meta[property="og:description"]')?.getAttribute('content')?.trim() ||
          doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ||
          doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content')?.trim() ||
          '';
        if (metaDesc) {
          scrapedData.short_description = metaDesc.substring(0, 200);
          scrapedData.full_description = metaDesc;
        }
      }

      // Fallback chain for image
      if (!scrapedData.image_url) {
        const ogImage =
          doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
          doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
          doc.querySelector('img[class*="event"]')?.getAttribute('src') ||
          doc.querySelector('img[class*="hero"]')?.getAttribute('src') ||
          doc.querySelector('img[class*="featured"]')?.getAttribute('src') ||
          doc.querySelector('img[class*="banner"]')?.getAttribute('src') ||
          '';
        if (ogImage) {
          try {
            scrapedData.image_url = ogImage.startsWith('http') ? ogImage : new URL(ogImage, url).href;
          } catch (e) {
            console.warn('Failed to construct absolute image URL');
          }
        }
      }

      // Fallback for date (look for common date patterns in HTML)
      if (!scrapedData.date) {
        const dateSelectors = [
          '[class*="event-date"]',
          '[class*="date"]',
          '[itemprop="startDate"]',
          'time[datetime]',
          '[class*="when"]'
        ];
        for (const selector of dateSelectors) {
          const dateElem = doc.querySelector(selector);
          if (dateElem) {
            const dateText = dateElem.getAttribute('datetime') || dateElem.textContent?.trim();
            if (dateText && dateText.length > 0 && dateText.length < 100) {
              scrapedData.date = dateText;
              break;
            }
          }
        }
      }

      // Fallback for location
      if (!scrapedData.location_name) {
        const locationSelectors = [
          '[class*="location"]',
          '[class*="venue"]',
          '[itemprop="location"]',
          '[class*="where"]',
          '[class*="place"]'
        ];
        for (const selector of locationSelectors) {
          const locationElem = doc.querySelector(selector);
          if (locationElem) {
            const locationText = locationElem.textContent?.trim();
            if (locationText && locationText.length > 0 && locationText.length < 200) {
              scrapedData.location_name = locationText;
              break;
            }
          }
        }
      }

      // Fallback for organizer/organization
      if (!scrapedData.organization_custom) {
        const orgSelectors = [
          '[class*="organizer"]',
          '[class*="host"]',
          '[itemprop="organizer"]',
          '[class*="presenter"]'
        ];
        for (const selector of orgSelectors) {
          const orgElem = doc.querySelector(selector);
          if (orgElem) {
            const orgText = orgElem.textContent?.trim();
            if (orgText && orgText.length > 0 && orgText.length < 100) {
              scrapedData.organization = 'Other';
              scrapedData.organization_custom = orgText;
              break;
            }
          }
        }
      }

      // Log what we found for debugging
      const fieldsFound = Object.keys(scrapedData).filter(k => scrapedData[k] && k !== 'registration_url');
      console.log(`Scraped ${fieldsFound.length} fields:`, fieldsFound);

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

      if (fieldsFound.length > 0) {
        alert(`Scraped ${fieldsFound.length} field(s)! Please review and fill in remaining details.`);
      } else {
        alert('Could not extract data from this URL. Please enter details manually.');
      }
    } catch (error) {
      console.error('Scraping error:', error);
      setScrapeErrors(prev => ({ ...prev, [slotNumber]: `Unable to scrape: ${error.message}. Please enter details manually.` }));
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
    const isWildcard = slotNumber === 4;

    return (
      <div key={slotNumber} className={`border-2 ${isWildcard ? 'border-[#D0ED00] border-4' : 'border-gray-300'} rounded-lg p-4 bg-white`}>
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
                {isWildcard && <span className="ml-2 text-xs bg-gradient-to-r from-[#009900] to-[#D0ED00] text-white px-2 py-0.5 rounded font-bold">🃏 Wildcard</span>}
              </h4>
              {hasEvent && !isExpanded && (
                <p className="text-xs text-gray-600 mt-0.5">{event.title}</p>
              )}
            </div>
          </div>

          {/* Move Up/Down Buttons */}
          {hasEvent && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMoveUp(slotNumber)}
                disabled={slotNumber === 1 || saving[slotNumber] || saving[slotNumber - 1]}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Move Up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleMoveDown(slotNumber)}
                disabled={slotNumber === 7 || saving[slotNumber] || saving[slotNumber + 1]}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Move Down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          )}
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
                  type="date"
                  value={event.date || ''}
                  onChange={(e) => handleInputChange(slotNumber, 'date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Time *</label>
                <input
                  type="text"
                  value={event.time || ''}
                  onChange={(e) => handleInputChange(slotNumber, 'time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder='e.g., "7:30 PM" or "6:00 PM - 8:00 PM"'
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
      {/* Region Selector */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-purple-900 mb-1">📍 Region</h3>
            <p className="text-xs text-purple-700">
              Select the region to manage events for
            </p>
          </div>
          <select
            value={selectedRegion}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="px-4 py-2 border-2 border-purple-400 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {Object.entries(REGIONS).map(([id, config]) => (
              <option key={id} value={id}>
                {config.displayName} {!config.isActive && '(Coming Soon)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-sm text-blue-900 mb-1">Events Page Listings (7 Slots) - {REGIONS[selectedRegion]?.name || selectedRegion}</h3>
        <p className="text-xs text-blue-700">
          Slots 1-4 are <strong>Featured Events</strong> (displayed in 2x2 grid). Slots 5-7 are standard events (displayed below).
          Empty slots won't appear on the public events page.
        </p>
      </div>

      {/* Auto-Fill Button */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-[#009900] rounded-lg p-4 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
              🎯 Smart Cleanup & Auto-Fill
            </h3>
            <p className="text-sm text-gray-700 mb-2">
              Two-step process: Clean up past events, then auto-fill empty slots.
            </p>
            <ul className="text-xs text-gray-600 space-y-1 mb-3">
              <li>• <strong>Step 1:</strong> Deletes past events (today or earlier)</li>
              <li>• <strong>Step 2:</strong> Scrapes {Object.keys(organizationEventPages).length} organizations for events in the <strong>next 2 weeks</strong></li>
              <li>• Limits to <strong>1 event per organization</strong> (max diversity)</li>
              <li>• Only fills <strong>empty slots</strong> (preserves future events)</li>
            </ul>
            {batchResults && (
              <div className="text-xs bg-white rounded p-2 border border-green-200">
                <p className="text-green-700 font-semibold">
                  ✓ Last run: Found {batchResults.total} events, filled {batchResults.selected} slots
                </p>
                <p className="text-gray-600 mt-1">
                  Organizations: {batchResults.orgs.slice(0, 3).join(', ')}
                  {batchResults.orgs.length > 3 && ` +${batchResults.orgs.length - 3} more`}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleBatchScrape}
            disabled={batchScraping}
            className="px-6 py-3 bg-gradient-to-r from-[#009900] to-[#007700] text-white rounded-lg font-bold text-sm hover:from-[#007700] hover:to-[#005500] disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg transition-all whitespace-nowrap"
          >
            {batchScraping ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Scraping...
              </span>
            ) : (
              'Auto-Fill 7 Events'
            )}
          </button>
        </div>
      </div>

      {[1, 2, 3, 4, 5, 6, 7].map(slotNumber => renderEventSlot(slotNumber))}
    </div>
  );
}

export default EventSlotsManager;
