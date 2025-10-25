import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Grid from './components/Grid';
import HistoryTimeline from './components/HistoryTimeline';
import './App.css';

interface GridUpdate {
  row: number;
  col: number;
  character: string;
  timestamp: number;
  playerId: string;
}

function App() {
  const [grid, setGrid] = useState<string[][]>(
    Array(10).fill(null).map(() => Array(10).fill(''))
  );
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [character, setCharacter] = useState('');
  const [playerCount, setPlayerCount] = useState(0);
  const [canUpdate, setCanUpdate] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Select a cell and enter a character');
  const [history, setHistory] = useState<GridUpdate[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isViewingHistory, setIsViewingHistory] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:3000');

    socketRef.current.on('gridUpdate', (gridData: string[][]) => {
      setGrid(gridData);
    });

    socketRef.current.on('cellUpdated', (update: GridUpdate) => {
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(row => [...row]);
        newGrid[update.row][update.col] = update.character;
        return newGrid;
      });

      const cellElement = document.querySelector(
        `.cell:nth-child(${update.row * 10 + update.col + 1})`
      );
      cellElement?.classList.add('updated');
      setTimeout(() => {
        cellElement?.classList.remove('updated');
      }, 500);
    });

    socketRef.current.on('playerCount', (count: number) => {
      setPlayerCount(count);
    });

    socketRef.current.on('historyUpdate', (historyData: GridUpdate[]) => {
      setHistory(historyData);
      if (!isViewingHistory) {
        setCurrentHistoryIndex(historyData.length - 1);
      }
    });

    return () => {
      socketRef.current?.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
      if (playbackRef.current) clearInterval(playbackRef.current);
    };
  }, []);

  useEffect(() => {
    if (timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setCanUpdate(true);
            setStatusMessage('You can now update the grid again!');
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeRemaining]);

  const handleCellClick = (row: number, col: number) => {
    if (!canUpdate || isViewingHistory) return;
    setSelectedCell({ row, col });
    setStatusMessage(`Cell [${row}, ${col}] selected. Enter a character and press Enter.`);
  };

  const handleCharacterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 1) {
      setCharacter(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCell || !character || !canUpdate || isViewingHistory) return;

    const update: GridUpdate = {
      row: selectedCell.row,
      col: selectedCell.col,
      character,
      timestamp: Date.now(),
      playerId: socketRef.current?.id || ''
    };

    socketRef.current?.emit('updateCell', update);

    setCanUpdate(false);
    setTimeRemaining(60);
    setStatusMessage('Update submitted! You can update again in 60 seconds.');
    setCharacter('');
    setSelectedCell(null);
  };

  const handleTimelineChange = (index: number) => {
    setIsViewingHistory(true);
    setCurrentHistoryIndex(index);
    applyHistoryState(index);
  };

  const applyHistoryState = (index: number) => {
    const newGrid = Array(10).fill(null).map(() => Array(10).fill(''));
    for (let i = 0; i <= index; i++) {
      const update = history[i];
      newGrid[update.row][update.col] = update.character;
    }
    setGrid(newGrid);
  };

  const handlePlay = () => {
    if (currentHistoryIndex >= history.length - 1) return;
    
    setIsPlaying(true);
    setIsViewingHistory(true);
    
    playbackRef.current = setInterval(() => {
      setCurrentHistoryIndex(prev => {
        const next = prev + 1;
        if (next >= history.length - 1) {
          setIsPlaying(false);
          if (playbackRef.current) clearInterval(playbackRef.current);
          return history.length - 1;
        }
        applyHistoryState(next);
        return next;
      });
    }, 1000);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (playbackRef.current) clearInterval(playbackRef.current);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setIsViewingHistory(false);
    if (playbackRef.current) clearInterval(playbackRef.current);
    setCurrentHistoryIndex(history.length - 1);
    socketRef.current?.emit('requestHistory');
  };

  return (
    <div className="container">
      <header>
        <h1>Multiplayer Grid Game</h1>
        <div className="player-info">
          <div className="player-count">
            <span className="label">Players Online:</span>
            <span className="count">{playerCount}</span>
          </div>
        </div>
      </header>

      <main>
        <Grid
          grid={grid}
          selectedCell={selectedCell}
          onCellClick={handleCellClick}
          canUpdate={canUpdate && !isViewingHistory}
        />

        <div className="controls">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="charInput">Character:</label>
              <input
                type="text"
                id="charInput"
                value={character}
                onChange={handleCharacterChange}
                placeholder="Enter a character"
                disabled={!canUpdate || isViewingHistory}
                maxLength={1}
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              className="submit-btn"
              disabled={!selectedCell || !character || !canUpdate || isViewingHistory}
            >
              Submit
            </button>
          </form>
          <div className={`status-message ${canUpdate ? 'info' : 'error'}`}>
            {statusMessage}
          </div>
          {timeRemaining > 0 && (
            <div className="timer">
              Time remaining: {Math.floor(timeRemaining / 60)}:
              {(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>

        <HistoryTimeline
          history={history}
          currentHistoryIndex={currentHistoryIndex}
          isPlaying={isPlaying}
          onTimelineChange={handleTimelineChange}
          onPlay={handlePlay}
          onPause={handlePause}
          onReset={handleReset}
        />
      </main>
    </div>
  );
}

export default App;
