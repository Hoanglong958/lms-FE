import React, { useState } from "react";
import "./QuestionBankCreate.css";

export default function QuestionBankCreate() {
  const [type, setType] = useState("Trắc nghiệm");
  const [options, setOptions] = useState(["", "", "", ""]);

  const handleOptionChange = (value, index) => {
    const newOps = [...options];
    newOps[index] = value;
    setOptions(newOps);
  };

  return (
    <div className="qb-create-container">
      <h2 className="qb-title">Tạo câu hỏi mới</h2>
      <p className="qb-sub">Nhập thông tin chi tiết cho câu hỏi</p>

      <div className="qb-card">

        {/* Câu hỏi */}
        <label className="qb-label">Câu hỏi *</label>
        <input
          type="text"
          className="qb-input"
          placeholder="Nhập nội dung câu hỏi..."
        />

        {/* Khóa học */}
        <label className="qb-label">Khóa học *</label>
        <input
          type="text"
          className="qb-input"
          placeholder="VD: React Advanced"
        />

        {/* Loại */}

        <label className="qb-label">Loại câu hỏi *</label>
        <select
          className="qb-input"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="Trắc nghiệm">Trắc nghiệm</option>
          <option value="Tự luận">Tự luận</option>
        </select>

        {/* Đáp án nếu là trắc nghiệm */}
        {type === "Trắc nghiệm" && (
          <>
            <label className="qb-label">Các lựa chọn *</label>

            {options.map((op, index) => (
              <input
                key={index}
                type="text"
                className="qb-input"
                placeholder={`Đáp án ${index + 1}`}
                value={op}
                onChange={(e) => handleOptionChange(e.target.value, index)}
              />
            ))}

            <label className="qb-label">Đáp án đúng *</label>
            <input
              type="text"
              className="qb-input"
              placeholder="Nhập đáp án đúng"
            />
          </>
        )}

        {/* Giải thích */}
        <label className="qb-label">Giải thích</label>
        <textarea
          className="qb-textarea"
          placeholder="Nhập giải thích đáp án..."
        />

        {/* Buttons */}
        <div className="qb-actions">
          <button className="qb-btn cancel">Hủy</button>
          <button className="qb-btn submit">Lưu câu hỏi</button>
        </div>
      </div>
    </div>
  );
}
