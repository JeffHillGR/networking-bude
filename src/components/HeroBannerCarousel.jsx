import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function HeroBannerCarousel() {
  const [currentBanner, setCurrentBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchBanners = async () => {
      try {
        const { data: banners, error } = await supabase
          .from('hero_banners')
          .select('*')
          .eq('is_active', true)
          .order('slot_number');

        if (error) throw error;

        if (cancelled) return; // Don't proceed if effect was cleaned up

        if (banners && banners.length > 0) {
          // Rotate through banners on each page load
          // Use sessionStorage to track which banner was shown last
          const lastShownIndex = parseInt(sessionStorage.getItem('lastHeroBannerIndex') || '0');
          const nextIndex = (lastShownIndex + 1) % banners.length;

          const banner = banners[nextIndex];

          // Update sessionStorage immediately to prevent double-loading on remounts
          sessionStorage.setItem('lastHeroBannerIndex', nextIndex.toString());

          // Preload the image before showing it
          const img = new Image();
          img.onload = () => {
            if (!cancelled) {
              setCurrentBanner(banner);
              setImageLoaded(true);
              setLoading(false);
              setHasLoaded(true);
            }
          };
          img.onerror = () => {
            if (!cancelled) {
              // If image fails to load, still show the banner
              setCurrentBanner(banner);
              setLoading(false);
              setHasLoaded(true);
            }
          };
          img.src = banner.image_url;
        } else {
          if (!cancelled) {
            setLoading(false);
            setHasLoaded(true);
          }
        }
      } catch (error) {
        if (!cancelled) {
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
