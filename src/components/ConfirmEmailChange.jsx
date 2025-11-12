import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function ConfirmEmailChange() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, waiting, error
  const [message, setMessage] = useState('');
  const [waitingFor, setWaitingFor] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');

      if (!token || !type) {
        setStatus('error');
        setMessage('Invalid confirmation link. Please check your email and try again.');
        return;
      }

      try {
        const response = await fetch('/api/confirmEmailChange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, type })
        });

        const data = await response.json();

        if (!response.ok) {
          setStatus('error');
          setMessage(data.error || 'Failed to confirm email change');
          return;
        }

        if (data.completed) {
          setStatus('success');
          setMessage(data.message || 'Email change completed successfully!');
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          setStatus('waiting');
          setMessage(data.message || 'Email confirmed. Waiting for other email confirmation.');
          setWaitingFor(data.waitingFor);
        }
      } catch (error) {
        console.error('Error confirming email:', error);
        setStatus('error');
        setMessage('An error occurred. Please try again.');
      }
    };

    confirmEmail();
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
              Confirming Email...
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your email address.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Email Change Complete!
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to login page...
            </p>
          </div>
        )}

        {status === 'waiting' && (
          <div className="text-center">
            <Clock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Partially Confirmed
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Next Step:</strong> Please check your <strong>{waitingFor}</strong> email address and click the confirmation link to complete the process.
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

        {status === 'error' && (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Confirmation Failed
            </h2>
            <p className="text-gray-600 mb-4">
              {message}
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm text-yellow-800 mb-2">
                    <strong>Common issues:</strong>
                  </p>
                  <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                    <li>The link may have expired (24-hour limit)</li>
                    <li>The link may have already been used</li>
                    <li>The request may have been cancelled</li>
                  </ul>
                </div>
              </div>
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
