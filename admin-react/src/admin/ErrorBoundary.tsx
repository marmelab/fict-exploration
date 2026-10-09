import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  fallback: (error: unknown, reset: () => void) => ReactNode;
  onError?: (error: unknown, info: ErrorInfo) => void;
  /** Changing any of these values clears the captured error. */
  resetKeys?: readonly unknown[];
  children?: ReactNode;
};

type ErrorBoundaryState = {
  // Tracked separately from `error` because anything can be thrown, `null`
  // included, so the value alone cannot signal the state.
  hasError: boolean;
  error: unknown;
};

function keysChanged(a: readonly unknown[], b: readonly unknown[]) {
  return a.length !== b.length || a.some((value, i) => !Object.is(value, b[i]));
}

/**
 * React has no built-in error boundary, so this mirrors Fict's `<ErrorBoundary>`
 * API (`fallback`, `onError`, `resetKeys`) with a class component.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (!this.state.hasError) return;
    const prevKeys = prevProps.resetKeys ?? [];
    const nextKeys = this.props.resetKeys ?? [];
    if (keysChanged(prevKeys, nextKeys)) {
      this.reset();
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.state.error, this.reset);
    }
    return this.props.children;
  }
}
