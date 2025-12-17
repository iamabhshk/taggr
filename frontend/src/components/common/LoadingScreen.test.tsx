import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import LoadingScreen from './LoadingScreen';

describe('LoadingScreen', () => {
  it('renders loading message', () => {
    render(<LoadingScreen />);
    expect(screen.getByText('Loading Taggr...')).toBeInTheDocument();
  });

  it('renders circular progress indicator', () => {
    render(<LoadingScreen />);
    // Material-UI CircularProgress renders as a div with role="progressbar"
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });
});

