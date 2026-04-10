import React, { useState } from "react";
import dayjs from "dayjs";
import { MoreHorizontal, RotateCcw } from "lucide-react";

export default function ChatBubble({
    message,
    isMe,
    currentUserId,
    onRevoke,
    isRevoking,
}) {
    const [showMenu, setShowMenu] = useState(false);

    const renderContent = () => {
        if (message.isDeleted) {
            return (
                <div className="bubble-revoked">
                    <RotateCcw size={12} />
                    <span>Tin nhắn đã được thu hồi</span>
                </div>
            );
        }
        if (message.type === "IMAGE") {
            return (
                <div className="bubble-image-wrap">
                    <img src={message.fileUrl} alt="Sent" className="bubble-image" />
                </div>
            );
        }
        if (message.type === "FILE") {
            return (
                <a
                    href={message.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bubble-file"
                >
                    <div className="bubble-file-icon">📎</div>
                    <div className="bubble-file-info">
                        <span className="bubble-file-name">{message.content}</span>
                        <span className="bubble-file-hint">Nhấn để tải xuống</span>
                    </div>
                </a>
            );
        }
        return <p className="bubble-text">{message.content}</p>;
    };

    const hasPartnerRead = message.readReceipts?.some(
        (r) => String(r.userId) !== String(currentUserId)
    );

    const statusIcon = message.isDeleted ? null
        : message.isOptimistic ? (
            <span className="bubble-status bubble-status--sending">Đang gửi</span>
        ) : isMe ? (
            hasPartnerRead
                ? <span className="bubble-status bubble-status--read">✓✓ Đã đọc</span>
                : <span className="bubble-status bubble-status--sent">✓ Đã gửi</span>
        ) : null;

    const canRevoke = isMe && onRevoke && !message.isDeleted && !message.isOptimistic;

    return (
        <div
            className={`bubble-row ${isMe ? "bubble-row--me" : "bubble-row--them"} ${message.isOptimistic ? "bubble-row--optimistic" : ""}`}
            onMouseLeave={() => setShowMenu(false)}
        >
            {canRevoke && (
                <div className="bubble-actions">
                    <button
                        className="bubble-more-btn"
                        onClick={() => setShowMenu((v) => !v)}
                    >
                        <MoreHorizontal size={15} />
                    </button>
                    {showMenu && (
                        <div className="bubble-menu">
                            <button
                                className="bubble-menu-item bubble-menu-item--danger"
                                onClick={() => { onRevoke(); setShowMenu(false); }}
                                disabled={isRevoking}
                            >
                                {isRevoking ? "Đang thu hồi..." : "Thu hồi tin nhắn"}
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="bubble-pill">
                {renderContent()}
                {!message.isDeleted && (
                    <div className="bubble-meta">
                        <span className="bubble-time">
                            {message.createdAt ? dayjs(message.createdAt).format("HH:mm") : "..."}
                        </span>
                        {statusIcon}
                    </div>
                )}
            </div>
        </div>
    );
}