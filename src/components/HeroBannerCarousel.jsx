import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function HeroBannerCarousel() {
  const [currentBanner, setCurrentBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data: banners, error } = await supabase
          .from('hero_banners')
          .select('*')
          .eq('is_active', true)
          .order('slot_number');

        if (error) throw error;

        if (banners && banners.length > 0) {
          // Rotate through banners on each page load
          // Use sessionStorage to track which banner was shown last
          const lastShownIndex = parseInt(sessionStorage.getItem('lastHeroBannerIndex') || '0');
          const nextIndex = (lastShownIndex + 1) % banners.length;

          setCurrentBanner(banners[nextIndex]);
          sessionStorage.setItem('lastHeroBannerIndex', nextIndex.toString());
        }
      } catch (error) {
        console.error('Error loading hero banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading) {
    return null; // Don't show anything while loading
  }

  // If no active banners, show fallback static banner
  if (!currentBanner) {
    return (
      <div className="relative h-48 rounded-lg overflow-hidden shadow-lg bg-gradient-to-r from-green-600 to-lime-400">
        <img
          src="/Tech-Week-rooftop.jpg"
          alt="Networking Event at Sunset"
          className="w-full h-full object-cover"
          loading="eager"
          fetchpriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Connect. Discover. Grow.</h2>
        </div>
      </div>
    );
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
