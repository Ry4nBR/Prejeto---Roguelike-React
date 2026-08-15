import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the game HUD', () => {
  render(<App />);

  expect(screen.getByText(/LVL/i)).toBeInTheDocument();
  expect(screen.getByText(/VIDA/i)).toBeInTheDocument();
  expect(screen.getByText(/WAVE/i)).toBeInTheDocument();
});
