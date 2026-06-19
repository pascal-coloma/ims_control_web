import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: (error: unknown, retry: () => void) => ReactNode;
}

interface State {
  error: unknown;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  private retry = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error)
      return this.props.fallback(this.state.error, this.retry);
    return this.props.children;
  }
}
