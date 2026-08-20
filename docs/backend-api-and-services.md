# BFGI Backend REST API & Services Architecture

## 1. Overview

The BFGI Backend (`server`) is a distributed, containerized Node.js service running on a dedicated Kubernetes server cluster behind an Nginx load balancer. In production:

- **Replication**: Runs **3 default backend instances (pods)** out-of-the-box for high availability and fault tolerance.
- **Horizontal Pod Autoscaling (HPA)**: Dynamically scales the pod count based on CPU utilization and incoming request throughput.
- **Asynchronous Persistence**: Uses **BullMQ** on Redis to decouple DB writes from HTTP/WebSocket request lifecycles.
- **Cross-Instance Event Streaming**: Employs **Apache Kafka** to stream real-time chat messages and notifications across all backend replicas.

---

## 2. Server Cluster & Distributed Architecture

```
                                  Nginx Load Balancer
                                           │
                     ┌─────────────────────┼─────────────────────┐
                     │                     │                     │
                     ▼                     ▼                     ▼
              ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
              │Backend Pod #1│      │Backend Pod #2│      │Backend Pod #3│
              │(Port: 4000)  │      │(Port: 4000)  │      │(Port: 4000)  │
              └──────┬───────┘      └──────┬───────┘      └──────┬───────┘
                     │                     │                     │
                     │   Kafka Producer &  │   Kafka Producer &  │   Kafka Producer &
                     │   Unique Consumer   │   Unique Consumer   │   Unique Consumer
                     ▼                     ▼                     ▼
              ┌──────────────────────────────────────────────────────────┐
              │               Apache Kafka Message Broker                │
              │                  Topic: chat-messages                    │
              └────────────────────────────┬─────────────────────────────┘
                                           │
                     ┌─────────────────────┴─────────────────────┐
                     ▼                                           ▼
              ┌──────────────┐                            ┌──────────────┐
              │PostgreSQL 16 │                            │Redis 7 Cache │
              │(Prisma ORM)  │                            │& BullMQ Queue│
              └──────────────┘                            └──────────────┘
```

---

## 3. Real-Time Chat Engine (Kafka + Socket.io Flow)

