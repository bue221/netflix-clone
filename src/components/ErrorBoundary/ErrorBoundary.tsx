import { Component, type ErrorInfo, type ReactNode } from 'react';
import { createLogger } from '../../lib/logger';
import { StatusMessage } from '../StatusMessage/StatusMessage';
import { Button } from '../ui/Button';

const logger = createLogger('error-boundary');

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Changing this value clears the error, e.g. when navigating to another view. */
  resetKey?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
  resetKey: string | undefined;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, resetKey: this.props.resetKey };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  static getDerivedStateFromProps(props: ErrorBoundaryProps, state: ErrorBoundaryState): Partial<ErrorBoundaryState> | null {
    return props.resetKey !== state.resetKey ? { error: null, resetKey: props.resetKey } : null;
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('Render failed', { error, componentStack: info.componentStack });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <StatusMessage
        tone="error"
        heading="Algo salió mal"
        action={<Button onClick={() => this.setState({ error: null })}>Reintentar</Button>}
      >
        Ocurrió un error al mostrar esta sección.
      </StatusMessage>
    );
  }
}
