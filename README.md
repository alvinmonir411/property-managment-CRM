# 🏠 EliteProp SaaS - Real Estate CRM & Management Platform

EliteProp is a high-performance, production-grade SaaS solution designed for Real Estate Agencies. It streamlines the lifecycle of a lead from initial contact to successful deal closure, featuring automated scoring, property matching, and task management.

---

## 🌟 Professional Features

### 🏢 Agency Administration
- **Command Center**: Real-time KPI dashboard (Revenue, Hot Leads, Pipeline Health).
- **Agent Leaderboard**: Track performance with sales and deal-count metrics.
- **Bulk Import**: Rapidly populate the platform with thousands of Leads/Properties via JSON.
- **Asset Inventory**: Centralized management of properties (Available/Sold/Rent).

### 🚀 Agent Productivity
- **Smart Pipeline**: Kanban-style tracking of Stage moves (Assigned -> Call -> Visit -> Deal).
- **Property Matching**: Automatic recommendation of properties based on lead budget and location.
- **WhatsApp Automation**: Personalized quick-reply templates to close deals 10x faster.
- **Interaction History**: Secure logging of every call, note, and stage change.

### � Ecosystem Integration
- **Notification Center**: Real-time alerts for new assignments and overdue tasks.
- **Activity Undo**: Safety net to revert accidental stage moves or activity logs.
- **Role-Based Access (RBAC)**: Distinct workflows for Admins, Agents, and Agency Assistants.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router & Server Actions)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Fully Responsive, Premium Dark/Light Modes)
- **Database**: [MongoDB](https://www.mongodb.com/) (Native Driver for maximum performance)
- **Auth**: [NextAuth.js v5](https://authjs.dev/) (Enterprise-grade session management)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State/API**: [Axios](https://axios-http.com/) with interceptors & React Hooks.

---

## 📋 Standard Workflows

### 1. Lead Lifecycle
1. **Intake**: Lead is created (Admin/Assistant) and assigned a **Score** based on budget/timeline.
2. **Assignment**: Admin assigns lead to an Agent -> Agent receives a **Notification**.
3. **Engagement**: Agent logs "Call" or "WhatsApp" -> Lead moves to **Call** stage.
4. **Showing**: Agent matches property -> Schedules **Visit**.
5. **Closing**: Negotiation leads to **Deal** -> Property marked **Sold** -> **Commission** logged.

### 2. Bulk Management
- **Format**: [
    ```json
    {
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+123456789",
      "location": "Downtown",
      "budgetMax": "500000"
    }
    ```
  ]
- **Action**: Use the "🚀 Bulk Import" button in Leads/Properties tabs.

---

## � Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas connection string

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env.local`:
   ```env
   MONGODB_URI=your_mongodb_uri
   AUTH_SECRET=your_nextauth_secret
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Deployment (Production)
The platform is optimized for [Vercel](https://vercel.com/):
- Connect your GitHub repo.
- Add ENV variables in Vercel Dashboard.
- Automatic CI/CD on every push.

---

## ✅ Quality Standards
- **Responsive**: Mobile-first design for agents on the move.
- **Secure**: RBAC enforced at both UI and API levels.
- **Scalable**: Document-based architecture ready for high-volume data.

---
*Created with ❤️ for High-Performance Real Estate Teams.*

