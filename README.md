# CoreInventory: SaaS Inventory Management System

CoreInventory is a high-performance, premium SaaS solution designed for real-time inventory tracking, multi-warehouse management, and seamless stock operations. Built for the modern supply chain, it provides a stable, aesthetic, and analytical dashboard for inventory managers.

## 🚀 Hackathon Submission Overview

This project is structured into two main components:
- `/frontend`: High-performance UI built with Next.js 16 (Canary) and Tailwind CSS 4.
- `/backend`: Scalable API layer powered by Node.js, Express, and Prisma ORM.

---

## 🛠️ Technical Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS 4 & Framer Motion (Transitions & Animations)
- **Visualization**: Recharts (Interactive Analytics)
- **Icons**: Lucide React

### Backend
- **Environment**: Node.js & TypeScript
- **Framework**: Express.js
- **ORM**: Prisma (Type-safe database access)
- **Authentication**: JWT & Bcrypt.js
- **Validation**: Zod (Schema-based validation)

---

## 🏗️ Architecture Design

The system follows a **Decoupled Client-Server Architecture**:
1. **Frontend**: A server-side rendered (SSR) Next.js application that handles all UI logic, data visualization, and user interactions. It communicates with the backend via RESTful APIs.
2. **Backend**: A modular Express server implemented in TypeScript. It handles business logic, security, and database orchestrations.
3. **API Layer**: Structured endpoints for Products, Warehouses, Receipts (Stock In), Deliveries (Stock Out), Internal Transfers, and Adjustments.

---

## 📊 Database Design & Schema

We use **PostgreSQL** as our primary relational database. The schema is optimized for consistency and auditability.

### Key Models:
- **User**: Authentication and RBAC (Admin/Staff).
- **Product & Category**: Hierarchical product management.
- **Warehouse**: Multi-hub storage tracking.
- **Inventory**: Junction table for real-time stock levels per warehouse.
- **Movements**:
    - `Receipt`: Incoming stock.
    - `Delivery`: Outgoing stock.
    - `Transfer`: Internal movement between hubs (From -> To).
    - `Adjustment`: Manual stock corrections with audit reason.
- **StockLedger**: An **immutable audit trail** that records every single stock change in the system for complete transparency.

---

## 🏃 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
# Configure your .env with DATABASE_URL
npx prisma migrate dev
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.
