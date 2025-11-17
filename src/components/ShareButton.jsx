import { useState } from 'react';
import { Share2, Mail, Copy, Check } from 'lucide-react';

export default function ShareButton({
  variant = 'default', // 'default', 'compact', 'banner'
  customText = null,
  className = ''
}) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const [friendName, setFriendName] = useState('');
  const [yourName, setYourName] = useState('');

  const shareUrl = 'https://networking-bude.vercel.app';
  const shareMessage = `Hey! I've been using Networking BudE and thought you might find it helpful. It's designed to help you make more meaningful professional connections. Check it out: ${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleEmailShare = async (e) => {
    e.preventDefault();

    const subject = `${yourName || 'A friend'} invited you to try Networking BudE`;
    const body = `Hey ${friendName || 'there'},

I've just discovered this great app called Networking BudE.com that introduced me to some really great connections, based on my networking goals, current frustrations with traditional networking, and interests; it seems way more meaningful than other networking apps.

Check it out: ${shareUrl}

Let me know what you think and I'll see you soon.

${yourName || ''}`;

    // Use mailto link for email
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;

    setEmailSent(true);
    setTimeout(() => {
      setShowShareModal(false);
      setEmailSent(false);
      setEmail('');
      setFriendName('');
      setYourName('');
    }, 2000);
  };

  // Render different button styles based on variant
  const renderButton = () => {
    if (variant === 'banner') {
      return (
        <div className={`bg-gradient-to-r from-[#009900] to-[#D0ED00] rounded-lg p-4 shadow-md ${className}`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-1">
                {customText || 'Loving your BudE experience?'}
              </h3>
              <p className="text-white text-sm">
                Share it with a friend and help them make better connections too!
              </p>
            </div>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-[#009900] rounded-lg font-semibold hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <Share2 className="w-5 h-5" />
              Share BudE
            </button>
          </div>
        </div>
      );
    }

    if (variant === 'compact') {
      return (
        <button
          onClick={() => setShowShareModal(true)}
          className={`flex items-center gap-2 px-4 py-2 text-[#009900] hover:bg-green-50 rounded-lg transition-colors font-medium ${className}`}
        >
          <Share2 className="w-4 h-4" />
          {customText || 'Share with a friend'}
        </button>
      );
    }

    // Default button
    return (
      <button
        onClick={() => setShowShareModal(true)}
        className={`flex items-center gap-2 px-6 py-3 bg-[#009900] border-2 border-[#D0ED00] text-white rounded-lg font-semibold hover:bg-[#007700] transition-colors ${className}`}
      >
        <Share2 className="w-5 h-5" />
        {customText || 'Share BudE'}
      </button>
    );
  };

  return (
    <>
      {renderButton()}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Share Networking BudE</h3>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setEmailSent(false);
                  setEmail('');
                  setFriendName('');
                  setYourName('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Help a friend discover better networking connections
            </p>

            {/* Copy Link Option */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Copy Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    copied
                      ? 'bg-green-50 text-green-700 border-2 border-green-200'
                      : 'bg-[#009900] text-white hover:bg-[#007700]'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                    </>
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Email Share Option */}
            {!emailSent ? (
              <form onSubmit={handleEmailShare} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name (optional)
                  </label>
                  <input
                    type="text"
                    value={yourName}
                    onChange={(e) => setYourName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Friend's Name (optional)
                  </label>
                  <input
                    type="text"
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    placeholder="Friend's name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Friend's Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                    placeholder="friend@example.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#009900] text-white rounded-lg font-semibold hover:bg-[#007700] transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Send Invitation
                </button>
              </form>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Email Ready!</h4>
                <p className="text-gray-600 text-sm">
                  Your email client should open with the invitation ready to send.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Import XIcon component
function XIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
