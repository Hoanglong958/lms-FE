/**
 * 🚀 Script Tạo Sample Posts
 * 
 * Copy toàn bộ script này vào Browser Console (F12)
 * và chạy: await createSamplePosts()
 * 
 * Yêu cầu: Phải đăng nhập với tài khoản ADMIN
 */

import { postService } from "@utils/postService";

async function createSamplePosts() {
    console.log("🚀 Bắt đầu tạo sample posts...\n");

    const samplePosts = [
        {
            title: "Hướng dẫn học React từ cơ bản đến nâng cao",
            slug: "huong-dan-hoc-react-co-ban-nang-cao",
            content: `# Hướng dẫn học React từ cơ bản đến nâng cao

React là một thư viện JavaScript mạnh mẽ để xây dựng giao diện người dùng. Trong bài viết này, chúng ta sẽ cùng tìm hiểu React từ những kiến thức cơ bản nhất.

## 1. React là gì?

React là một thư viện JavaScript mã nguồn mở được phát triển bởi Facebook. React giúp developers xây dựng giao diện người dùng một cách dễ dàng và hiệu quả.

### Ưu điểm của React:
- **Component-based**: Xây dựng UI từ các component độc lập
- **Virtual DOM**: Tăng hiệu suất rendering
- **Declarative**: Code dễ đọc và maintain
- **Large ecosystem**: Nhiều thư viện hỗ trợ

## 2. Cài đặt React

\`\`\`bash
npx create-react-app my-app
cd my-app
npm start
\`\`\`

## 3. Component cơ bản

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
\`\`\`

## 4. Hooks

React Hooks cho phép bạn sử dụng state và các tính năng khác mà không cần viết class.

\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
\`\`\`

## Kết luận

React là một công cụ tuyệt vời để xây dựng UI. Hãy bắt đầu học ngay hôm nay!`,
            authorId: 1,
            tagNames: ["React", "JavaScript", "Tutorial", "Frontend"],
            status: "PUBLISHED"
        },
        {
            title: "10 Mẹo JavaScript hữu ích cho Developer",
            slug: "10-meo-javascript-huu-ich",
            content: `# 10 Mẹo JavaScript hữu ích cho Developer

JavaScript là ngôn ngữ lập trình phổ biến nhất hiện nay. Dưới đây là 10 mẹo giúp bạn code JavaScript hiệu quả hơn!

## 1. Destructuring Assignment

\`\`\`javascript
const user = { name: 'John', age: 30 };
const { name, age } = user;
console.log(name, age); // John 30
\`\`\`

## 2. Spread Operator

\`\`\`javascript
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];
console.log(arr2); // [1, 2, 3, 4, 5]
\`\`\`

## 3. Template Literals

\`\`\`javascript
const name = 'Alice';
const greeting = \`Hello, \${name}!\`;
\`\`\`

## 4. Arrow Functions

\`\`\`javascript
const add = (a, b) => a + b;
\`\`\`

## 5. Optional Chaining

\`\`\`javascript
const user = { profile: { name: 'Bob' } };
console.log(user?.profile?.name); // Bob
\`\`\`

Và còn 5 mẹo nữa đang chờ bạn khám phá!`,
            authorId: 1,
            tagNames: ["JavaScript", "Tips", "Programming"],
            status: "PUBLISHED"
        },
        {
            title: "Tailwind CSS - Framework CSS hiện đại",
            slug: "tailwind-css-framework-hien-dai",
            content: `# Tailwind CSS - Framework CSS hiện đại

Tailwind CSS là một utility-first CSS framework giúp bạn xây dựng giao diện nhanh chóng.

## Tại sao nên dùng Tailwind?

- ⚡ **Nhanh**: Không cần viết CSS custom
- 🎨 **Linh hoạt**: Tùy chỉnh dễ dàng
- 📦 **Nhỏ gọn**: Chỉ build ra code cần dùng
- 🔧 **Tiện lợi**: Utilities sẵn có

## Cài đặt

\`\`\`bash
npm install -D tailwindcss
npx tailwindcss init
\`\`\`

## Ví dụ

\`\`\`html
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Click me
</button>
\`\`\`

Tailwind sẽ giúp bạn viết CSS nhanh hơn gấp nhiều lần!`,
            authorId: 1,
            tagNames: ["CSS", "Tailwind", "Frontend"],
            status: "PUBLISHED"
        },
        {
            title: "Spring Boot REST API - Hướng dẫn chi tiết",
            slug: "spring-boot-rest-api",
            content: `# Spring Boot REST API - Hướng dẫn chi tiết

Spring Boot giúp tạo REST API một cách đơn giản và nhanh chóng.

## Tạo Controller

\`\`\`java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @GetMapping
    public List<User> getAllUsers() {
        return userService.findAll();
    }
    
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.save(user);
    }
}
\`\`\`

## Exception Handling

\`\`\`java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleNotFound(Exception ex) {
        return ResponseEntity.notFound().build();
    }
}
\`\`\`

Spring Boot làm việc với REST API trở nên dễ dàng!`,
            authorId: 1,
            tagNames: ["Java", "Spring Boot", "Backend", "REST API"],
            status: "PUBLISHED"
        },
        {
            title: "Git Commands - Cheat Sheet cho Developer",
            slug: "git-commands-cheat-sheet",
            content: `# Git Commands - Cheat Sheet

Tổng hợp các lệnh Git thường dùng nhất.

## Basic Commands

\`\`\`bash
git init
git clone <url>
git add .
git commit -m "message"
git push origin main
\`\`\`

## Branching

\`\`\`bash
git branch <branch-name>
git checkout <branch-name>
git merge <branch-name>
git branch -d <branch-name>
\`\`\`

## Undoing Changes

\`\`\`bash
git reset HEAD~1
git revert <commit-hash>
git checkout -- <file>
\`\`\`

## Stashing

\`\`\`bash
git stash
git stash pop
git stash list
\`\`\`

Lưu lại để dùng khi cần!`,
            authorId: 1,
            tagNames: ["Git", "Tools", "DevOps"],
            status: "PUBLISHED"
        }
    ];

    let successCount = 0;
    let failedCount = 0;

    for (const post of samplePosts) {
        try {
            const response = await postService.createPost(post);
            console.log(`✅ Created: "${post.title}" (ID: ${response.data.id})`);
            successCount++;

            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
            console.error(`❌ Failed to create: "${post.title}"`, error.response?.data || error.message);
            failedCount++;
        }
    }

    console.log("\n" + "=".repeat(60));
    console.log(`✅ Success: ${successCount}/${samplePosts.length}`);
    console.log(`❌ Failed: ${failedCount}/${samplePosts.length}`);
    console.log("=".repeat(60));

    if (successCount > 0) {
        console.log("\n🎉 Hoàn thành! Refresh trang /bai-viet để xem bài viết mới!");
    }
}

// Auto export for use in console
window.createSamplePosts = createSamplePosts;

console.log(`
╔════════════════════════════════════════════════════════════════╗
║          📝 Sample Posts Creator                               ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║ Để tạo 5 bài viết mẫu, chạy lệnh:                             ║
║   await createSamplePosts()                                    ║
║                                                                ║
║ Hoặc mở: http://localhost:5173/admin/posts/api-example        ║
║ và click nút "✨ Create 3 Sample Posts"                       ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

export { createSamplePosts };
