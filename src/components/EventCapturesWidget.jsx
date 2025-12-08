import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function EventCapturesWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [captures, setCaptures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCaptures = async () => {
      try {
        // Get user's region
        let userRegion = 'grand-rapids';
        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('region')
            .eq('id', user.id)
            .single();
          if (profile?.region) {
            userRegion = profile.region;
          }
        }

        // Fetch the 3 most recent active captures for user's region
        const { data, error } = await supabase
          .from('event_captures')
          .select(`
            *,
            event_capture_photos (
              id,
              image_url,
              display_order
            )
          `)
          .eq('is_active', true)
          .eq('region_id', userRegion)
          .order('display_order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;

        // Fetch like counts for each capture
        const capturesWithLikes = await Promise.all((data || []).map(async (capture) => {
          const { count } = await supabase
            .from('event_capture_likes')
            .select('*', { count: 'exact', head: true })
            .eq('event_capture_id', capture.id);

          return { ...capture, likeCount: count || 0 };
        }));

        setCaptures(capturesWithLikes);
      } catch (error) {
        console.error('Error fetching event captures:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCaptures();
  }, [user]);

  // Get the first photo from a capture for the thumbnail
  const getThumbnail = (capture) => {
    const photos = capture.event_capture_photos || [];
    const sortedPhotos = photos.sort((a, b) => a.display_order - b.display_order);
    return sortedPhotos[0]?.image_url || '/placeholder-event.jpg';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 md:p-5 shadow-sm border border-gray-200 animate-pulse">
        <div className="mb-2 text-center">
          <div className="inline-block bg-gray-200 h-10 w-48 rounded-lg"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start gap-4 p-2">
              <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show empty state if no captures (to maintain grid layout)
  if (captures.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 md:p-5 shadow-sm border border-gray-200">
        <div className="mb-2 text-center">
          <div className="inline-block bg-[#009900] md:bg-white px-4 md:px-6 py-2 rounded-lg border-2 border-[#D0ED00] md:border-black md:min-w-[340px]">
            <h3 className="font-bold text-white md:text-black text-base md:text-lg">Event Captures</h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">The BudE community out on the town</p>
        </div>
        <div className="py-12 text-center">
          <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Event captures coming soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 md:p-5 shadow-sm border border-gray-200 flex flex-col">
      <div className="mb-2 text-center">
        <div className="inline-block bg-[#009900] md:bg-white px-4 md:px-6 py-2 rounded-lg border-2 border-[#D0ED00] md:border-black md:min-w-[340px]">
          <h3 className="font-bold text-white md:text-black text-base md:text-lg">Event Captures</h3>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">The BudE community out on the town</p>
      </div>

      {/* Event Captures Cards */}
      <div className="space-y-4 flex-grow">
        {captures.map((capture) => (
          <div
            key={capture.id}
            onClick={() => navigate('/event-captures')}
            className="flex flex-col md:flex-row items-start gap-4 hover:bg-gray-50 p-2 md:p-3 rounded-lg transition-colors cursor-pointer"
          >
            {/* Thumbnail Image */}
            <div className="relative flex-shrink-0 self-center md:self-start">
              <img
                src={getThumbnail(capture)}
                alt={capture.event_name}
                className="w-28 h-28 md:w-32 md:h-32 rounded-lg object-cover bg-white shadow-sm"
              />
              {/* Photo count badge */}
              {(capture.event_capture_photos?.length || 0) > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  {capture.event_capture_photos.length}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 text-center md:text-left">
              <h4 className="font-bold text-gray-900 mb-1 text-lg leading-tight line-clamp-2">{capture.event_name}</h4>
              <p className="text-xs text-gray-500 italic mb-1">{capture.event_date}</p>
              {capture.organization_name && (
                <p className="text-xs text-gray-600 mb-1">
                  Hosted by {capture.organization_name}
                </p>
              )}
              {capture.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{capture.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-auto pt-4 text-center">
        <button
          onClick={() => navigate('/event-captures')}
          className="text-[#009900] font-semibold hover:text-[#007700] transition-colors inline-flex items-center gap-1"
        >
          View all captures <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default EventCapturesWidget;
