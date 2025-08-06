import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * PUBLIC_INTERFACE
 * Main App component for the Tic Tac Toe game.
 * Renders the game board, player indicators, controls, and handles all game logic/state.
 * Accessible, responsive, and play-on-one-device for two players.
 */
function App() {
  // 'X' always goes first
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [theme, setTheme] = useState('light'); // keep theme toggle

  // Accessibility: Remember last cell focused for keyboard navigation
  const [lastFocused, setLastFocused] = useState(null);

  // Checks for winner/draw after each move
  useEffect(() => {
    const gameWinner = calculateWinner(board);
    if (gameWinner) {
      setWinner(gameWinner);
      setIsDraw(false);
    } else if (board.every(cell => cell !== null)) {
      setIsDraw(true);
      setWinner(null);
    } else {
      setWinner(null);
      setIsDraw(false);
    }
  }, [board]);

  // Theme effect for dark/light mode (preserved from template)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const handleCellClick = idx => {
    // Prevent overriding (cell occupied, game over)
    if (board[idx] !== null || winner || isDraw) return;
    const nextBoard = [...board];
    nextBoard[idx] = isXNext ? 'X' : 'O';
    setBoard(nextBoard);
    setIsXNext(!isXNext);
    setLastFocused(idx);
  };

  // Keyboard navigation: make board fully keyboard-accessible
  const handleCellKeyDown = (event, idx) => {
    if (winner || isDraw) return;
    // Simulate click on Space or Enter if empty
    if ((event.key === ' ' || event.key === 'Enter') && board[idx] === null) {
      handleCellClick(idx);
    }
    // Move arrow navigation to other cells (left/up/right/down)
    let target = null;
    if (event.key === 'ArrowLeft' && idx % 3 > 0) {
      target = idx - 1;
    }
    if (event.key === 'ArrowRight' && idx % 3 < 2) {
      target = idx + 1;
    }
    if (event.key === 'ArrowUp' && idx > 2) {
      target = idx - 3;
    }
    if (event.key === 'ArrowDown' && idx < 6) {
      target = idx + 3;
    }
    if (target !== null && target >= 0 && target < 9) {
      setLastFocused(target);
    }
  };

  // PUBLIC_INTERFACE
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setIsDraw(false);
    setLastFocused(null);
  };

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Helper: Render player indicator with colored badge
  function PlayerIndicator({ player, active }) {
    return (
      <span
        className={`player-indicator${active ? ' active' : ''}`}
        aria-current={active ? 'true' : undefined}
        aria-label={active ? `Current turn: Player ${player}` : `Player ${player}`}
      >
        {player} {active ? <span className="turn-arrow" aria-hidden="true">⬅</span> : null}
      </span>
    );
  }

  // Helper: Aria description for the game board status
  function getBoardStatus() {
    if (winner) {
      return `Player ${winner} wins!`;
    }
    if (isDraw) {
      return "It's a draw!";
    }
    return `Player ${isXNext ? 'X' : 'O'}'s turn`;
  }

  // The Game UI
  return (
    <div className="App">
      <header className="App-header">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <h1 className="title ttt-title" tabIndex={-1}>Tic Tac Toe</h1>
        <p className="subtitle">A game for two on the same device</p>
        <div className="player-row" role="region" aria-label="Player turn indicators">
          <PlayerIndicator player="X" active={isXNext && !winner && !isDraw} /> &nbsp;
          <span className="vs-label" aria-hidden="true">vs</span> &nbsp;
          <PlayerIndicator player="O" active={!isXNext && !winner && !isDraw} />
        </div>
        <div
          className="ttt-board"
          role="grid"
          aria-label="Tic Tac Toe board"
          aria-describedby="game-status"
        >
          {board.map((cell, idx) => (
            <button
              key={idx}
              className={`ttt-cell${cell ? ' occupied' : ''}${winner || isDraw ? ' end-state' : ''}${
                lastFocused === idx ? ' focused' : ''
              }`}
              onClick={() => handleCellClick(idx)}
              onKeyDown={e => handleCellKeyDown(e, idx)}
              tabIndex={lastFocused === idx || (lastFocused === null && idx === 0) ? 0 : -1}
              aria-label={
                cell
                  ? `Cell ${idx + 1}, ${cell}`
                  : `Cell ${idx + 1}, empty`
              }
              aria-disabled={cell !== null || winner || isDraw}
              disabled={!!cell || !!winner || isDraw}
              style={{ outline: lastFocused === idx ? '2px solid var(--text-secondary)' : 'none' }}
              ref={el => {
                if (lastFocused === idx && el) {
                  el.focus();
                }
              }}
              role="gridcell"
              aria-posinset={idx + 1}
              aria-setsize={9}
              aria-selected={lastFocused === idx}
            >
              <span className={`symbol symbol-${cell}`}>{cell}</span>
            </button>
          ))}
        </div>
        <div id="game-status" className="game-status" aria-live="polite" role="status">
          {winner && <span className="winner-message">🎉 Player {winner} wins!</span>}
          {!winner && isDraw && <span className="draw-message">🤝 It's a draw!</span>}
          {!winner && !isDraw && (
            <span>
              Player{' '}
              <span className="turn-indicator">{isXNext ? 'X' : 'O'}</span>
              , it's your turn.
            </span>
          )}
        </div>
        <div className="control-row">
          <button className="reset-btn" onClick={resetGame} aria-label="Restart game">
            🔄 Reset
          </button>
        </div>
        <footer className="footer">
          <p>
            <span className="footer-brand">
              <strong>Tic Tac Toe</strong>
            </span>{' '}
            <span className="footer-credit">
              by React
            </span>
          </p>
        </footer>
      </header>
    </div>
  );
}

// Helper to check for a win condition for 3x3 TicTacToe
function calculateWinner(board) {
  // Possible win lines: rows, columns, diagonals
  const lines = [
    [0, 1, 2], // Rows
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6], // Columns
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8], // Diagonals
    [2, 4, 6],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return board[a]; // X or O
    }
  }
  return null;
}

export default App;
