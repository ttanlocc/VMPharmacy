'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center bg-red-50 rounded-xl border border-red-100">
                    <AlertCircle className="text-red-500 mb-3" size={40} />
                    <h2 className="text-lg font-bold text-red-900 mb-2">Đã xảy ra lỗi</h2>
                    <p className="text-sm text-red-600 mb-4 max-w-xs">
                        {this.state.error?.message || 'Không thể hiển thị nội dung này.'}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <RefreshCcw size={16} />
                        Thử lại
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
