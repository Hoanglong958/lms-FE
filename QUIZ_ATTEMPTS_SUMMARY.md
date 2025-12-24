# ✅ Quiz Attempts API - Tóm Tắt Hoàn Chỉnh

## 🎯 Tất Cả Endpoints Đã Được Tích Hợp

Tất cả **6 endpoints** Quiz Attempts API đã sẵn sàng! ✅

---

## 📋 Danh Sách API Endpoints

### 1. GET /api/v1/quiz-attempts
**Mô tả:** Lấy danh sách TẤT CẢ lượt làm quiz

```javascript
import { quizAttemptService } from "@utils/quizAttemptService";

const response = await quizAttemptService.getAllAttempts();
console.log(response.data);
```

---

### 2. GET /api/v1/quiz-attempts/paging ⭐ MỚI
**Mô tả:** Lấy danh sách tất cả lượt làm quiz (CÓ PHÂN TRANG)

```javascript
const response = await quizAttemptService.getPagingAttempts({
  page: 0,           // Trang đầu tiên (0-indexed)
  size: 10,          // 10 items mỗi trang
  sort: "startTime,desc"  // Sắp xếp theo thời gian
});

console.log("Total:", response.data.totalElements);
console.log("Pages:", response.data.totalPages);
console.log("Attempts:", response.data.content);
```

**Response Structure:**
```json
{
  "totalElements": 50,
  "totalPages": 5,
  "size": 10,
  "content": [...],
  "number": 0,
  "first": true,
  "last": false
}
```

---

### 3. GET /api/v1/quiz-attempts/{attemptId}
**Mô tả:** Lấy chi tiết MỘT lượt làm quiz

```javascript
const attemptId = 123;
const response = await quizAttemptService.getAttemptDetail(attemptId);

console.log("Attempt details:", response.data);
// {
//   attemptId: 123,
//   quizTitle: "...",
//   score: 85,
//   passed: true,
//   ...
// }
```

---

### 4. GET /api/v1/quiz-attempts/by-quiz/{quizId}
**Mô tả:** Lấy danh sách lượt làm của MỘT QUIZ cụ thể

```javascript
const quizId = 10;
const response = await quizAttemptService.getAttemptsByQuiz(quizId);

console.log(`All attempts for quiz ${quizId}:`, response.data);
// Array of attempts for this quiz
```

**Use Case:** Xem tất cả người đã làm quiz này

---

### 5. GET /api/v1/quiz-attempts/by-user/{userId}
**Mô tả:** Lấy danh sách lượt làm của MỘT USER

```javascript
const userId = 1001;
const response = await quizAttemptService.getAttemptsByUser(userId);

console.log(`All attempts by user ${userId}:`, response.data);
// Array of ALL attempts by this user across all quizzes
```

**Use Case:** Xem lịch sử làm quiz của một user

---

### 6. GET /api/v1/quiz-attempts/by-user/{userId}/quiz/{quizId}
**Mô tả:** Lấy danh sách lượt làm của MỘT USER trong MỘT QUIZ cụ thể

```javascript
const userId = 1001;
const quizId = 10;

const response = await quizAttemptService.getAttemptsByUserAndQuiz(userId, quizId);

console.log(`User ${userId}'s attempts for quiz ${quizId}:`, response.data);
// Array of attempts by this user for this specific quiz
```

**Use Case:** Xem một user đã làm quiz này bao nhiêu lần, kết quả như thế nào

---

## 💻 Code Examples

### Example 1: Lấy Tất Cả Attempts (Có Phân Trang)

```javascript
import { quizAttemptService } from "@utils/quizAttemptService";
import { useState, useEffect } from "react";

