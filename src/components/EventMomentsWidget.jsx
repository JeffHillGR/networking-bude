import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function EventMomentsWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMoments = async () => {
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

        // Fetch the 3 most recent active moments for user's region
        const { data, error } = await supabase
          .from('event_moments')
          .select(`
            *,
            event_moment_photos (
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

        // Fetch like counts for each moment
        const momentsWithLikes = await Promise.all((data || []).map(async (moment) => {
          const { count } = await supabase
            .from('event_moment_likes')
            .select('*', { count: 'exact', head: true })
            .eq('event_moment_id', moment.id);

          return { ...moment, likeCount: count || 0 };
        }));

        setMoments(momentsWithLikes);
      } catch (error) {
        console.error('Error fetching event moments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMoments();
  }, [user]);

  // Get the first photo from a moment for the thumbnail
  const getThumbnail = (moment) => {
    const photos = moment.event_moment_photos || [];
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

  // Show empty state if no moments (to maintain grid layout)
  if (moments.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 md:p-5 shadow-sm border border-gray-200">
        <div className="mb-2 text-center">
          <div className="inline-block bg-white px-4 md:px-6 py-2 rounded-lg border-2 border-black md:min-w-[340px]">
            <h3 className="font-bold text-black text-base md:text-lg">Event Moments</h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">The BudE community in pictures</p>
        </div>
        <div className="py-12 text-center">
          <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Event moments coming soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 md:p-5 shadow-sm border border-gray-200 flex flex-col">
      <div className="mb-2 text-center">
        <div className="inline-block bg-white px-4 md:px-6 py-2 rounded-lg border-2 border-black md:min-w-[340px]">
          <h3 className="font-bold text-black text-base md:text-lg">Event Moments</h3>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">The BudE community in pictures</p>
      </div>

      {/* Event Moments Cards */}
      <div className="space-y-4 flex-grow">
        {moments.map((moment) => (
          <div
            key={moment.id}
            onClick={() => navigate('/event-moments')}
            className="flex flex-col md:flex-row items-start gap-4 hover:bg-gray-50 p-2 md:p-3 rounded-lg transition-colors cursor-pointer"
          >
            {/* Thumbnail Image */}
            <div className="relative flex-shrink-0 self-center md:self-start">
              <img
                src={getThumbnail(moment)}
                alt={moment.event_name}
                className="w-28 h-28 md:w-32 md:h-32 rounded-lg object-cover bg-white shadow-sm"
              />
              {/* Photo count badge */}
              {(moment.event_moment_photos?.length || 0) > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  {moment.event_moment_photos.length}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 text-center md:text-left">
              <h4 className="font-bold text-gray-900 mb-1 text-lg leading-tight line-clamp-2">{moment.event_name}</h4>
              <p className="text-xs text-gray-500 italic mb-1">{moment.event_date}</p>
              {moment.organization_name && (
                <p className="text-xs text-gray-600 mb-1">
                  Hosted by {moment.organization_url ? (
                    <a
                      href={moment.organization_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#009900] hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {moment.organization_name}
                    </a>
                  ) : (
                    moment.organization_name
                  )}
                </p>
              )}
              {moment.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{moment.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-auto pt-4 text-center">
        <button
          onClick={() => navigate('/event-moments')}
          className="text-[#009900] font-semibold hover:text-[#007700] transition-colors inline-flex items-center gap-1"
        >
          View all moments <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default EventMomentsWidget;
