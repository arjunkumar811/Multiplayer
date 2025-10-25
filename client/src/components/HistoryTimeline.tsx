import React from 'react';
import './HistoryTimeline.css';

interface GridUpdate {
  row: number;
  col: number;
  character: string;
  timestamp: number;
  playerId: string;
}

interface HistoryTimelineProps {
  history: GridUpdate[];
  currentHistoryIndex: number;
  isPlaying: boolean;
  onTimelineChange: (index: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
}

const HistoryTimeline: React.FC<HistoryTimelineProps> = ({
  history,
  currentHistoryIndex,
  isPlaying,
  onTimelineChange,
  onPlay,
  onPause,
  onReset,
}) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="history-section">
      <div className="history-header">
        <h2>History Timeline</h2>
        <div className="history-controls">
          <button onClick={onPlay} disabled={isPlaying || history.length === 0}>
            ▶ Play
          </button>
          <button onClick={onPause} disabled={!isPlaying}>
            ⏸ Pause
          </button>
          <button onClick={onReset} disabled={history.length === 0}>
            ⏮ Reset
          </button>
        </div>
      </div>
      <div className="timeline-container">
        <input
          type="range"
          id="timeline"
          min="0"
          max={Math.max(0, history.length - 1)}
          value={currentHistoryIndex}
          step="1"
          onChange={(e) => onTimelineChange(parseInt(e.target.value))}
          disabled={history.length === 0}
        />
        <div className="timeline-info">
          <span id="timelinePosition">{currentHistoryIndex}</span> /{' '}
          <span id="timelineTotal">{history.length}</span> updates
        </div>
      </div>
      <div className="history-list">
        {history.map((update, index) => (
          <div
            key={index}
            className={`history-item ${index <= currentHistoryIndex ? 'active' : ''}`}
          >
            <div className="update-info">
              <span className="cell-pos">
                [{update.row}, {update.col}]
              </span>
              <span className="character">{update.character}</span>
            </div>
            <span className="timestamp">{formatTime(update.timestamp)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryTimeline;
