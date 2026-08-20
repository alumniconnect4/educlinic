# BFGI Alumni Platform

## Overview

The BFGI Alumni Platform is a comprehensive digital ecosystem designed for Baba Farid Group of Institutions (BFGI). It unites students, alumni, faculty, and administration through a public alumni portal, an internal community and real-time chat application, an administrative management portal, and a scalable microservices backend.

---

## Architecture Components

| Directory | Component | Hosting | Technology | Description |
| :--- | :--- | :--- | :--- | :--- |
| `client/` | **Alumni Portal** | Vercel Edge | Next.js 16, React 19, Tailwind CSS | Public-facing institutional portal, alumni directory, event ticketing, and media gallery. |
| `chat-app/` | **Community App** | Vercel Edge | React 19, Vite, Tailwind CSS, Socket.io | Real-time community platform, discussion feeds, direct messaging, and developer showcase. |
| `admin-portal/` | **Admin Portal** | Vercel Edge | React 19, Vite, Tailwind CSS, Recharts | Administrative control panel for user moderation, event management, and support tickets. |
| `server/` | **Backend API** | Dedicated Cluster | Node.js, Express, Prisma ORM, Socket.io | Core REST API, 3 default replicas with HPA, Kafka pub/sub streaming, and Redis caching. |
| `k8s/` | **Kubernetes** | Server Node | K8s Manifests, ArgoCD | Production orchestration, Ingress routing, and GitOps automated delivery. |
| `nginx/` | **Reverse Proxy** | Server Edge | Nginx | SSL termination, request buffering, and high-performance load proxying. |

---

## Detailed Documentation

Comprehensive documentation for all subsystems is available in the `docs/` directory:

- **[System Architecture & Overview](file:///home/keshav/Desktop/JourneyTOBMW/educlinic/docs/README.md)**
- **[Next.js Alumni Portal Flow](file:///home/keshav/Desktop/JourneyTOBMW/educlinic/docs/alumni-portal-nextjs.md)**
- **[Community & Chat Application Flow](file:///home/keshav/Desktop/JourneyTOBMW/educlinic/docs/community-chat-app.md)**
- **[Admin Management Portal Flow](file:///home/keshav/Desktop/JourneyTOBMW/educlinic/docs/admin-portal.md)**
- **[Backend REST API & Services](file:///home/keshav/Desktop/JourneyTOBMW/educlinic/docs/backend-api-and-services.md)**
- **[DevOps, Kubernetes & Nginx Guide](file:///home/keshav/Desktop/JourneyTOBMW/educlinic/docs/devops-k8s-and-nginx.md)**

---

## Quick Start (Development)

### Prerequisites

- Node.js v20+
- pnpm v9+
- Docker & Docker Compose

### 1. Start Infrastructure Services

```bash
docker compose up -d
```

### 2. Install Workspace Dependencies

```bash
pnpm install
```

### 3. Database Migration

```bash
cd server
pnpm prisma migrate dev
pnpm prisma generate
```

### 4. Run Development Servers

```bash
# Start backend server
cd server && pnpm dev

# Start Next.js alumni portal (in separate terminal)
cd client && pnpm dev

# Start community chat app (in separate terminal)
cd chat-app && pnpm dev

# Start admin portal (in separate terminal)
cd admin-portal && pnpm dev
```

---

## License & Intellectual Property

Copyright (c) 2024-2026 Baba Farid Group of Institutions (BFGI). All Rights Reserved.

This software, source code, documentation, and digital assets are the exclusive proprietary property of Baba Farid Group of Institutions (BFGI), Bathinda, Punjab, India. Unauthorized reproduction, distribution, decompilation, or commercial exploitation is strictly prohibited without prior written consent. For details, see the [LICENSE](file:///home/keshav/Desktop/JourneyTOBMW/educlinic/LICENSE) file.
