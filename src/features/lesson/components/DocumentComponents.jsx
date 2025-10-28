import React from "react";
import "./DocumentComponents.css";

const DocumentComponents = ({ item }) => {
  const createMarkup = () => {
    return { __html: item.content };
  };

  return (
    <div className="document-components-wrapper">
      <h1 className="document-title">{item.title}</h1>
      <span className="document-date">24 tháng 6 năm 2023</span>
      <div
        className="document-content"
        dangerouslySetInnerHTML={createMarkup()}
      />
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt="Nội dung bài học"
          className="document-image"
        />
      )}
    </div>
  );
};

export default DocumentComponents;
