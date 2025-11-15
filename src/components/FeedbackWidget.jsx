import { Lightbulb } from 'lucide-react';

function FeedbackWidget({ onOpenFeedback }) {
  return (
    <>
      {/* Mobile: Floating circular button - 40% smaller */}
      <button
        onClick={onOpenFeedback}
        className="md:hidden fixed right-4 bottom-24 bg-[#D0ED00] text-gray-900 w-8 h-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-[#009900] flex items-center justify-center z-40"
        aria-label="Share Your Ideas"
      >
        <Lightbulb className="w-4 h-4" />
      </button>

      {/* Desktop: Tab on right edge - 40% smaller */}
      <div className="hidden md:block fixed right-0 bottom-8 z-40">
        <button
          onClick={onOpenFeedback}
          className="bg-[#D0ED00] text-gray-900 shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-[#D0ED00] border-r-0 flex items-center justify-center group hover:-translate-x-1"
          style={{
            borderTopLeftRadius: '8px',
            borderBottomLeftRadius: '8px',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed'
          }}
          aria-label="Give Feedback"
        >
          <div className="flex flex-col items-center gap-1 py-3 px-2">
            <Lightbulb className="w-3 h-3" style={{ transform: 'rotate(90deg)' }} />
            <span className="font-bold text-xs tracking-wider">
              FEEDBACK
            </span>
          </div>
        </button>
      </div>
    </>
  );
}

export default FeedbackWidget;
