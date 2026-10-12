# QueueZero — Smart Digital Queue Management System

QueueZero is a full-stack MERN application that lets customers join a service
queue digitally (hospitals, banks, government offices, colleges, restaurants,
salons, etc.) instead of standing in a physical line, and gives staff a live
console to run that queue.

## Tech stack

**Frontend:** React 18 + Vite, React Router, Axios, Lucide React icons, plain modern CSS (no UI framework).
**Backend:** Node.js, Express.js, REST API, JWT auth, bcrypt password hashing.
**Database:** MongoDB with Mongoose ODM.

## Project structure

```
queuezero/
├── server/                # Express REST API
│   ├── config/db.js       # MongoDB connection
│   ├── models/            # User, Service, Token (Mongoose schemas)
│   ├── middleware/        # JWT auth + role authorization, error handler
│   ├── controllers/       # Route logic (auth, services, queue, admin)
│   ├── routes/            # Express routers
│   ├── utils/             # generateToken.js, seed.js
│   └── server.js          # App entry point
│
└── client/                # React + Vite frontend
    └── src/
        ├── api/axios.js           # Axios instance with JWT interceptor
        ├── context/                # AuthContext, NotificationContext
        ├── components/             # Navbar, Sidebar, ServiceCard, TokenTicket, etc.
        ├── pages/
        │   ├── LandingPage, Login, Register, NotFound
        │   ├── customer/           # Dashboard, MyToken, History
        │   └── admin/               # AdminDashboard, QueueMonitor, ManageServices
        └── styles/index.css        # Design system (single stylesheet)
```

## How the queueing logic works

1. Each `Service` keeps a running `lastTokenNumber` counter. Joining a queue
   atomically increments it and creates a `Token` document with `status: "waiting"`.
2. A token's position is computed on read: `peopleAhead` = count of other
   `waiting` tokens for that service with an earlier `joinedAt`.
3. **Estimated wait** = `peopleAhead * service.avgServiceTimeMinutes`.
4. Admins **call next** → oldest `waiting` token becomes `serving`. Only one
   token per service can be `serving` at a time.
5. Admins then mark it **completed**, or **skip** it (e.g. a no-show).
   Customers can **cancel** their own token any time it is `waiting` or `serving`.
6. The customer's "My Token" and the admin's "Live Queues" pages poll the API
   every few seconds to reflect queue movement in near real time.

## Setup instructions (VS Code)

### 1. Prerequisites
- Node.js 18+ and npm
- A MongoDB connection — either a local `mongod` instance or a free
  [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

### 2. Backend

```bash
cd server
npm install
cp .env.example .env
# edit .env and set MONGO_URI and JWT_SECRET
npm run seed     # creates a demo admin + sample services
npm run dev      # starts the API on http://localhost:5000
```

Demo admin login created by the seed script: `admin@queuezero.com` / `Admin@123`

### 3. Frontend

Open a second terminal:

```bash
cd client
npm install
cp .env.example .env   # VITE_API_URL should point at your backend
npm run dev             # starts the app on http://localhost:5173
```

Visit `http://localhost:5173` — register a customer account, or log in with
the seeded admin account to manage services and run the live queue console.

### 4. Testing the API with Postman

All protected routes expect `Authorization: Bearer <token>`, where the token
is returned by `POST /api/auth/login` or `POST /api/auth/register`.

Key endpoints:
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/services` (all authenticated users), `POST/PUT/DELETE /api/services` (admin)
- `POST /api/queue/join`, `GET /api/queue/my-token`, `GET /api/queue/history`, `PUT /api/queue/:id/cancel` (customer)
- `GET /api/admin/queue`, `GET /api/admin/serving`, `POST /api/admin/queue/:serviceId/call-next`,
  `PUT /api/admin/queue/:id/complete`, `PUT /api/admin/queue/:id/skip`, `PUT /api/admin/queue/:id/cancel`,
  `GET /api/admin/statistics` (admin)

## Roles

- **Customer** — register, log in, browse services, join a queue, track token
  live, cancel own token, view history.
- **Admin** — log in, manage services (CRUD), view/monitor all queues, call
  next token, complete/skip/cancel any token, view statistics.

Role is stored on the `User` document and enforced both by frontend route
guards (`ProtectedRoute`) and backend middleware (`protect` + `authorize`),
so a customer JWT can never reach an admin-only endpoint.
