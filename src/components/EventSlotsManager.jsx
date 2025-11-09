import { useState, useEffect } from 'react';
import { Upload, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase.js';

function EventSlotsManager() {
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedSlot, setExpandedSlot] = useState(null);
  const [saving, setSaving] = useState({});

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
      const eventData = {
        ...event,
        slot_number: slotNumber,
        is_featured: slotNumber <= 4 // Slots 1-4 are featured
      };

      // Check if event exists
      const { data: existing } = await supabase
        .from('events')
        .select('id')
        .eq('slot_number', slotNumber)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('slot_number', slotNumber);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('events')
          .insert(eventData);

        if (error) throw error;
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
          <div className="flex items-center gap-2">
            {hasEvent && (
              <button
                onClick={() => handleDeleteEvent(slotNumber)}
                disabled={saving[slotNumber]}
                className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Expanded Form */}
        {isExpanded && (
          <div className="space-y-3 bg-gray-50 p-4 rounded">
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

            {/* Save Button */}
            <div className="pt-3 border-t">
              <button
                onClick={() => handleSaveEvent(slotNumber)}
                disabled={saving[slotNumber]}
                className="w-full px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving[slotNumber] ? 'Saving...' : `Save Event Slot ${slotNumber}`}
              </button>
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
