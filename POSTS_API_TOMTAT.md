# ✅ Posts API - Tóm Tắt Hướng Dẫn

## 🎯 API Đã Được Tích Hợp Sẵn

API **GET /api/v1/posts** đã được tích hợp sẵn trong dự án của bạn!

---

## 📁 Các File Quan Trọng

### 1. **Service File** (Đã có sẵn)
📍 `src/shared/utils/postService.js`

```javascript
import { postService } from "@utils/postService";

// Các method có sẵn:
postService.getPosts(params)           // Lấy bài viết PUBLISHED
postService.getDrafts(params)          // Lấy bài viết DRAFT
postService.getPostById(id)            // Lấy chi tiết bài viết
postService.createPost(payload)        // Tạo bài viết mới
postService.updatePost(id, payload)    // Cập nhật bài viết
postService.deletePost(id)             // Xóa bài viết
```

### 2. **Components Đã Có**
✅ `src/features/Admin/PostManagement/PostManagement.jsx` - Quản lý bài viết
✅ `src/features/Admin/PostManagement/PostCreate.jsx` - Tạo bài viết
✅ `src/features/Admin/PostManagement/PostEdit.jsx` - Sửa bài viết
🆕 `src/features/Admin/PostManagement/PostsAPIExample.jsx` - **Demo API**

### 3. **Documentation**
📖 `POSTS_API_GUIDE.md` - Hướng dẫn chi tiết
🧪 `src/shared/utils/postsApiTest.js` - Test functions

---

## 🚀 Cách Sử Dụng Ngay

### Cách 1: Xem Component Có Sẵn
Truy cập: **http://localhost:5173/admin/posts**

Component `PostManagement.jsx` đã sử dụng API này và hiển thị:
- ✅ Danh sách tất cả bài viết
- ✅ Tìm kiếm và lọc
- ✅ Thống kê (Tổng, Published, Draft, Mới)
- ✅ Chỉnh sửa và xóa

### Cách 2: Xem Demo API
Truy cập: **http://localhost:5173/admin/posts/api-example**

Component mới `PostsAPIExample.jsx` hiển thị:
- ✅ Cách gọi API với pagination
- ✅ Chuyển trang (Next/Previous)
- ✅ Chọn số lượng bài viết mỗi trang (5, 10, 20, 50)
- ✅ Sắp xếp (Newest/Oldest/Title A-Z/Z-A)
- ✅ Load Published posts và Draft posts
- ✅ Code examples và documentation

---

## 💻 Code Example - Copy & Paste

### Lấy Danh Sách Bài Viết Published

```javascript
import { useState, useEffect } from "react";
import { postService } from "@utils/postService";

export default function MyComponent() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await postService.getPosts({
        page: 0,           // Trang đầu tiên
        size: 10,          // 10 bài viết mỗi trang
        sort: "createdAt,desc"  // Mới nhất trước
      });

      const data = response?.data;
      setPosts(data?.content || []);
      
      console.log("Total posts:", data?.totalElements);
      console.log("Total pages:", data?.totalPages);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {posts.map(post => (
            <div key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <small>By: {post.author?.fullName}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 📊 Response Structure

```javascript
{
  totalElements: 25,      // Tổng số bài viết
  totalPages: 3,          // Tổng số trang
  size: 10,               // Kích thước mỗi trang
  number: 0,              // Trang hiện tại (0-indexed)
  first: true,            // Có phải trang đầu?
  last: false,            // Có phải trang cuối?
  
  content: [              // Array các bài viết
    {
      id: 1,
      title: "Học React cơ bản",
      slug: "hoc-react-co-ban",
      content: "Nội dung bài viết...",
      author: {
        id: 1,
        fullName: "Nguyễn Văn A"
      },
      status: "PUBLISHED",  // hoặc "DRAFT"
      createdAt: "2025-12-24T15:31:33.118Z",
      tags: ["React", "JavaScript"]
    },
    // ... more posts
  ]
}
```

---

## 🎨 Tính Năng Pagination

```javascript
const [pagination, setPagination] = useState({
  page: 0,
  size: 10,
  totalPages: 0
});

// Trang tiếp theo
const nextPage = () => {
  if (pagination.page < pagination.totalPages - 1) {
    fetchPosts(pagination.page + 1, pagination.size);
  }
};

// Trang trước
const prevPage = () => {
  if (pagination.page > 0) {
    fetchPosts(pagination.page - 1, pagination.size);
  }
};
```

---

## 🔧 Test API Trong Console

Mở browser console và chạy:

```javascript
// Copy file postsApiTest.js vào console, sau đó:

// Test lấy published posts
await testGetPublishedPosts();

// Test lấy drafts
await testGetDrafts();

// Test lấy post theo ID
await testGetPostById(1);

// Chạy tất cả tests
await runAllTests();
```

---

## 📋 Checklist

✅ Service file đã có sẵn (`postService.js`)
✅ Component quản lý bài viết đã có sẵn (`PostManagement.jsx`)
✅ API đã được gọi trong component hiện tại
✅ Component demo mới được tạo (`PostsAPIExample.jsx`)
✅ Route cho demo đã được thêm (`/admin/posts/api-example`)
✅ Documentation đầy đủ (`POSTS_API_GUIDE.md`)
✅ Test functions (`postsApiTest.js`)

---

## 🎯 Next Steps

1. **Xem demo ngay:**
   - Vào http://localhost:5173/admin/posts/api-example

2. **Đọc documentation:**
   - Mở file `POSTS_API_GUIDE.md`

3. **Tùy chỉnh:**
   - Copy code từ `PostsAPIExample.jsx`
   - Sửa theo nhu cầu của bạn

4. **Test API:**
   - Mở browser console
   - Chạy các functions trong `postsApiTest.js`

---

## 💡 Support

Nếu bạn cần:
- Thêm tính năng mới
- Sửa lỗi
- Giải thích chi tiết hơn

Hãy cho tôi biết! 😊

---

**Được tạo bởi Antigravity AI - Google Deepmind**
📅 2025-12-24
