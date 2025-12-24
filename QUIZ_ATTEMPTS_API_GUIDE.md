# Quiz Attempts API - Usage Guide

## 📚 Overview
This guide explains how to use the Quiz Attempts API endpoints to fetch quiz attempt data.

---

## 🎯 Available API Endpoints

### 1. GET /api/v1/quiz-attempts
**Description:** Lấy danh sách TẤT CẢ lượt làm quiz

**Parameters:**
- Optional query parameters (page, size, sort, etc.) - depends on backend implementation

**Response Structure:**
```javascript
[
  {
    "attemptId": 123,
    "quizId": 10,
    "quizTitle": "Kiểm tra kiến thức Java Core",
    "userId": 1001,
    "startTime": "2025-12-24T16:11:29.988Z",
    "endTime": "2025-12-24T16:11:29.988Z", "score": 85,
    "correctCount": 17,
    "totalCount": 20,
    "passed": true,
    "status": "COMPLETED",
    "attemptNumber": 1,
    "timeSpentSeconds": 1200,
    "createdAt": "2025-12-24T16:11:29.988Z"
  }
  // ... more attempts
]
```

### 2. GET /api/v1/quiz-attempts/{attemptId}
**Description:** Lấy chi tiết một lượt làm quiz cụ thể

**Parameters:**
- `attemptId` (path parameter, required): ID của attempt

**Response Structure:**
```javascript
{
  "attemptId": 123,
  "quizId": 10,
  "quizTitle": "Kiểm tra kiến thức Java Core",
  "userId": 1001,
  "startTime": "2025-12-24T16:11:29.988Z",
  "endTime": "2025-12-24T16:11:29.988Z",
  "score": 85,
  "correctCount": 17,
  "totalCount": 20,
  "passed": true,
  "status": "COMPLETED",
  "attemptNumber": 1,
  "timeSpentSeconds": 1200,
  "createdAt": "2025-12-24T16:11:29.988Z"
}
```

---

## 💻 Usage in React Components

### Example 1: Get All Attempts

```javascript
import { quizAttemptService } from "@utils/quizAttemptService";
import { useState, useEffect } from "react";

function QuizAttemptsList() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllAttempts();
  }, []);

  const fetchAllAttempts = async () => {
    setLoading(true);
    try {
      const response = await quizAttemptService.getAllAttempts();
      
      console.log("All attempts:", response.data);
      
      // Handle different response structures
      let attemptsList = [];
      if (Array.isArray(response.data)) {
        attemptsList = response.data;
      } else if (Array.isArray(response.data?.content)) {
        attemptsList = response.data.content;
      }
      
      setAttempts(attemptsList);
    } catch (error) {
      console.error("Error fetching attempts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {attempts.map(attempt => (
            <li key={attempt.attemptId}>
              {attempt.quizTitle} - Score: {attempt.score}%
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Example 2: Get Specific Attempt Detail

```javascript
import { quizAttemptService } from "@utils/quizAttemptService";
import { useState } from "react";

