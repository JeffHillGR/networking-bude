import { X, Crown, Sparkles } from 'lucide-react';

function UpgradeModal({ isOpen, onClose, onUpgrade }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#009900] to-[#D0ED00] rounded-full mb-6">
            <Crown className="w-8 h-8 text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Premium Feature
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            This feature is only available to paid subscribers. Upgrade your plan to unlock unlimited connections, events, and more!
          </p>

          {/* Features Preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-gray-900 mb-3">With BudE Plan you get:</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#009900]" />
                Unlimited connections
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#009900]" />
                Unlimited event access
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#009900]" />
                Connection insights & analytics
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#009900]" />
                Messaging between professionals
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button
              onClick={onUpgrade}
              className="w-full bg-[#009900] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#007700] transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Find Out More
            </button>
            <button
              onClick={onClose}
              className="w-full text-gray-600 py-2 px-6 rounded-lg font-medium hover:text-gray-900 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpgradeModal;