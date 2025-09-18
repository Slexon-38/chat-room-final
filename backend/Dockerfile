# Backend Dockerfile
FROM node:23-alpine

# Arbeitsverzeichnis setzen
WORKDIR /app

# Package.json kopieren und Dependencies installieren
COPY backend/package*.json ./
RUN npm install --omit=dev

# Source Code kopieren
COPY backend/ .

# Port freigeben (Render nutzt standardmäßig Port 10000)
EXPOSE 10000

# Health Check hinzufügen (angepasst für Render Port)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-10000}/health || exit 1

# Anwendung starten
CMD ["npm", "start"]
