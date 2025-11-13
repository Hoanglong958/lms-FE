// @/data/mockData.js

// --- Courses ---
export const mockCourses = [
  {
    id: "c1",
    title: "Khóa học ReactJS từ A-Z",
    description:
      "Học ReactJS từ cơ bản đến nâng cao: Hooks, Redux, Component, State, Props, Lifecycle.",
  },
  {
    id: "c2",
    title: "Chuyên sâu NodeJS & Express",
    description:
      "Xây dựng backend API với NodeJS, Express, MongoDB, routes, middleware và database.",
  },
  {
    id: "c3",
    title: "Làm chủ Javascript ES6+",
    description:
      "Nắm vững Javascript hiện đại: Arrow function, Promise, Async/Await, Modules, Destructuring.",
  },
];

// --- Sections (Phân học) ---
export const mockSections = [
  {
    id: "s1",
    courseId: "c1",
    title: "Chương 1: Bắt đầu",
    description: "Nhập môn ReactJS",
  },
  {
    id: "s2",
    courseId: "c1",
    title: "Chương 2: Khái niệm cốt lõi",
    description: "Component, Props, State, Lifecycle",
  },
  {
    id: "s3",
    courseId: "c2",
    title: "Phần 1: Cài đặt",
    description: "Cài NodeJS, Express",
  },
];

// --- Lessons ---
export const mockLessons = [
  // Phân học s1 (React)
  {
    id: "l1",
    sectionId: "s1",
    title: "Giới thiệu ReactJS",
    description: "Tổng quan về ReactJS, cách hoạt động và lợi ích.",
    type: "document",
    content: {
      sections: [
        {
          id: "d1",
          title: "React là gì?",
          content: "React là thư viện JS để xây dựng UI component-based.",
        },
        {
          id: "d2",
          title: "Ưu điểm",
          content: "Virtual DOM, tái sử dụng component dễ dàng.",
        },
      ],
    },
  },
  {
    id: "l2",
    sectionId: "s1",
    title: "Cài đặt môi trường",
    description: "Hướng dẫn cài NodeJS, npm và create-react-app.",
    type: "video",
    content: {
      videoUrl: "https://www.youtube.com/watch?v=eNXPoaD_Tgc",
    },
  },

  // Phân học s2 (React)
  {
    id: "l3",
    sectionId: "s2",
    title: "Components và Props",
    description: "Hiểu cách tạo component và sử dụng props.",
    type: "document",
    content: {
      sections: [
        {
          id: "d3",
          title: "Function Component",
          content: "Khai báo component dạng function.",
        },
        {
          id: "d4",
          title: "Props",
          content: "Props dùng để truyền dữ liệu từ cha xuống con.",
        },
      ],
    },
  },
  {
    id: "l4",
    sectionId: "s2",
    title: "State và Lifecycle",
    description: "Quản lý state và các phương thức lifecycle.",
    type: "quiz",
    content: {
      questions: [
        {
          id: "q1",
          question: "State dùng để làm gì?",
          answer: "Lưu trữ dữ liệu của component.",
        },
        {
          id: "q2",
          question: "Lifecycle method nào chạy khi mount?",
          answer: "componentDidMount / useEffect(..., [])",
        },
      ],
    },
  },

  // Phân học s3 (NodeJS)
  {
    id: "l5",
    sectionId: "s3",
    title: "Cài đặt NodeJS",
    description: "Tải và cài NodeJS, npm.",
    type: "document",
    content: {
      sections: [
        {
          id: "d5",
          title: "Download NodeJS",
          content: "Tải NodeJS tại nodejs.org, chọn bản LTS.",
        },
        {
          id: "d6",
          title: "Cài đặt trên máy",
          content: "Cài theo hướng dẫn, kiểm tra node -v & npm -v.",
        },
      ],
    },
  },
  {
    id: "l6",
    sectionId: "s3",
    title: "Chạy server đầu tiên",
    description: "Tạo file server.js và chạy server NodeJS đầu tiên.",
    type: "video",
    content: {
      videoUrl: "https://www.youtube.com/watch?v=TlB_eWDSMt4",
    },
  },
];
