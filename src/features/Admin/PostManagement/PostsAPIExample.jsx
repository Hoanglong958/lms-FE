import React, { useState, useEffect } from "react";
import { postService } from "@utils/postService";

/**
 * Example component demonstrating how to call the GET /api/v1/posts API
 * This API returns paginated list of PUBLISHED posts
 */
export default function PostsAPIExample() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        sort: "createdAt,desc",
        totalElements: 0,
        totalPages: 0
    });

    /**
     * Fetch published posts with pagination
     * API: GET /api/v1/posts
     * Parameters:
     *  - page: Trang bắt đầu từ 0 (default: 0)
     *  - size: Kích thước trang (default: 10)
     *  - sort: Sắp xếp (default: "createdAt,desc")
     * 
     * Response structure:
     * {
     *   totalElements: number,
     *   totalPages: number,
     *   size: number,
     *   content: [...posts],
     *   number: number (current page),
     *   first: boolean,
     *   last: boolean,
     *   ...
     * }
     */
    const fetchPublishedPosts = async (page = 0, size = 10, sort = "createdAt,desc") => {
        setLoading(true);
        try {
            // Call API with parameters
            const response = await postService.getPosts({
                page,
                size,
                sort
            });

            console.log("API Response:", response);

            // Handle response - the response structure can vary
            const data = response?.data;

            // Extract content array
            let content = [];
            if (Array.isArray(data)) {
                content = data;
            } else if (Array.isArray(data?.content)) {
                content = data.content;
            } else if (Array.isArray(data?.data?.content)) {
                content = data.data.content;
            }

            setPosts(content);

            // Update pagination info
            setPagination({
                page: data?.number || page,
                size: data?.size || size,
                sort: sort,
                totalElements: data?.totalElements || 0,
                totalPages: data?.totalPages || 0
            });

        } catch (error) {
            console.error("Failed to fetch posts:", error);
            alert("Không thể tải danh sách bài viết");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fetch draft posts
     * API: GET /api/v1/posts/drafts
     */
    const fetchDraftPosts = async (page = 0, size = 10, sort = "createdAt,desc") => {
        setLoading(true);
        try {
            const response = await postService.getDrafts({
                page,
                size,
                sort
            });

            console.log("Drafts API Response:", response);

            const data = response?.data;
            let content = [];
            if (Array.isArray(data?.content)) {
                content = data.content;
            }

            setPosts(content);
            setPagination({
                page: data?.number || page,
                size: data?.size || size,
                sort: sort,
                totalElements: data?.totalElements || 0,
                totalPages: data?.totalPages || 0
            });

        } catch (error) {
            console.error("Failed to fetch drafts:", error);
            alert("Không thể tải danh sách bản nháp");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Create a test post
     * API: POST /api/v1/posts
     */
    const createTestPost = async () => {
        const newPost = {
            title: `Test Post - ${new Date().toLocaleString()}`,
            slug: `test-post-${Date.now()}`,
            content: `# Test Post Created via API

This is a test post created using the **POST /api/v1/posts** API.

## Features Demonstrated:
- ✅ Creating posts programmatically
- ✅ Auto-generated slug
- ✅ Multiple tags support
- ✅ Published status

Created at: ${new Date().toLocaleString()}`,
            authorId: 1, // You may need to change this
            tagNames: ["Test", "API", "Demo"],
            status: "PUBLISHED"
        };

        setLoading(true);
        try {
            console.log("Creating test post...", newPost);

            const response = await postService.createPost(newPost);

            console.log("✅ Post created successfully:", response.data);
            alert(`✅ Bài viết đã được tạo thành công!\nID: ${response.data.id}\nTitle: ${response.data.title}`);

            // Refresh the posts list
            await fetchPublishedPosts(0, pagination.size, pagination.sort);

        } catch (error) {
            console.error("❌ Failed to create post:", error);
            alert("❌ Không thể tạo bài viết. Vui lòng kiểm tra console để xem lỗi chi tiết.");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Create sample posts
     */
    const createSamplePosts = async () => {
        const samplePosts = [
            {
                title: "Hướng dẫn học React từ cơ bản đến nâng cao",
                slug: "huong-dan-hoc-react-co-ban-den-nang-cao",
                content: "React là thư viện JavaScript phổ biến để xây dựng giao diện người dùng...",
                authorId: 1,
                tagNames: ["React", "JavaScript", "Tutorial"],
                status: "PUBLISHED"
            },
            {
                title: "10 Mẹo JavaScript Hữu Ích",
                slug: "10-meo-javascript-huu-ich",
                content: "Khám phá 10 mẹo JavaScript giúp code ngắn gọn và hiệu quả hơn...",
                authorId: 1,
                tagNames: ["JavaScript", "Tips"],
                status: "PUBLISHED"
            },
            {
                title: "Tailwind CSS - Hướng dẫn cơ bản",
                slug: "tailwind-css-huong-dan-co-ban",
                content: "Tailwind CSS là utility-first CSS framework...",
                authorId: 1,
                tagNames: ["CSS", "Tailwind"],
                status: "DRAFT"
            }
        ];

        setLoading(true);
        let successCount = 0;

        try {
            for (const post of samplePosts) {
                try {
                    await postService.createPost(post);
                    successCount++;
                    console.log(`✅ Created: ${post.title}`);
                } catch (error) {
                    console.error(`❌ Failed to create: ${post.title}`, error);
                }
                // Small delay between requests
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            alert(`✅ Đã tạo ${successCount}/${samplePosts.length} bài viết mẫu!`);

            // Refresh posts
            await fetchPublishedPosts(0, pagination.size, pagination.sort);

        } catch (error) {
            console.error("Error creating sample posts:", error);
        } finally {
            setLoading(false);
        }
    };

    // Load posts on component mount
    useEffect(() => {
        fetchPublishedPosts();
    }, []);

    // Handlers for pagination
    const handleNextPage = () => {
        if (pagination.page < pagination.totalPages - 1) {
            fetchPublishedPosts(pagination.page + 1, pagination.size, pagination.sort);
        }
    };

    const handlePrevPage = () => {
        if (pagination.page > 0) {
            fetchPublishedPosts(pagination.page - 1, pagination.size, pagination.sort);
        }
    };

    const handlePageSizeChange = (newSize) => {
        fetchPublishedPosts(0, newSize, pagination.sort);
    };

    const handleSortChange = (newSort) => {
        fetchPublishedPosts(pagination.page, pagination.size, newSort);
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Posts API Example</h1>

            {/* Controls */}
            <div style={styles.controls}>
                <button
                    onClick={() => fetchPublishedPosts(0, pagination.size, pagination.sort)}
                    style={styles.button}
                >
                    🔄 Reload Published Posts
                </button>

                <button
                    onClick={() => fetchDraftPosts(0, pagination.size, pagination.sort)}
                    style={styles.button}
                >
                    📝 Load Draft Posts
                </button>

                <button
                    onClick={createTestPost}
                    style={{ ...styles.button, background: "#10b981" }}
                    disabled={loading}
                >
                    ➕ Create Test Post (POST API)
                </button>

                <button
                    onClick={createSamplePosts}
                    style={{ ...styles.button, background: "#3b82f6" }}
                    disabled={loading}
                >
                    ✨ Create 3 Sample Posts
                </button>

                {/* Sort Options */}
                <select
                    value={pagination.sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    style={styles.select}
                >
                    <option value="createdAt,desc">Newest First</option>
                    <option value="createdAt,asc">Oldest First</option>
                    <option value="title,asc">Title A-Z</option>
                    <option value="title,desc">Title Z-A</option>
                </select>

                {/* Page Size */}
                <select
                    value={pagination.size}
                    onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                    style={styles.select}
                >
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                </select>
            </div>

            {/* Pagination Info */}
            <div style={styles.paginationInfo}>
                <span>
                    Page {pagination.page + 1} of {pagination.totalPages} |
                    Total: {pagination.totalElements} posts
                </span>
                <div style={styles.paginationButtons}>
                    <button
                        onClick={handlePrevPage}
                        disabled={pagination.page === 0}
                        style={styles.button}
                    >
                        ← Previous
                    </button>
                    <button
                        onClick={handleNextPage}
                        disabled={pagination.page >= pagination.totalPages - 1}
                        style={styles.button}
                    >
                        Next →
                    </button>
                </div>
            </div>

            {/* Posts List */}
            {loading ? (
                <div style={styles.loading}>Loading posts...</div>
            ) : posts.length === 0 ? (
                <div style={styles.empty}>No posts found</div>
            ) : (
                <div style={styles.postsList}>
                    {posts.map((post) => (
                        <div key={post.id} style={styles.postCard}>
                            <div style={styles.postHeader}>
                                <h3 style={styles.postTitle}>{post.title}</h3>
                                <span style={styles.status}>
                                    {post.status === 'PUBLISHED' ? '✅ Published' : '📝 Draft'}
                                </span>
                            </div>
                            <p style={styles.postSlug}>/{post.slug}</p>
                            <div style={styles.postMeta}>
                                <span>👤 {post.author?.fullName || 'Unknown'}</span>
                                <span>📅 {new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                            {post.tags && post.tags.length > 0 && (
                                <div style={styles.tags}>
                                    {post.tags.map((tag, idx) => (
                                        <span key={idx} style={styles.tag}>{tag}</span>
                                    ))}
                                </div>
                            )}
                            <div style={styles.content}>
                                {post.content?.substring(0, 150)}...
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* API Info */}
            <div style={styles.apiInfo}>
                <h3>📚 API Documentation</h3>
                <div style={styles.apiEndpoint}>
                    <strong>GET /api/v1/posts</strong>
                    <p>Danh sách bài viết PUBLISHED, phân trang</p>
                    <pre style={styles.code}>
                        {`// Example usage:
const response = await postService.getPosts({
  page: 0,        // Trang bắt đầu từ 0
  size: 10,       // Kích thước trang
  sort: "createdAt,desc"  // Sắp xếp
});

// Response structure:
{
  totalElements: 0,
  totalPages: 0,
  size: 0,
  content: [...],  // Array of posts
  number: 0,       // Current page
  first: true,
  last: true,
  ...
}`}
                    </pre>
                </div>

                <div style={styles.apiEndpoint}>
                    <strong>GET /api/v1/posts/drafts</strong>
                    <p>Danh sách bài viết bản nháp (DRAFT)</p>
                    <pre style={styles.code}>
                        {`// Example usage:
const response = await postService.getDrafts({
  page: 0,
  size: 10,
  sort: "createdAt,desc"
});`}
                    </pre>
                </div>

                <div style={styles.apiEndpoint}>
                    <strong>POST /api/v1/posts</strong>
                    <p>Tạo bài viết mới (Chỉ ADMIN được phép)</p>
                    <pre style={styles.code}>
                        {`// Example usage:
const response = await postService.createPost({
  title: "Tiêu đề bài viết",
  slug: "tieu-de-bai-viet",
  content: "Nội dung bài viết...",
  authorId: 1,
  tagNames: ["React", "JavaScript"],
  status: "PUBLISHED"  // or "DRAFT"
});

// Response (201 Created):
{
  id: 1,
  title: "Tiêu đề bài viết",
  slug: "tieu-de-bai-viet",
  content: "Nội dung...",
  status: "PUBLISHED",
  createdAt: "2025-12-24T15:00:00",
  author: {
    id: 1,
    fullName: "Nguyen Van A"
  },
  tags: ["React", "JavaScript"]
}`}
                    </pre>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: "32px",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: '"Inter", sans-serif',
        background: "#f7f8fa",
        minHeight: "100vh"
    },
    title: {
        fontSize: "32px",
        fontWeight: "700",
        color: "#111827",
        marginBottom: "24px"
    },
    controls: {
        display: "flex",
        gap: "12px",
        marginBottom: "24px",
        flexWrap: "wrap"
    },
    button: {
        padding: "10px 16px",
        background: "#f97316",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s"
    },
    select: {
        padding: "10px 16px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        fontSize: "14px",
        background: "white",
        cursor: "pointer"
    },
    paginationInfo: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px",
        background: "white",
        borderRadius: "12px",
        marginBottom: "24px",
        border: "1px solid #e5e7eb"
    },
    paginationButtons: {
        display: "flex",
        gap: "8px"
    },
    loading: {
        textAlign: "center",
        padding: "48px",
        fontSize: "18px",
        color: "#6b7280"
    },
    empty: {
        textAlign: "center",
        padding: "48px",
        fontSize: "18px",
        color: "#6b7280"
    },
    postsList: {
        display: "grid",
        gap: "16px",
        marginBottom: "32px"
    },
    postCard: {
        background: "white",
        padding: "24px",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
    },
    postHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "start",
        marginBottom: "8px"
    },
    postTitle: {
        fontSize: "20px",
        fontWeight: "600",
        color: "#111827",
        margin: "0"
    },
    status: {
        padding: "4px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "600",
        background: "#f0fdf4",
        color: "#16a34a"
    },
    postSlug: {
        fontSize: "14px",
        color: "#6b7280",
        marginBottom: "12px"
    },
    postMeta: {
        display: "flex",
        gap: "16px",
        fontSize: "14px",
        color: "#6b7280",
        marginBottom: "12px"
    },
    tags: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        marginBottom: "12px"
    },
    tag: {
        padding: "4px 12px",
        background: "#f3f4f6",
        borderRadius: "6px",
        fontSize: "12px",
        color: "#4b5563"
    },
    content: {
        fontSize: "14px",
        color: "#374151",
        lineHeight: "1.6"
    },
    apiInfo: {
        background: "white",
        padding: "24px",
        borderRadius: "12px",
        border: "1px solid #e5e7eb"
    },
    apiEndpoint: {
        marginBottom: "24px"
    },
    code: {
        background: "#1f2937",
        color: "#f9fafb",
        padding: "16px",
        borderRadius: "8px",
        fontSize: "13px",
        overflow: "auto",
        marginTop: "12px"
    }
};
