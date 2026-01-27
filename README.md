# Real Estate Agent Dashboard - Workflow & Features

This Agent Dashboard is a complete, production-ready system for managing real estate operations. It includes Leads Management, Property Listings, Pipeline Tracking, and Activity Logging.

## 🚀 Key Features

-   **Dashboard Home**: Real-time stats, quick actions, and recent activity overview.
-   **Leads Management**: Full CRUD (Create, Read, Update, Delete) with Search, Filtering, and Scoring.
-   **Property Listings**: Manage properties with status tracking (Available, Sold, Rent).
-   **Pipeline Board**: Kanban-style view to track deals from "New" to "Closed".
-   **Unified Actions**: Consistent "Call", "WhatsApp", "Note", and "Mark Done" actions across all pages.
-   **Calendar Integration**: View and manage follow-ups directly from a monthly calendar.
-   **RBAC**: Secure Agent/Admin role separation.

---

## 📋 Agent Workflow

### 1. **Dashboard Overview**
Start your day at `/dashboard/agents`.
-   **Check Stats**: See your active leads and listings at a glance.
-   **Quick Actions**: Use the "Add Lead" or "List Property" buttons for fast entry.

### 2. **Managing Leads**
Navigate to `/dashboard/admin/leads` (or Agent Leads).
-   **Add Lead**: Click "Add Lead" to input new client details.
-   **Score**: Leads are automatically scored (0-100) based on budget, timeline, and completeness.
-   **Call/Action**: Click the **Phone** icon to call directly or add a **Quick Note**.

### 3. **Pipeline Management**
Go to `/dashboard/agents/pipeline`.
-   **Kanban View**: Visualize your sales funnel.
-   **Move Stages**: Drag or use the "Move" dropdown to progress leads (e.g., *Connected* -> *Visit*).
-   **Track Value**: See the total potential value of leads in each stage.

### 4. **Daily Follow-ups**
Check `/dashboard/agents/follow-ups`.
-   **Prioritize**: Tasks are sorted by *Overdue*, *Today*, and *Upcoming*.
-   **Complete Tasks**: Click **"Done"**. A modal will ask for the Outcome (Note) and Next Follow-up Date.
-   **Result**: The lead is updated, activity is logged, and the next task is scheduled effectively.

### 5. **Property Management**
Go to `/dashboard/agents/properties`.
-   **Listings**: View all your assigned properties.
-   **Add Property**: Use the comprehensive form to upload details and images.
-   **Status**: Toggle status between *Available*, *Sold*, etc.

### 6. **Calendar**
Visit `/dashboard/agents/calendar`.
-   **Schedule**: See your entire month's follow-ups.
-   **Interact**: Click a day to see tasks and perform actions directly from the drawer.

---

## 🛠️ Technical Implementation

### Tech Stack
-   **Frontend**: Next.js 14+ (App Router), Tailwind CSS, Lucide React.
-   **Backend**: Next.js API Routes.
-   **Database**: MongoDB (Native Driver).
-   **Auth**: NextAuth.js (v5 Beta).

### Key Components
-   `useLeadActions`: Custom hook for standardized action handling suitable for any component.
-   `LeadsListView`: Reusable list component with advanced filtering.
-   `AddPropertyForm`: Multi-step form for detailed property entry.

### Database Schema (Simplified)
-   **Leads**: `_id`, `fullName`, `status`, `score`, `assignedAgent`, `nextFollowUpDate`.
-   **Properties**: `_id`, `title`, `price`, `status`, `agentEmail`, `images`.
-   **Activities**: `leadId`, `agentEmail`, `actionType` (Call, Note, etc.), `timestamp`.

---

## ✅ Deployment & Verification

1.  **Install**: `npm install`
2.  **Run**: `npm run dev`
3.  **Verify**: Log in as an Agent and follow the workflow above.
