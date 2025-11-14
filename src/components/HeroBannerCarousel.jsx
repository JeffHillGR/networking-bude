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

  if (loading || !currentBanner) {
    return null; // Don't show anything while loading or if no banners
  }

  return (
    <div className="relative w-full bg-gray-100 overflow-hidden">
      {currentBanner.click_url ? (
        <a
          href={currentBanner.click_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
        >
          <img
            src={currentBanner.image_url}
            alt={currentBanner.alt_text || 'Hero Banner'}
            className="w-full h-auto object-cover"
            style={{ maxHeight: '300px' }}
          />
        </a>
      ) : (
        <img
          src={currentBanner.image_url}
          alt={currentBanner.alt_text || 'Hero Banner'}
          className="w-full h-auto object-cover"
          style={{ maxHeight: '300px' }}
        />
      )}
    </div>
  );
}

export default HeroBannerCarousel;
