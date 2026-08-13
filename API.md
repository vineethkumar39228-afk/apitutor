# APITutor Backend API Reference

Base Production URL: `https://apitutor.onrender.com/api`  
Base Local URL: `http://localhost:5000/api`

---

## Table of Contents
1. [Authentication (`/api/auth` & `/api/users`)](#1-authentication)
2. [User Profile (`/api/users`)](#2-user-profile)
3. [Questions & Problem Catalog (`/api/questions`)](#3-questions--problem-catalog)
4. [Step Solver Engine (`/api/solver`)](#4-step-solver-engine)
5. [User Progress Tracking (`/api/progress`)](#5-user-progress-tracking)
6. [Analytics & Leaderboard (`/api/analytics`)](#6-analytics--leaderboard)

---

## 1. Authentication

### `POST /api/auth/register` (or `/api/users/register`)
Register a new user account. Returns an Access Token and sets an `httpOnly` refresh token cookie.

- **Access:** Public
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```
- **Success Response (201 Created):**
```json
{
  "_id": "64f8a123b456c7890def1111",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```
- **Error Responses:**
  - `400 Bad Request`: `{"message": "Please provide name, email, and password"}` or `{"message": "User already exists"}`

---

### `POST /api/auth/login` (or `/api/users/login`)
Authenticate existing user. Returns an Access Token and sets an `httpOnly` refresh token cookie (`jwt`).

- **Access:** Public
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```
- **Success Response (200 OK):**
```json
{
  "_id": "64f8a123b456c7890def1111",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```
- **Error Responses:**
  - `401 Unauthorized`: `{"message": "Invalid email or password"}`

---

### `POST /api/auth/refresh` (or `/api/users/refresh`)
Issues a fresh Access Token using the valid `jwt` HttpOnly cookie.

- **Access:** Public (Requires `jwt` Cookie)
- **Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}
```
- **Error Responses:**
  - `401 Unauthorized`: `{"message": "Unauthorized. No refresh token found."}`
  - `403 Forbidden`: `{"message": "Forbidden. Refresh token expired."}`

---

### `POST /api/auth/logout` (or `/api/users/logout`)
Clears the `jwt` HttpOnly refresh cookie.

- **Access:** Public
- **Success Response (200 OK / 204 No Content):**
```json
{
  "message": "Logged out successfully"
}
```

---

## 2. User Profile

### `GET /api/users/me`
Fetches the currently authenticated user profile.

- **Access:** Private
- **Headers:** `Authorization: Bearer <accessToken>`
- **Success Response (200 OK):**
```json
{
  "_id": "64f8a123b456c7890def1111",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "createdAt": "2026-08-01T10:00:00.000Z"
}
```
- **Error Responses:**
  - `401 Unauthorized`: Missing or invalid Bearer token
  - `404 Not Found`: User does not exist

---

## 3. Questions & Problem Catalog

### `GET /api/questions`
Fetches catalog of math problem questions with support for filtering, search, and pagination. Results are cached in Redis.

- **Access:** Public / Private
- **Query Parameters:**
  - `topic` (string, optional): e.g., `algebra`, `calculus`
  - `difficulty` (string, optional): e.g., `easy`, `medium`, `hard`
  - `search` (string, optional): Search term for title or equation
  - `page` (number, default: `1`)
  - `limit` (number, default: `10`)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "source": "database",
  "data": [
    {
      "_id": "64f8b222c333d444e5556666",
      "title": "Linear Equation Isolation",
      "topic": "Algebra",
      "difficulty": "Easy",
      "originalEquation": "2x + 4 = 10"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "pages": 3,
    "limit": 10
  }
}
```

---

### `GET /api/questions/:id`
Fetches a single problem by ID.

- **Access:** Public
- **Success Response (200 OK):**
```json
{
  "_id": "64f8b222c333d444e5556666",
  "title": "Linear Equation Isolation",
  "topic": "Algebra",
  "difficulty": "Easy",
  "originalEquation": "2x + 4 = 10",
  "expectedSteps": [
    "Subtract 4 from both sides: 2x = 6",
    "Divide both sides by 2: x = 3"
  ]
}
```

---

## 4. Step Solver Engine

### `POST /api/solver/solve`
Evaluates a mathematical equation string, sanitizes input via MathSanitizer middleware, and generates step-by-step solutions.

- **Access:** Public / Private
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "equation": "2x + 4 = 10"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "original": "2x + 4 = 10",
  "parsedData": {
    "cleanString": "2*x + 4 = 10"
  },
  "result": "x = 3",
  "steps": [
    "2*x = 10 - 4",
    "2*x = 6",
    "x = 3"
  ]
}
```

---

### `POST /api/solver/validate-step`
Validates a student's step against the problem's expected step using mathematical equivalence evaluation and Gemini Agentic fallback.

- **Access:** Public / Private
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "problemId": "64f8b222c333d444e5556666",
  "currentStepIndex": 0,
  "step": "2x = 6"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "isCorrect": true,
  "isComplete": false,
  "message": "Correct step!",
  "diagnostic": null
}
```

---

### `POST /api/solver/hint`
Retrieves a contextual hint for the current step of a problem.

- **Access:** Public / Private
- **Request Body:**
```json
{
  "problemId": "64f8b222c333d444e5556666",
  "currentStepIndex": 0
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "step": 1,
  "hint": "Subtract 4 from both sides to isolate 2x."
}
```

---

## 5. User Progress Tracking

### `POST /api/progress/attempt`
Logs a new problem attempt for the authenticated user.

- **Access:** Private
- **Headers:** `Authorization: Bearer <accessToken>`
- **Request Body:**
```json
{
  "problemId": "64f8b222c333d444e5556666"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "progress": {
    "userId": "64f8a123b456c7890def1111",
    "problemId": "64f8b222c333d444e5556666",
    "attempts": 1,
    "isCompleted": false
  }
}
```

---

### `POST /api/progress/complete`
Marks a problem as completed for the authenticated user.

- **Access:** Private
- **Headers:** `Authorization: Bearer <accessToken>`
- **Request Body:**
```json
{
  "problemId": "64f8b222c333d444e5556666"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Problem marked as completed!",
  "progress": {
    "userId": "64f8a123b456c7890def1111",
    "problemId": "64f8b222c333d444e5556666",
    "attempts": 1,
    "isCompleted": true,
    "completedAt": "2026-08-13T15:30:00.000Z"
  }
}
```

---

## 6. Analytics & Leaderboard

### `GET /api/analytics/dashboard`
Fetches user mastery statistics and overall attempt accuracy across topics.

- **Access:** Private
- **Headers:** `Authorization: Bearer <accessToken>`
- **Success Response (200 OK):**
```json
{
  "success": true,
  "overall": {
    "totalStarted": 10,
    "totalCompleted": 8,
    "totalAttempts": 12,
    "accuracyRate": 66.7
  },
  "mastery": [
    {
      "topic": "Algebra",
      "problemsStarted": 5,
      "problemsCompleted": 5,
      "masteryScore": 100,
      "avgAttemptsPerProblem": 1.2
    }
  ]
}
```

---

### `GET /api/analytics/leaderboard`
Fetches global leaderboard top 10 users ordered by completed problems (cached in Redis for 5 mins).

- **Access:** Public / Private
- **Success Response (200 OK):**
```json
{
  "success": true,
  "source": "database",
  "leaderboard": [
    {
      "name": "Jane Doe",
      "totalSolved": 42
    }
  ]
}
```
