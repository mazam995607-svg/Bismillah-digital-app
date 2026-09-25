import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    if (
      error.message?.includes('WebSocket') ||
      error.message?.includes('vite') ||
      error.message?.includes('HMR')
    ) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (
      error.message?.includes('WebSocket') ||
      error.message?.includes('vite') ||
      error.message?.includes('HMR')
    ) {
      return;
    }
    console.error('Unhandled Exception caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-amber-400">Terminal Recovered</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              A temporary runtime issue was caught and contained safely without data loss.
            </p>
            <button
              onClick={this.handleReset}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow transition inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Reload System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
