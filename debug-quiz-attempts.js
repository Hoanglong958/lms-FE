/**
 * DEBUG SCRIPT - Quiz Attempts API
 * Kiểm tra tại sao chỉ hiển thị 4/6 attempts
 * 
 * Copy script này vào Browser Console và chạy
 */

async function debugQuizAttempts() {
    console.log("🔍 Starting Debug...\n");

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    console.log("👤 Current User:", user);
    console.log("🔑 Token:", token ? "✅ Exists" : "❌ Missing");
    console.log("\n" + "=".repeat(60) + "\n");

    // Test 1: GET /api/v1/quiz-attempts (tất cả)
    console.log("📋 Test 1: GET /api/v1/quiz-attempts");
    try {
        const response1 = await fetch('http://localhost:3900/api/v1/quiz-attempts', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        const data1 = await response1.json();
        console.log("✅ Response Status:", response1.status);
        console.log("📊 Response Data:", data1);

        if (Array.isArray(data1)) {
            console.log(`📌 Count: ${data1.length} attempts`);
            console.log("IDs:", data1.map(a => a.attemptId));
        } else if (data1.content) {
            console.log(`📌 Count: ${data1.content.length} attempts`);
            console.log("IDs:", data1.content.map(a => a.attemptId));
            console.log("Total Elements:", data1.totalElements);
        }
    } catch (error) {
        console.error("❌ Error:", error);
    }

    console.log("\n" + "=".repeat(60) + "\n");

    // Test 2: GET /api/v1/quiz-attempts/paging
    console.log("📄 Test 2: GET /api/v1/quiz-attempts/paging");
    try {
        const response2 = await fetch('http://localhost:3900/api/v1/quiz-attempts/paging?page=0&size=100', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        const data2 = await response2.json();
        console.log("✅ Response Status:", response2.status);
        console.log("📊 Response Data:", data2);

        if (data2.content) {
            console.log(`📌 Count: ${data2.content.length} attempts`);
            console.log("IDs:", data2.content.map(a => a.attemptId));
            console.log("Total Elements:", data2.totalElements);
            console.log("Total Pages:", data2.totalPages);
        }
    } catch (error) {
        console.error("❌ Error:", error);
    }

    console.log("\n" + "=".repeat(60) + "\n");

    // Test 3: Lấy từng attempt riêng lẻ
    console.log("🔢 Test 3: Individual Attempts (1-6)");
    for (let id = 1; id <= 6; id++) {
        try {
            const response = await fetch(`http://localhost:3900/api/v1/quiz-attempts/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Attempt #${id}:`, {
                    attemptId: data.attemptId,
                    userId: data.userId,
                    quizId: data.quizId,
                    score: data.score,
                    status: data.status
                });
            } else {
                console.log(`❌ Attempt #${id}: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error(`❌ Attempt #${id}: Error`, error.message);
        }
    }

    console.log("\n" + "=".repeat(60) + "\n");

    // Test 4: By Quiz
    console.log("📝 Test 4: GET /api/v1/quiz-attempts/by-quiz/2");
    try {
        const response4 = await fetch('http://localhost:3900/api/v1/quiz-attempts/by-quiz/2', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        const data4 = await response4.json();
        console.log("✅ Response Status:", response4.status);
        console.log("📊 Response Data:", data4);

        if (Array.isArray(data4)) {
            console.log(`📌 Count: ${data4.length} attempts for Quiz #2`);
            console.log("IDs:", data4.map(a => a.attemptId));
        }
    } catch (error) {
        console.error("❌ Error:", error);
    }

    console.log("\n" + "=".repeat(60) + "\n");
    console.log("✅ Debug Complete!");

    return {
        message: "Debug complete! Check console logs above for details."
    };
}

// Run debug
console.log(`
╔════════════════════════════════════════════════════════════════╗
║           Quiz Attempts Debug Tool                             ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║ Chạy lệnh:                                                     ║
║   await debugQuizAttempts()                                    ║
║                                                                ║
║ Script này sẽ test TẤT CẢ các API endpoints để tìm            ║
║ lý do tại sao chỉ hiển thị 4/6 attempts                       ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

// Cũng export để dùng
export { debugQuizAttempts };
