# 🏠 EliteProp SaaS - Real Estate CRM & Management Platform (Next.js 16)

EliteProp is a high-performance, production-grade SaaS solution designed for Real Estate Agencies, built on the cutting edge of the Next.js ecosystem. It streamlines the lifecycle of a lead from initial contact to successful deal closure, featuring automated scoring, property matching, and task management.

---



## 🚀 Cutting-Edge Tech Stack

EliteProp is built using the latest stable and experimental versions of top-tier technologies to ensure maximum performance and developer experience:

- **Framework**: [Next.js 16.1.4](https://nextjs.org/) (App Router, Turbopack, Server Components)
- **Library**: [React 19.2.3](https://react.dev/) (Concurrent Mode, Advanced Hooks)
- **Styling**: [Tailwind CSS 4.0+](https://tailwindcss.com/) (Next-gen CSS performance)
- **Database**: [MongoDB](https://www.mongodb.com/) (Native Driver for optimized persistence)
- **Auth**: [NextAuth.js v5 (Beta 30)](https://authjs.dev/) (Enterprise-grade security)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) (Smooth UI transitions)
- **Icons**: [Lucide React](https://lucide.dev/)

---
#liveLink : https://propertymanagment-five.vercel.app/auth/login

Agent: agent@gmail.com | Admin: admin@gmail.com | Password: 13663


## 🌟 Professional Features by Role

### 👑 Agency Administration
- **Global Command Center**: Real-time KPI dashboard tracking Revenue, Hot Leads, and Pipeline Health.
- **Agent Leaderboard**: Performance metrics based on sales, deal counts, and commission.
- **User Management**: Complete control over platform users (Admin, Agent, Manager roles).
- **Bulk Intelligence**: JSON-based bulk import for rapid lead and property ingestion.
- **Inventory Control**: Comprehensive management of property assets (Sale/Rent status).

### � Agent Workspace
- **Smart Pipeline**: Visual Kanban-style tracking (Assigned -> Call -> Visit -> Deal -> Commission).
- **Property Matching**: Automated matching of leads to available properties based on budget, type, and location.
- **Communication Hub**: Integrated WhatsApp quick-templates and interaction logging.
- **Task Priority**: Deadlines and follow-up reminders prioritized by lead urgency.

### 👤 User/Client Portal
- **Dashboard Overview**: Personalized view of active leads and property interests.
- **Profile Management**: Direct control over profile details, names, and security credentials.
- **Activity Feed**: Stay updated on the latest status of property inquiries.

---

## � Advanced Search & Filtering

EliteProp features a powerful, context-aware global search system:
- **Property ID Search**: Directly locate leads interested in a specific property using unique IDs (e.g., `PROP-123`).
- **Multi-Factor Filtering**: Filter leads by Purpose (**Rent/Buy/Invest**), Name, Email, or Phone.
- **Smart Reset**: Clearing search inputs automatically resets filters to "Show All," ensuring a seamless user experience.

---

## �️ Profile & Security Management
- **Unified Profile System**: All roles (Admin, Agent, User) can update their **Full Name** and **Passwords** securely.
- **Next-Gen Session Sync**: Profile updates are persisted to MongoDB and instantly synchronized with the active session.
- **Dynamic Header**: Smart name display that prioritizes the user's name over their email for a professional touch.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- MongoDB Atlas account

### Installation
1. Clone the repository.
2. Install dependencies (optimized for React 19):
   ```bash
   npm install
   ```
3. Configure your secret variables in `.env.local`:
   ```env
   MONGODB_URI=your_mongodb_uri
   AUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```
4. Launch the Turbopack-powered dev server:
   ```bash
   npm run dev
   ```

### Production Deployment
EliteProp is pre-configured for **Vercel** deployment:
- `npm run build` generates a highly optimized edge-compatible bundle.
- Support for Middleware-based RBAC and secure API endpoints.

---

*Built with ❤️ for High-Performance Real Estate Teams.*