function AttemptDetail({ attemptId }) {
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAttemptDetail = async () => {
    setLoading(true);
    try {
      const response = await quizAttemptService.getAttemptDetail(attemptId);
      
      console.log("Attempt detail:", response.data);
      setAttempt(response.data);
    } catch (error) {
      console.error(`Error fetching attempt ${attemptId}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (attemptId) {
      fetchAttemptDetail();
    }
  }, [attemptId]);

  if (loading) return <p>Loading...</p>;
  if (!attempt) return <p>No data</p>;

  return (
    <div>
      <h2>{attempt.quizTitle}</h2>
      <p>Score: {attempt.score}%</p>
      <p>Correct: {attempt.correctCount}/{attempt.totalCount}</p>
      <p>Time: {Math.floor(attempt.timeSpentSeconds / 60)}m</p>
      <p>Status: {attempt.status}</p>
      <p>Passed: {attempt.passed ? "✅ Yes" : "❌ No"}</p>
    </div>
  );
}
```

### Example 3: With Statistics

```javascript
import { quizAttemptService } from "@utils/quizAttemptService";
import { useState, useEffect, useMemo } from "react";

function QuizAttemptsStats() {
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const response = await quizAttemptService.getAllAttempts();
      setAttempts(response.data || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const stats = useMemo(() => {
    return {
      total: attempts.length,
      passed: attempts.filter(a => a.passed).length,
      failed: attempts.filter(a => !a.passed).length,
      averageScore: attempts.length > 0
        ? (attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length).toFixed(2)
        : 0
    };
  }, [attempts]);

  return (
    <div>
      <h3>Statistics</h3>
      <p>Total Attempts: {stats.total}</p>
      <p>Passed: {stats.passed}</p>
      <p>Failed: {stats.failed}</p>
      <p>Average Score: {stats.averageScore}%</p>
    </div>
  );
}
```

---

## 🧪 Test in Browser Console

Open Browser Console (F12) and run:

```javascript
// Test 1: Get all attempts
const allAttempts = await fetch('/api/v1/quiz-attempts', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
}).then(r => r.json());

console.log("All attempts:", allAttempts);

// Test 2: Get specific attempt
const attemptId = 123;
const attemptDetail = await fetch(`/api/v1/quiz-attempts/${attemptId}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
}).then(r => r.json());

console.log("Attempt detail:", attemptDetail);
```

---

## 🎨 Interactive Demo

Visit the demo page to see a working example:

**URL:** http://localhost:5173/admin/quiz-attempts-demo

Features:
- ✅ List view of all quiz attempts
- ✅ Click to view detailed information
- ✅ Statistics dashboard (total, passed, failed, average score)
- ✅ Real-time data fetching
- ✅ Code examples and documentation

---

## 📁 Service Methods

All methods are available in `quizAttemptService.js`:

```javascript
import { quizAttemptService } from "@utils/quizAttemptService";

// Available methods:
quizAttemptService.getAllAttempts(params)           // GET /api/v1/quiz-attempts
quizAttemptService.getAttemptDetail(attemptId)      // GET /api/v1/quiz-attempts/{id}
quizAttemptService.startAttempt(payload)            // POST /api/v1/quiz-attempts/start
quizAttemptService.submitAttempt(attemptId, payload) // POST /api/v1/quiz-attempts/{id}/submit
quizAttemptService.getAttemptsByQuiz(quizId)        // GET /api/v1/quiz-attempts/by-quiz/{quizId}
quizAttemptService.getAttemptsByUser(userId)        // GET /api/v1/quiz-attempts/by-user/{userId}
quizAttemptService.getAttemptsByUserAndQuiz(userId, quizId) // GET by user and quiz
quizAttemptService.uploadAttachment(attemptId, file) // POST attachment
```

---

## 📊 Response Fields Explanation

| Field | Type | Description |
|-------|------|-------------|
| `attemptId` | number | ID của lượt làm quiz |
| `quizId` | number | ID của quiz |
| `quizTitle` | string | Tên quiz |
| `userId` | number | ID của user làm quiz |
| `startTime` | string (ISO 8601) | Thời gian bắt đầu |
| `endTime` | string (ISO 8601) | Thời gian kết thúc |
| `score` | number | Điểm số (0-100) |
| `correctCount` | number | Số câu đúng |
| `totalCount` | number | Tổng số câu |
| `passed` | boolean | true nếu đạt, false nếu không |
| `status` | string | Trạng thái (COMPLETED, IN_PROGRESS, etc.) |
| `attemptNumber` | number | Lần thử thứ mấy |
| `timeSpentSeconds` | number | Thời gian làm bài (giây) |
| `createdAt` | string (ISO 8601) | Thời gian tạo |

---

## ⚠️ Important Notes

1. **Authentication Required**: Phải đăng nhập để gọi API
2. **Response Structure**: Response có thể là array hoặc object với field `content`
3. **Error Handling**: Luôn wrap trong try-catch
4. **Loading States**: Hiển thị loading indicator khi fetch data

---

## 🔍 Filtering & Sorting

If the backend supports pagination/filtering, you can pass parameters:

```javascript
// With pagination
const response = await quizAttemptService.getAllAttempts({
  page: 0,
  size: 20,
  sort: "startTime,desc"
});

// With filters (if supported)
const response = await quizAttemptService.getAllAttempts({
  quizId: 10,
  userId: 1001,
  status: "COMPLETED"
});
```

---

## 📝 Quick Reference

### Get All Attempts
```javascript
const response = await quizAttemptService.getAllAttempts();
console.log(response.data);
```

### Get Attempt Detail
```javascript
const response = await quizAttemptService.getAttemptDetail(123);
console.log(response.data);
```

### Get Attempts by Quiz ID
```javascript
const response = await quizAttemptService.getAttemptsByQuiz(10);
console.log(response.data);
```

### Get Attempts by User ID
```javascript
const response = await quizAttemptService.getAttemptsByUser(1001);
console.log(response.data);
```

---

## ✅ Files

| File | Description |
|------|-------------|
| `quizAttemptService.js` | Service with all API methods |
| `QuizAttemptsAPIDemo.jsx` | Interactive demo component |
| `AppRouter.jsx` | Routes configuration |
| `QUIZ_ATTEMPTS_API_GUIDE.md` | This documentation file |

---

**Created by Antigravity AI - Google Deepmind**
📅 2025-12-24
