# Posts API - Usage Guide

## 📚 Overview
This document explains how to use the Posts API endpoints in your React application.

## 🎯 Available API Endpoints

### 1. GET /api/v1/posts
**Description:** Lấy danh sách bài viết đã xuất bản (PUBLISHED), có phân trang

**Parameters:**
- `page` (integer, optional): Trang bắt đầu từ 0. Default: 0
- `size` (integer, optional): Kích thước trang. Default: 10
- `sort` (string, optional): Sắp xếp. Default: "createdAt,desc"
  - Examples: "createdAt,desc", "createdAt,asc", "title,asc", "title,desc"

**Response Structure:**
```javascript
{
  totalElements: 0,      // Tổng số bài viết
  totalPages: 0,         // Tổng số trang
  size: 0,               // Kích thước trang
  content: [             // Mảng bài viết
    {
      id: 0,
      title: "string",
      slug: "string",
      content: "string",
      author: {
        id: 0,
        fullName: "string"
      },
      status: "string",  // PUBLISHED hoặc DRAFT
      createdAt: "2025-12-24T15:31:33.118Z",
      tags: ["string"]
    }
  ],
  number: 0,            // Trang hiện tại
  sort: {
    empty: true,
    sorted: true,
    unsorted: true
  },
  first: true,          // Có phải trang đầu tiên?
  last: true,           // Có phải trang cuối cùng?
  pageable: { ... },
  numberOfElements: 0,  // Số phần tử trong trang hiện tại
  empty: true
}
```

### 2. GET /api/v1/posts/drafts
**Description:** Lấy danh sách bài viết bản nháp (DRAFT)

**Parameters:** Same as above
- `page` (integer, optional): Default: 0
- `size` (integer, optional): Default: 10
- `sort` (string, optional): Default: "createdAt,desc"

**Response:** Same structure as GET /api/v1/posts

### 3. GET /api/v1/posts/{id}
**Description:** Lấy chi tiết một bài viết

**Parameters:**
- `id` (path parameter): ID của bài viết

### 4. POST /api/v1/posts
**Description:** Tạo bài viết mới

**Request Body:**
```javascript
{
  title: "string",
  slug: "string",
  content: "string",
  authorId: 0,
  tagNames: ["string"],
  status: "PUBLISHED" // or "DRAFT"
}
```

### 5. PUT /api/v1/posts/{id}
**Description:** Cập nhật bài viết

**Parameters:**
- `id` (path parameter): ID của bài viết

**Request Body:** Same as POST

### 6. DELETE /api/v1/posts/{id}
**Description:** Xóa bài viết

**Parameters:**
- `id` (path parameter): ID của bài viết

---

## 💻 Usage in React Components

### Basic Example - Get Published Posts

```javascript
import { postService } from "@utils/postService";

// In your component
const [posts, setPosts] = useState([]);
const [loading, setLoading] = useState(false);

const fetchPosts = async () => {
  setLoading(true);
  try {
    const response = await postService.getPosts({
      page: 0,
      size: 10,
      sort: "createdAt,desc"
    });
    
    // Handle response structure
    const data = response?.data;
    const content = data?.content || [];
    
    setPosts(content);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchPosts();
}, []);
```

### Example with Pagination

```javascript
const [pagination, setPagination] = useState({
  page: 0,
  size: 10,
  sort: "createdAt,desc",
  totalPages: 0,
  totalElements: 0
});

const fetchPosts = async (page = 0, size = 10, sort = "createdAt,desc") => {
  try {
    const response = await postService.getPosts({ page, size, sort });
    const data = response?.data;
    
    setPosts(data?.content || []);
    setPagination({
      page: data?.number || 0,
      size: data?.size || 10,
      sort: sort,
      totalPages: data?.totalPages || 0,
      totalElements: data?.totalElements || 0
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

// Navigation handlers
const handleNextPage = () => {
  if (pagination.page < pagination.totalPages - 1) {
    fetchPosts(pagination.page + 1, pagination.size, pagination.sort);
  }
};

const handlePrevPage = () => {
  if (pagination.page > 0) {
    fetchPosts(pagination.page - 1, pagination.size, pagination.sort);
  }
};
```

### Get Draft Posts

