# TaskFlow - Smart Task & Project Manager

TaskFlow is a modern, full-stack task and project management application built with the MERN stack (MongoDB, Express, React, Node.js) and integrated with the Google Gemini API for intelligent task estimations.

## Features
- **User Authentication**: Secure JWT-based login and registration.
- **Board Management**: Create and manage multiple Kanban boards. Strict ownership enforcement prevents unauthorized access.
- **Task Management**: Create tasks, assign priorities, set due dates, and track status across "To Do", "In Progress", and "Done" columns.
- **Subtask Workflow**: Advanced 3-state subtasks (todo, in-progress, done) that automatically derive the parent task's column status.
- **AI-Powered Estimations**: Request effort and due date suggestions using Google's Gemini AI.
- **Modern UI**: Built with React and Tailwind CSS, featuring light/dark mode, fully responsive mobile design, and fluid drag-and-drop.
- **State Management**: Zustand for scalable and lightweight client-side state handling.

## Tech Stack
### Frontend
- React 18+
- Vite
- Tailwind CSS
- Zustand
- React Router DOM
- dnd-kit (Drag and Drop)
- Axios

### Backend
- Node.js
- Express.js
- MongoDB & Mongoose
- JSON Web Token (JWT)
- bcryptjs
- @google/genai (Gemini AI API)

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB instance (local or Atlas)
- Google Gemini API Key

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```env
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/taskflow
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   
The frontend will run on `http://localhost:5173` and communicate with the backend on `http://localhost:5001`.

## API Documentation
Please see [API_DOCS.md](./API_DOCS.md) for a full list of available REST API endpoints and authentication requirements.

## Deployment

### Backend (Render / Heroku / DigitalOcean)
1. Ensure your MongoDB Atlas cluster is accessible.
2. Set the environment variables (`PORT`, `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`) in your hosting provider's dashboard.
3. Use the start script provided in `package.json`: `npm start` (which runs `node server.js`).

### Frontend (Vercel / Netlify)
1. The frontend uses Vite. When deploying to a platform like Vercel, set the Framework Preset to Vite.
2. Build command: `npm run build`
3. Output directory: `dist`
4. **Environment Variables**: You MUST provide the backend API URL as an environment variable in your hosting dashboard:
   ```env
   VITE_API_URL=https://your-backend-url.com/api
   ```
   If `VITE_API_URL` is omitted, the application will default to `http://localhost:5001/api`.
