import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="glass-card p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">We're sorry for the inconvenience</p>
            <button
              onClick={() => window.location.reload()}
              className="text-primary hover:text-primary/90 transition-custom"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;