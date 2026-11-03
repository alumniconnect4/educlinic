# BFGI Alumni & Community Platform (EduClinic)
## Product & Feature Guide for Documentation & Content Teams (Non-Technical)

---

### Executive Objective
This document translates the complete architecture, modules, workflows, and administration tools of the **BFGI Alumni Platform** into clear, user-friendly concepts. The documentation team can directly use this reference to create step-by-step user manuals, help center knowledge bases, FAQs, and onboarding guides without requiring any technical background.

---

## 1. System Architecture: The Three Main Portals

```
+-----------------------------------------------------------------------------------+
|                        BFGI DIGITAL CAMPUS PLATFORM                               |
+--------------------------+--------------------------------+-----------------------+
| 1. Client Portal         | 2. Community & Chat App        | 3. Admin Portal       |
| (Public Web & Showcase)  | (Interactive Social Hub)       | (Management Cockpit)  |
|                          |                                |                       |
| - Public Landing Pages   | - Real-time 1-to-1 Chat        | - User Verification   |
| - Alumni Directory       | - Feed & Project Showcase      | - Event Management    |
| - Event Discovery & RSVP | - Threaded Comments & Likes    | - Gallery Management  |
| - Campus Photo Gallery   | - Follow & Networking Network  | - Support Helpdesk    |
+--------------------------+--------------------------------+-----------------------+
```

---

## 2. User Roles & Permission Matrix

| Role | Definition & Eligibility | Permissions & Capabilities | Verification Status |
| :--- | :--- | :--- | :--- |
| **Guest / Visitor** | Public visitor browsing the institutional site. | View public home page, research posts, public photo albums, upcoming event catalog. | None (Public) |
| **Student / User (`USER`)** | Currently enrolled BFGI student or new platform registrant. | Browse alumni directory, register for events, raise support tickets, comment on community posts. | Standard login |
| **Verified Alumni (`ALUMNI`)** | Confirmed graduate of Baba Farid Group of Institutions. | Official Blue Checkmark, create posts, share portfolio in Developer Showcase, 1-to-1 direct chat. | Verified via Degree / ID Card review by Admin |
| **Admin (`ADMIN`)** | Designated college staff member or department coordinator. | Verify alumni documents, create & edit events, manage attendee lists, answer helpdesk tickets. | Staff Authorization |
| **Super Admin (`SUPER_ADMIN`)** | Institutional leadership and platform administrators. | Full master access: assign admin privileges, manage all modules, download institutional analytics. | System Master |

---

## 3. Functional Modules & Workflows

### Module 1: Authentication, Onboarding & Alumni Verification
- **User Registration**: Users provide Full Name, Email, Password, and select their Department (*School of Engineering, School of Computer Applications, School of Business Studies, School of Agriculture, School of Sciences, etc.*).
- **Document Submission**: Users upload a photo or scanned copy of their Student ID Card or Degree Certificate.
- **Admin Verification**: College staff reviews the uploaded document in the Admin Portal and grants the official verified badge with one click.

**Workflow Pipeline:**
`1. Sign Up` -> `2. Log In` -> `3. Upload Proof` -> `4. Admin Review` -> `5. Verified Alumni Badge`

---

### Module 2: Community Feed, Social Posts & Engagement
- **Publishing Posts**: Users share announcements, campus memories, and milestones.
- **Developer Showcase**: Special category of posts highlighting software or engineering projects built by students/alumni.
- **Likes & Reactions**: Members give instant feedback with real-time like counters.
- **Threaded Discussions**: Nested comment threads allowing users to reply directly to posts or to other member comments.

---

### Module 3: Directory Search & Multi-Criteria Filtering
- **Alumni Directory Search**: Filter graduates by Department, Company / Employer, and Graduation Year.
- **Event Filters**: Filter events by *Online Webinar vs In-Person* and *Campus-wide (Global) vs Departmental*.
- **Gallery Filters**: Search and filter photos by campus celebration, academic year, and category.

---

