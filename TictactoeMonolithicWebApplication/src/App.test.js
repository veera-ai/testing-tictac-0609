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

test('cells do not accept input after win or draw', () => {
  render(<App />);
  const cells = screen.getAllByRole('gridcell');
  // X: 0, O: 3, X: 1, O: 4, X: 2 (X wins)
  [0,3,1,4,2].forEach(i => fireEvent.click(cells[i]));
  expect(screen.getByText(/Player X wins/i)).toBeInTheDocument();
  // Try to click or keyboard on an available cell after win
  fireEvent.click(cells[5]);
  expect(cells[5].textContent).toBe('');
  fireEvent.keyDown(cells[5], { key: 'Enter' });
  expect(cells[5].textContent).toBe('');
  // Now reset, play to draw
  fireEvent.click(screen.getByRole('button', { name: /reset/i }));
  const drawMoves = [0,1,2,4,3,5,7,6,8];
  drawMoves.forEach(i => fireEvent.click(screen.getAllByRole('gridcell')[i]));
  expect(screen.getByText(/it's a draw/i)).toBeInTheDocument();
  // Try after draw
  const lastCell = screen.getAllByRole('gridcell')[8];
  fireEvent.click(lastCell);
  expect(lastCell.textContent).toBe('X'); // Game should block after filled
});

test('cannot click on an occupied cell or overwrite it', () => {
  render(<App />);
  const cells = screen.getAllByRole('gridcell');
  fireEvent.click(cells[0]); // X
  expect(cells[0].textContent).toBe('X');
  fireEvent.click(cells[0]); // Should do nothing, still X's turn for the rest of the grid
  expect(cells[0].textContent).toBe('X');
  // Try keyboard activation as O
  fireEvent.click(cells[1]); // O
  fireEvent.keyDown(cells[0], { key: 'Enter' }); // No effect, already occupied
  expect(cells[0].textContent).toBe('X');
  expect(screen.getByText(/Player X, it's your turn/i)).toBeInTheDocument();
});

test('theme toggle changes data-theme on document element and button label', () => {
  render(<App />);
  const initialTheme = document.documentElement.getAttribute('data-theme');
  const toggleBtn = screen.getByRole('button', { name: /switch to dark mode/i });
  expect(toggleBtn).toBeInTheDocument();
  // Toggle to dark
  fireEvent.click(toggleBtn);
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
  // Toggle back to light
  fireEvent.click(screen.getByRole('button', { name: /switch to light mode/i }));
  expect(document.documentElement.getAttribute('data-theme')).toBe('light');
});

test('can navigate board with arrow keys and activate cell via keyboard', () => {
  render(<App />);
  let cells = screen.getAllByRole('gridcell');
  // First cell is focused
  cells[0].focus();
  // Move right to cell 1
  fireEvent.keyDown(cells[0], { key: 'ArrowRight' });
  cells = screen.getAllByRole('gridcell');
  expect(document.activeElement).toBe(cells[1]);
  // Move down to cell 4
  fireEvent.keyDown(cells[1], { key: 'ArrowDown' });
  cells = screen.getAllByRole('gridcell');
  expect(document.activeElement).toBe(cells[4]);
  // Press Space to select cell 4 for X
  fireEvent.keyDown(cells[4], { key: ' ' });
  expect(cells[4].textContent).toBe('X');
  // O's turn: use Enter to mark cell 0
  fireEvent.keyDown(cells[4], { key: 'ArrowLeft' }); // to cell 3
  fireEvent.keyDown(cells[3], { key: 'ArrowUp' });   // to cell 0
  fireEvent.keyDown(cells[0], { key: 'Enter' });
  expect(cells[0].textContent).toBe('O');
  // Trying again should not allow to overwrite; X's turn
  fireEvent.keyDown(cells[0], { key: 'Enter' });
  expect(cells[0].textContent).toBe('O');
});

test('focus returns to first cell after reset, and after move correct cell is focused', () => {
  render(<App />);
  let cells = screen.getAllByRole('gridcell');
  // Simulate a move and expect focus on that cell
  fireEvent.click(cells[2]);
  cells = screen.getAllByRole('gridcell');
  expect(document.activeElement).toBe(cells[2]);
  // Reset
  const resetBtn = screen.getByRole('button', { name: /reset/i });
  fireEvent.click(resetBtn);
  cells = screen.getAllByRole('gridcell');
  expect(document.activeElement).toBe(cells[0]);
});
