import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ExamCreate.css";

export default function ExamCreate() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    course: "",
    date: "",
    duration: "",
    passScore: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.course) {
      alert("⚠️ Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    // ✅ Lưu vào localStorage (giả lập backend)
    const exams = JSON.parse(localStorage.getItem("exams") || "[]");
    exams.push({
      id: exams.length + 1,
      ...formData,
      status: "Đang mở",
    });
    localStorage.setItem("exams", JSON.stringify(exams));

    alert("✅ Tạo bài kiểm tra thành công!");
    navigate("/admin/exam");
  };

  return (
    <div className="exam-create-container">
      <div className="exam-create-header">
        <h2>Tạo bài kiểm tra mới</h2>
        <p>Nhập thông tin chi tiết cho bài kiểm tra</p>
      </div>

      <form onSubmit={handleSubmit} className="exam-create-form">
        <div className="form-group">
          <label>Tên bài kiểm tra *</label>
          <input
            type="text"
            name="name"
            placeholder="VD: Kiểm tra giữa kỳ React"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Mô tả</label>
          <textarea
            name="description"
            placeholder="Nhập mô tả ngắn cho bài kiểm tra..."
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Khóa học *</label>
          <input
            type="text"
            name="course"
            placeholder="VD: React Advanced"
            value={formData.course}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Ngày thi *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Thời gian (phút)</label>
            <input
              type="number"
              name="duration"
              placeholder="VD: 60"
              value={formData.duration}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Điểm đậu (%)</label>
            <input
              type="number"
              name="passScore"
              placeholder="VD: 50"
              value={formData.passScore}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/admin/exam")}
          >
            ← Hủy
          </button>
          <button type="submit" className="btn-save">
            💾 Lưu bài kiểm tra
          </button>
        </div>
      </form>
    </div>
  );
}
