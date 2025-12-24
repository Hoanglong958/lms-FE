/**
 * Simple script to test the Posts API
 * You can run this in the browser console after logging in as admin
 */

// Import the service (if running in browser console on your app)
// Make sure you're logged in first!

// Example 1: Get published posts (default pagination)
async function testGetPublishedPosts() {
    try {
        const response = await fetch('/api/v1/posts?page=0&size=10&sort=createdAt,desc', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust based on your auth setup
            }
        });
        const data = await response.json();
        console.log('📚 Published Posts:', data);
        console.log(`Total: ${data.totalElements} posts, ${data.totalPages} pages`);
        console.log('Posts:', data.content);
        return data;
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Example 2: Get draft posts
async function testGetDrafts() {
    try {
        const response = await fetch('/api/v1/posts/drafts?page=0&size=10&sort=createdAt,desc', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        console.log('📝 Draft Posts:', data);
        return data;
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Example 3: Get post by ID
async function testGetPostById(postId) {
    try {
        const response = await fetch(`/api/v1/posts/${postId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        console.log(`📄 Post #${postId}:`, data);
        return data;
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Example 4: Create a new post
async function testCreatePost() {
    const newPost = {
        title: "Test Post from API",
        slug: "test-post-from-api",
        content: "This is a test post created via API",
        authorId: 1, // Change to your user ID
        tagNames: ["Test", "API"],
        status: "DRAFT" // or "PUBLISHED"
    };

    try {
        const response = await fetch('/api/v1/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(newPost)
        });
        const data = await response.json();
        console.log('✅ Post created:', data);
        return data;
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Example 5: Update a post
async function testUpdatePost(postId) {
    const updatedPost = {
        title: "Updated Test Post",
        slug: "updated-test-post",
        content: "This post has been updated",
        authorId: 1,
        tagNames: ["Updated", "Test"],
        status: "PUBLISHED"
    };

    try {
        const response = await fetch(`/api/v1/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(updatedPost)
        });
        const data = await response.json();
        console.log('✅ Post updated:', data);
        return data;
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Example 6: Delete a post
async function testDeletePost(postId) {
    try {
        const response = await fetch(`/api/v1/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        console.log('🗑️ Post deleted successfully');
        return response;
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting Posts API Tests...\n');

    // Test 1: Get published posts
    console.log('1️⃣ Testing GET /api/v1/posts');
    await testGetPublishedPosts();
    console.log('\n');

    // Test 2: Get drafts
    console.log('2️⃣ Testing GET /api/v1/posts/drafts');
    await testGetDrafts();
    console.log('\n');

    // Test 3: Get post by ID (if you have posts)
    // console.log('3️⃣ Testing GET /api/v1/posts/{id}');
    // await testGetPostById(1);
    // console.log('\n');

    console.log('✅ All tests completed!');
}

// Instructions:
console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    Posts API Test Functions                    ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║ Available functions:                                           ║
║                                                                ║
║ 1. testGetPublishedPosts()  - Get published posts             ║
║ 2. testGetDrafts()          - Get draft posts                 ║
║ 3. testGetPostById(id)      - Get specific post               ║
║ 4. testCreatePost()         - Create new post                 ║
║ 5. testUpdatePost(id)       - Update existing post            ║
║ 6. testDeletePost(id)       - Delete post                     ║
║ 7. runAllTests()            - Run all GET tests               ║
║                                                                ║
║ Example usage:                                                 ║
║   testGetPublishedPosts()                                      ║
║   testGetPostById(1)                                           ║
║   runAllTests()                                                ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

// Export for use
export {
    testGetPublishedPosts,
    testGetDrafts,
    testGetPostById,
    testCreatePost,
    testUpdatePost,
    testDeletePost,
    runAllTests
};
