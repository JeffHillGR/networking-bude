import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ChevronDown, ChevronUp, X, Share2 } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../contexts/AuthContext.jsx';

function ResourcesInsights() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showArchive, setShowArchive] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [loadedContent, setLoadedContent] = useState([null, null, null]);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

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
                fullContent: item.full_content,
                author: item.author
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

  // Check if non-authenticated user has already viewed content
  useEffect(() => {
    if (!user) {
      const hasViewedPublicContent = sessionStorage.getItem('hasViewedPublicContent');
      if (hasViewedPublicContent) {
        // They've already viewed one piece of content, show signup prompt
        setShowSignupPrompt(true);
      } else {
        // First view is free, mark it
        sessionStorage.setItem('hasViewedPublicContent', 'true');
      }
    }
  }, [user]);

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
      image: 'https://travischappell.com/wp-content/uploads/2023/08/phone-img-podcast.png',
      title: 'How to Lose Everything and Come Back Even Stronger with Annette Raynor',
      description: 'Travis Chappell interviews Annette Raynor, who brings two decades of IT experience. Learn about resilience through economic downturns, building enterprises, and the lessons learned from overcoming significant financial setbacks.',
      url: 'https://travischappell.com/travis_podcast/047-how-to-lose-everything-and-come-back-even-stronger-with-annette-raynor/',
      tags: 'Resilience, Entrepreneurship',
      sponsoredBy: ''
    },
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

  const ContentCard = ({ content, slotNumber }) => {
    const handleClick = () => {
      if (content.url) {
        window.open(content.url, '_blank');
      } else if (content.fullContent) {
        setSelectedContent({...content, slotNumber});
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
          {content.author && (
            <p className="text-sm text-gray-500 italic mb-2">By {content.author}</p>
          )}
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
          <div className="flex items-center justify-between mt-2">
            <div>
              {content.url && (
                <div className="flex items-center gap-1 text-[#009900] font-medium">
                  <span>View Content</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
              )}
              {!content.url && content.fullContent && (
                <div className="flex items-center gap-1 text-[#009900] font-medium">
                  <span>Read Full Article</span>
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedContent({...content, slotNumber});
                setShowShareModal(true);
              }}
              className="text-gray-600 hover:text-[#009900] transition-colors p-2"
              title="Share content"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
    );
  };

  return (
    <>
      {/* Top banner matching site header */}
      <div className="bg-gradient-to-r from-[#D0ED00] via-[#009900] to-[#D0ED00] text-white px-4 py-1 text-center text-sm md:text-base">
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
                  <ContentCard key={index} content={content} slotNumber={index + 1} />
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
                {selectedContent.author && (
                  <p className="text-sm text-gray-500 italic mb-2">By {selectedContent.author}</p>
                )}
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex-shrink-0 text-gray-600 hover:text-[#009900] transition-colors"
                  title="Share content"
                >
                  <Share2 className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setSelectedContent(null)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
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

      {/* Share Content Modal */}
      {showShareModal && selectedContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setShowShareModal(false);
                setLinkCopied(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-lime-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Share Content</h3>
              <p className="text-sm text-gray-600">{selectedContent.title}</p>
            </div>

            {/* Link Display with Copy Button */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm text-gray-500 mb-1">Share Link:</p>
                  <p className="text-sm font-mono text-gray-900 truncate">
                    {selectedContent.url || `${window.location.origin}/resources-insights`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const shareLink = selectedContent.url || `${window.location.origin}/resources-insights`;
                    try {
                      if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(shareLink).then(() => {
                          setLinkCopied(true);
                          setTimeout(() => setLinkCopied(false), 2000);
                        }).catch(() => {
                          prompt('Copy this link:', shareLink);
                        });
                      } else {
                        prompt('Copy this link:', shareLink);
                      }
                    } catch (err) {
                      prompt('Copy this link:', shareLink);
                    }
                  }}
                  className="flex-shrink-0 bg-[#009900] text-white px-4 py-2 rounded-lg hover:bg-[#007700] transition-colors border-[3px] border-[#D0ED00] flex items-center gap-2"
                >
                  {linkCopied ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Share Options */}
            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Share to:</p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(selectedContent.slotNumber ? `${window.location.origin}/resources-insights/${selectedContent.slotNumber}` : window.location.origin + '/resources-insights')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-lg hover:bg-[#006399] transition-colors text-sm"
                >
                  LinkedIn
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(selectedContent.slotNumber ? `${window.location.origin}/resources-insights/${selectedContent.slotNumber}` : window.location.origin + '/resources-insights')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#145dbf] transition-colors text-sm"
                >
                  Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(selectedContent.slotNumber ? `${window.location.origin}/resources-insights/${selectedContent.slotNumber}` : window.location.origin + '/resources-insights')}&text=${encodeURIComponent('Check out: ' + selectedContent.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                >
                  X
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent('Check out: ' + selectedContent.title)}&body=${encodeURIComponent('I thought you might be interested in this:\n\n' + selectedContent.title + '\n\n' + (selectedContent.slotNumber ? `${window.location.origin}/resources-insights/${selectedContent.slotNumber}` : window.location.origin + '/resources-insights'))}`}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Email
                </a>
              </div>
            </div>

            <button
              onClick={() => {
                setShowShareModal(false);
                setLinkCopied(false);
              }}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Signup Prompt Modal for Non-Authenticated Users */}
      {showSignupPrompt && !user && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl border-4 border-[#D0ED00]">
            <div className="text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-lime-500 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Create an Account for Full Access</h2>
              <p className="text-gray-600 mb-6">
                It only takes 2 minutes to join our networking community and unlock all events and content!
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-[#009900] text-white py-3 rounded-lg font-bold hover:bg-[#007700] transition-colors border-[3px] border-[#D0ED00] mb-3"
              >
                Create Account
              </button>
              <button
                onClick={() => setShowSignupPrompt(false)}
                className="text-gray-500 text-sm hover:text-gray-700"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ResourcesInsights;
