/**
 * Test Script - POST /api/v1/posts
 * Tạo bài viết mới
 * 
 * Copy toàn bộ script này vào Browser Console để test
 */

// Test 1: Tạo bài viết PUBLISHED
async function createPublishedPost() {
    const newPost = {
        title: "Hướng dẫn học React từ cơ bản đến nâng cao",
        slug: "huong-dan-hoc-react-co-ban-nang-cao",
        content: `
# Giới thiệu về React

React là một thư viện JavaScript phổ biến để xây dựng giao diện người dùng.

## Các khái niệm cơ bản

1. **Components**: Các thành phần có thể tái sử dụng
2. **Props**: Dữ liệu truyền vào component
3. **State**: Trạng thái nội bộ của component
4. **Hooks**: useState, useEffect, useContext...

## Ví dụ về Component

\`\`\`javascript
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}
\`\`\`

Hãy bắt đầu học React ngay hôm nay!
    `.trim(),
        authorId: 1,  // Thay bằng ID của bạn
        tagNames: ["React", "JavaScript", "Frontend", "Tutorial"],
        status: "PUBLISHED"
    };

    try {
        console.log('🚀 Creating published post...');

        const response = await fetch('/api/v1/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(newPost)
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('❌ Error:', error);
            return;
        }

        const data = await response.json();
        console.log('✅ Post created successfully!');
        console.log('📄 Post details:', data);
        console.log(`📌 ID: ${data.id}`);
        console.log(`📝 Title: ${data.title}`);
        console.log(`🔗 Slug: ${data.slug}`);
        console.log(`✨ Status: ${data.status}`);
        console.log(`👤 Author: ${data.author?.fullName}`);
        console.log(`🏷️ Tags:`, data.tags);

        return data;
    } catch (error) {
        console.error('❌ Failed to create post:', error);
    }
}

// Test 2: Tạo bài viết DRAFT
async function createDraftPost() {
    const draftPost = {
        title: "Vue.js vs React - So sánh chi tiết",
        slug: "vuejs-vs-react-so-sanh-chi-tiet",
        content: `
# Vue.js vs React

Bài viết này so sánh hai framework phổ biến nhất hiện nay.

## Vue.js
- Dễ học
- Template syntax quen thuộc
- Hệ sinh thái tốt

## React
- Component-based
- Cộng đồng lớn
- Hỗ trợ tốt từ Facebook

*Bài viết đang trong quá trình hoàn thiện...*
    `.trim(),
        authorId: 1,
        tagNames: ["Vue", "React", "Comparison"],
        status: "DRAFT"  // Bản nháp
    };

    try {
        console.log('🚀 Creating draft post...');

        const response = await fetch('/api/v1/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(draftPost)
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('❌ Error:', error);
            return;
        }

        const data = await response.json();
        console.log('✅ Draft post created!');
        console.log('📄 Post details:', data);

        return data;
    } catch (error) {
        console.error('❌ Failed to create draft:', error);
    }
}

// Test 3: Tạo nhiều bài viết mẫu
async function createSamplePosts() {
    const samplePosts = [
        {
            title: "10 Mẹo JavaScript Hữu Ích",
            slug: "10-meo-javascript-huu-ich",
            content: "Khám phá 10 mẹo JavaScript giúp code của bạn ngắn gọn và hiệu quả hơn...",
            authorId: 1,
            tagNames: ["JavaScript", "Tips", "Best Practices"],
            status: "PUBLISHED"
        },
        {
            title: "Tailwind CSS - Hướng dẫn cơ bản",
            slug: "tailwind-css-huong-dan-co-ban",
            content: "Tailwind CSS là utility-first CSS framework giúp tạo giao diện nhanh chóng...",
            authorId: 1,
            tagNames: ["CSS", "Tailwind", "Frontend"],
            status: "PUBLISHED"
        },
        {
            title: "Node.js Best Practices 2025",
            slug: "nodejs-best-practices-2025",
            content: "Các best practices khi làm việc với Node.js trong năm 2025...",
            authorId: 1,
            tagNames: ["Node.js", "Backend", "Best Practices"],
            status: "DRAFT"
        }
    ];

    console.log(`🚀 Creating ${samplePosts.length} sample posts...`);

    const results = [];
    for (let i = 0; i < samplePosts.length; i++) {
        const post = samplePosts[i];
        console.log(`\n📝 Creating post ${i + 1}/${samplePosts.length}: ${post.title}`);

        try {
            const response = await fetch('/api/v1/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(post)
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Created: ${data.title} (ID: ${data.id})`);
                results.push(data);
            } else {
                console.error(`❌ Failed to create: ${post.title}`);
            }

            // Delay 500ms giữa các requests
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            console.error(`❌ Error creating ${post.title}:`, error);
        }
    }

    console.log(`\n✅ Created ${results.length}/${samplePosts.length} posts successfully!`);
    return results;
}

// Test 4: Tạo post với image URL
async function createPostWithImage() {
    const postWithImage = {
        title: "Getting Started with TypeScript",
        slug: "getting-started-with-typescript",
        content: "TypeScript là superset của JavaScript với type system mạnh mẽ...",
        authorId: 1,
        tagNames: ["TypeScript", "JavaScript", "Tutorial"],
        status: "PUBLISHED"
    };

    try {
        console.log('🚀 Creating post with image...');

        const response = await fetch('/api/v1/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(postWithImage)
        });

        const data = await response.json();
        console.log('✅ Post created:', data);
        return data;
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Hướng dẫn sử dụng
console.log(`
╔════════════════════════════════════════════════════════════════╗
║              Test POST /api/v1/posts API                       ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║ Các functions có sẵn:                                          ║
║                                                                ║
║ 1. createPublishedPost()    - Tạo bài viết xuất bản           ║
║ 2. createDraftPost()        - Tạo bài viết bản nháp           ║
║ 3. createSamplePosts()      - Tạo 3 bài viết mẫu              ║
║ 4. createPostWithImage()    - Tạo post với hình ảnh           ║
║                                                                ║
║ Cách sử dụng:                                                  ║
║   await createPublishedPost()                                  ║
║   await createDraftPost()                                      ║
║   await createSamplePosts()                                    ║
║                                                                ║
║ Lưu ý: Phải đăng nhập với tài khoản ADMIN!                    ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

// Export để dùng
export {
    createPublishedPost,
    createDraftPost,
    createSamplePosts,
    createPostWithImage
};
