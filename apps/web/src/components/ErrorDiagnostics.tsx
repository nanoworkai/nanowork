import { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronRight, Copy, X } from 'lucide-react';
import { ApiError, formatErrorForDisplay } from '../types/errors';

interface ErrorDiagnosticsProps {
  error: ApiError;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Comprehensive error display component with expandable diagnostics
 */
export function ErrorDiagnostics({ error, onDismiss, className = '' }: ErrorDiagnosticsProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const { title, message, details } = formatErrorForDisplay(error);

  const copyToClipboard = () => {
    const debugInfo = JSON.stringify(
      {
        error: error.details.errorMessage,
        endpoint: error.details.endpoint,
        method: error.details.method,
        status: error.details.responseStatus,
        timestamp: error.details.timestamp,
        context: error.details.context,
        requestPayload: error.details.requestPayload,
        responseBody: error.details.responseBody,
      },
      null,
      2
    );

    navigator.clipboard.writeText(debugInfo).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`bg-red-50 border border-red-200 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-red-900">{title}</h3>
              <p className="text-sm text-red-800 mt-1">{message}</p>
            </div>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-1 rounded-md hover:bg-red-100 text-red-600 hover:text-red-900 transition-colors flex-shrink-0"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick details */}
          <div className="mt-2 space-y-1">
            {details.map((detail, index) => (
              <div key={index} className="text-xs text-red-700">
                <span className="font-medium">{detail.label}:</span> {detail.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expandable diagnostics */}
      <div className="border-t border-red-200">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-2 flex items-center justify-between bg-red-100/50 hover:bg-red-100 transition-colors"
        >
          <span className="text-xs font-medium text-red-900 flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            Technical Details
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard();
            }}
            className="px-2 py-1 rounded text-xs bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-1"
          >
            <Copy className="w-3 h-3" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </button>

        {expanded && (
          <div className="px-4 py-3 bg-white space-y-3 max-h-96 overflow-y-auto">
            {/* Request Info */}
            <div>
              <h4 className="text-xs font-semibold text-gray-900 mb-1">Request</h4>
              <div className="bg-gray-50 rounded p-2 text-xs font-mono text-gray-700 break-all">
                {error.details.method} {error.details.endpoint}
              </div>
            </div>

            {/* Request Payload */}
            {error.details.requestPayload && (
              <div>
                <h4 className="text-xs font-semibold text-gray-900 mb-1">Request Payload</h4>
                <pre className="bg-gray-50 rounded p-2 text-xs font-mono text-gray-700 overflow-x-auto">
                  {JSON.stringify(error.details.requestPayload, null, 2)}
                </pre>
              </div>
            )}

            {/* Response Info */}
            {error.details.responseStatus && (
              <div>
                <h4 className="text-xs font-semibold text-gray-900 mb-1">Response Status</h4>
                <div className="bg-gray-50 rounded p-2 text-xs font-mono text-gray-700">
                  {error.details.responseStatus}
                </div>
              </div>
            )}

            {/* Response Body */}
            {error.details.responseBody && (
              <div>
                <h4 className="text-xs font-semibold text-gray-900 mb-1">Response Body</h4>
                <pre className="bg-gray-50 rounded p-2 text-xs font-mono text-gray-700 overflow-x-auto max-h-48">
                  {typeof error.details.responseBody === 'string'
                    ? error.details.responseBody
                    : JSON.stringify(error.details.responseBody, null, 2)}
                </pre>
              </div>
            )}

            {/* Error Message */}
            <div>
              <h4 className="text-xs font-semibold text-gray-900 mb-1">Error Message</h4>
              <div className="bg-gray-50 rounded p-2 text-xs text-gray-700 break-words">
                {error.details.errorMessage}
              </div>
            </div>

            {/* Timestamp */}
            <div>
              <h4 className="text-xs font-semibold text-gray-900 mb-1">Timestamp</h4>
              <div className="bg-gray-50 rounded p-2 text-xs font-mono text-gray-700">
                {new Date(error.details.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Inline error display for form-level errors
 */
interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className = '' }: InlineErrorProps) {
  return (
    <div className={`flex items-start gap-2 text-red-600 ${className}`}>
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

/**
 * Error boundary fallback component
 */
interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

export function ErrorBoundaryFallback({ error, resetError }: ErrorBoundaryFallbackProps) {
  return (
    <div className="min-h-screen bg-background-subtle flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-xl border border-red-200 overflow-hidden">
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h2 className="text-lg font-bold text-red-900">Something went wrong</h2>
              <p className="text-sm text-red-700 mt-1">
                An unexpected error occurred. Please try again.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-900 mb-2">Error Details</h3>
            <pre className="bg-gray-50 rounded p-3 text-xs font-mono text-gray-700 overflow-x-auto">
              {error.message}
            </pre>
          </div>

          <button
            onClick={resetError}
            className="w-full px-4 py-2.5 rounded-md bg-accent-primary hover:bg-accent-primary/90 text-white text-sm font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
