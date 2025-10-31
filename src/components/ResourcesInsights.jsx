import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import Sidebar from './Sidebar.jsx';

function ResourcesInsights() {
  const navigate = useNavigate();
  const [showArchive, setShowArchive] = useState(false);

  // Load admin-created featured content from localStorage
  const adminContent1 = localStorage.getItem('featuredContent1');
  const adminFeaturedContent1 = adminContent1 ? JSON.parse(adminContent1) : null;

  const adminContent2 = localStorage.getItem('featuredContent2');
  const adminFeaturedContent2 = adminContent2 ? JSON.parse(adminContent2) : null;

  const adminContent3 = localStorage.getItem('featuredContent3');
  const adminFeaturedContent3 = adminContent3 ? JSON.parse(adminContent3) : null;

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

  // Build featured content array: use admin content where available, otherwise use defaults
  const slot1 = (adminFeaturedContent1 && adminFeaturedContent1.title) ? adminFeaturedContent1 : defaultFeaturedContent[0];
  const slot2 = (adminFeaturedContent2 && adminFeaturedContent2.title) ? adminFeaturedContent2 : defaultFeaturedContent[1];
  const slot3 = (adminFeaturedContent3 && adminFeaturedContent3.title) ? adminFeaturedContent3 : defaultFeaturedContent[2];

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

  const ContentCard = ({ content }) => (
    <div
      onClick={() => content.url && window.open(content.url, '_blank')}
      className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
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
        </div>
      </div>
    </div>
  );

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
    </>
  );
}

export default ResourcesInsights;
