import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div
          style={{
            padding: 24,
            fontFamily: "system-ui, sans-serif",
            color: "#333",
            maxWidth: 600,
          }}
        >
          <h1 style={{ color: "#c00", marginBottom: 16 }}>Something went wrong</h1>
          <pre
            style={{
              background: "#f5f5f5",
              padding: 16,
              overflow: "auto",
              fontSize: 12,
            }}
          >
            {this.state.error.message}
          </pre>
          <pre
            style={{
              marginTop: 16,
              fontSize: 11,
              color: "#666",
            }}
          >
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
