import React, { useEffect, useState, useRef } from "react";
import { lessonDocumentService } from "@utils/lessonDocumentService";
import { userProgressService } from "@utils/userProgressService";
import "./DocumentViewer.css";
import { SERVER_URL } from "@config";

const DocumentViewer = ({ item }) => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const timerRef = useRef(null);

  // Get current user
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    } catch {
      return {};
    }
  })();

  const handleComplete = async () => {
    if (isCompleted) return;
    if (!user.id || !item?.id) return;

    try {
      await userProgressService.saveLessonProgress({
        userId: user.id,
        lessonId: item.id,
        sessionId: item.sessionId || 0,
        courseId: item.courseId || 0,
        type: "document",
        status: "COMPLETED",
        progressPercent: 100
      });
      setIsCompleted(true);
      // console.log("Document progress saved");
    } catch (e) {
      console.error("Failed to save document progress", e);
    }
  };

  useEffect(() => {
    if (!item?.id) {
      setLoading(false);
      return;
    }

    const fetchDocument = async () => {
      try {
        const res = await lessonDocumentService.getDocumentsByLesson(item.id);
        const documents = res.data || [];
        if (documents.length > 0) {
          setDocument(documents[0]);
        }
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [item.id]);

  // Timer: 10 seconds to auto-complete
  useEffect(() => {
    if (!document) return;
    timerRef.current = setTimeout(() => {
      handleComplete();
    }, 10000); // 10s

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [document]); // Depend on document load

  // Scroll detection (window)
  useEffect(() => {
    const onScroll = () => {
      if (isCompleted) return;
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
        handleComplete();
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isCompleted, document]);


  if (loading) {
    return (
      <div className="document-components-wrapper">Đang tải tài liệu...</div>
    );
  }

  if (!document) {
    return <div className="document-components-wrapper">Chưa có tài liệu</div>;
  }

  const createMarkup = () => {
    return { __html: document.content || item.content || "" };
  };

  return (
    <div className="document-components-wrapper">
      <h1 className="document-title">{document.title || item.title}</h1>
      <span className="document-date">
        {document.createdAt
          ? new Date(document.createdAt).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
          : "24 tháng 6 năm 2023"}
      </span>
      <div
        className="document-content"
        dangerouslySetInnerHTML={createMarkup()}
      />
      {document.imageUrl && (
        <img
          src={document.imageUrl}
          alt={document.title || "Nội dung bài học"}
          className="document-image"
        />
      )}
      {!document.imageUrl && item.img1 && (
        <img
          src={item.img1}
          alt="Nội dung bài học"
          className="document-image"
        />
      )}

      {document.pdfUrl && (
        <div className="document-pdf-container">
          <div className="document-pdf-icon">📄</div>
          <div className="document-pdf-info">
            <div className="document-pdf-title">Tài liệu đính kèm</div>
            <a
              href={document.pdfUrl.startsWith("/") ? `${SERVER_URL}${document.pdfUrl}` : document.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="document-pdf-link"
            >
              📥 Tải xuống PDF
            </a>
          </div>
        </div>
      )}



    </div>
  );
};

export default DocumentViewer;