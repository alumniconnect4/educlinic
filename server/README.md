# BFGI Backend REST API & Services

## Overview

The BFGI Backend server is the core API gateway and microservices backend powering the BFGI Alumni Portal, Community Chat Application, and Admin Management Portal. It delivers RESTful endpoints, real-time WebSocket communications, relational persistence, in-memory caching, message streaming, and background queue processing.

---

## Key Features

- **Authentication & RBAC**: JWT-based session security with HTTP-Only cookies supporting USER, ALUMNI, ADMIN, and SUPER_ADMIN roles.
- **Relational Data Layer**: PostgreSQL 16 managed via Prisma ORM with connection pooling.
- **In-Memory Caching**: Multi-tier Redis caching for high-velocity endpoints with on-demand invalidation.
- **Real-Time WebSockets**: Socket.io engine for instant direct messaging, typing indicators, and user presence.
- **Background Worker & Media Pipeline**: BullMQ async workers and Cloudinary CDN for automated image transformations.
- **Event Streaming**: Apache Kafka broker integration for scalable cross-service event publishing.

---

## Technical Stack

- **Runtime**: Node.js v20+, TypeScript
- **Framework**: Express.js
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Cache**: Redis (ioredis)
- **WebSockets**: Socket.io
- **Queues**: BullMQ, KafkaJS

---

## Development Setup

```bash
# Install dependencies
pnpm install

# Apply database migrations
pnpm prisma migrate dev

# Generate Prisma Client
pnpm prisma generate

# Start development server on port 4000
pnpm dev

# Build production bundle
pnpm build
```

---

## Documentation

For complete REST API endpoints, Prisma schema definitions, caching architecture, and queue topologies, see [Backend API Documentation](file:///home/keshav/Desktop/JourneyTOBMW/educlinic/docs/backend-api-and-services.md).
