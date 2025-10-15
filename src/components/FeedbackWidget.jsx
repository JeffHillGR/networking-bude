import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

function FeedbackWidget({ onOpenFeedback }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        onClick={onOpenFeedback}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="bg-[#009900] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border-[3px] border-[#D0ED00] flex items-center gap-2 group"
        aria-label="Give Feedback"
      >
        {/* Mobile: Just icon */}
        <div className="md:hidden p-4">
          <MessageCircle className="w-6 h-6" />
        </div>

        {/* Desktop: Icon + Text */}
        <div className="hidden md:flex items-center gap-2 py-3 px-4">
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium text-sm whitespace-nowrap">
            Feedback
          </span>
        </div>
      </button>

      {/* Tooltip on hover (desktop only) */}
      {isHovered && (
        <div className="hidden md:block absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap">
          Share your thoughts!
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}

export default FeedbackWidget;
