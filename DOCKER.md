# CamSight Docker Setup

Dokumentasi ini menjelaskan cara menjalankan aplikasi CamSight menggunakan Docker Compose.

## Prerequisites

Pastikan Anda telah menginstall:

- Docker
- Docker Compose

## Struktur Project

```
CamSight/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── requirements.txt
│   ├── main.py
│   └── ...
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── ...
├── docker-compose.yml
└── DOCKER.md
```

## Quick Start

### 1. Build dan Jalankan Aplikasi

```bash
# Clone repository (jika belum)
git clone <repository-url>
cd CamSight

# Build dan jalankan dengan Docker Compose
docker-compose up --build
```

### 2. Akses Aplikasi

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Backend Status**: http://localhost:8000/status

### 3. Stop Aplikasi

```bash
# Stop containers
docker-compose down

# Stop dan hapus volumes (jika diperlukan)
docker-compose down -v
```

## Docker Commands yang Berguna

### Build Ulang Aplikasi

```bash
docker-compose build
```

### Jalankan di Background

```bash
docker-compose up -d
```

### Lihat Logs

```bash
# Semua services
docker-compose logs

# Service tertentu
docker-compose logs backend
docker-compose logs frontend

# Follow logs
docker-compose logs -f
```

### Restart Service Tertentu

```bash
docker-compose restart backend
docker-compose restart frontend
```

### Masuk ke Container

```bash
# Backend container
docker-compose exec backend bash

# Frontend container
docker-compose exec frontend sh
```

## Environment Variables

### Frontend

- `BACKEND_HOST`: Hostname backend (default: backend)

### Backend

- Menggunakan konfigurasi default dari main.py

## Network Configuration

Aplikasi menggunakan Docker network bernama `camsight-network` yang memungkinkan komunikasi antar container:

- Backend dapat diakses oleh frontend dengan hostname `backend`
- Port 3000 (frontend) dan 8000 (backend) di-expose ke host

## Troubleshooting

### 1. Port Sudah Digunakan

Jika port 3000 atau 8000 sudah digunakan, ubah mapping port di `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "3001:3000" # Ubah port host
  backend:
    ports:
      - "8001:8000" # Ubah port host
```

### 2. Build Error

Jika terjadi error saat build:

```bash
# Clean rebuild
docker-compose down
docker system prune -f
docker-compose up --build --force-recreate
```

### 3. Camera Access Issue

Untuk akses kamera dalam Docker container, Anda mungkin perlu menambahkan device mapping (untuk development):

```yaml
services:
  backend:
    devices:
      - /dev/video0:/dev/video0 # Linux
```

**Note**: Camera access biasanya tidak berfungsi dalam Docker container. Aplikasi ini dirancang untuk diakses dari browser host yang memiliki akses langsung ke kamera.

## Development vs Production

### Development

File saat ini dikonfigurasi untuk development dengan:

- Hot reload enabled
- Debug mode active
- Port exposure untuk development
- **Git hooks (Husky) untuk quality control - TIDAK termasuk dalam Docker build**

#### Setup Development Environment

```bash
# 1. Install frontend dependencies (termasuk Husky)
cd frontend
npm install

# 2. Setup Git hooks (Windows)
.\setup-hooks.ps1

# 3. Setup Git hooks (Linux/Mac)
./setup-hooks.sh
```

#### Pre-commit Hooks

Otomatis akan menjalankan sebelum setiap commit:

- TypeScript compilation check (`tsc -b`)
- ESLint dengan auto-fix (`eslint . --fix`)

**Note**: Husky hanya untuk development dan sudah dikecualikan dari Docker builds via `.dockerignore`

### Production

Untuk production, pertimbangkan:

- Menggunakan environment variables untuk konfigurasi
- Setup reverse proxy (nginx)
- SSL/TLS configuration
- Resource limits untuk containers
- Health checks dan monitoring

## Health Checks

Backend container memiliki health check yang memeriksa endpoint `/status` setiap 30 detik. Status dapat dilihat dengan:

```bash
docker-compose ps
```
