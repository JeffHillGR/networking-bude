import { useState } from 'react';
import { Lightbulb, Share2, X, Mail, Copy, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function FeedbackWidget() {
  const { user } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isShareClosing, setIsShareClosing] = useState(false);
  const [isFeedbackClosing, setIsFeedbackClosing] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    name: '',
    email: '',
    loveFeatures: '',
    improveFeatures: '',
    newFeatures: ''
  });

  const shareUrl = 'https://www.networkingbude.com';

  const closeShareModal = () => {
    setIsShareClosing(true);
    setTimeout(() => {
      setShowShareModal(false);
      setIsShareClosing(false);
    }, 300);
  };

  const closeFeedbackModal = () => {
    if (feedbackSubmitted) return;
    setIsFeedbackClosing(true);
    setTimeout(() => {
      setShowFeedbackModal(false);
      setIsFeedbackClosing(false);
    }, 300);
  };
  const shareSubject = 'Check out Networking BudE!';
  const shareBody = `I thought you might enjoy Networking BudE - a platform for meaningful professional connections.\n\n${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleEmailShare = () => {
    const mailtoLink = `mailto:?subject=${encodeURIComponent(shareSubject)}&body=${encodeURIComponent(shareBody)}`;
    window.location.href = mailtoLink;
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/submitFeedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...feedbackData,
          userId: user?.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit feedback');
      }

      setFeedbackSubmitted(true);

      setTimeout(() => {
        setFeedbackSubmitted(false);
        setShowFeedbackModal(false);
        setFeedbackData({
          name: '',
          email: '',
          loveFeatures: '',
          improveFeatures: '',
          newFeatures: ''
        });
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('There was an error submitting your feedback. Please try again.');
    }
  };

  // Only show for logged-in users
  if (!user) return null;

  return (
    <>
      {/* Mobile: Floating circular buttons - stacked vertically */}
      <div className="md:hidden fixed right-3 bottom-20 z-40 flex flex-col gap-2">
        {/* Share button */}
        <button
          onClick={() => setShowShareModal(true)}
          className="bg-[#009900] text-white w-10 h-10 rounded-full shadow-md hover:shadow-lg transition-all duration-200 border-2 border-[#D0ED00] flex items-center justify-center"
          aria-label="Share Networking BudE"
        >
          <Share2 className="w-5 h-5" />
        </button>
        {/* Feedback button */}
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="bg-[#D0ED00] text-gray-900 w-10 h-10 rounded-full shadow-md hover:shadow-lg transition-all duration-200 border-2 border-[#009900] flex items-center justify-center"
          aria-label="Share Your Ideas"
        >
          <Lightbulb className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop: File folder tabs on right edge */}
      <div className="hidden md:flex fixed right-0 bottom-[46px] z-40 flex-col gap-0">
        {/* Share Tab - Top */}
        <button
          onClick={() => setShowShareModal(true)}
          className="bg-[#009900] text-white shadow-md hover:shadow-lg transition-all duration-200 border-2 border-[#D0ED00] border-r-0 flex items-center justify-center group hover:-translate-x-2"
          style={{
            borderTopLeftRadius: '8px',
            borderBottomLeftRadius: '2px',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            padding: '12px 8px',
            marginBottom: '-2px',
            minHeight: '90px'
          }}
          aria-label="Share Networking BudE"
        >
          <div className="flex flex-col items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5" />
            <span className="font-bold tracking-wide" style={{ fontSize: '10px' }}>
              SHARE
            </span>
          </div>
        </button>

        {/* Feedback Tab - Bottom */}
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="bg-[#D0ED00] text-gray-900 shadow-md hover:shadow-lg transition-all duration-200 border-2 border-[#D0ED00] border-r-0 flex items-center justify-center group hover:-translate-x-2"
          style={{
            borderTopLeftRadius: '2px',
            borderBottomLeftRadius: '8px',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            padding: '12px 8px',
            minHeight: '90px'
          }}
          aria-label="Give Feedback"
        >
          <div className="flex flex-col items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" style={{ transform: 'rotate(90deg)' }} />
            <span className="font-bold tracking-wide" style={{ fontSize: '10px' }}>
              FEEDBACK
            </span>
          </div>
        </button>
      </div>

      {/* Share Modal - Slides out from right */}
      {showShareModal && (
        <div
          className={`fixed inset-0 bg-black/30 z-50 transition-opacity duration-300 ${isShareClosing ? 'opacity-0' : 'opacity-100'}`}
          onClick={closeShareModal}
        >
          <div
            className={`fixed right-0 bottom-[43px] flex items-end ${isShareClosing ? 'animate-slideOutRight' : 'animate-slideInRight'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Attached Tab - Desktop: full tab, Mobile: icon only */}
            <button
              onClick={closeShareModal}
              className="bg-[#009900] text-white shadow-md border-2 border-[#D0ED00] border-r-0 flex items-center justify-center md:rounded-l-lg mb-[90px] md:mb-[92px]"
              style={{
                borderTopLeftRadius: '8px',
                borderBottomLeftRadius: '8px',
                writingMode: 'vertical-rl',
                textOrientation: 'mixed'
              }}
            >
              {/* Mobile: icon only */}
              <div className="md:hidden p-2">
                <Share2 className="w-5 h-5" />
              </div>
              {/* Desktop: icon + text */}
              <div className="hidden md:flex flex-col items-center gap-1.5 py-3 px-2" style={{ minHeight: '90px' }}>
                <Share2 className="w-3.5 h-3.5" />
                <span className="font-bold tracking-wide" style={{ fontSize: '10px' }}>
                  SHARE
                </span>
              </div>
            </button>
            {/* Drawer Content */}
            <div className="w-[300px] bg-white shadow-2xl rounded-l-lg overflow-y-auto">
              <div className="p-5">
                {/* Close button */}
                <button
                  onClick={closeShareModal}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="text-center mb-4 mt-2">
                  <div className="w-12 h-12 bg-[#009900] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Share Networking BudE</h2>
                  <p className="text-sm text-gray-600">Know someone who may enjoy BudE?</p>
                </div>

                {/* Share buttons */}
                <div className="space-y-3">
                  {/* Copy Link Button */}
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-gray-700 text-sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  {/* Email Button */}
                  <button
                    onClick={handleEmailShare}
                    className="w-full flex items-center justify-center gap-2 px-3 py-3 bg-[#009900] hover:bg-[#007700] text-white rounded-lg transition-colors font-medium text-sm border-2 border-[#D0ED00]"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Share via Email</span>
                  </button>
                </div>

                {/* URL Preview */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Link to share:</p>
                  <p className="text-xs text-gray-700 font-mono break-all">{shareUrl}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal - Slides out from right */}
      {showFeedbackModal && (
        <div
          className={`fixed inset-0 bg-black/30 z-50 transition-opacity duration-300 ${isFeedbackClosing ? 'opacity-0' : 'opacity-100'}`}
          onClick={closeFeedbackModal}
        >
          <div
            className={`fixed right-0 bottom-[43px] flex items-end ${isFeedbackClosing ? 'animate-slideOutRight' : 'animate-slideInRight'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Attached Tab - Desktop: full tab, Mobile: icon only */}
            <button
              onClick={closeFeedbackModal}
              className="bg-[#D0ED00] text-gray-900 shadow-md border-2 border-[#D0ED00] border-r-0 flex items-center justify-center md:rounded-l-lg mb-[40px] md:mb-[5px]"
              style={{
                borderTopLeftRadius: '8px',
                borderBottomLeftRadius: '8px',
                writingMode: 'vertical-rl',
                textOrientation: 'mixed'
              }}
            >
              {/* Mobile: icon only */}
              <div className="md:hidden p-2">
                <Lightbulb className="w-5 h-5" />
              </div>
              {/* Desktop: icon + text */}
              <div className="hidden md:flex flex-col items-center gap-1.5 py-3 px-2" style={{ minHeight: '90px' }}>
                <Lightbulb className="w-3.5 h-3.5" style={{ transform: 'rotate(90deg)' }} />
                <span className="font-bold tracking-wide" style={{ fontSize: '10px' }}>
                  FEEDBACK
                </span>
              </div>
            </button>
            {/* Drawer Content */}
            <div className="w-[300px] max-h-[90vh] bg-white shadow-2xl rounded-l-lg overflow-y-auto">
              <div className="p-4">
              {feedbackSubmitted ? (
                <div className="text-center py-8">
                  <div className="mb-3">
                    <svg className="w-12 h-12 mx-auto text-[#009900]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Thank You!</h3>
                  <p className="text-sm text-gray-600 mb-1">Your feedback has been submitted.</p>
                  <p className="text-xs text-gray-500">This helps us make BudE better!</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Share Feedback</h2>
                    <button onClick={closeFeedbackModal} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmitFeedback} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Name (optional)</label>
                        <input
                          type="text"
                          value={feedbackData.name}
                          onChange={(e) => setFeedbackData({...feedbackData, name: e.target.value})}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Email (optional)</label>
                        <input
                          type="email"
                          value={feedbackData.email}
                          onChange={(e) => setFeedbackData({...feedbackData, email: e.target.value})}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                        <span>👍</span>
                        I love these features
                      </label>
                      <textarea
                        value={feedbackData.loveFeatures}
                        onChange={(e) => setFeedbackData({...feedbackData, loveFeatures: e.target.value})}
                        rows="2"
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent resize-none"
                        placeholder="Tell us what you love..."
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                        <span>💡</span>
                        Could use some work
                      </label>
                      <textarea
                        value={feedbackData.improveFeatures}
                        onChange={(e) => setFeedbackData({...feedbackData, improveFeatures: e.target.value})}
                        rows="2"
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent resize-none"
                        placeholder="What could we improve?"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                        <span>❤️</span>
                        I'd love to see this
                      </label>
                      <textarea
                        value={feedbackData.newFeatures}
                        onChange={(e) => setFeedbackData({...feedbackData, newFeatures: e.target.value})}
                        rows="2"
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent resize-none"
                        placeholder="What new features would you like?"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={closeFeedbackModal} className="flex-1 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                      <button type="submit" className="flex-1 px-3 py-2 text-xs bg-[#009900] text-white rounded-lg font-medium hover:bg-[#007700] transition-colors border-2 border-[#D0ED00]">Submit</button>
                    </div>
                  </form>
                </>
              )}

              {/* Footer */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">Networking BudE by The BudE System</p>
              </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(100%);
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out forwards;
        }
        .animate-slideOutRight {
          animation: slideOutRight 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}

export default FeedbackWidget;
