import React from "react";
import dayjs from "dayjs";

export default function ChatBubble({ message, isMe }) {
    return (
        <div className={`message-bubble-wrapper ${isMe ? "sent" : "received"}`}>
            <div className="message-bubble">
                <div className="message-content">{message.content}</div>
                <span className="message-time">
                    {dayjs(message.createdAt).format("HH:mm")}
                </span>
            </div>
        </div>
    );
}
