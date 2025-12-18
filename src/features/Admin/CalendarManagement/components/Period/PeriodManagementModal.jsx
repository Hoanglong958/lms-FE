// src/features/periods/PeriodManagementModal.jsx
import React, { useEffect, useState } from "react";
import { periodService } from "@utils/periodService";
import NotificationModal from "@components/NotificationModal/NotificationModal";
import "./PeriodManagementModal.css";

function toTimeObj(timeStr) {
  // timeStr like "08:30"
  const [h, m] = (timeStr || "").split(":").map((v) => Number(v));
  return {
    hour: Number.isFinite(h) ? h : 0,
    minute: Number.isFinite(m) ? m : 0,
    second: 0,
    nano: 0,
  };
}

function timeObjToString(t) {
  // t may be "08:00:00" or object; support both
  if (!t) return "";
  if (typeof t === "string") {
    const parts = t.split(":");
    if (parts.length >= 2)
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
    return t;
  }
  if (typeof t === "object") {
    const hh = String(t.hour ?? 0).padStart(2, "0");
    const mm = String(t.minute ?? 0).padStart(2, "0");
    return `${hh}:${mm}`;
  }
  return "";
}

export default function PeriodManagementModal({ onClose }) {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showNotification = (title, message, type = "info") => {
    setNotification({ isOpen: true, title, message, type });
  };

  // form state
  const [editing, setEditing] = useState(null); // null => create
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("10:00");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await periodService.getAll();
      // swagger example returns array at top-level; adapt:
      const data = res.data ?? [];
      setPeriods(
        Array.isArray(data) ? data : data?.data ?? data?.content ?? []
      );
    } catch (err) {
      console.error("Load periods failed", err);
      showNotification("Lỗi", "Không thể tải danh sách ca học", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setStartTime("08:00");
    setEndTime("10:00");
  };

  const openEdit = (p) => {
    setEditing(p);
    setName(p.name || "");
    setStartTime(timeObjToString(p.startTime));
    setEndTime(timeObjToString(p.endTime));
  };

  const validate = () => {
    if (!name.trim()) {
      showNotification("Thiếu thông tin", "Vui lòng nhập tên ca học", "warning");
      return false;
    }

    if (!startTime || !endTime) {
      showNotification("Thiếu thông tin", "Vui lòng chọn giờ bắt đầu và giờ kết thúc", "warning");
      return false;
    }
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const s = sh * 60 + sm;
    const e = eh * 60 + em;
    if (e <= s) {
      showNotification("Lỗi logic", "Giờ kết thúc phải lớn hơn giờ bắt đầu", "warning");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: name.trim(),
      startTime: `${startTime}:00`,
      endTime: `${endTime}:00`,
    };

    try {
      if (editing) {
        await periodService.update(editing.id, payload);
      } else {
        await periodService.create(payload);
      }
      await load();
      // reset form
      openCreate();
    } catch (err) {
      console.error("Save period failed", err);
      showNotification("Lỗi", "Lỗi khi lưu ca học", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa ca học này?")) return;
    try {
      await periodService.delete(id);
      await load();
    } catch (err) {
      console.error("Delete failed", err);
      showNotification("Lỗi", "Không thể xóa ca học", "error");
    }
  };

  return (
    <div className="period-modal-backdrop" role="dialog" aria-modal="true">
      <div className="period-modal">
        <div className="period-modal-header">
          <h3>Quản lý ca học</h3>
          <div>
            <button className="btn ghost" onClick={onClose} aria-label="Đóng">
              ×
            </button>
          </div>
        </div>

        <div className="period-modal-body">
          <div className="period-left">
            <div className="period-list-header">
              <h4>Danh sách ca học</h4>
              <button className="btn primary" onClick={openCreate}>
                + Thêm
              </button>
            </div>

            {loading ? (
              <p>Đang tải...</p>
            ) : (
              <ul className="period-list">
                {periods.length === 0 && (
                  <li className="muted">Chưa có ca học</li>
                )}
                {periods.map((p) => (
                  <li key={p.id} className="period-item">
                    <div>
                      <div className="period-name">{p.name}</div>
                      <div className="period-time">
                        {timeObjToString(p.startTime)} —{" "}
                        {timeObjToString(p.endTime)}
                      </div>
                    </div>
                    <div className="period-actions">
                      <button className="btn sm" onClick={() => openEdit(p)}>
                        Sửa
                      </button>
                      <button
                        className="btn danger sm"
                        onClick={() => handleDelete(p.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="period-form">
            <h4>{editing ? "Sửa ca học" : "Tạo ca học mới"}</h4>

            <label className="label">
              Tên ca
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label className="label">
              Giờ bắt đầu
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </label>

            <label className="label">
              Giờ kết thúc
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </label>

            <div className="form-actions">
              <button className="btn" onClick={openCreate}>
                Reset
              </button>
              <button
                className="btn primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Tạo"}
              </button>
            </div>
          </div>
        </div>

        <div className="period-modal-footer">
          <button className="btn ghost" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
    </div >
  );
}
