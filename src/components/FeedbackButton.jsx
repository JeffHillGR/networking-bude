import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function FeedbackButton() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    loveFeatures: '',
    improveFeatures: '',
    newFeatures: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submitFeedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      // Show success message
      setShowSuccess(true);
      setFormData({ name: '', email: '', loveFeatures: '', improveFeatures: '', newFeatures: '' });

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowModal(false);
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('There was an error submitting your feedback. Please try emailing us directly at grjeff@gmail.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 md:bottom-6 right-6 bg-[#009900] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#007700] transition-all z-40 flex items-center gap-2 border-2 border-[#D0ED00] font-medium"
        aria-label="Send Feedback"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline">Feedback</span>
      </button>

      {/* Feedback Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Send Feedback</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {showSuccess ? (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Thank you!</h3>
                  <p className="text-gray-600">Your feedback has been submitted.</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-6">
                    We'd love to hear from you! Share your thoughts below.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name (optional)</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <span className="text-xl">👍</span>
                        I love these features
                      </label>
                      <textarea
                        value={formData.loveFeatures}
                        onChange={(e) => setFormData({ ...formData, loveFeatures: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent resize-none"
                        placeholder="Tell us what you love about BudE..."
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <span className="text-xl">💡</span>
                        These features could use some work
                      </label>
                      <textarea
                        value={formData.improveFeatures}
                        onChange={(e) => setFormData({ ...formData, improveFeatures: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent resize-none"
                        placeholder="What could we improve?"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <span className="text-xl">❤️</span>
                        I'd love to see this feature
                      </label>
                      <textarea
                        value={formData.newFeatures}
                        onChange={(e) => setFormData({ ...formData, newFeatures: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009900] focus:border-transparent resize-none"
                        placeholder="What new features would you like?"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-[#009900] text-white rounded-lg font-medium hover:bg-[#007700] transition-colors border-2 border-[#D0ED00] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Sending...' : 'Send Feedback'}
                      </button>
                    </div>
                  </form>

                  <p className="text-xs text-gray-500 mt-4 text-center">
                    Or email us directly at{' '}
                    <a href="mailto:grjeff@gmail.com" className="text-blue-600 hover:underline">
                      grjeff@gmail.com
                    </a>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
