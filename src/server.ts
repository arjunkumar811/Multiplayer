import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.static(path.join(__dirname, '../client/dist')));

interface GridUpdate {
  row: number;
  col: number;
  character: string;
  timestamp: number;
  playerId: string;
}

const gridState: string[][] = Array(10).fill(null).map(() => Array(10).fill(''));
const history: GridUpdate[] = [];
let connectedPlayers = 0;

io.on('connection', (socket) => {
  connectedPlayers++;
  console.log(`Player connected: ${socket.id}. Total players: ${connectedPlayers}`);
  
  socket.emit('gridUpdate', gridState);
  socket.emit('historyUpdate', history);
  io.emit('playerCount', connectedPlayers);

  socket.on('updateCell', (data: GridUpdate) => {
    const { row, col, character, timestamp } = data;
    
    if (row >= 0 && row < 10 && col >= 0 && col < 10) {
      gridState[row][col] = character;
      
      const update: GridUpdate = {
        row,
        col,
        character,
        timestamp,
        playerId: socket.id
      };
      
      history.push(update);
      
      io.emit('cellUpdated', update);
      io.emit('historyUpdate', history);
    }
  });

  socket.on('requestHistory', () => {
    socket.emit('historyUpdate', history);
  });

  socket.on('disconnect', () => {
    connectedPlayers--;
    console.log(`Player disconnected: ${socket.id}. Total players: ${connectedPlayers}`);
    io.emit('playerCount', connectedPlayers);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
