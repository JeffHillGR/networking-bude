import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center border-4 border-[#D0ED00]">
            <div className="mb-6">
              <img
                src="https://raw.githubusercontent.com/JeffHillGR/networking-bude/main/public/scientist-chalkboard.jpg"
                alt="BudE taking a break"
                className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-[#009900]"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              BudE's Taking a Quick Break
            </h1>
            <p className="text-gray-600 mb-6">
              Oops! Something unexpected happened. Don't worry, BudE will be right back!
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-[#009900] text-white py-3 px-6 rounded-lg font-bold hover:bg-[#007700] transition-colors border-2 border-[#D0ED00]"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Refresh Page
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Dev Only)
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-48">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
