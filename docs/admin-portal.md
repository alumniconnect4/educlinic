# BFGI Admin Management Portal

## 1. Overview

The BFGI Admin Portal (`admin-portal`) is a dedicated operational control plane built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**, deployed on the **Vercel Edge Network**. It provides authorized staff, moderators, and system administrators with tools to oversee user accounts, manage events, moderate media galleries, resolve support tickets, and analyze platform engagement.

### Technical Stack

- **Hosting**: Vercel Edge Network
- **Core**: React 19, TypeScript, Vite
- **Styling & Icons**: Tailwind CSS, Lucide Icons, Radix UI Primitives
- **Data Visualization**: Recharts
- **State Management**: Zustand
- **Routing**: React Router DOM v6
- **AI Engine**: Integrated Google Gemini AI Assistant for institutional queries

---

## 2. Directory Structure

```
admin-portal/
├── src/
│   ├── api/                      # Admin API client with token interception
│   │   └── client.ts
│   ├── components/
│   │   ├── layout/               # Admin sidebar, header, top navigation & guards
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── ui/                   # Modals, confirmation dialogs, badge components
│   │   └── ai/                   # Embedded AI assistant widget
│   ├── pages/                    # Administrative operational views
│   │   ├── Home.tsx              # Analytics dashboard & quick operational stats
│   │   ├── AnalyticsDetail.tsx   # Detailed charts, growth metrics & user trends
│   │   ├── Events.tsx            # Event creator, editor & schedule manager
│   │   ├── EventRegistrations.tsx# Registrations table, attendee list & CSV export
│   │   ├── Gallery.tsx           # Album creator & Cloudinary batch photo uploader
│   │   ├── HelpTickets.tsx       # Support ticket queue, priority & status updater
│   │   ├── Guide.tsx             # Administrative documentation & user manuals
│   │   ├── Settings.tsx          # System parameters, credentials & email setups
│   │   ├── Login.tsx             # Administrative authentication gateway
│   │   └── users/                # User directory, verification & developer flag toggle
│   │       ├── UsersList.tsx
│   │       └── UserDetailModal.tsx
│   ├── store/                    # Global admin state & auth stores
│   │   └── useAdminStore.ts
│   ├── App.tsx                   # Route definitions & access protection
│   └── main.tsx                  # Bootstrap & providers
```

---

## 3. Operational Workflows and Capabilities

```
                               ┌─────────────────────────┐
                               │  Admin Logs In (/login) │
                               └────────────┬────────────┘
                                            │
                                            ▼
                        ┌───────────────────────────────────────┐
                        │              AdminLayout              │
                        │       Sidebar & RBAC Verification     │
                        └───────────────────┬───────────────────┘
                                            │
         ┌──────────────────┬───────────────┼───────────────┬──────────────────┐
         │                  │               │               │                  │
         ▼                  ▼               ▼               ▼                  ▼
┌────────────────┐  ┌────────────────┐ ┌─────────┐  ┌────────────────┐ ┌────────────────┐
│   Dashboard    │  │User Management │ │ Events  │  │Gallery & Media │ │Support Tickets │
│Metrics, Graphs,│  │Approve Degrees,│ │Create & │  │Upload Albums,  │ │Resolve Inquiries│
│Recent Activity │  │Toggle Dev Flag │ │Export RS│  │Set Cover Photos│ │Assign Priority│
└────────────────┘  └────────────────┘ └─────────┘  └────────────────┘ └────────────────┘
```

### 3.1 Platform Analytics & Metrics (`/`)
- **Key Performance Indicators**: Total user registrations, active alumni, event attendee totals, and open support tickets.
- **Visual Trends**: Recharts line and bar graphs depicting daily registration velocity and engagement metrics.

### 3.2 User Moderation & Verification (`/users`)
- **Alumni Verification Workflow**: Inspection of uploaded graduation degrees (`degreeUrl`) and student ID cards (`idCardUrl`) before granting `isVerified` status.
- **Developer Flag Management**: Designated administrators can assign `isDeveloper: true` and specify custom engineering titles (e.g., `Lead Backend Engineer`, `Full Stack Developer`).
- **Role Assignment**: Capability to elevate user roles (`USER` -> `ALUMNI` -> `ADMIN` -> `SUPER_ADMIN`).

### 3.3 Event Creation & Attendee Export (`/events`, `/events/:id/registrations`)
- **Event Lifecycle**: Creating offline/online events with capacity constraints, dates, locations, and descriptions.
- **Attendee Roster**: Live view of registered students/alumni with contact numbers, graduation years, and companies.
- **Data Export**: Export attendee rosters to CSV for offline campus security check-ins.

### 3.4 Media Gallery Management (`/gallery`)
- **Album Creation**: Create named albums categorized by school or year.
- **Batch Upload**: Multi-file image uploading directly to Cloudinary with automated optimization.
- **Cover Image Selection**: Specify album cover previews for public display.

### 3.5 Support Ticket Helpdesk (`/help-tickets`)
- **Ticket Lifecycle**:
  ```
  [OPEN] ─── (Review Priority: LOW / MEDIUM / HIGH) ───> [IN_PROGRESS] ───> [RESOLVED]
  ```
- **Direct Filtering**: Filter tickets by status and priority to ensure fast response times for student inquiries.

### 3.6 Integrated AI Assistant
- **Context-Aware Intelligence**: Uses Google Gemini API with system instructions tuned for BFGI policies, campus history, and alumni administration.
- **Quick Actions**: Assists administrators in drafting announcements, summarizing ticket queues, and formulating event agendas.

---

## 4. Environment Configuration

```env
# Backend API Gateway
VITE_API_URL=https://api.h4x.co.in/api

# AI Service Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Cloudinary Integration for Admin Media Uploads
VITE_CLOUDINARY_UPLOAD_PRESET=educlinic_preset
VITE_CLOUDINARY_CLOUD_NAME=educlinic
```
