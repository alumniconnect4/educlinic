# BFGI Alumni Portal (Next.js Application)

## 1. Overview

The BFGI Alumni Portal (`client`) is a modern web application built with **Next.js (App Router)**, **React 19**, and **Tailwind CSS**, deployed on the **Vercel Edge Network**. It serves as the primary public-facing gateway for Baba Farid Group of Institutions alumni, prospective students, current scholars, faculty, and corporate recruiters.

### Technical Stack

- **Hosting**: Vercel Edge Network
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19, Radix UI primitives, Lucide React, React Icons
- **Styling**: Tailwind CSS v4, PostCSS, Class Variance Authority, Clsx, Tailwind Merge
- **State Management**: Zustand, React Context (Auth, Toast)
- **Mapping & Geolocation**: Leaflet, React Leaflet, React Leaflet Cluster
- **Networking**: Axios, Fetch API

---

## 2. Directory Structure

```
client/
├── app/
│   ├── layout.tsx                # Root layout with providers, fonts, navbar & footer
│   ├── page.tsx                  # Home landing page with hero, statistics & feeds
│   ├── globals.css               # Global theme tokens, typography & animations
│   ├── about/                    # About BFGI, leadership messages & history
│   │   └── page.tsx
│   ├── alumni/                   # Alumni directory, filtering & global map view
│   │   └── page.tsx
│   ├── auth/                     # Authentication pages (login, signup, password reset)
│   │   ├── login/
│   │   └── register/
│   ├── contact/                  # Contact us & helpdesk ticket submission
│   │   └── page.tsx
│   ├── events/                   # Event catalog, detail view & RSVP modal
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── gallery/                  # Photo albums, media categories & event memories
│   │   ├── page.tsx
│   │   └── events/
│   │       └── page.tsx
│   └── research/                 # Academic publications & institutional research
│       └── page.tsx
├── components/                   # Reusable UI component modules
│   ├── ConditionalNavbar.tsx     # Route-aware header navigation
│   ├── ConditionalFooter.tsx     # Route-aware footer with institutional links
│   ├── AuthProvider.tsx          # Global authentication state listener
│   ├── SplashScreen.tsx          # Initial loading screen animation
│   ├── FloatingBell.tsx          # Floating notification badge
│   ├── FloatingChatbot.tsx       # AI chatbot popup integration
│   ├── Home/                     # Landing page sections (Hero, Stats, AlumniStories)
│   ├── Alumni/                   # Alumni cards, department filter & Leaflet map
│   ├── Events/                   # Event cards, registration modals & calendar
│   ├── Gallery/                  # Album grid, lightbox viewer & filter tabs
│   └── About/                    # Leadership profiles & institutional timeline
├── store/                        # Zustand state stores
│   └── useAuthStore.ts
└── utils/                        # Axios instance, ToastProvider & formatters
```

---

## 3. Application Flow and User Journeys

```
                               ┌─────────────────────────┐
                               │   Visitor Enters Site   │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │     Home Page (/)       │
                               │  Hero, Stats, Spotlights│
                               └────────────┬────────────┘
                                            │
         ┌──────────────────┬───────────────┼───────────────┬──────────────────┐
         │                  │               │               │                  │
         ▼                  ▼               ▼               ▼                  ▼
┌────────────────┐  ┌────────────────┐ ┌─────────┐  ┌────────────────┐ ┌────────────────┐
│  About Page    │  │Alumni Directory│ │ Events  │  │ Media Gallery  │ │ Contact / Help │
│  Leadership &  │  │Search, Filter &│ │ RSVP &  │  │ Categorized    │ │ Ticket Form &  │
│  Vision        │  │Global Map      │ │ Details │  │ Albums         │ │ Inquiries      │
└────────────────┘  └───────┬────────┘ └────┬────┘  └────────────────┘ └────────────────┘
                            │               │
                            ▼               ▼
                 ┌──────────────────────────────────────┐
                 │       Authentication Barrier         │
                 │ (Login / Registration / Session Sync)│
                 └──────────────────┬───────────────────┘
                                    │
                                    ▼
                 ┌──────────────────────────────────────┐
                 │ Deep Link to Community App / RSVP   │
                 └──────────────────────────────────────┘
```

### Key Modules and Functionality

### 3.1 Landing Page (`/`)
- **Institutional Hero**: Promotes the alumni network with call-to-actions for registration and community onboarding.
- **Key Metrics**: Dynamic display of registered alumni count, placed graduates, partnered firms, and hosted events.
- **Distinguished Alumni Spotlight**: Showcases prominent graduates across engineering, business, computer science, and healthcare.

### 3.2 Alumni Directory & Geographic Map (`/alumni`)
- **Multi-criteria Filtering**: Filters by School Category (`School of Engineering`, `School of Computer Applications`, etc.), graduation year, and company.
- **Interactive Global Map**: Integrates `leaflet` and `react-leaflet-cluster` to plot alumni geographic distributions across various global tech hubs.
- **Direct Connect Trigger**: Seamlessly navigates users into the Community Chat application to start a direct dialogue or follow peers.

### 3.3 Event Management & Ticketing (`/events`)
- **Event Categorization**: Segregates events into `ONLINE` (webinars, masterclasses) and `OFFLINE` (reunions, campus drives, convocations).
- **RSVP and Registration Modal**: Allows students and alumni to submit registration forms. Prevents duplicate registrations through unique constraints on `(eventId, userId)`.
- **Capacity Tracking**: Displays real-time registration counts against event limits.

### 3.4 Media Gallery (`/gallery`)
- **Album Grid**: Organizes memories by year, category, and department.
- **Lightbox Carousel**: High-resolution image inspection with responsive thumbnails.

### 3.5 Contact & Helpdesk (`/contact`)
- **Support Inquiries**: Direct form submission feeding directly into the backend `HelpTicket` repository.
- **Ticket Dispatch**: Assigns ticket priorities (`LOW`, `MEDIUM`, `HIGH`) for immediate processing in the Admin Portal.

---

## 4. Environment Configuration

```env
# API Gateway URL
NEXT_PUBLIC_API_URL=https://api.h4x.co.in/api

# Chat Application Endpoint for Cross-Domain Links
NEXT_PUBLIC_CHAT_APP_URL=https://chat.h4x.co.in

# Mapbox / OpenStreetMap Tiles Configuration
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```
