import { MessageCircle } from 'lucide-react';

function FeedbackWidget({ onOpenFeedback }) {
  return (
    <div className="fixed right-0 bottom-24 md:bottom-8 z-40">
      <button
        onClick={onOpenFeedback}
        className="bg-[#D0ED00] text-gray-900 shadow-lg hover:shadow-xl transition-all duration-200 border-[3px] border-[#D0ED00] border-r-0 flex items-center justify-center group hover:-translate-x-1"
        style={{
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '0',
          borderBottomLeftRadius: '12px',
          borderBottomRightRadius: '0',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed'
        }}
        aria-label="Give Feedback"
      >
        {/* Mobile: Just icon */}
        <div className="md:hidden py-4 px-3">
          <MessageCircle className="w-5 h-5" style={{ transform: 'rotate(90deg)' }} />
        </div>

        {/* Desktop: Icon + Text (vertical) */}
        <div className="hidden md:flex flex-col items-center gap-2 py-5 px-3">
          <MessageCircle className="w-5 h-5" style={{ transform: 'rotate(90deg)' }} />
          <span className="font-bold text-sm tracking-wider">
            FEEDBACK
          </span>
        </div>
      </button>
    </div>
  );
}

export default FeedbackWidget;
