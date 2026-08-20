# BFGI Community & Real-Time Chat Application

## 1. Overview

The BFGI Community & Chat Application (`chat-app`) is a high-performance single-page application built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**. It is deployed on the **Vercel Edge Network** and communicates with the backend cluster via REST endpoints and persistent WebSockets.

### Technical Stack

- **Client Hosting**: Vercel Edge Network
- **UI Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Class Variance Authority, Radix UI Primitives, Lucide Icons, React Icons
- **Real-Time Engine**: Socket.io Client (`socket.io-client`)
- **State Management**: Zustand
- **Routing**: React Router DOM v6
- **Asset Optimization**: Cloudinary Dynamic Resizing & Caching

---

## 2. Directory Structure

```
chat-app/
├── src/
│   ├── api/                      # Axios & Fetch clients with auth interceptors
│   │   └── client.ts
│   ├── components/
│   │   ├── chat/                 # Direct messaging & chat window components
│   │   │   ├── ChatArea.tsx
│   │   │   ├── ChatList.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── MessageInput.tsx
│   │   ├── layout/               # Shell layout, navbar & responsive sidebars
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── RightSidebar.tsx
│   │   ├── post-detail/          # Comment threads & post interaction components
│   │   │   ├── CommentSection.tsx
│   │   │   ├── PostAuthorCard.tsx
│   │   │   └── PostInteractionBar.tsx
│   │   ├── profile/              # User profiles, avatar updater & tabbed post lists
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── EditProfileModal.tsx
│   │   │   └── ProfilePostList.tsx
│   │   └── ui/                   # Reusable atomic UI elements (Button, Avatar, Modal)
│   ├── pages/                    # Route page components
│   │   ├── FeedPage.tsx          # Main algorithmic community feed
│   │   ├── ConnectPage.tsx       # Student & alumni discovery + Developer showcase
│   │   ├── ChatPage.tsx          # Real-time direct messaging interface
│   │   ├── CreatePostPage.tsx    # Rich text & image post composer
│   │   ├── PostDetailPage.tsx    # Threaded discussion & nested comments
│   │   └── ProfilePage.tsx       # User profile with follow actions & media
│   ├── store/                    # Zustand global store & cache slices
│   │   └── useStore.ts
│   ├── types/                    # TypeScript interfaces & enums
│   │   └── index.ts
│   ├── utils/                    # Avatar helpers & date formatters
│   │   └── helpers.ts
│   ├── App.tsx                   # Route definitions & layout wrapping
│   └── main.tsx                  # Application bootstrap & providers
```

---

## 3. Distributed Real-Time Chat Protocol

Because the backend runs **3 default instances** behind an Nginx load balancer, WebSocket connections from different users are distributed across different server pods. The system uses **Apache Kafka** as a distributed message backbone to stream events across all backend pods.

```
[Sender on Vercel]                                     [Recipient on Vercel]
       │                                                         │
       │ WebSocket (send_message)                                │
       ▼                                                         │
┌──────────────┐                                                 │
│Backend Pod #1│                                                 │
└──────┬───────┘                                                 │
       ├─────────────────────────┐                               │
       │ 1. Async BullMQ Job     │ 2. Publish to Kafka topic     │
       ▼                         ▼                               │
┌──────────────┐          ┌──────────────┐                       │
│PostgreSQL DB │          │ Apache Kafka │                       │
│(Via Worker)  │          │(chat-messages│                       │
└──────────────┘          └──────┬───────┘                       │
                                 │                               │
                                 │ 3. Broadcast to all instances │
                                 ├───────────────────────────────┤
                                 │                               │
                                 ▼                               ▼
                          ┌──────────────┐                ┌──────────────┐
                          │Backend Pod #1│                │Backend Pod #2│
                          └──────┬───────┘                └──────┬───────┘
                                 │ 4. Local emit                 │ 4. Local emit
                                 ▼                               ▼
                          [Sender Client]                 [Recipient Client]
```

### Event Lifecycle:
1. **Send Event**: The sender emits `send_message` with `receiverId`, `content`, and an optimistic `tempId`.
2. **Background Persistence**: The receiving server pod enqueues a database write job into BullMQ and immediately forwards the payload to Kafka.
3. **Kafka Broadcast**: Kafka streams the payload across all pod consumer groups.
4. **Target Delivery**: Whichever pod holds the recipient's active WebSocket connection emits `receive_message` into `user:${receiverId}`, delivering the message instantly.
5. **Sender Confirmation**: The sending pod emits `receive_message` to `user:${senderId}` to reconcile the optimistic `tempId` with the server state.

---

## 4. Key Pages and User Workflows

### 4.1 Feed & Social Graph (`/`)
- **Algorithmic Feed**: Community discussions, official college announcements, and department hashtags (`#engineering`, `#placements`, `#announcements`).
- **Interactive Reactions**: Optimistic UI updates for likes and bookmarking.
- **Threaded Comments**: Nested discussions supporting multi-level replies.

### 4.2 Connect & Developer Directory (`/connect`)
- **Developers Team Showcase**: Single-row responsive showcase grid:
  - **Large Screens**: 4 developer cards.
  - **Medium Screens**: 3 developer cards.
  - **Small Screens**: 2 developer cards.
- **Search & Discovery**: Search by student/alumni name, department category, or developer title.
- **Live Follow System**: Real-time follow/unfollow updates with optimistic UI updates.

### 4.3 Direct Messaging Window (`/chat`)
- **Live Presence & Typing**: Live indicators showing when the conversation partner is typing (`user_typing` / `user_stop_typing`).
- **Message States**: Instant visual ticks indicating sent, delivered, and read status.
- **Chat Management**: Ability to clear conversation history.

### 4.4 Profile Management (`/profile`)
- **Role & Verified Badges**: Distinguishes Students, Alumni, Admins, and Core Developers with verified blue checkmarks.
- **Activity Tabs**: Switch between user posts, comments, and media.
- **Profile Completion Tracker**: Guides users to complete avatars, bios, and LinkedIn URLs.

---

## 5. Environment Configuration

```env
# Backend API & WebSocket Gateway
VITE_API_URL=https://api.h4x.co.in/api
VITE_SOCKET_URL=https://api.h4x.co.in

# Cloudinary Cloud Configuration
VITE_CLOUDINARY_CLOUD_NAME=educlinic
```
