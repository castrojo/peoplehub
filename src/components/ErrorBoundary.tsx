import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  errorMessage: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : 'An unexpected error occurred.',
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-16">
          <p className="text-fg-muted mb-2">Something went wrong loading the feed.</p>
          <p className="text-xs text-fg-subtle mb-4">{this.state.errorMessage}</p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 rounded-md bg-accent-emphasis text-white text-sm hover:opacity-90"
          >
            Reload feed
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
