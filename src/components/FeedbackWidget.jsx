import { Lightbulb } from 'lucide-react';

function FeedbackWidget({ onOpenFeedback }) {
  return (
    <>
      {/* Mobile: Floating circular button */}
      <button
        onClick={onOpenFeedback}
        className="md:hidden fixed right-4 bottom-24 bg-[#D0ED00] text-gray-900 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border-[3px] border-[#009900] flex items-center justify-center z-40"
        aria-label="Share Your Ideas"
      >
        <Lightbulb className="w-6 h-6" />
      </button>

      {/* Desktop: Tab on right edge */}
      <div className="hidden md:block fixed right-0 bottom-8 z-40">
        <button
          onClick={onOpenFeedback}
          className="bg-[#D0ED00] text-gray-900 shadow-lg hover:shadow-xl transition-all duration-200 border-[3px] border-[#D0ED00] border-r-0 flex items-center justify-center group hover:-translate-x-1"
          style={{
            borderTopLeftRadius: '12px',
            borderBottomLeftRadius: '12px',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed'
          }}
          aria-label="Give Feedback"
        >
          <div className="flex flex-col items-center gap-2 py-5 px-3">
            <Lightbulb className="w-5 h-5" style={{ transform: 'rotate(90deg)' }} />
            <span className="font-bold text-sm tracking-wider">
              FEEDBACK
            </span>
          </div>
        </button>
      </div>
    </>
  );
}

export default FeedbackWidget;
