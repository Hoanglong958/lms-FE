import React from "react";

// Giả sử bạn có component Breadcrumbs riêng
const Breadcrumbs = () => (
  <div className="breadcrumbs">
    <span>Trang chủ</span> / <span>Web Frontend Fundamental</span>
  </div>
);

const LessonDetail = () => {
  return (
    <div className="lesson-detail-container">
      <Breadcrumbs />

      <div className="lesson-navigation">
        <button className="nav-button prev">← Bài trước</button>
        <button className="nav-button next">Bài tiếp theo →</button>
      </div>

      <div className="video-player-wrapper">
        {/* Bạn có thể thay thế bằng component video player thật */}
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Example video
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      <div className="lesson-header">
        <div className="lesson-title-group">
          <h2>N1 Chill Class</h2>
          <span>24 tháng 6 năm 2023</span>
        </div>
        <div className="lesson-progress">1/10 Bài học</div>
      </div>

      <div className="lesson-description">
        <h3>Mô tả</h3>
        <p>
          Lorem ipsum dolor sit amet consectetur. Ornare eu elementum felis
          porttitor nunc tortor. Ornare neque accumsan metus ultrices maecenas
          rhoncus ultrices cras. Vestibulum varius adipiscing ipsum pharetra...
        </p>
        <a href="#">Xem thêm</a>
      </div>
    </div>
  );
};

export default LessonDetail;
