import { MessageCircle } from 'lucide-react';

function FeedbackWidget({ onOpenFeedback }) {
  return (
    <div className="fixed bottom-0 right-6 z-40">
      <button
        onClick={onOpenFeedback}
        className="bg-[#009900] text-white shadow-lg hover:shadow-xl transition-all duration-200 border-[3px] border-[#D0ED00] border-b-0 flex items-center gap-2 group hover:-translate-y-1"
        style={{
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          borderBottomLeftRadius: '0',
          borderBottomRightRadius: '0'
        }}
        aria-label="Give Feedback"
      >
        {/* Mobile: Just icon */}
        <div className="md:hidden py-3 px-4">
          <MessageCircle className="w-5 h-5" />
        </div>

        {/* Desktop: Icon + Text */}
        <div className="hidden md:flex items-center gap-2 py-3 px-5">
          <MessageCircle className="w-5 h-5" />
          <span className="font-bold text-sm whitespace-nowrap">
            FEEDBACK
          </span>
        </div>
      </button>
    </div>
  );
}

export default FeedbackWidget;
