import axiosInstance from "@config/index";

const AI_TIMEOUT = 120000; // 120 giây cho Ollama

export const askAI = async (type, question, options = {}) => {
    const response = await axiosInstance.post(
        "/ai/chat",
        {
            type,
            question,
            courseId: options.courseId || null,
            lessonId: options.lessonId || null,
        },
        { timeout: AI_TIMEOUT }
    );
    return response.data;
};

/**
 * Health check Ollama
 */
export const checkAIHealth = async () => {
    try {
        const response = await axiosInstance.get("/ai/health", { timeout: 15000 });
        return response.data?.success === true;
    } catch {
        return false;
    }
};
