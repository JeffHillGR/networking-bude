import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Shield } from 'lucide-react';

export default function CancelEmailChange() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const cancelRequest = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid cancellation link. Please check your email and try again.');
        return;
      }

      try {
        const response = await fetch('/api/cancelEmailChange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (!response.ok) {
          setStatus('error');
          setMessage(data.error || 'Failed to cancel email change request');
          return;
        }

        setStatus('success');
        setMessage(data.message || 'Email change request cancelled successfully.');

        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (error) {
        console.error('Error cancelling email change:', error);
        setStatus('error');
        setMessage('An error occurred. Please try again.');
      }
    };

    cancelRequest();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* BudE Logo */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-green-600 to-lime-400 text-white px-6 py-2 rounded-full font-bold text-xl">
            BudE
          </div>
        </div>

        {/* Status Content */}
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Cancelling Request...
            </h2>
            <p className="text-gray-600">
              Please wait while we cancel the email change request.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Request Cancelled
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800">
                Your email address remains unchanged and your account is secure.
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Redirecting to BudE...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Cancellation Failed
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                The cancellation link may have expired or already been used. If you're concerned about your account security, please contact support.
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-green-600 to-lime-400 text-white rounded-lg font-medium hover:from-green-700 hover:to-lime-500 transition-all"
            >
              Return to BudE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
