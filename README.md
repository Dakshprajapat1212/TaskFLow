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

### 🧪 Test Credentials
If you'd like to skip registration and test the live application immediately, you can use the following test account:
- **Email:** `dakshprajapat1212@gmail.com`
- **Password:** `daksh1212`

1. **Sign Up / Log In:** Create an account or use the test credentials above to access your personal workspace.
2. **Create a Board:** Click "New Project" to start a new board.
3. **Customize Columns:** Click the "Add Column" button on the far right of your board to create custom workflow stages.
4. **Create Tasks:** Click "New Issue" to add a task. 
5. **Manage Tasks:** Click any task to open its details. From there, you can edit its properties, add comments, or delete the task entirely using the red Delete button.
6. **Use AI:** In the task creation modal, type naturally in the "Ask AI" box, or use the "AI Assistant" sidebar to auto-generate subtasks and estimates.
7. **Drag and Drop:** Grab anywhere on a task card and effortlessly drag it to a new column. 
8. **Complete Subtasks:** Clicking a subtask directly from the board will cycle its state. Dragging the parent card to the final "Done" column will complete them all automatically!

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
*TaskFlow was engineered to showcase modern full-stack development, utilizing decoupled architecture and serverless optimization techniques.



pictures-






.*<img width="2940" height="1618" alt="iScreen Shoter - Microsoft Edge - 260625213343" src="https://github.com/user-attachments/assets/4de03e59-a356-4dbb-ac4e-397db8599bc8" />
<img width="2940" height="1618" alt="iScreen Shoter - Microsoft Edge - 260625194528" src="https://github.com/user-attachments/assets/2e6d11e3-5000-414f-a120-bfe5ca3e612a" />
<img width="2940" height="1618" alt="iScreen Shoter - Microsoft Edge - 260625194504" src="https://github.com/user-attachments/assets/fe207fe2-4853-4cee-8fab-3663f1aaf3ec" />
<img width="2940" height="1618" alt="iScreen Shoter - Microsoft Edge - 260625194456" src="https://github.com/user-attachments/assets/27eeab9c-9fa9-4616-a186-4e88c88e5043" />
<img width="2940" height="1618" alt="iScreen Shoter - Microsoft Edge - 260625194444" src="https://github.com/user-attachments/assets/a43ccc8a-fe2a-4fe0-a98d-dceffcb8384d" />
<img width="2940" height="1618" alt="iScreen Shoter - Microsoft Edge - 260625194436" src="https://github.com/user-attachments/assets/be0e2b37-8112-4bce-8cc8-0b15933149f0" />
<img width="2940" height="1618" alt="iScreen Shoter - Microsoft Edge - 260625194424" src="https://github.com/user-attachments/assets/0a064960-1482-4ed3-a478-ac9163a0eefc" />
<img width="2940" height="1618" alt="iScreen Shoter - Microsoft Edge - 260625194412" src="https://github.com/user-attachments/assets/de3d7b82-14c4-49cc-983b-7680e793eef5" />



<img width="2922" height="1604" alt="iScreen Shoter - Microsoft Edge - 260625194344" src="https://github.com/user-attachments/assets/da151e77-bcd3-4332-bb94-0421c9c653a7" />
<img width="2940" height="1606" alt="iScreen Shoter - Microsoft Edge - 260625194302" src="https://github.com/user-attachments/assets/d9c97591-5296-45d7-b8ff-76eb17accf19" />
<img width="2940" height="1618" alt="iScreen Shoter - Microsoft Edge - 260625194202" src="https://github.com/user-attachments/assets/196699e3-01e2-4c38-ba14-3efa7b6e0748" />
<img width="2940" height="1618" alt="iScreen Shoter - Microsoft Edge - 260625194045" src="https://github.com/user-attachments/assets/8e6e40ac-2ddd-4cea-825f-ecd31fda9b12" />




<img width="2940" height="1618" alt="iScreen Shoter - Microsoft Edge - 260625193919" src="https://github.com/user-attachments/assets/cb5aea5b-378b-4c30-b4f0-d4d6f2805f86" />
<img width="2940" height="1618" alt="iScreen Shoter - Microsoft Edge - 260625193821" src="https://github.com/user-attachments/assets/21cc011d-c04b-4456-b4ae-749aa68ba172" />
<img width="2940" height="1618" alt="iScreen Shoter - Microsoft Edge - 260625193742" src="https://github.com/user-attachments/assets/7d8caaa5-c6b9-4f48-915c-808429dd7d24" />
<img width="2940" height="1618" alt="iScreen Shoter - Microsoft Edge - 260625193715" src="https://github.com/user-attachments/assets/d5e6c7ec-0ba1-49bd-ac0a-c50c35bbbce2" />
<img width="2940" height="1618" alt="iScreen Shoter - Microsoft Edge - 260625193545" src="https://github.com/user-attachments/assets/623120c9-f9dd-4e94-b89d-bf2596f0a666" />
<img width="2940" height="1618" alt="iScreen Shoter - 20260625194227110" src="https://github.com/user-attachments/assets/7bb5189b-c0a5-4312-95b9-33239495101d" />
<img width="2940" height="1618" alt="iScreen Shoter - 20260625194140732" src="https://github.com/user-attachments/assets/991820d6-34e8-40f4-8e83-97388d5dbf6b" />

