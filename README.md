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

## 🔌 API Documentation

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and get JWT token | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| GET | `/api/boards` | Get all boards for logged-in user | Yes |
| POST | `/api/boards` | Create a new board | Yes |
| PUT | `/api/boards/:id` | Update board (Add Custom Column) | Yes |
| DELETE | `/api/boards/:id` | Delete a board | Yes |
| GET | `/api/tasks/board/:boardId` | Get all tasks for a specific board | Yes |
| POST | `/api/tasks` | Create a new task | Yes |
| PUT | `/api/tasks/:id` | Update task details / status | Yes |
| DELETE | `/api/tasks/:id` | Delete a task | Yes |
| POST | `/api/ai/suggest` | Generate AI task/subtask suggestions | Yes |

## 📸 Screenshots
*(Add your live screenshots here)*
- **Login Screen:** `![Login](./screenshots/login.png)`
- **Dashboard:** `![Dashboard](./screenshots/dashboard.png)`
- **Board View:** `![Board View](./screenshots/board.png)`
- **Mobile View:** `![Mobile View](./screenshots/mobile.png)`

## ⚠️ Known Issues / Future Improvements
- **Real-time Collaboration:** Currently, the app relies on REST API polling. In the future, integrating WebSockets (Socket.io) would allow multiple users to drag-and-drop on the same board simultaneously.

---
*TaskFlow was engineered to showcase modern full-stack development, utilizing decoupled architecture and serverless optimization techniques.*
