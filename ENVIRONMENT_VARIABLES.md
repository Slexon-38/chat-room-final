# Umgebungsvariablen für Render.com Deployment

## Backend Umgebungsvariablen

Diese Variablen müssen im Render Dashboard für deinen **Web Service (Backend)** unter "Environment" gesetzt werden:

### Erforderliche Variablen:

| Variable | Wert | Beschreibung |
|----------|------|--------------|
| `NODE_ENV` | `production` | Setzt Node.js in Produktionsmodus |
| `PORT` | `10000` | Standard-Port für Render Web Services |
| `DATABASE_URL` | `postgresql://user:pass@host:port/db` | PostgreSQL Verbindungsstring (wird von Render bereitgestellt) |
| `FRONTEND_URL` | `https://your-frontend-name.onrender.com` | URL deines Frontend Services für CORS |

### Optionale Variablen:

| Variable | Wert | Beschreibung |
|----------|------|--------------|
| `LOG_LEVEL` | `info` | Logging-Level |
| `SESSION_SECRET` | `your-secret-key` | Geheimer Schlüssel für Sessions |

---

## Frontend Umgebungsvariablen

Diese Variablen müssen im Render Dashboard für deine **Static Site (Frontend)** unter "Environment" gesetzt werden:

### Erforderliche Variablen:

| Variable | Wert | Beschreibung |
|----------|------|--------------|
| `VITE_API_URL` | `https://your-backend-name.onrender.com` | URL deines Backend Services |
| `VITE_SOCKET_URL` | `https://your-backend-name.onrender.com` | Socket.io URL (meist gleich wie API URL) |

### Optionale Variablen:

| Variable | Wert | Beschreibung |
|----------|------|--------------|
| `NODE_ENV` | `production` | Build-Modus |

---

## Render-spezifische Hinweise

### Automatisch bereitgestellte Variablen:
- `DATABASE_URL` wird automatisch gesetzt, wenn du eine Render PostgreSQL Datenbank nutzt
- `PORT` wird von Render automatisch gesetzt (normalerweise 10000)

### Service-Namen finden:
1. Nach dem Deployment findest du die URLs unter:
   - Dashboard → Dein Service → "Settings" → Service URL
2. Format: `https://[service-name].onrender.com`

### Beispiel-Konfiguration:

**Backend Service:** `chat-room-backend`
- Service URL: `https://chat-room-backend.onrender.com`

**Frontend Service:** `chat-room-frontend`  
- Service URL: `https://chat-room-frontend.onrender.com`

**Umgebungsvariablen Backend:**
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://chat_room_user:xxx@dpg-xxx.oregon-postgres.render.com/chat_room_db
FRONTEND_URL=https://chat-room-frontend.onrender.com
```

**Umgebungsvariablen Frontend:**
```
VITE_API_URL=https://chat-room-backend.onrender.com
VITE_SOCKET_URL=https://chat-room-backend.onrender.com
NODE_ENV=production
```

---

## Häufige Fehler

### CORS Fehler:
- Stelle sicher, dass `FRONTEND_URL` im Backend richtig gesetzt ist
- URL muss exakt übereinstimmen (ohne trailing slash)

### Database Connection Error:
- `DATABASE_URL` muss das komplette PostgreSQL Connection String enthalten
- SSL ist bei Render automatisch aktiviert

### Socket.io Connection Failed:
- `VITE_SOCKET_URL` muss mit der Backend-URL übereinstimmen
- Beide Services müssen HTTPS verwenden

### Build Failures:
- Alle `VITE_*` Variablen müssen zur Build-Zeit verfügbar sein
- Prüfe, ob alle Umgebungsvariablen in Render gesetzt sind

---

## Setup-Reihenfolge

1. **Datenbank erstellen** (PostgreSQL Service)
2. **Backend deployen** mit `DATABASE_URL`
3. **Backend URL notieren** für Frontend-Konfiguration
4. **Frontend deployen** mit Backend-URLs
5. **Beide Services testen**

## Validierung

### Backend Health Check:
```
curl https://your-backend-name.onrender.com/health
```
Antwort: `{"status":"OK","timestamp":"..."}`

### Frontend Check:
Öffne `https://your-frontend-name.onrender.com` im Browser und teste die Chat-Funktionen.