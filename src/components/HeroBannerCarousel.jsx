import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Preload an image and return a promise
const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = reject;
    img.src = src;
  });
};

function HeroBannerCarousel() {
  const [currentBanner, setCurrentBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [userRegion, setUserRegion] = useState('grand-rapids'); // Default to GR

  // Format region slug to display name (e.g., "grand-rapids" → "Grand Rapids")
  const formatRegionName = (regionSlug) => {
    if (!regionSlug) return '';
    return regionSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

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
              const storedIndex = sessionStorage.getItem('lastHeroBannerIndex');
              if (storedIndex === null) {
                // Brand new visitor - start at first banner
                bannerIndex = 0;
              } else {
                // Returning visitor - rotate to next
                bannerIndex = (parseInt(storedIndex) + 1) % banners.length;
              }
              sessionStorage.setItem('lastHeroBannerIndex', bannerIndex.toString());
              sessionStorage.setItem('bannerRotatedThisSession', 'true');
            } else {
              bannerIndex = parseInt(sessionStorage.getItem('lastHeroBannerIndex') || '0');
            }

            const banner = banners[bannerIndex];

            // Preload the image before showing
            try {
              await preloadImage(banner.image_url);
              if (!cancelled) {
                setCurrentBanner(banner);
                setImageLoaded(true);
                setLoading(false);
                setHasLoaded(true);
                displayedFromCache = true;
              }
            } catch (e) {
              console.warn('Failed to preload cached banner image:', e);
            }
          }
        } catch (e) {
          console.error('Error parsing cached banners:', e);
        }
      }

      try {
        // Fetch banners in two queries since .or() with hyphenated strings can be problematic
        // Query 1: Universal banners (null region_id)
        const { data: universalBanners, error: universalError } = await supabase
          .from('hero_banners')
          .select('*')
          .eq('is_active', true)
          .is('region_id', null)
          .order('slot_number');

        // Query 2: Region-specific banners
        const { data: regionBanners, error: regionError } = await supabase
          .from('hero_banners')
          .select('*')
          .eq('is_active', true)
          .eq('region_id', region)
          .order('slot_number');

        const error = universalError || regionError;

        // Combine, filter out any without images, and sort by slot_number
        const banners = [...(universalBanners || []), ...(regionBanners || [])]
          .filter(b => b.image_url) // Only include banners that have an image
          .sort((a, b) => a.slot_number - b.slot_number);

        console.log('🎯 Hero banners query result:', { region, bannerCount: banners?.length, universalCount: universalBanners?.length, regionCount: regionBanners?.length, banners });

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
              const storedIndex = sessionStorage.getItem('lastHeroBannerIndex');
              if (storedIndex === null) {
                // Brand new visitor - start at first banner
                bannerIndex = 0;
              } else {
                // Returning visitor - rotate to next
                bannerIndex = (parseInt(storedIndex) + 1) % banners.length;
              }
              sessionStorage.setItem('lastHeroBannerIndex', bannerIndex.toString());
              sessionStorage.setItem('bannerRotatedThisSession', 'true');
            } else {
              // Subsequent mount (tab navigation) - use current banner
              bannerIndex = parseInt(sessionStorage.getItem('lastHeroBannerIndex') || '0');
            }

            const banner = banners[bannerIndex];

            // Preload the image before showing
            try {
              await preloadImage(banner.image_url);
              if (!cancelled) {
                setCurrentBanner(banner);
                setImageLoaded(true);
                setLoading(false);
                setHasLoaded(true);
              }
            } catch (e) {
              console.warn('Failed to preload banner image:', e);
              if (!cancelled) {
                setLoading(false);
                setHasLoaded(true);
              }
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
        {/* Region indicator - show even while loading */}
        <div
          className="absolute bottom-2 right-7 text-gray-600 text-xl font-semibold"
          style={{ fontFamily: "'IBM Plex Sans', sans-serif", textDecoration: 'underline', textUnderlineOffset: '2px' }}
        >
          {formatRegionName(userRegion)}
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
            loading="eager"
            fetchpriority="high"
          />
        </a>
      ) : (
        <img
          src={currentBanner.image_url}
          alt={currentBanner.alt_text || 'Hero Banner'}
          className="w-full h-full object-cover"
          loading="eager"
          fetchpriority="high"
        />
      )}
      {/* Region indicator */}
      <div
        className="absolute bottom-2 right-7 text-white text-xl font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
        style={{ fontFamily: "'IBM Plex Sans', sans-serif", textDecoration: 'underline', textUnderlineOffset: '2px' }}
      >
        {formatRegionName(userRegion)}
      </div>
    </div>
  );
}

export default HeroBannerCarousel;
