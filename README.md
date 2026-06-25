# TaskFlow 🚀

TaskFlow is a powerful, AI-assisted Kanban project management tool built with the MERN stack. Designed for maximum productivity, it features a highly dynamic drag-and-drop interface, custom board columns, and intelligent AI integration to automate your workflow.

## ✨ Features

- **Dynamic Kanban Boards:** Create custom columns (e.g., "Backlog", "In Review", "QA") and seamlessly drag and drop tasks between them.
- **AI-Powered Assistance (Google Gemini):**
  - **Natural Language Parsing:** Type "Remind me to fix the login bug tomorrow" to auto-fill task properties.
  - **Auto-Subtasks:** Generate intelligent subtask checklists based purely on your task title.
  - **Auto-Estimates:** Get AI-driven time and effort estimations.
- **Smart Subtask Syncing:** Dragging a parent task to the "Done" column automatically checks off all its subtasks. Dragging it back resets them.
- **Zero-Latency UI:** Powered by Zustand and Optimistic UI updates, drag-and-drop feels instantaneous (0ms perceived latency).
- **Secure Authentication:** JWT-based user authentication with encrypted passwords via bcrypt.
- **Responsive Dark Mode:** Beautiful, modern UI built with Tailwind CSS that respects your system preferences.

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Zustand, React Router, @dnd-kit
- **Backend:** Node.js, Express.js, Mongoose, Google Gemini API
- **Database:** MongoDB Atlas
- **Deployment Strategy:** Vercel (Frontend), Render (Backend), GitHub Actions (Keep-Alive Cron Job)

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine. You will also need a MongoDB Atlas account and a Google Gemini API Key.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory and add the following:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
```

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory and add the following:
```env
VITE_API_URL=http://localhost:5001/api
```

Start the frontend development server:
```bash
npm run dev
```

## 📖 How to Use TaskFlow

1. **Sign Up / Log In:** Create an account to access your personal workspace.
2. **Create a Board:** Click "New Project" to start a new board.
3. **Customize Columns:** Click the "Add Column" button on the far right of your board to create custom workflow stages.
4. **Create Tasks:** Click "New Issue" to add a task. 
5. **Use AI:** In the task creation modal, type naturally in the "Ask AI" box, or use the "AI Assistant" sidebar to auto-generate subtasks and estimates.
6. **Drag and Drop:** Grab anywhere on a task card and effortlessly drag it to a new column. 
7. **Complete Subtasks:** Clicking a subtask directly from the board will cycle its state. Dragging the parent card to the final "Done" column will complete them all automatically!

---
*TaskFlow was engineered to showcase modern full-stack development, utilizing decoupled architecture and serverless optimization techniques.*