```javascript
const fetchDrafts = async () => {
  try {
    const response = await postService.getDrafts({
      page: 0,
      size: 10,
      sort: "createdAt,desc"
    });
    
    const data = response?.data;
    setDrafts(data?.content || []);
  } catch (error) {
    console.error("Error fetching drafts:", error);
  }
};
```

### Get Post by ID

```javascript
const fetchPostById = async (postId) => {
  try {
    const response = await postService.getPostById(postId);
    setPost(response?.data);
  } catch (error) {
    console.error("Error fetching post:", error);
  }
};
```

### Create New Post

```javascript
const createPost = async (postData) => {
  try {
    const response = await postService.createPost({
      title: "My New Post",
      slug: "my-new-post",
      content: "Post content here...",
      authorId: 1,
      tagNames: ["React", "JavaScript"],
      status: "PUBLISHED" // or "DRAFT"
    });
    
    console.log("Post created:", response.data);
    // Refresh posts list
    fetchPosts();
  } catch (error) {
    console.error("Error creating post:", error);
  }
};
```

### Update Post

```javascript
const updatePost = async (postId, updatedData) => {
  try {
    const response = await postService.updatePost(postId, {
      title: "Updated Title",
      slug: "updated-slug",
      content: "Updated content...",
      authorId: 1,
      tagNames: ["React", "Updated"],
      status: "PUBLISHED"
    });
    
    console.log("Post updated:", response.data);
    fetchPosts();
  } catch (error) {
    console.error("Error updating post:", error);
  }
};
```

### Delete Post

```javascript
const deletePost = async (postId) => {
  try {
    await postService.deletePost(postId);
    console.log("Post deleted successfully");
    // Refresh posts list
    fetchPosts();
  } catch (error) {
    console.error("Error deleting post:", error);
  }
};
```

---

## 🔍 Complete Working Example

See the file: `src/features/Admin/PostManagement/PostsAPIExample.jsx`

This file contains a fully working example with:
- ✅ Fetching published posts with pagination
- ✅ Fetching draft posts
- ✅ Pagination controls (next/previous page)
- ✅ Page size selection (5, 10, 20, 50 per page)
- ✅ Sort options (newest/oldest/title)
- ✅ Displaying post cards with all data
- ✅ Loading and empty states

---

## 📁 Service File Location

The Posts service is located at:
```
src/shared/utils/postService.js
```

All API methods are defined in this file and ready to use.

---

## 🎨 Existing Components

The following components already use the Posts API:

1. **PostManagement.jsx** (`src/features/Admin/PostManagement/PostManagement.jsx`)
   - Lists all posts with filtering and search
   - Includes edit and delete functionality
   - Shows statistics (total, published, drafts, recent)

2. **PostCreate.jsx** (`src/features/Admin/PostManagement/PostCreate.jsx`)
   - Form to create new posts

3. **PostEdit.jsx** (`src/features/Admin/PostManagement/PostEdit.jsx`)
   - Form to edit existing posts

---

## 🚀 Quick Start

To test the Posts API in your browser:

1. Navigate to: `http://localhost:5173/admin/posts`
   - This shows the existing PostManagement component
   
2. Or create a test route for the example component:
   ```javascript
   // Add to AppRouter.jsx
   <Route path="posts/example" element={<PostsAPIExample />} />
   ```
   Then visit: `http://localhost:5173/admin/posts/example`

---

## ⚠️ Important Notes

1. **Response Structure Variations**: The API response might be nested differently depending on your backend setup. Always check:
   ```javascript
   const content = response?.data?.content || 
                   response?.data?.data?.content || 
                   response?.data || [];
   ```

2. **Error Handling**: Always wrap API calls in try-catch blocks

3. **Loading States**: Show loading indicators while fetching data

4. **Authentication**: Make sure the user is authenticated (API calls use the configured axios instance with auth headers)

---

## 📞 Available Methods in postService

```javascript
import { postService } from "@utils/postService";

// All available methods:
postService.getPosts(params)           // GET /api/v1/posts
postService.getDrafts(params)          // GET /api/v1/posts/drafts
postService.getPostById(id)            // GET /api/v1/posts/{id}
postService.createPost(payload)        // POST /api/v1/posts
postService.updatePost(id, payload)    // PUT /api/v1/posts/{id}
postService.deletePost(id)             // DELETE /api/v1/posts/{id}
```

All methods return a Promise with the axios response object.
