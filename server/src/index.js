import http from 'node:http';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { config } from './config.js';
import api from './routes/api.routes.js';
import { errorHandler } from './utils/http.js';
import { verifyToken } from './middleware/auth.js';
import { Room } from './models/Room.js';
import { seedRestaurants } from './seed/seed.js';

const app = express();
app.set('trust proxy', 1); // Render sits behind a proxy

// Dynamic CORS configuration handling normalized origins & preflight
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, '');
    if (config.clientOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-room-code'],

};

// Enable CORS middleware (handles route parsing and preflights automatically)
app.use(cors(corsOptions));

app.use(express.json({ limit: '50kb' }));
app.use('/api', api);
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

const server = http.createServer(app);

// Socket.IO configuration sharing the same CORS rules
const io = new Server(server, {
  cors: {
    origin: config.clientOrigins,
    credentials: true,
  },
});
app.set('io', io);

// Sockets only carry a "something changed, refetch" ping; state itself always comes from the API.
io.use((socket, next) => {
  try {
    socket.data.userId = verifyToken(socket.handshake.auth?.token).sub;
    next();
  } catch {
    next(new Error('unauthorized'));
  }
});

io.on('connection', (socket) => {
  socket.on('join-room', async (code, ack) => {
    const roomCode = String(code || '').toUpperCase();
    const ok = await Room.exists({ code: roomCode, 'members.userId': socket.data.userId });
    if (ok) socket.join(roomCode);
    ack?.({ ok: Boolean(ok) });
  });
});

async function main() {
  if (!config.mongoUri) throw new Error('Set MONGO_URI (or MONGO_CONNECT_STRING) in the environment');
  await mongoose.connect(config.mongoUri);
  console.log('Connected to MongoDB');
  await Room.syncIndexes();
  await seedRestaurants();

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n⚠️ Port ${config.port} is already in use by another process.`);
      console.error(`Please stop the process running on port ${config.port} or change PORT in server/.env\n`);
    } else {
      console.error('Server error:', err.message);
    }
    process.exit(1);
  });

  server.listen(config.port, () => console.log(`FoodSquad API on :${config.port}`));
}

main().catch((err) => {
  console.error('Startup failed:', err.message);
  process.exit(1);
});