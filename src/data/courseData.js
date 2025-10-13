// Import các icon bạn sẽ dùng cho từng loại bài học
import checkIconSvg from "@assets/icons/lesson-type-icons/check-icon.svg";
import documentIconSvg from "@assets/icons/lesson-type-icons/document-icon.svg";
import quizIconSvg from "@assets/icons/lesson-type-icons/quiz-icon.svg";
import videoIconSvg from "@assets/icons/lesson-type-icons/video-icon.svg";
import terminalIconSvg from "@assets/icons/lesson-type-icons/terminal-icon.svg";
import { Descriptions } from "antd";

// Dữ liệu cho tất cả các khóa học
export const courses = {
  // Dữ liệu cho khóa học có id là 'n1-chill-class'
  "n1-chill-class": {
    courseTitle: "N1 Chill Class",
    sessions: [
      {
        id: "session-1",
        title: "Session 1: Từ vựng",
        lessons: [
          {
            id: "lesson-1-1",
            title: "Lesson 1: Phó từ láy",
            items: [
              {
                id: "1",
                type: "video",
                title: "Form & Table",
                duration: "10:34",
                img: checkIconSvg,
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Nội dung video về Form & Table.",
              },
              {
                id: "2",
                type: "video",
                title: "Luyện tập Function",
                duration: "10:34",
                img: documentIconSvg,
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Nội dung video về Function.",
              },
              {
                id: "3",
                type: "video",
                title: "Tổng quan về Git",
                duration: "10:34",
                img: videoIconSvg,
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Nội dung video về Git.",
              },
              {
                id: "4",
                type: "quiz",
                title: "[Quiz] JS Cơ bản",
                questions: 6,
                img: quizIconSvg,
                content:
                  "Ornare eu elementum felis porttitor nunc tortor. Ornare neque accumsan metus nulla ultricies maecenas rhoncus ultrices cras. Vestibulum varius adipiscing ipsum.",
                Descriptions:
                  "Lorem ipsum dolor sit amet consectetur: <b> Ornare eu elementum felis porttitor nunc tortor.</b> Ornare neque accumsan metus nulla ultricies maecenas rhoncus ultrices cras. Vestibulum varius adipiscing ipsum pharetra. Semper ullamcorper malesuada ut auctor scelerisque. Sit morbi pellentesque adipiscing pellentesque habitant ullamcorper est. In dolor sit platea faucibus ut dignissim pulvinar.",
              },
            ],
          },
          {
            id: "lesson-1-2",
            title: "Lesson 2: Tính từ",
            items: [
              {
                id: "5",
                type: "video",
                title: "Basic HTML Tag",
                duration: "10:34",
                img: videoIconSvg,
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Nội dung video về HTML Tag.",
              },
              {
                id: "6",
                type: "quiz",
                title: "[Quiz] JS Nâng cao",
                questions: 6,
                img: quizIconSvg,
                content: "Nội dung quiz về JS Nâng cao.",
              },
            ],
          },
          {
            id: "lesson-1-3",
            title: "Lesson 3: Danh từ",
            items: [
              {
                id: "7",
                type: "video",
                title: "HTML Layout Structure",
                duration: "10:34",
                img: videoIconSvg,
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Nội dung video về HTML Layout.",
              },
              {
                id: "8",
                type: "quiz",
                title: "[Quiz] JS Cơ bản",
                questions: 6,
                img: quizIconSvg,
                content:
                  "Ornare eu elementum felis porttitor nunc tortor. Ornare neque accumsan metus nulla ultricies maecenas rhoncus ultrices cras. Vestibulum varius adipiscing ipsum pharetra. Semper ullamcorper malesuada ut auctor scelerisque. Sit morbi pellentesque adipiscing pellentesque habitant ullamcorper est. In dolor sit platea faucibus ut dignissim pulvinar.",
              },
              {
                id: "9",
                type: "video",
                title: "HTML in Real World",
                duration: "10:34",
                img: videoIconSvg,
                videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                content: "Nội dung video về ứng dụng HTML.",
              },
              {
                id: "10",
                type: "quiz",
                title: "[Quiz] Array Methods",
                questions: 6,
                img: videoIconSvg,
                content: "Nội dung quiz về các phương thức mảng.",
              },
            ],
          },
          {
            id: "lesson-1-4",
            title: "Bài tập về nhà",
            items: [
              {
                id: "11",
                type: "task",
                title: "Chia thẻ danh sách",
                img: terminalIconSvg,
                content: "Nội dung bài tập về nhà: Chia thẻ danh sách.",
              },
              {
                id: "12",
                type: "task",
                title: "Tạo trang CV cá nhân",
                img: terminalIconSvg,
                content: "Nội dung bài tập về nhà: Tạo CV.",
              },
              {
                id: "13",
                type: "task",
                title: "Kết hợp thẻ nav, a để làm menu",
                img: terminalIconSvg,
                content: "Nội dung bài tập về nhà: Làm menu.",
              },
              {
                id: "14",
                type: "task",
                title: "Thực hành thẻ img",
                img: terminalIconSvg,
                content: "Nội dung bài tập về nhà: Thực hành ảnh.",
              },
            ],
          },
        ],
      },
      {
        id: "session-2",
        title: "Session 2: Chữ Hán",
        lessons: [
          { id: "lesson-2-1", title: "Lesson 1: HTML Introduction", items: [] },
          { id: "lesson-2-2", title: "Lesson 2: HTML Basic", items: [] },
          { id: "lesson-2-3", title: "Lesson 3: Form & Table", items: [] },
        ],
      },
      {
        id: "session-3",
        title: "Session 3: Ngữ pháp",
        lessons: [],
      },
    ],
  },

  // Dữ liệu cho các khóa học khác (bạn có thể thêm vào sau)
  "n2-chill-class": {
    courseTitle: "N2 Chill Class",
    sessions: [
      {
        id: "session-n2-1",
        title: "Session 1: Ngữ pháp N2",
        lessons: [
          {
            id: "lesson-n2-1-1",
            title: "Bài 1: Thể bị động",
            items: [
              {
                id: "n2-video-1",
                type: "video",
                title: "Video bài giảng",
                duration: "15:00",
                img: videoIconSvg,
                content: "Nội dung video về thể bị động trong N2...",
              },
            ],
          },
        ],
      },
    ],
  },
  "phat-am-jvoice": {
    courseTitle: "Phát Âm J-Voice",
    sessions: [
      /* Thêm dữ liệu cho khóa học này */
    ],
  },
  "it-talk": {
    courseTitle: "IT Talk",
    sessions: [
      /* Thêm dữ liệu cho khóa học này */
    ],
  },
};
