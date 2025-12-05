import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function HeroBannerCarousel() {
  const [currentBanner, setCurrentBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [userRegion, setUserRegion] = useState('grand-rapids'); // Default to GR

  useEffect(() => {
    let cancelled = false;

    // Clear rotation flag on page load (not on component remount)
    // This ensures rotation happens on refresh but not on tab navigation
    if (performance.navigation.type === 1 || !sessionStorage.getItem('pageLoaded')) {
      sessionStorage.removeItem('bannerRotatedThisSession');
      sessionStorage.setItem('pageLoaded', 'true');
    }

    // First, get the user's region
    const getUserRegion = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('region')
            .eq('id', user.id)
            .single();

          if (profile?.region) {
            setUserRegion(profile.region);
            return profile.region;
          }
        }
      } catch (e) {
        console.warn('Could not get user region, using default');
      }
      return 'grand-rapids'; // Default fallback
    };

    // Try to load cached banners immediately for instant display
    const cachedBanners = sessionStorage.getItem('cachedHeroBanners');
    const cachedRegion = sessionStorage.getItem('cachedBannerRegion');
    let displayedFromCache = false;

    const fetchBanners = async () => {
      const region = await getUserRegion();

      // Only use cache if it matches user's region
      if (cachedBanners && cachedRegion === region) {
        try {
          const banners = JSON.parse(cachedBanners);
          if (banners && banners.length > 0) {
            // Determine which banner to show
            const hasRotatedThisSession = sessionStorage.getItem('bannerRotatedThisSession');
            let bannerIndex;

            if (!hasRotatedThisSession) {
              const lastShownIndex = parseInt(sessionStorage.getItem('lastHeroBannerIndex') || '0');
              bannerIndex = (lastShownIndex + 1) % banners.length;
              sessionStorage.setItem('lastHeroBannerIndex', bannerIndex.toString());
              sessionStorage.setItem('bannerRotatedThisSession', 'true');
            } else {
              bannerIndex = parseInt(sessionStorage.getItem('lastHeroBannerIndex') || '0');
            }

            const banner = banners[bannerIndex];

            // Show cached banner immediately
            setCurrentBanner(banner);
            setImageLoaded(true);
            setLoading(false);
            setHasLoaded(true);
            displayedFromCache = true;
          }
        } catch (e) {
          console.error('Error parsing cached banners:', e);
        }
      }

      try {
        // Fetch banners for user's region (or universal banners with null region)
        const { data: banners, error } = await supabase
          .from('hero_banners')
          .select('*')
          .eq('is_active', true)
          .or(`region_id.eq.${region},region_id.is.null`)
          .order('slot_number');

        console.log('🎯 Hero banners query result:', { region, banners, error });

        if (error) throw error;

        if (cancelled) return; // Don't proceed if effect was cleaned up

        if (banners && banners.length > 0) {
          // Cache the fresh banners for next time (with region)
          sessionStorage.setItem('cachedHeroBanners', JSON.stringify(banners));
          sessionStorage.setItem('cachedBannerRegion', region);

          // Only update display if we didn't already show from cache
          if (!displayedFromCache) {
            // Only rotate on page refresh, not on component remount
            // Check if we've already rotated during this page session
            const hasRotatedThisSession = sessionStorage.getItem('bannerRotatedThisSession');

            let bannerIndex;
            if (!hasRotatedThisSession) {
              // First mount after page load - rotate to next banner
              const lastShownIndex = parseInt(sessionStorage.getItem('lastHeroBannerIndex') || '0');
              bannerIndex = (lastShownIndex + 1) % banners.length;
              sessionStorage.setItem('lastHeroBannerIndex', bannerIndex.toString());
              sessionStorage.setItem('bannerRotatedThisSession', 'true');
            } else {
              // Subsequent mount (tab navigation) - use current banner
              bannerIndex = parseInt(sessionStorage.getItem('lastHeroBannerIndex') || '0');
            }

            const banner = banners[bannerIndex];

            // Show banner
            if (!cancelled) {
              setCurrentBanner(banner);
              setImageLoaded(true);
              setLoading(false);
              setHasLoaded(true);
            }
          }
        } else {
          if (!cancelled && !displayedFromCache) {
            setLoading(false);
            setHasLoaded(true);
          }
        }
      } catch (error) {
        if (!cancelled && !displayedFromCache) {
          console.error('Error loading hero banners:', error);
          setLoading(false);
          setHasLoaded(true);
        }
      }
    };

    fetchBanners();

    // Cleanup function to prevent state updates after unmount
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="relative h-48 rounded-lg overflow-hidden shadow-lg bg-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-[#009900]"></div>
            <p className="text-gray-600 mt-3 text-sm">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // If no active banners after loading, don't render anything
  if (!currentBanner) {
    return null;
  }

  return (
    <div className="relative h-48 rounded-lg overflow-hidden shadow-lg bg-gradient-to-r from-green-600 to-lime-400">
      {currentBanner.click_url ? (
        <a
          href={currentBanner.click_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          <img
            src={currentBanner.image_url}
            alt={currentBanner.alt_text || 'Hero Banner'}
            className="w-full h-full object-cover"
          />
        </a>
      ) : (
        <img
          src={currentBanner.image_url}
          alt={currentBanner.alt_text || 'Hero Banner'}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}

export default HeroBannerCarousel;