### 3.1 The Multi-Instance Socket Problem
When running multiple load-balanced backend instances (Pod #1, Pod #2, Pod #3), a user's WebSocket connection is bound to only one specific pod. If User A (connected to Pod #1) sends a message to User B (connected to Pod #2), Pod #1 cannot directly emit a WebSocket event to User B because User B's socket does not exist in Pod #1's memory.

### 3.2 The Kafka Fan-Out Solution
To solve this, the server utilizes Apache Kafka with instance-specific consumer groups:

```typescript
// server/src/services/kafka.service.ts
const baseGroupId = process.env.KAFKA_GROUP_ID || 'chat-backend-group';
const instanceId =
  process.env.HOSTNAME ||
  process.env.POD_NAME ||
  os.hostname() ||
  Math.random().toString(36).substring(2, 9);

// Unique Group ID per pod ensures every pod receives all broadcasted messages
const groupId = `${baseGroupId}-${instanceId}`;
```

1. **Step 1 (Client Transmission)**: User A emits `send_message` with recipient ID and content.
2. **Step 2 (Queue Job Creation)**: Pod #1 validates recipient existence and push blocks, then enqueues a background persistence job to BullMQ (`chatQueue.add('save_message', ...)`).
3. **Step 3 (Publish to Kafka)**: Pod #1 formats an optimistic message payload and publishes it to the Kafka topic `chat-messages`.
4. **Step 4 (Distributed Broadcast)**: Kafka delivers the message to all registered consumer groups (Pod #1, Pod #2, Pod #3).
5. **Step 5 (Socket Emission)**: Every pod receives the Kafka message and executes:
   ```typescript
   io.to(`user:${payload.receiverId}`).emit('receive_message', payload);
   io.to(`user:${payload.senderId}`).emit('receive_message', payload);
   ```
6. **Step 6 (Client Arrival)**: Pod #2 (where User B is connected) delivers the event to User B's open socket. Pod #1 delivers the event back to User A for UI delivery confirmation.

---

## 4. Background Job Pipelines (BullMQ & Redis)

The backend uses BullMQ backed by Redis for CPU-intensive and I/O-heavy operations:

1. **Chat Message DB Persistence**: Saves messages to PostgreSQL in background batches without blocking WebSocket event loops.
2. **Cloudinary Image Upload Queue**: Automatically takes base64 avatars/media, uploads them to Cloudinary CDN, generates optimized thumbnail URLs, and updates the user record asynchronously.

---

## 5. Caching Layer & Invalidation (Redis)

```
 Incoming Request
        │
        ▼
 Is `refresh=true` passed? ───Yes───► [Bypass Cache] ───► Query Database ───► Update Redis (TTL: 300s)
        │
        No
        │
        ▼
 Check Redis Cache Key:
 `users:{userId}:{limit}:{skip}:{search}:{excludeDevs}:{role}`
        │
   ┌────┴────┐
   ▼         ▼
Hit       Miss
   │         │
   │         └─────► Query PostgreSQL ───► Store in Redis (TTL: 300s) ───► Return JSON
   │
   └───────────────► Return Cached JSON Response
```

### Cache Invalidation Triggers:
- User profile updates invalidate `users:*` keys.
- Following/unfollowing triggers selective follower graph cache evictions.
- New post publications purge `posts:*` cache keys.

---

## 6. Database Schema Design (Prisma)

The PostgreSQL database is managed through Prisma ORM with strict referential integrity and indexes:

| Model | Table Name | Purpose |
| :--- | :--- | :--- |
| `User` | `User` | Stores credentials, profile data, roles (`USER`, `ALUMNI`, `ADMIN`, `SUPER_ADMIN`), verification status, and developer flags. |
| `Event` | `Event` | Campus events with start/end dates, visibility (`GLOBAL`, `DEPARTMENTAL`), and registration quotas. |
| `Registration` | `Registration` | Event RSVPs with unique constraints on `(eventId, userId)`. |
| `Post` | `Post` | Community feed publications. |
| `Comment` | `Comment` | Threaded replies supporting recursive parent-child comments. |
| `PostLike` / `CommentLike` | `PostLike` / `CommentLike` | Engagement tracking with unique constraints per user/item. |
| `Follow` | `Follow` | Follower graph relationships between users. |
| `Message` | `Message` | Direct chat message archive with `isRead` and `isEdited` flags. |
| `Block` | `Block` | User block registry preventing message delivery and profile discovery. |
| `Album` / `GalleryImage` | `Album` / `GalleryImage` | Event memories and departmental media categorization. |
| `HelpTicket` | `HelpTicket` | Student support ticket tracking with priorities (`LOW`, `MEDIUM`, `HIGH`). |

---

## 7. REST API Endpoint Catalog

### Authentication (`/api/auth`)
- `POST /register`: Registers student/alumni account.
- `POST /login`: Issues JWT token and sets HttpOnly cookie.
- `POST /logout`: Invalidate session in Redis and clears cookies.
- `GET /me`: Returns authenticated session profile.

### Users & Directory (`/api/users`)
- `GET /`: Searchable user catalog with role filters and pagination. Supports `refresh=true` for cache bypassing.
- `GET /developers`: Lists platform developers (`isDeveloper: true`).
- `GET /:id`: Retrieves full user profile.
- `PUT /profile`: Updates bio, avatar, and social links.
- `POST /follow/:id`: Toggles follow/unfollow state.

### Posts & Comments (`/api/posts`)
- `GET /`: Lists community posts.
- `POST /`: Publishes new post with Cloudinary image support.
- `POST /:id/like`: Toggles post like.
- `POST /:id/comments`: Submits nested comments.

### Events & Gallery (`/api/events`, `/api/gallery`)
- `GET /api/events`: Lists active campus events.
- `POST /api/events/:id/register`: Submits RSVP registration.
- `GET /api/gallery/albums`: Retrieves categorized media albums.
- `POST /api/gallery/albums`: Creates new album (Admin only).