### Module 4: Real-Time Chat, Following & Connection System
- **Follow System**: Connect with mentors or batchmates to follow their career updates.
- **1-to-1 Direct Messaging**: Private conversations with real-time delivery and active presence indicators.
- **Safety & Privacy**: Options to clear conversation history or block unwanted contacts.

---

### Module 5: Campus Events & Digital Ticketing / RSVP
- **Event Discovery**: View event schedules, speakers, venue, and registration deadlines.
- **RSVP & Digital Seat**: Submit contact details to secure a seat. Seat limit meters automatically close registration once full.
- **Organizer Tools**: Download and export real-time participant sheets for check-in.

---

### Module 6: Campus Memories & Media Gallery
- **Album Organization**: Photo albums categorized by annual events, sports meets, and convocation days.
- **High-Res Lightbox**: Full-screen photo viewer for alumni to revisit campus memories.

---

### Module 7: Helpdesk & Support Tickets
- **Query Submission**: Raise requests regarding degree verification, transcript assistance, or technical help.
- **Priority Tracking**: Categorized into *High*, *Medium*, and *Low* priority.
- **Status Lifecycle**: Tracked from `OPEN` to `RESOLVED` by administrative staff.

---

## 4. Admin Management Portal Screen Guide

| Screen / Section | Non-Technical Description | Key Action Buttons |
| :--- | :--- | :--- |
| **Analytics Dashboard** | High-level metrics showing total registered users, verified alumni count, active events, and open support tickets with growth charts. | View Metrics, Filter Date Range |
| **User Verification Center** | Queue of alumni who uploaded certificates/ID cards. Staff inspect the image alongside the user's branch and graduation year. | `Approve Verification`, `Reject / Re-upload`, `Promote Role` |
| **Events Management** | Create college events, set dates/venues, upload posters, set seat capacities, and view attendee lists. | `+ Create Event`, `Edit Event`, `Export Attendees` |
| **Gallery & Album Studio** | Create event albums (*Convocation 2026*), upload photo batches, set cover images, and manage archives. | `+ New Album`, `Upload Images`, `Delete Image` |
| **Helpdesk & Support Queue** | Central inbox of user queries with priority filtering and status tracking. | `View Ticket`, `Mark as Resolved`, `Filter Priority` |

---

## 5. End-to-End User Journey Scenarios

### Scenario A: New Graduate Onboarding & Networking
1. **Registration**: Rohan (Alumnus, 2024) registers and selects *School of Computer Applications*.
2. **Verification**: In profile settings, he uploads his Degree Certificate.
3. **Approval**: An admin verifies his certificate in the Admin Portal. Rohan receives the blue Verified Alumni checkmark.
4. **Community**: Rohan writes a post celebrating his new job. Peers like and comment.
5. **Live Chat**: Rohan finds his batchmate in the Alumni Directory, clicks **Follow**, and starts a real-time **1-to-1 Chat**.

### Scenario B: Student Discovering & Registering for a Campus Fest
1. **Discovery**: Ananya (3rd-year student) opens the Events tab on the Client Portal.
2. **Selection**: Selects the *Annual BFGI Tech Summit* and checks seat availability.
3. **RSVP**: Submits her registration form and receives instant seat confirmation.

### Scenario C: Administrator Organizing an Event & Managing Attendees
1. **Creation**: Professor Sharma logs into the Admin Portal and clicks **+ Create Event**.
2. **Setup**: Fills in venue, description, banner, and sets a 250-attendee limit.
3. **Tracking**: Monitors live registrations and exports the final attendee sheet for campus security.

---

## 6. Glossary of Non-Technical Terms

- **Verified Alumni Badge**: Official blue checkmark granted after administrative verification of degree documents.
- **Developer Showcase**: A dedicated post format for members to present tech, software, or design projects.
- **Global vs Departmental Event**: Global events are campus-wide; Departmental events are tailored to specific academic branches.
- **Help Ticket**: A structured support request handled by college administration.
- **Alumni Directory**: The searchable campus directory of all registered graduates.
