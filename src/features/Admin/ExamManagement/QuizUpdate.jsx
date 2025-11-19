import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./QuizUpdate.css";
import { quizService } from "@utils/quizService.js";

export default function QuizUpdate() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState({
    id: null,
    name: "",
    course: "",
    description: "",
    date: "",
    duration: "",
    passScore: "",
    status: "Hoạt động",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await quizService.getQuiz(quizId);
        const q = res.data?.data || res.data;
        setQuiz({
          id: q?.id ?? quizId,
          name: q?.name ?? "",
          course: q?.course ?? "",
          description: q?.description ?? "",
          date: q?.date ?? q?.openDate ?? "",
          duration: q?.duration ?? "",
          passScore: q?.passScore ?? "",
          status: q?.status ?? "Hoạt động",
        });
      } catch (e) {
        navigate("/admin/quiz");
      }
    };
    load();
  }, [quizId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuiz({
      ...quiz,
      [name]: name === "duration" || name === "passScore" ? Number(value) : value,
    });
  };

  const handleUpdate = async () => {
    try {
      const payload = { ...quiz };
      await quizService.updateQuiz(quizId, payload);
      alert(`Cập nhật quiz ID ${quizId} thành công!`);
      navigate("/admin/quiz");
    } catch (e) {
      alert("Cập nhật quiz thất bại");
    }
  };

  return (
    <div className="quiz-update-container">
      <h2>✏️ Cập nhật Quiz</h2>
      <p className="quiz-id">ID Quiz: {quizId}</p>

      <label>Tên Quiz</label>
      <input name="name" value={quiz.name} onChange={handleChange} />

      <label>Khóa học</label>
      <input name="course" value={quiz.course} onChange={handleChange} />

      <label>Mô tả</label>
      <input name="description" value={quiz.description} onChange={handleChange} />

      <label>Ngày mở</label>
      <input type="date" name="date" value={quiz.date} onChange={handleChange} />

      <label>Thời gian (phút)</label>
      <input name="duration" value={quiz.duration} onChange={handleChange} />

      <label>Điểm đậu</label>
      <input name="passScore" value={quiz.passScore} onChange={handleChange} />

      <label>Trạng thái</label>
      <select name="status" value={quiz.status} onChange={handleChange}>
        <option value="Hoạt động">Hoạt động</option>
        <option value="Không hoạt động">Không hoạt động</option>
      </select>

      <div className="quiz-update-actions">
        <button className="btn-save" onClick={handleUpdate}>💾 Lưu cập nhật</button>
        <button className="btn-cancel" onClick={() => navigate("/admin/quiz")}>❌ Hủy</button>
      </div>
    </div>
  );
}
