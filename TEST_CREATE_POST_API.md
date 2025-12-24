# ✅ HƯỚNG DẪN TEST POST /api/v1/posts API

## 🎯 Tổng Quan

API **POST /api/v1/posts** đã được tích hợp với 2 cách test:

1. ✅ **UI Buttons** - Click button để test trên giao diện
2. ✅ **Console Script** - Chạy script trong Browser Console

---

## 🚀 Cách 1: Test Bằng UI (Đơn Giản Nhất)

### Bước 1: Mở trang demo
Truy cập: **http://localhost:5173/admin/posts/api-example**

### Bước 2: Click Button
Bạn sẽ thấy 2 buttons màu xanh:

1. **➕ Create Test Post (POST API)** (Màu xanh lá)
   - Tạo 1 bài viết test với timestamp
   - Tự động refresh danh sách sau khi tạo

2. **✨ Create 3 Sample Posts** (Màu xanh dương)
   - Tạo 3 bài viết mẫu (2 published + 1 draft)
   - Có nội dung tiếng Việt đầy đủ

### Bước 3: Xem kết quả
- Sau khi click, sẽ có alert thông báo thành công
- Danh sách bài viết tự động refresh
- Xem console (F12) để thấy chi tiết response

### Lưu ý:
- ⚠️ Phải đăng nhập với tài khoản ADMIN
- ⚠️ `authorId` mặc định là 1, có thể cần thay đổi

---

## 🧪 Cách 2: Test Bằng Browser Console

### Bước 1: Copy script
Mở file: `test-create-post.js` và copy toàn bộ nội dung

### Bước 2: Mở Console
- Nhấn **F12** để mở DevTools
- Chuyển sang tab **Console**

### Bước 3: Paste và Enter
Paste toàn bộ script vào console và nhấn Enter

### Bước 4: Chạy các functions

```javascript
// Tạo 1 bài viết published
await createPublishedPost()

// Tạo 1 bài viết draft
await createDraftPost()

// Tạo 3 bài viết mẫu
await createSamplePosts()

// Tạo post với image
await createPostWithImage()
```

---

## 📝 Code Example - Sử Dụng Trong Component

```javascript
import { postService } from "@utils/postService";

// Tạo bài viết mới
const createPost = async () => {
  try {
    const response = await postService.createPost({
      title: "Tiêu đề bài viết",
      slug: "tieu-de-bai-viet",
      content: "Nội dung bài viết...",
      authorId: 1,  // ID của tác giả
      tagNames: ["React", "JavaScript"],
      status: "PUBLISHED"  // hoặc "DRAFT"
    });

    console.log("✅ Created:", response.data);
    // Response (201):
    // {
    //   id: 1,
    //   title: "...",
    //   slug: "...",
    //   createdAt: "2025-12-24T...",
    //   author: { id: 1, fullName: "..." },
    //   tags: ["React", "JavaScript"],
    //   status: "PUBLISHED"
    // }
    
  } catch (error) {
    console.error("❌ Error:", error.response?.data);
  }
};
```

---

## 📊 Request Body Format

```json
{
  "title": "string",           ← Bắt buộc
  "slug": "string",             ← Bắt buộc, unique
  "content": "string",          ← Bắt buộc
  "authorId": 0,                ← Bắt buộc (integer)
  "tagNames": ["string"],       ← Optional (array)
  "status": "string"            ← PUBLISHED hoặc DRAFT
}
```

### Ví dụ:

```json
{
  "title": "Học React cơ bản",
  "slug": "hoc-react-co-ban",
  "content": "React là thư viện JavaScript...",
  "authorId": 1,
  "tagNames": ["React", "JavaScript", "Tutorial"],
  "status": "PUBLISHED"
}
```

---

## ✅ Response Success (201 Created)

```json
{
  "id": 1,
  "title": "Học React cơ bản",
  "slug": "hoc-react-co-ban",
  "imageUrl": "https://example.com/image.jpg",
  "content": "React là thư viện JavaScript...",
  "status": "PUBLISHED",
  "createdAt": "2025-12-24T15:00:00",
  "author": {
    "id": 1,
    "fullName": "Nguyen Van A"
  },
  "tags": ["React", "JavaScript", "Tutorial"]
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "message": "Validation failed",
  "errors": {
    "title": "Title is required",
    "slug": "Slug already exists"
  }
}
```

### 403 Forbidden
```json
{
  "message": "Access denied. Admin role required."
}
```

---

## 🎯 Test Checklist

- [ ] Mở trang http://localhost:5173/admin/posts/api-example
- [ ] Click button "Create Test Post" để tạo 1 bài test
- [ ] Xem alert xác nhận thành công
- [ ] Kiểm tra bài viết mới xuất hiện trong danh sách
- [ ] Click button "Create 3 Sample Posts"
- [ ] Xác nhận có 3 bài viết mới
- [ ] Mở console (F12) xem response chi tiết
- [ ] Test tạo bài DRAFT
- [ ] Test với tags khác nhau

---

## 🔍 Debug Tips

### 1. Nếu gặp lỗi 403 (Forbidden)
```javascript
// Kiểm tra token
console.log(localStorage.getItem('token'));

// Kiểm tra user role
console.log(JSON.parse(localStorage.getItem('user')));
```

### 2. Nếu gặp lỗi 400 (Bad Request)
- Kiểm tra `slug` không bị duplicate
- Kiểm tra `authorId` tồn tại trong database
- Kiểm tra tất cả fields bắt buộc

### 3. Xem Network Request
- Mở DevTools → Tab Network
- Filter: "posts"
- Click button tạo post
- Click vào request để xem:
  - Request Headers
  - Request Payload
  - Response

---

## 📄 Files Liên Quan

| File | Mô Tả |
|------|-------|
| `postService.js` | Service chứa `createPost()` method |
| `PostsAPIExample.jsx` | Component demo với buttons |
| `test-create-post.js` | Script test cho console |
| `PostCreate.jsx` | Form tạo bài viết hoàn chỉnh |
| `POSTS_API_GUIDE.md` | Documentation đầy đủ |

---

## 🎨 UI Locations

1. **Demo Page:**
   - URL: http://localhost:5173/admin/posts/api-example
   - Có buttons để test nhanh

2. **Production Form:**
   - URL: http://localhost:5173/admin/posts/create
   - Form đầy đủ để tạo bài viết thực

3. **Management Page:**
   - URL: http://localhost:5173/admin/posts
   - Xem tất cả bài viết đã tạo

---

## 💡 Tips

1. **Slug Generation:**
   ```javascript
   const generateSlug = (title) => {
     return title
       .toLowerCase()
       .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
       .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
       .replace(/[đ]/g, 'd')
       .replace(/\s+/g, '-')
       .replace(/[^\w-]+/g, '');
   };
   ```

2. **Get Current User ID:**
   ```javascript
   const user = JSON.parse(localStorage.getItem('user'));
   const authorId = user?.id || 1;
   ```

3. **Test với Markdown:**
   ```javascript
   const content = `
   # Heading 1
   ## Heading 2
   
   **Bold text**
   *Italic text*
   
   - List item 1
   - List item 2
   
   \`\`\`javascript
   const hello = "world";
   \`\`\`
   `;
   ```

---

## ✅ Kết Luận

POST API đã sẵn sàng! Bạn có thể:

1. ✅ Test ngay bằng UI buttons
2. ✅ Test bằng console scripts  
3. ✅ Sử dụng trong components
4. ✅ Xem full documentation

**Happy Coding!** 🚀
