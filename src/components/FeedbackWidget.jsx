import { Lightbulb } from 'lucide-react';

function FeedbackWidget({ onOpenFeedback }) {
  return (
    <>
      {/* Mobile: Floating circular button - much smaller */}
      <button
        onClick={onOpenFeedback}
        className="md:hidden fixed right-3 bottom-20 bg-[#D0ED00] text-gray-900 w-10 h-10 rounded-full shadow-md hover:shadow-lg transition-all duration-200 border-2 border-[#009900] flex items-center justify-center z-40"
        aria-label="Share Your Ideas"
      >
        <Lightbulb className="w-5 h-5" />
      </button>

      {/* Desktop: Tab on right edge - much smaller */}
      <div className="hidden md:block fixed right-0 bottom-6 z-40">
        <button
          onClick={onOpenFeedback}
          className="bg-[#D0ED00] text-gray-900 shadow-md hover:shadow-lg transition-all duration-200 border-2 border-[#D0ED00] border-r-0 flex items-center justify-center group hover:-translate-x-1"
          style={{
            borderTopLeftRadius: '6px',
            borderBottomLeftRadius: '6px',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            padding: '8px 6px'
          }}
          aria-label="Give Feedback"
        >
          <div className="flex flex-col items-center gap-1">
            <Lightbulb className="w-3 h-3" style={{ transform: 'rotate(90deg)' }} />
            <span className="font-semibold text-[10px] tracking-wide">
              FEEDBACK
            </span>
          </div>
        </button>
      </div>
    </>
  );
}

export default FeedbackWidget;
