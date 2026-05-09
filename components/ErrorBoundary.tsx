import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-white pt-48 pb-20 px-6 flex items-center justify-center">
          <div className="max-w-4xl w-full bg-white border-[8px] border-black p-12 md:p-20 shadow-[24px_24px_0px_0px_#ff2a5f]">
            <div className="inline-block bg-black text-[#ff2a5f] text-sm font-black uppercase tracking-[0.3em] px-6 py-2 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] mb-8">
              CRITICAL_FAIL
            </div>
            <h1 className="text-5xl md:text-7xl font-black font-syne text-black uppercase leading-none tracking-tighter mb-8">
              SYSTEM <span className="text-[#ff2a5f]" style={{ WebkitTextStroke: '3px black' }}>COLLAPSE</span>
            </h1>
            <p className="text-xl font-bold text-black uppercase opacity-60 mb-8 leading-relaxed">
              An unexpected rendering exception was caught inside this sector. Standard execution has been suspended.
            </p>
            
            <div className="bg-black text-red-400 p-8 mb-12 border-[4px] border-black shadow-[8px_8px_0px_0px_#000] font-mono text-xs overflow-auto max-h-[300px]">
              <p className="font-bold mb-4 uppercase text-[#ff2a5f] text-sm">Error: {this.state.error?.toString()}</p>
              {this.state.errorInfo && (
                <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
              )}
            </div>

            <button
              onClick={() => window.location.reload()}
              className="bg-black text-white px-12 py-5 border-[4px] border-black font-black uppercase text-2xl shadow-[8px_8px_0px_0px_#ff2a5f] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
            >
              REBOOT SYSTEM
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
