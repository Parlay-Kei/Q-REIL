import React, { Component, ErrorInfo, ReactNode } from 'react';
import { DEFAULT_DOCUMENT_TITLE } from '../constants/brand';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Root error boundary so a component crash shows a fallback UI instead of a blank canvas.
 * Ensures document.title is set even when the shell fails.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    document.title = DEFAULT_DOCUMENT_TITLE;
    console.error('Q Suite UI error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center p-8 bg-bg-deep text-text-primary font-sans"
          style={{ background: 'var(--bg-deep)', color: 'var(--text-primary)' }}
        >
          <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-text-secondary text-sm mb-4 max-w-md text-center">
            The app encountered an error. Try refreshing the page.
          </p>
          <pre className="text-xs text-text-tertiary bg-surface-elevated p-4 rounded-lg max-w-lg overflow-auto text-left">
            {this.state.error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
