# TaskFlow API Documentation

This document outlines the REST API endpoints available in the TaskFlow application. All protected endpoints require a valid JWT token in the Authorization header.

## Base URL
Local Development: `http://localhost:5001/api`
Production: `[YOUR_PRODUCTION_API_URL]/api`

## Authentication (`/api/auth`)

### 1. Register User
- **URL**: `/auth/register`
- **Method**: `POST`
- **Access**: Public
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Success Response** (201):
  ```json
  {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "jwt_token_here"
  }
  ```

### 2. Login User
- **URL**: `/auth/login`
- **Method**: `POST`
- **Access**: Public
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Success Response** (200): Same as Register.

---

## Boards (`/api/boards`)
*Requires Authorization: Bearer <token>*

### 1. Get All Boards
- **URL**: `/boards`
- **Method**: `GET`
- **Access**: Private (Returns only boards owned by the authenticated user)
- **Success Response** (200):
  ```json
  [
    {
      "_id": "board_id",
      "title": "My Project",
      "description": "Project description",
      "owner": "user_id",
      "createdAt": "2023-10-01T12:00:00Z"
    }
  ]
  ```

### 2. Create Board
- **URL**: `/boards`
- **Method**: `POST`
- **Access**: Private
- **Body**:
  ```json
  {
    "title": "My Project",
    "description": "Optional description"
  }
  ```

### 3. Update Board
- **URL**: `/boards/:id`
- **Method**: `PUT`
- **Access**: Private (Must be board owner)

### 4. Delete Board
- **URL**: `/boards/:id`
- **Method**: `DELETE`
- **Access**: Private (Must be board owner)

---

## Tasks (`/api/tasks`)
*Requires Authorization: Bearer <token>*

### 1. Get Tasks for Board
- **URL**: `/tasks?boardId=<board_id>`
- **Method**: `GET`
- **Access**: Private (Must be board owner)
- **Success Response** (200):
  ```json
  [
    {
      "_id": "task_id",
      "title": "Design UI",
      "status": "todo",
      "subtasks": [],
      "board": "board_id"
    }
  ]
  ```

### 2. Create Task
- **URL**: `/tasks`
- **Method**: `POST`
- **Access**: Private
- **Body**:
  ```json
  {
    "title": "Design UI",
    "description": "Create Figma mocks",
    "boardId": "board_id",
    "status": "todo"
  }
  ```

### 3. Update Task
- **URL**: `/tasks/:id`
- **Method**: `PUT`
- **Access**: Private (Must be task owner)
- **Body**: Partial updates allowed (e.g., `{ "status": "in-progress" }`)

### 4. Delete Task
- **URL**: `/tasks/:id`
- **Method**: `DELETE`
- **Access**: Private (Must be task owner)

---

## AI Features (`/api/ai`)
*Requires Authorization: Bearer <token>*

### 1. Suggest Estimates
- **URL**: `/ai/suggest-estimates`
- **Method**: `POST`
- **Access**: Private
- **Body**:
  ```json
  {
    "title": "Implement JWT Auth",
    "description": "Add login and register routes using bcrypt and jsonwebtoken"
  }
  ```
- **Success Response** (200):
  ```json
  {
    "estimatedEffort": 4,
    "suggestedDueDate": "2023-10-05"
  }
  ```