function AllAttemptsWithPaging() {
  const [attempts, setAttempts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0
  });

  const fetchAttempts = async (page = 0) => {
    try {
      const response = await quizAttemptService.getPagingAttempts({
        page,
        size: 10,
        sort: "startTime,desc"
      });

      const data = response.data;
      setAttempts(data.content || []);
      setPagination({
        page: data.number,
        size: data.size,
        totalPages: data.totalPages
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

  const nextPage = () => {
    if (pagination.page < pagination.totalPages - 1) {
      fetchAttempts(pagination.page + 1);
    }
  };

  const prevPage = () => {
    if (pagination.page > 0) {
      fetchAttempts(pagination.page - 1);
    }
  };

  return (
    <div>
      <h2>All Quiz Attempts</h2>
      {attempts.map(attempt => (
        <div key={attempt.attemptId}>
          {attempt.quizTitle} - Score: {attempt.score}%
        </div>
      ))}
      <button onClick={prevPage} disabled={pagination.page === 0}>
        Previous
      </button>
      <span>Page {pagination.page + 1} of {pagination.totalPages}</span>
      <button onClick={nextPage} disabled={pagination.page >= pagination.totalPages - 1}>
        Next
      </button>
    </div>
  );
}
```

---

### Example 2: Lấy Attempts Của Một Quiz

```javascript
function QuizAttempts({ quizId }) {
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    fetchQuizAttempts();
  }, [quizId]);

  const fetchQuizAttempts = async () => {
    try {
      const response = await quizAttemptService.getAttemptsByQuiz(quizId);
      setAttempts(response.data || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h3>Quiz Attempts ({attempts.length})</h3>
      {attempts.map(attempt => (
        <div key={attempt.attemptId}>
          User #{attempt.userId}: {attempt.score}% - 
          {attempt.passed ? "✅ Passed" : "❌ Failed"}
        </div>
      ))}
    </div>
  );
}
```

---

### Example 3: Lấy Attempts Của Một User

```javascript
function UserAttempts({ userId }) {
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    fetchUserAttempts();
  }, [userId]);

  const fetchUserAttempts = async () => {
    try {
      const response = await quizAttemptService.getAttemptsByUser(userId);
      setAttempts(response.data || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Tính toán thống kê
  const stats = {
    total: attempts.length,
    passed: attempts.filter(a => a.passed).length,
    averageScore: attempts.length > 0
      ? (attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length).toFixed(2)
      : 0
  };

  return (
    <div>
      <h3>User #{userId} Quiz History</h3>
      <p>Total attempts: {stats.total}</p>
      <p>Passed: {stats.passed}</p>
      <p>Average score: {stats.averageScore}%</p>
      
      {attempts.map(attempt => (
        <div key={attempt.attemptId}>
          {attempt.quizTitle}: {attempt.score}%
        </div>
      ))}
    </div>
  );
}
```

---

### Example 4: Lấy Attempts Của User Trong Một Quiz

```javascript
function UserQuizHistory({ userId, quizId }) {
  const [attempts, setAttempts] = useState([]);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    fetchUserQuizAttempts();
  }, [userId, quizId]);

  const fetchUserQuizAttempts = async () => {
    try {
      const response = await quizAttemptService.getAttemptsByUserAndQuiz(
        userId, 
        quizId
      );
      
      const data = response.data || [];
      setAttempts(data);
      
      // Tìm điểm cao nhất
      if (data.length > 0) {
        const max = Math.max(...data.map(a => a.score));
        setBestScore(max);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h3>User's Attempts for This Quiz</h3>
      <p>Total attempts: {attempts.length}</p>
      <p>Best score: {bestScore}%</p>
      
      <table>
        <thead>
          <tr>
            <th>Attempt #</th>
            <th>Score</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((attempt, idx) => (
            <tr key={attempt.attemptId}>
              <td>{idx + 1}</td>
              <td>{attempt.score}%</td>
              <td>{new Date(attempt.startTime).toLocaleDateString()}</td>
              <td>{attempt.passed ? "✅" : "❌"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🧪 Test Trong Browser Console

```javascript
// Test 1: Lấy tất cả (có phân trang)
const paging = await quizAttemptService.getPagingAttempts({
  page: 0,
  size: 20
});
console.log("📄 Paging:", paging.data);

// Test 2: Lấy tất cả (không phân trang)
const all = await quizAttemptService.getAllAttempts();
console.log("📋 All:", all.data);

// Test 3: Lấy chi tiết
const detail = await quizAttemptService.getAttemptDetail(123);
console.log("🔍 Detail:", detail.data);

// Test 4: Lấy theo quiz
const byQuiz = await quizAttemptService.getAttemptsByQuiz(10);
console.log("📝 By Quiz:", byQuiz.data);

// Test 5: Lấy theo user
const byUser = await quizAttemptService.getAttemptsByUser(1001);
console.log("👤 By User:", byUser.data);

// Test 6: Lấy theo user + quiz
const byUserQuiz = await quizAttemptService.getAttemptsByUserAndQuiz(1001, 10);
console.log("🎯 By User & Quiz:", byUserQuiz.data);
```

---

## 📊 Response Data Structure

```javascript
{
  "attemptId": 123,
  "quizId": 10,
  "quizTitle": "Kiểm tra kiến thức Java Core",
  "userId": 1001,
  "startTime": "2025-12-24T16:11:29.988Z",
  "endTime": "2025-12-24T16:11:29.988Z",
  "score": 85,                    // Điểm số (0-100)
  "correctCount": 17,             // Số câu đúng
  "totalCount": 20,               // Tổng số câu
  "passed": true,                 // Đạt hay không
  "status": "COMPLETED",          // Trạng thái
  "attemptNumber": 1,             // Lần thử thứ mấy
  "timeSpentSeconds": 1200,       // Thời gian (giây)
  "createdAt": "2025-12-24T16:11:29.988Z"
}
```

---

## 📁 Service Methods Đã Có

```javascript
import { quizAttemptService } from "@utils/quizAttemptService";

// GET Endpoints
quizAttemptService.getAllAttempts(params)              // GET /api/v1/quiz-attempts
quizAttemptService.getPagingAttempts(params)           // GET /api/v1/quiz-attempts/paging ⭐
quizAttemptService.getAttemptDetail(attemptId)         // GET /api/v1/quiz-attempts/{id}
quizAttemptService.getAttemptsByQuiz(quizId)           // GET /api/v1/quiz-attempts/by-quiz/{quizId}
quizAttemptService.getAttemptsByUser(userId)           // GET /api/v1/quiz-attempts/by-user/{userId}
quizAttemptService.getAttemptsByUserAndQuiz(userId, quizId)  // GET by user & quiz

// POST Endpoints
quizAttemptService.startAttempt(payload)               // POST /api/v1/quiz-attempts/start
quizAttemptService.submitAttempt(attemptId, payload)   // POST /api/v1/quiz-attempts/{id}/submit
quizAttemptService.uploadAttachment(attemptId, file)   // POST attachment
```

---

## 🎨 Demo Page

**URL:** http://localhost:5173/admin/quiz-attempts-demo

Features:
- ✅ List view tất cả quiz attempts
- ✅ Statistics dashboard (Total, Passed, Failed, Avg Score)
- ✅ Click để xem chi tiết attempt
- ✅ Full API documentation
- ✅ Real-time data

---

## 📋 So Sánh Các Endpoints

| Endpoint | Mục Đích | Use Case |
|----------|----------|----------|
| `/quiz-attempts` | Lấy TẤT CẢ | Admin xem tổng quan |
| `/quiz-attempts/paging` | Lấy TẤT CẢ có phân trang | Admin xem với pagination |
| `/quiz-attempts/{id}` | Chi tiết 1 attempt | Xem kết quả cụ thể |
| `/by-quiz/{quizId}` | Theo quiz | Xem ai làm quiz này |
| `/by-user/{userId}` | Theo user | Lịch sử của user |
| `/by-user/{userId}/quiz/{quizId}` | User + Quiz | User làm quiz này bao nhiêu lần |

---

## ✅ Checklist

- [x] Service methods đã có đủ 6 endpoints
- [x] Demo component hoàn chỉnh
- [x] Route đã được thêm
- [x] Documentation đầy đủ
- [x] Code examples chi tiết
- [x] Test scripts sẵn sàng

---

## 🎯 Kết Luận

**TẤT CẢ 6 ENDPOINTS ĐÃ SẴN SÀNG!** 🎉

Bạn có thể:
1. ✅ Gọi API trong components
2. ✅ Test trong browser console
3. ✅ Xem demo tại `/admin/quiz-attempts-demo`
4. ✅ Đọc docs trong `QUIZ_ATTEMPTS_API_GUIDE.md`

**Happy Coding!** 🚀

---

**Created:** 2025-12-24  
**By:** Antigravity AI - Google Deepmind
