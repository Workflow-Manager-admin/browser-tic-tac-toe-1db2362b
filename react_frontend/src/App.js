import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * Distributed Tic Tac Toe Game - React Frontend
 * - Modern, minimalistic, light UI
 * - Uses FastAPI backend endpoints for all game actions
 */

// Backend base URL (adjust if deployed differently)
const API_BASE = '/';

const COLORS = {
  accent: '#43a047',
  primary: '#1976d2',
  secondary: '#ffffff',
};

// Helper for making requests to backend API
async function apiRequest(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: data
      ? {
          'Content-Type': 'application/json',
        }
      : {},
  };
  if (data) options.body = JSON.stringify(data);
  const res = await fetch(API_BASE + endpoint, options);
  if (!res.ok) throw new Error(`Backend error: ${res.status}`);
  return await res.json();
}

// PUBLIC_INTERFACE
function App() {
  const [board, setBoard] = useState([
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]);
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [draw, setDraw] = useState(false);
  const [status, setStatus] = useState('Loading...');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Load game state from backend
  // PUBLIC_INTERFACE
  const fetchState = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('game', 'GET');
      setBoard(data.board);
      setCurrentPlayer(data.current_player);
      setWinner(data.winner);
      setDraw(data.draw);
      setStatus(data.status);
    } catch (err) {
      setError('Failed to load board. Backend not available?');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchState();
  }, []);

  // PUBLIC_INTERFACE
  const handleCellClick = async (row, col) => {
    if (
      board[row][col] !== null ||
      !!winner ||
      !!draw ||
      loading ||
      actionLoading
    ) {
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      const data = await apiRequest('move', 'POST', { row, col });
      setBoard(data.board);
      setCurrentPlayer(data.current_player);
      setWinner(data.winner);
      setDraw(data.draw);
      setStatus(data.status);
    } catch (err) {
      setError('Failed to make move. Please retry.');
    }
    setActionLoading(false);
  };

  // PUBLIC_INTERFACE
  const handleReset = async () => {
    setActionLoading(true);
    setError('');
    try {
      const data = await apiRequest('reset', 'POST');
      setBoard(data.board);
      setCurrentPlayer(data.current_player);
      setWinner(data.winner);
      setDraw(data.draw);
      setStatus(data.status);
    } catch (err) {
      setError('Failed to reset game.');
    }
    setActionLoading(false);
  };

  const getCellStyle = (value) => ({
    width: 72,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${COLORS.primary}`,
    fontSize: 32,
    fontWeight: 700,
    cursor:
      !value && !winner && !draw && !loading && !actionLoading
        ? 'pointer'
        : 'default',
    background: COLORS.secondary,
    color:
      value === 'X'
        ? COLORS.primary
        : value === 'O'
        ? COLORS.accent
        : COLORS.primary,
    transition: 'background 0.2s, color 0.2s',
    borderRadius: 12,
    userSelect: 'none',
  });

  const renderBoard = () => (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: 'repeat(3, 1fr)',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
        margin: '0 auto',
        maxWidth: 240,
      }}
    >
      {board.map((rowArr, rowIdx) =>
        rowArr.map((cell, colIdx) => (
          <div
            key={`${rowIdx}-${colIdx}`}
            style={getCellStyle(cell)}
            onClick={() => handleCellClick(rowIdx, colIdx)}
            tabIndex={0}
            aria-label={`Cell ${rowIdx + 1},${colIdx + 1}`}
            role="button"
            onKeyPress={e => {
              if (e.key.toLowerCase() === 'enter') handleCellClick(rowIdx, colIdx);
            }}
          >
            {cell}
          </div>
        ))
      )}
    </div>
  );

  const renderStatus = () => {
    if (loading) return <div style={{ margin: 16 }}>Loading...</div>;
    if (error)
      return (
        <div style={{ margin: 16, color: '#d32f2f', fontWeight: 600 }}>
          {error}
        </div>
      );
    if (winner)
      return (
        <div
          style={{
            color: COLORS.accent,
            fontWeight: 700,
            margin: '18px 0 10px 0',
            fontSize: 22,
            letterSpacing: 1,
          }}
        >
          🎉 Player {winner} wins!
        </div>
      );
    if (draw)
      return (
        <div
          style={{
            color: COLORS.primary,
            fontWeight: 700,
            margin: '18px 0 10px 0',
            fontSize: 22,
            letterSpacing: 1,
          }}
        >
          🟦 It&apos;s a draw!
        </div>
      );
    return (
      <div style={{
        color: COLORS.primary,
        fontWeight: 500,
        marginTop: 18,
        fontSize: 18,
        letterSpacing: 1
      }}>
        {status || `Player ${currentPlayer}'s turn`}
      </div>
    );
  };

  return (
    <div
      className="App"
      style={{
        minHeight: '100vh',
        background: COLORS.secondary,
        color: COLORS.primary,
        fontFamily: `system-ui, 'Segoe UI', 'Roboto', Arial, sans-serif`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <header
        className="App-header"
        style={{
          background: 'inherit',
          minHeight: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: 64,
        }}
      >
        <h1
          style={{
            color: COLORS.primary,
            fontWeight: 800,
            fontSize: 40,
            margin: 0,
            letterSpacing: 2,
          }}
        >
          Tic Tac Toe
        </h1>
        <div style={{ margin: '12px 0 36px', color: '#888', fontSize: 15 }}>
          Minimal distributed game &mdash; modern UI
        </div>
        {renderBoard()}
        {renderStatus()}
        <button
          className="reset-btn"
          style={{
            margin: '32px 0 0 0',
            padding: '10px 32px',
            borderRadius: '24px',
            border: 'none',
            background: COLORS.primary,
            color: COLORS.secondary,
            fontWeight: 700,
            fontSize: 18,
            cursor: actionLoading || loading ? 'not-allowed' : 'pointer',
            opacity: actionLoading || loading ? 0.7 : 1,
            transition: 'opacity 0.2s',
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
            letterSpacing: 1.2,
          }}
          onClick={handleReset}
          disabled={actionLoading || loading}
        >
          {actionLoading ? 'Resetting...' : 'Reset Game'}
        </button>
      </header>
      <footer
        style={{
          position: 'fixed',
          left: 0,
          bottom: 8,
          width: '100%',
          textAlign: 'center',
          color: '#aaa',
          fontSize: 12,
          letterSpacing: 1,
        }}
      >
        Browser Tic Tac Toe &mdash; Distributed Demo &copy; Kavia
      </footer>
    </div>
  );
}

export default App;
