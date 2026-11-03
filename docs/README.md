# BFGI Alumni Ecosystem Architecture & Flow

## 1. System Overview

The BFGI Alumni Ecosystem is a distributed web platform for Baba Farid Group of Institutions (BFGI). The production deployment architecture decouples client delivery from backend computational services:

- **Client Tier**: All frontend applications are hosted on **Vercel Edge Network** for global CDN caching, zero-cold-start performance, and automatic SSL provisioning.
- **Backend Tier**: The backend is hosted on a dedicated server cluster running **3 default instances (replicas)** managed by a load balancer and Kubernetes Ingress. Backend instances autoscale dynamically based on CPU/memory load.
- **Real-Time Distributed Chat Engine**: Uses an **Apache Kafka fan-out pub/sub pattern** combined with **Socket.io** to broadcast messages across all backend replicas, guaranteeing real-time delivery regardless of which server instance a user is connected to.

---

## 2. Global Production Deployment Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Vercel Edge Network (CDN)                       │
│                                                                        │
│   ┌─────────────────────┐┌─────────────────────┐┌──────────────────┐   │
│   │ BFGI Alumni Portal  ││ Community & Chat App││   Admin Portal   │   │
│   │      (Next.js)      ││    (React/Vite)     ││   (React/Vite)   │   │
│   └──────────┬──────────┘└──────────┬──────────┘└────────┬─────────┘   │
└──────────────┼──────────────────────┼────────────────────┼─────────────┘
               │                      │                    │
               │ HTTP / REST          │ REST + WebSockets  │ HTTP / REST
               ▼                      ▼                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Nginx Edge Load Balancer                         │
│                    (SSL Termination on Port 2087)                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Kubernetes Ingress Controller                      │
│                    (Round-Robin / Least Connections)                   │
└───────┬───────────────────────────┼────────────────────────────┬───────┘
        │                           │                            │
        ▼                           ▼                            ▼
┌─────────────────┐       ┌─────────────────┐          ┌─────────────────┐
│ Backend Pod #1  │       │ Backend Pod #2  │          │ Backend Pod #3  │
│ (Default Pod)   │       │ (Default Pod)   │          │ (Default Pod)   │
│ Socket.io + REST│       │ Socket.io + REST│          │ Socket.io + REST│
└───────┬─────────┘       └────────┬────────┘          └────────┬────────┘
        │                          │                            │
        │ Kafka Publish / Consume  │ Kafka Publish / Consume    │ Kafka Publish / Consume
        ▼                          ▼                            ▼
┌────────────────────────────────────────────────────────────────────────┐
│               Apache Kafka Distributed Streaming Cluster               │
│                  (Topic: chat-messages, Fan-out Model)                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
             ┌──────────────────────┴──────────────────────┐
             ▼                                             ▼
┌────────────────────────┐                    ┌────────────────────────┐
│ PostgreSQL 16 Database │                    │ Redis In-Memory Cache  │
│ (Managed via Prisma)   │                    │ & BullMQ Job Queue     │
└────────────────────────┘                    └────────────────────────┘
```

---

## 3. Real-Time Distributed Chat Flow (Kafka + WebSockets)

In a multi-server setup behind a load balancer, User A and User B may be connected to different backend instances. The platform bridges instances using Apache Kafka:

```
[User A (Sender)]                                       [User B (Recipient)]
       │                                                         │
       │ 1. WebSocket: send_message                              │
       ▼                                                         │
┌──────────────┐                                                 │
│Backend Pod #1│                                                 │
└──────┬───────┘                                                 │
       ├─────────────────────────┐                               │
       │ 2. Async DB Job         │ 3. Publish message event      │
       ▼                         ▼                               │
┌──────────────┐          ┌──────────────┐                       │
│BullMQ Queue  │          │ Apache Kafka │                       │
│(Redis worker)│          │ Topic:       │                       │
└──────┬───────┘          │ chat-messages│                       │
       │                  └──────┬───────┘                       │
       ▼                         │                               │
┌──────────────┐                 │ 4. Broadcast to all unique    │
│PostgreSQL DB │                 │    consumer groups            │
└──────────────┘                 ├───────────────────────────────┤
                                 │                               │
                                 ▼                               ▼
                          ┌──────────────┐                ┌──────────────┐
                          │Backend Pod #1│                │Backend Pod #2│
                          │(Consumer Grp)│                │(Consumer Grp)│
                          └──────┬───────┘                └──────┬───────┘
                                 │ 5. Local emit                 │ 5. Local emit
                                 ▼                               ▼
                          [User A UI Ack]                 [User B UI Receive]
```

### Flow Breakdown:
1. **Socket Ingestion**: User A sends a message via Socket.io to **Backend Pod #1**.
2. **Asynchronous Persistence**: Pod #1 adds a `save_message` job to the **BullMQ Queue**, offloading relational DB writes from the real-time event loop.
3. **Kafka Publishing**: Pod #1 pushes the message payload to the Kafka topic `chat-messages`.
4. **Kafka Fan-Out Broadcast**: Each backend instance runs a Kafka consumer with a unique, instance-specific `groupId` (`chat-backend-group-{HOSTNAME}`). Because group IDs are unique per replica, Kafka streams every message to **all active backend instances**.
5. **Local Socket Dispatch**: Each backend pod emits the socket event (`receive_message`) to its locally attached WebSocket rooms (`user:{userId}`).
6. **Cross-Server Delivery**: User B receives the real-time notification from **Backend Pod #2** with sub-50ms latency.

---

## 4. Subsystem Documentation Directory

| Document | Target Area | Description |
| :--- | :--- | :--- |
| **[Alumni Portal (Next.js)](file:///home/keshav/Desktop/JourneyTOBMW/educlinic/docs/alumni-portal-nextjs.md)** | Vercel Client | App Router, Leaflet interactive map, event RSVP, gallery lightbox, and contact helpdesk. |
| **[Community & Chat Application](file:///home/keshav/Desktop/JourneyTOBMW/educlinic/docs/community-chat-app.md)** | Vercel Client | Algorithmic feed, threaded comments, direct messaging, follow system, and developer showcase. |
| **[Admin Management Portal](file:///home/keshav/Desktop/JourneyTOBMW/educlinic/docs/admin-portal.md)** | Vercel Client | User degree/ID verification, event attendee rosters, album moderation, ticket resolution, and AI assistant. |
| **[Backend REST API & Services](file:///home/keshav/Desktop/JourneyTOBMW/educlinic/docs/backend-api-and-services.md)** | Dedicated Cluster | Multi-instance Express backend, Prisma data models, Redis caching, Kafka streaming, and BullMQ queues. |
| **[DevOps, Kubernetes & Nginx](file:///home/keshav/Desktop/JourneyTOBMW/educlinic/docs/devops-k8s-and-nginx.md)** | Infrastructure | Kubernetes 3-pod default scaling, HPA, Nginx SSL proxying, Vercel frontend routing, and ArgoCD GitOps. |

---

## 5. Security & Authentication Architecture

Authentication is unified across all three frontends using HTTP-Only secure cookies and JWT Bearer tokens:

- **Token Storage**: Encrypted JWT stored inside an `HttpOnly`, `SameSite=Lax`, `Secure` cookie (`sessionId` / `token`).
- **Session Verification**: Backed by Redis session cache for instant revocation during logout or password changes.
- **WebSocket Handshake Guard**: The Socket.io connection extracts session tokens from the handshake auth payload or cookie header and verifies them against Redis and PostgreSQL before admitting connections.
