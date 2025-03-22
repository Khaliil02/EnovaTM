import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-red-800 my-4">
          <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
          <p className="mb-4">The application encountered an unexpected error.</p>
          <button
            className="bg-primary-600 text-white px-4 py-2 rounded-md"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
          {window.ENV?.NODE_ENV === 'development' && (
            <details className="mt-4 p-4 bg-white rounded-md">
              <summary className="cursor-pointer font-medium">Error details</summary>
              <pre className="mt-2 text-xs overflow-auto p-2 bg-gray-100 rounded">
                {this.state.error?.toString()}
                <br />
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;