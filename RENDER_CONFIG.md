# Render.com Konfiguration

## Backend Web Service

**Service Type:** Web Service  
**Runtime:** Docker  
**Dockerfile Path:** `./backend/Dockerfile`  
**Build Command:** (automatisch über Docker)  
**Start Command:** (automatisch über Docker)  

**Health Check Path:** `/health`  
**Auto-Deploy:** Yes  

## Frontend Static Site

**Service Type:** Static Site  
**Build Command:** 
```bash
cd frontend && npm ci && npm run build
```

**Publish Directory:** `frontend/dist`  
**Auto-Deploy:** Yes  

## Alternative: Frontend als Web Service (mit nginx)

Falls du das Frontend als Web Service deployen möchtest:

**Service Type:** Web Service  
**Runtime:** Docker  
**Dockerfile Path:** `./frontend/Dockerfile`  
**Build Command:** (automatisch über Docker)  
**Start Command:** (automatisch über Docker)  

---

## Docker Multi-Service Deployment (Nicht empfohlen für Free Tier)

Render Free Tier unterstützt nur einen Web Service. Für Multi-Container Deployments brauchst du den kostenpflichtigen Plan.

Wenn du trotzdem beide Services als Docker Container deployen möchtest:
1. Backend als Web Service (Docker)
2. Frontend als Web Service (Docker) - kostenpflichtig

---

## Empfohlene Konfiguration für Free Tier:

1. **PostgreSQL Database** (Free)
2. **Backend Web Service** mit Docker (Free - 750h/Monat)
3. **Frontend Static Site** (Free - unbegrenzt)

Diese Konfiguration maximiert die kostenlosen Ressourcen von Render.