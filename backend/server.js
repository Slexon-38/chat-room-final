const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { connectDB, User } = require('./database');
const { initializeFeatures } = require('./features');
const routes = require('./routes');

const app = express();

// CORS Konfiguration für alle Routen
const allowedOrigins = [
  'http://localhost:5173', // Lokale Entwicklung
  'https://chat-room-frontend-76f3.onrender.com', // Production Frontend URL
  process.env.FRONTEND_URL // Zusätzliche URL aus Environment
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { 
    origin: allowedOrigins,
    credentials: true
  }
});

// API Routes
app.use(routes);

// Set zur Speicherung aktiver User-Sessions global
const activeUsers = new Set();
const featureHandler = initializeFeatures(io);

// Socket-Logik
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  // Binde Feature-Logik an den Socket
  featureHandler(socket);

  // Beitreten zu einem Room
  socket.on('join', async ({ username, room }) => {
    if (!username || !room) return;

    if (activeUsers.has(username)) {
      socket.emit('error', { message: `Username "${username}" ist bereits vergeben.` });
      return;
    }

    try {
      const [user] = await User.findOrCreate({
        where: { username },
        defaults: { username },
      });

      if (!user) {
        socket.emit('error', { message: 'Konnte User nicht erstellen oder finden.' });
        return;
      }

      activeUsers.add(username);
      socket.join(room);
      socket.username = username;
      socket.currentRoom = room;

      // Fügt User zur Raumliste im Feature-Modul hinzu
      socket.addUserToRoom(username, room);

      // Sende Chat-History mit Zeitstempeln aus dem Feature-Modul
      const history = await socket.getHistory(room);
      socket.emit('history', history);

      io.to(room).emit('message', { user: 'System', text: `${username} ist beigetreten.` });

    } catch (error) {
      console.error('Fehler beim Join:', error);
      socket.emit('error', { message: 'Serverfehler beim Beitreten.' });
    }
  });

  // Nachricht senden
  socket.on('message', async ({ room, text }) => {
    if (!text || !room || !socket.username) return;
    
    try {
      // Erstellt Nachricht mit Zeitstempel über das Feature-Modul
      const message = await socket.createMessage({ room, text, author: socket.username });
      io.to(room).emit('message', message);
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
    }
  });

  // Disconnect-Logik
  const handleDisconnect = () => {
    if (socket.username) {
      activeUsers.delete(socket.username);
      io.to(socket.currentRoom).emit('message', {
        user: 'System',
        text: `${socket.username} hat den Room verlassen.`,
      });
      console.log(`${socket.username} disconnected and was removed from active users.`);
    }
    // Die Feature-spezifische Cleanup-Logik wird durch den 'disconnect'-Listener
    // in features.js automatisch gehandhabt.
    console.log('User disconnected:', socket.id);
  };

  socket.on('leave', handleDisconnect);
  socket.on('disconnect', handleDisconnect);
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Starte Server nach DB-Verbindung
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 10000; // Render Standard-Port
  server.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server läuft auf Port ${PORT}`));
};

startServer();
