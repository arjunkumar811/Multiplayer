import React from 'react';
import './Grid.css';

interface GridProps {
  grid: string[][];
  selectedCell: { row: number; col: number } | null;
  onCellClick: (row: number, col: number) => void;
  canUpdate: boolean;
}

const Grid: React.FC<GridProps> = ({ grid, selectedCell, onCellClick, canUpdate }) => {
  return (
    <div className="grid-container">
      <div className="grid">
        {grid.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`cell ${
                selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                  ? 'selected'
                  : ''
              } ${!canUpdate ? 'disabled' : ''}`}
              onClick={() => canUpdate && onCellClick(rowIndex, colIndex)}
            >
              {cell}
            </div>
          ))
        ))}
      </div>
    </div>
  );
};

export default Grid;
