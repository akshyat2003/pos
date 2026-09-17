# Full Stack POS & Inventory Management System

A modern, minimalist Point of Sale (POS) system built with **Express.js**, **MongoDB Atlas**, and **Vite + React**.

---

## Features

- **Storefront**:
  - Multi-category product catalog (Beverages, Bakery, Food, Snacks, Electronics, Accessories).
  - Search & category filtering.
  - Interactive shopping cart with quantity controls.
  - Smooth customer checkout modal collecting Name, Phone Number, and Delivery Address.

- **Admin Portal**:
  - Live aggregated metrics: Total Users, Total Products, Total Orders, Total Revenue.
  - **Full Product CRUD**: Add, Edit/Update, and Delete products directly in MongoDB.
  - **Full Customer CRUD**: Add, Edit/Update, and Delete customer records.
  - **Order & Transaction Logs**: Live records with items, total price, and timestamps.

---

## Tech Stack

- **Backend**: Node.js, Express.js, Mongoose, CORS, Dotenv
- **Database**: MongoDB Atlas
- **Frontend**: React (JavaScript), Vite, Vanilla CSS

---

## Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
```

Run the backend development server:
```bash
npm run dev
```

*(Optional database utilities)*:
- `npm run seed-db`: Populate 170+ starter products across all categories.
- `npm run clean-all`: Wipe database clean for testing.

---

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.
