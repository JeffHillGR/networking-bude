import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ChevronDown, ChevronUp, X } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import { supabase } from '../lib/supabase.js';

function ResourcesInsights() {
  const navigate = useNavigate();
  const [showArchive, setShowArchive] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [loadedContent, setLoadedContent] = useState([null, null, null]);
  const [isLoading, setIsLoading] = useState(true);

  // Load featured content from Supabase on mount
  useEffect(() => {
    const loadFeaturedContent = async () => {
      try {
        const { data, error } = await supabase
          .from('featured_content')
          .select('*')
          .order('slot_number', { ascending: true });

        if (error) {
          console.error('Error loading featured content:', error);
          setIsLoading(false);
          return;
        }

        if (data && data.length > 0) {
          const contentArray = [null, null, null];

          data.forEach(item => {
            const index = item.slot_number - 1;
            if (index >= 0 && index < 3) {
              contentArray[index] = {
                image: item.image,
                title: item.title,
                description: item.description,
                url: item.url,
                tags: item.tags,
                sponsoredBy: item.sponsored_by,
                fullContent: item.full_content
              };
            }
          });

          setLoadedContent(contentArray);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error in loadFeaturedContent:', err);
        setIsLoading(false);
      }
    };

    loadFeaturedContent();
  }, []);

  const defaultFeaturedContent = [
    {
      image: 'https://travischappell.com/wp-content/uploads/2023/08/phone-img-podcast.png',
      title: 'How to Lose Everything and Come Back Even Stronger with Annette Raynor',
      description: 'Travis Chappell interviews Annette Raynor, who brings two decades of IT experience. Learn about resilience through economic downturns, building enterprises, and the lessons learned from overcoming significant financial setbacks.',
      url: 'https://travischappell.com/travis_podcast/047-how-to-lose-everything-and-come-back-even-stronger-with-annette-raynor/',
      tags: 'Resilience, Entrepreneurship',
      sponsoredBy: ''
    },
    {
      image: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/52/2c/26/522c2689-01a0-f2c4-37b9-20034b428603/mza_15419489958704245485.jpg/540x540bb.webp',
      title: 'The Not Perfect Networking Podcast',
      description: 'Networking doesn\'t have to be perfect to be powerful. Join us for real conversations about building genuine connections in business and life. Perfect for professionals who want to network authentically.',
      url: 'https://podcasts.apple.com/us/podcast/the-not-perfect-networking-podcast/id1802926391',
      tags: 'Networking, Professional Development',
      sponsoredBy: ''
    },
    {
      image: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/aa/8e/72/aa8e72f7-643a-f98e-f929-3586a8c3ef62/mza_10593625707581288470.jpg/540x540bb.webp',
      title: 'How to Build Systems to Actually Achieve Your Goals',
      description: "Are your goals holding you back? In this episode, I'll show you why focusing on big, long-term results can actually demotivate you—and how shifting to daily, actionable systems can help you achieve real progress.",
      url: 'https://podcasts.apple.com/us/podcast/how-to-build-systems-to-actually-achieve-your-goals/id1033048640?i=1000728624111',
      tags: 'Goal Setting, Personal Growth',
      sponsoredBy: ''
    }
  ];

  // Build featured content array: use database content where available, otherwise use defaults
  const slot1 = (loadedContent[0] && loadedContent[0].title) ? loadedContent[0] : defaultFeaturedContent[0];
  const slot2 = (loadedContent[1] && loadedContent[1].title) ? loadedContent[1] : defaultFeaturedContent[1];
  const slot3 = (loadedContent[2] && loadedContent[2].title) ? loadedContent[2] : defaultFeaturedContent[2];

  const featuredContent = [slot1, slot2, slot3];

  // Archived content - these were previously featured
  const archivedContent = [
    {
      image: 'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1320417949i/84699.jpg',
      title: 'Never Eat Alone: The Power of Relationship Building',
      description: 'Keith Ferrazzi\'s groundbreaking book on building authentic professional relationships and mastering the art of networking to advance your career and enrich your life.',
      url: 'https://www.goodreads.com/book/show/84699.Never_Eat_Alone',
      tags: 'Networking, Relationships, Career Growth',
      sponsoredBy: ''
    },
    {
      image: 'https://hbr.org/resources/images/article_assets/2016/04/R1605J_NIEMI_TOC.jpg',
      title: 'Learn to Love Networking',
      description: 'Harvard Business Review explores why networking feels uncomfortable and provides research-backed strategies to make professional networking more authentic and effective.',
      url: 'https://hbr.org/2016/05/learn-to-love-networking',
      tags: 'Networking, Professional Development',
      sponsoredBy: ''
    }
  ];

  const ContentCard = ({ content }) => {
    const handleClick = () => {
      if (content.url) {
        window.open(content.url, '_blank');
      } else if (content.fullContent) {
        setSelectedContent(content);
      }
    };

    const isClickable = content.url || content.fullContent;

    return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-lg shadow-sm p-6 transition-shadow border border-gray-200 ${isClickable ? 'hover:shadow-md cursor-pointer' : ''}`}
    >
      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={content.image}
          alt={content.title}
          className="w-full md:w-48 h-48 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{content.title}</h3>
          <p className="text-gray-600 mb-4">{content.description}</p>
          {content.tags && (
            <div className="flex gap-2 flex-wrap mb-3">
              {content.tags.split(',').map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
          {content.sponsoredBy && (
            <p className="text-xs text-gray-500 italic">Sponsored by {content.sponsoredBy}</p>
          )}
          {content.url && (
            <div className="flex items-center gap-1 text-[#009900] font-medium mt-2">
              <span>View Content</span>
              <ExternalLink className="w-4 h-4" />
            </div>
          )}
          {!content.url && content.fullContent && (
            <div className="flex items-center gap-1 text-[#009900] font-medium mt-2">
              <span>Read Full Article</span>
            </div>
          )}
        </div>
      </div>
    </div>
    );
  };

  return (
    <>
      {/* Top banner matching site header */}
      <div className="bg-gradient-to-r from-[#009900] to-[#D0ED00] text-white px-4 py-1 text-center text-sm md:text-base">
        <span className="font-medium">
          Welcome to Networking BudE • <button
          onClick={() => {
            localStorage.removeItem('onboardingCompleted');
            window.location.href = '/';
          }}
          className="underline hover:no-underline font-medium"
        >
          Reset to Onboarding
        </button>
        </span>
      </div>

      <div className="flex min-h-screen bg-gray-50">
        <Sidebar activeTab="resources" setActiveTab={() => navigate('/dashboard')} />

        <div className="flex-1">
          <div className="bg-white border-b border-gray-200">
            <div className="px-4 py-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-[#009900] hover:text-[#007700] font-medium mb-4 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="text-center">
                <div className="inline-block bg-white px-6 py-3 rounded-lg mb-3 border-2 border-black">
                  <h1 className="text-3xl font-bold text-black">Resources & Insights</h1>
                </div>
                <p className="text-gray-600 mt-2">Curated content to help you grow</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-6 max-w-4xl mx-auto">
            {/* Featured Content */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Featured Content</h2>
              <div className="space-y-6">
                {featuredContent.map((content, index) => (
                  <ContentCard key={index} content={content} />
                ))}
              </div>
            </div>

            {/* Content Archive */}
            <div className="mb-8">
              <button
                onClick={() => setShowArchive(!showArchive)}
                className="flex items-center justify-between w-full p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-bold text-gray-900">Content Archive</h2>
                {showArchive ? (
                  <ChevronUp className="w-6 h-6 text-gray-600" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-600" />
                )}
              </button>

              {showArchive && (
                <div className="mt-6 space-y-6">
                  {archivedContent.map((content, index) => (
                    <ContentCard key={index} content={content} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Content Modal */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
              <div className="flex-1 pr-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedContent.title}</h2>
                {selectedContent.tags && (
                  <div className="flex gap-2 flex-wrap">
                    {selectedContent.tags.split(',').map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedContent(null)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {selectedContent.image && (
                <img
                  src={selectedContent.image}
                  alt={selectedContent.title}
                  className="w-full max-h-96 object-cover rounded-lg mb-6"
                />
              )}

              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedContent.fullContent}
                </p>
              </div>

              {selectedContent.sponsoredBy && (
                <p className="text-sm text-gray-500 italic mt-6 pt-6 border-t border-gray-200">
                  Sponsored by {selectedContent.sponsoredBy}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ResourcesInsights;
