import React, { useEffect, useState } from "react";
import { lessonDocumentService } from "@utils/lessonDocumentService";
import "./DocumentViewer.css";

const DocumentViewer = ({ item }) => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!item?.id) {
      setLoading(false);
      return;
    }

    const fetchDocument = async () => {
      try {
        // Fetch document theo lessonId giống như Admin
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
    </div>
  );
};

export default DocumentViewer;