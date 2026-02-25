import React from "react";
import dayjs from "dayjs";

export default function ChatBubble({ message, isMe }) {
    const renderContent = () => {
        if (message.type === "IMAGE") {
            return (
                <div className="message-image-container">
                    <img src={message.fileUrl} alt="Sent" className="message-image" />
                </div>
            );
        }
        if (message.type === "FILE") {
            return (
                <div className="message-file-container">
                    <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="message-file-link">
                        <span className="file-name">{message.content}</span>
                        <span className="file-hint">Click to download</span>
                    </a>
                </div>
            );
        }
        return <div className="message-content">{message.content}</div>;
    };

    return (
        <div className={`message-bubble-wrapper ${isMe ? "sent" : "received"}`}>
            <div className="message-bubble">
                {renderContent()}
                <span className="message-time">
                    {dayjs(message.createdAt).format("HH:mm")}
                </span>
            </div>
        </div>
    );
}
