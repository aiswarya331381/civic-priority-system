# 🏛️ Civic Issue Reporting & Prioritization System

A full-stack MERN application for reporting, tracking, and prioritizing civic issues with real-time location mapping.

---

## Features

- Priority-based complaint management
- Interactive map integration
- Role-based authentication (User/Admin)
- Complaint tracking and status management
- Secure REST APIs using JWT authentication
- Responsive government-style dashboard UI
- Image upload support for complaints

---

## Tech Stack

### Frontend
- React.js
- JavaScript
- CSS
- Vite

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Maps & Authentication
- Leaflet / OpenStreetMap
- JWT Authentication

---

## Installation

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file inside the `backend` folder and add:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
```

---

## Project Structure

```text
CIVIC_COPY/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Future Enhancements

- AI-based complaint priority prediction
- Email/SMS notifications
- Advanced analytics dashboard
- Mobile responsive optimization
- Government department integration

---

## Author

Developed as a full-stack MERN civic management application for smart complaint reporting and prioritization.