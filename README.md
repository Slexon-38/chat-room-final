# 🚀 Chat Room App

Eine moderne, echtzeitfähige Chat-Anwendung mit React Frontend und Node.js Backend. Vollständig containerisiert und produktionsbereit für Render.com.

![Chat Room App](https://img.shields.io/badge/Status-Live-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![React](https://img.shields.io/badge/React-19+-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)

## ✨ Features

### 🔐 Authentifizierung
- **Registrierung & Login** mit bcrypt-Verschlüsselung
- **Session-Management** mit automatischer Wiederanmeldung
- **Sichere Passwort-Hashing** für Datenschutz

### 💬 Echtzeit-Chat
- **Sofortige Nachrichten** über Socket.io
- **Typing-Indikatoren** zeigen wer gerade tippt
- **Online-Status** aller Benutzer in Echtzeit
- **Multiple Chat-Räume** gleichzeitig

### ✅ WhatsApp-Style Read Receipts
- **1 Haken** = Nachricht gesendet
- **2 graue Haken** = An alle zugestellt
- **2 cyan Haken** = Von allen gelesen
- **Tooltips** mit detaillierten Informationen

### ⭐ Erweiterte Features
- **Favoriten-System** für häufig genutzte Räume
- **Nachrichtensuche** mit erweiterten Filtern
- **Export-Funktion** für Chat-Verläufe
- **Responsive Design** für alle Geräte

## 🛠️ Technischer Stack

### Backend
- **Node.js** mit Express.js Framework
- **Socket.io** für Echtzeit-Kommunikation
- **PostgreSQL** mit Sequelize ORM
- **bcrypt** für sichere Passwort-Verschlüsselung
- **CORS** für Cross-Origin-Anfragen

### Frontend
- **React 19** mit modernen Hooks
- **Vite** als Build-Tool
- **Tailwind CSS** für Styling
- **Socket.io-client** für Echtzeit-Features

### Deployment
- **Docker** für Containerisierung
- **Render.com** für Production Hosting
- **PostgreSQL on Render** für die Datenbank
- **GitHub** für Versionskontrolle

## 🚀 Live Demo

- **Frontend**: [https://chat-room-frontend-76f3.onrender.com](https://chat-room-frontend-76f3.onrender.com)
- **Backend API**: [https://chat-room-backend-iov4.onrender.com](https://chat-room-backend-iov4.onrender.com)

## 📦 Installation & Setup

### Voraussetzungen
- Node.js 18+ 
- PostgreSQL 15+
- Docker (optional für lokale Entwicklung)

### 1. Repository klonen
```bash
git clone https://github.com/Slexon-38/chat-room-final.git
cd chat-room-final
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# .env konfigurieren (siehe unten)
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# .env konfigurieren (siehe unten)
npm run dev
```

## ⚙️ Konfiguration

### Backend Environment (.env)
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/chatroom
```

### Frontend Environment (.env)
```bash
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

## 🐳 Docker Setup

### Lokale Entwicklung
```bash
# Alle Services starten
docker-compose up -d

# Logs verfolgen
docker-compose logs -f

# Services stoppen
docker-compose down
```

### Production Build
```bash
# Production Build
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Datenbankstruktur

### Users Table
```sql
- id (Primary Key)
- username (Unique)
- password (bcrypt hash)
- createdAt / updatedAt
```

### Messages Table
```sql
- id (Primary Key)
- text (Message content)
- user (Author username)
- room (Chat room name)
- timestamp
- readBy (Array of usernames)
```

### Favorites Table
```sql
- id (Primary Key)
- userId (Foreign Key)
- roomName
- createdAt
```

### ReadReceipts Table
```sql
- id (Primary Key)
- messageId (Foreign Key)
- userId (Foreign Key)
- readAt (Timestamp)
```

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - Benutzer registrieren
- `POST /api/login` - Benutzer anmelden

### Favorites
- `GET /api/favorites/:userId` - Favoriten abrufen
- `POST /api/favorites` - Favorit hinzufügen
- `DELETE /api/favorites/:userId/:roomName` - Favorit entfernen

### Messages
- `GET /api/search` - Nachrichten suchen
- `GET /api/export` - Chat exportieren
- `POST /api/mark-read` - Nachricht als gelesen markieren

### System
- `GET /health` - Health Check

## 🎯 Socket.io Events

### Client → Server
- `join` - Raum beitreten
- `message` - Nachricht senden
- `typing` - Typing-Status
- `mark_read` - Read Receipt

### Server → Client
- `message` - Neue Nachricht
- `user_joined` / `user_left` - User-Events
- `typing` - Typing-Indikatoren
- `online_users` - Online-Status
- `read_receipt` - Read Receipt Updates

## 🚀 Deployment auf Render.com

### 1. Datenbank erstellen
1. Neuer PostgreSQL Service auf Render
2. Notiere die `DATABASE_URL`

### 2. Backend deployen
1. Neuer Web Service (Docker)
2. Repository: `https://github.com/Slexon-38/chat-room-final`
3. Root Directory: `backend`
4. Environment Variables setzen

### 3. Frontend deployen
1. Neuer Static Site
2. Build Command: `cd frontend && npm ci && npm run build`
3. Publish Directory: `frontend/dist`
4. Environment Variables setzen

## 🔒 Security Features

- **bcrypt Passwort-Hashing** mit Salt-Rounds
- **CORS Protection** für sichere API-Aufrufe
- **Input Validation** auf Client und Server
- **SQL Injection Protection** durch Sequelize ORM
- **XSS Protection** durch React's eingebaute Sicherheit

## 📱 Responsive Design

- **Mobile-First** Tailwind CSS Design
- **Touch-optimierte** Chat-Bedienung
- **Adaptive Layouts** für alle Bildschirmgrößen
- **Dark Theme** mit blau-grauer Farbpalette

## 🐛 Troubleshooting

### Häufige Probleme

**CORS-Fehler**: Prüfe `FRONTEND_URL` in Backend .env

**Socket-Verbindung fehlgeschlagen**: Prüfe `VITE_SOCKET_URL` im Frontend

**Datenbank-Verbindung**: Prüfe `DATABASE_URL` Format

**Build-Fehler**: `npm ci` statt `npm install` verwenden

### Logs checken
```bash
# Docker Logs
docker-compose logs backend
docker-compose logs frontend

# Render Logs
# Im Render Dashboard unter "Logs" Tab
```

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.

## 👨‍💻 Autor

**Slexon** - [GitHub](https://github.com/Slexon-38)

## 🤝 Contributing

1. Fork das Repository
2. Feature Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Commit deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Push zur Branch (`git push origin feature/AmazingFeature`)
5. Pull Request erstellen

---

⭐ **Gefällt dir das Projekt? Gib uns einen Stern!** ⭐