import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders main Tic Tac Toe title and player indicators', () => {
  render(<App />);
  expect(screen.getByText(/Tic Tac Toe/i)).toBeInTheDocument();
  expect(screen.getByText(/Player X/i)).toBeInTheDocument();
  expect(screen.getByText(/Player O/i)).toBeInTheDocument();
});

test('displays correct turn, winner and draw messages', () => {
  render(<App />);
  // Initially, Player X's turn
  expect(screen.getByText(/Player X, it's your turn/i)).toBeInTheDocument();

  // Play a simple win (X in 0, O in 3, X in 1, O in 4, X in 2)
  const cells = screen.getAllByRole('gridcell');
  fireEvent.click(cells[0]);
  fireEvent.click(cells[3]);
  fireEvent.click(cells[1]);
  fireEvent.click(cells[4]);
  fireEvent.click(cells[2]);
  expect(screen.getByText(/Player X wins/i)).toBeInTheDocument();

  // Restart and play a draw
  fireEvent.click(screen.getByRole('button', { name: /reset/i }));
  const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8]; // X, O, X, O, X, O, X, O, X results in draw
  moves.forEach(i => fireEvent.click(screen.getAllByRole('gridcell')[i]));
  expect(screen.getByText(/it's a draw/i)).toBeInTheDocument();
});

test('reset button resets the game', () => {
  render(<App />);
  const cells = screen.getAllByRole('gridcell');
  fireEvent.click(cells[0]);
  fireEvent.click(cells[1]);
  fireEvent.click(cells[2]);
  expect(screen.getByText(/Player X, it's your turn/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /reset/i }));
  // Cells should be empty
  screen.getAllByRole('gridcell').forEach(cell => {
    expect(cell.textContent).toBe('');
  });
});
