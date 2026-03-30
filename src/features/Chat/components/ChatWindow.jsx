import React, { useState, useEffect, useRef } from "react";
import { Send, Image, Paperclip, MessageSquare } from "lucide-react";
import { chatService } from "@utils/chatService";
import ChatBubble from "./ChatBubble";

const TYPING_THROTTLE_MS = 2000;
const TYPING_INDICATOR_DURATION = 2500;

export default function ChatWindow({ room, currentUser }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [isPartnerTyping, setIsPartnerTyping] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [revokingMessageId, setRevokingMessageId] = useState(null);

    const messageListRef = useRef(null);
    const messageSubscriptionRef = useRef(null);
    const typingSubscriptionRef = useRef(null);
    const readReceiptSubscriptionRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const lastTypingSentRef = useRef(0);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const isRoomChangeRef = useRef(false);

    const normalizeMessage = (msg) => ({
        ...msg,
        readReceipts: msg?.readReceipts || [],
    });

    const cleanupSubscriptions = () => {
        messageSubscriptionRef.current?.unsubscribe();
        typingSubscriptionRef.current?.unsubscribe();
        readReceiptSubscriptionRef.current?.unsubscribe();
    };

    useEffect(() => {
        if (!room || !currentUser) {
            cleanupSubscriptions();
            setIsPartnerTyping(false);
            return () => {};
        }

        isRoomChangeRef.current = true;
        loadMessages();
        subscribeToRoom();
        subscribeToTyping();
        subscribeToReadReceipts();
        markAsRead();

        return () => {
            cleanupSubscriptions();
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            setIsPartnerTyping(false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [room, currentUser]);

    useEffect(() => {
        if (!isRoomChangeRef.current) {
            scrollToBottom("smooth");
        }
    }, [messages]);

    const markAsRead = async () => {
        try {
            await chatService.markRead(room.id, currentUser.id);
            window.dispatchEvent(new Event("chat-read"));
        } catch (err) {
            console.error("Failed to mark messages as read", err);
        }
    };

    const scrollToBottom = (behavior = "smooth") => {
        const list = messageListRef.current;
        if (!list) return;
        list.scrollTo({ top: list.scrollHeight, behavior });
    };

    const loadMessages = async () => {
        try {
            const res = await chatService.getMessages(room.id);
            const payload = res?.data?.content || [];
            const normalized = [...payload].reverse().map(normalizeMessage);
            setMessages(normalized);
            setTimeout(() => {
                scrollToBottom("instant");
                isRoomChangeRef.current = false;
            }, 0);
        } catch (err) {
            console.error("Failed to load messages", err);
            isRoomChangeRef.current = false;
        }
    };

    const subscribeToRoom = () => {
        if (!room) return;
        if (messageSubscriptionRef.current) {
            messageSubscriptionRef.current.unsubscribe();
        }
        messageSubscriptionRef.current = chatService.subscribeToRoom(room.id, (incoming) => {
            const message = normalizeMessage(incoming);
            setMessages((prev) => {
                if (message.id) {
                    const existingIndex = prev.findIndex((m) => m.id === message.id);
                    if (existingIndex !== -1) {
                        const updated = [...prev];
                        updated[existingIndex] = {
                            ...prev[existingIndex],
                            ...message,
                            readReceipts: message.readReceipts.length
                                ? message.readReceipts
                                : prev[existingIndex].readReceipts,
                        };
                        return updated;
                    }
                }

                const optimisticIndex = prev.findIndex((m) =>
                    m.isOptimistic &&
                    m.senderId === message.senderId &&
                    m.type === message.type &&
                    (m.content === message.content || (m.type !== "TEXT" && m.fileName === message.content))
                );

                if (optimisticIndex !== -1) {
                    const updated = [...prev];
                    updated[optimisticIndex] = message;
                    return updated;
                }

                return [...prev, message];
            });
        });
    };

    const handleReadReceipt = (payload) => {
        if (!payload || !payload.roomId || !payload.messageIds?.length) {
            return;
        }
        if (!room || String(payload.roomId) !== String(room.id)) {
            return;
        }
        const messageIds = payload.messageIds.map((id) => String(id));
        setMessages((prev) =>
            prev.map((msg) => {
                if (!msg.id || !messageIds.includes(String(msg.id))) {
                    return msg;
                }
                const existing = msg.readReceipts || [];
                if (existing.some((receipt) => String(receipt.userId) === String(payload.readerId))) {
                    return msg;
                }
                return {
                    ...msg,
                    readReceipts: [
                        ...existing,
                        {
                            id: `${msg.id}-receipt-${payload.readerId}-${existing.length}`,
                            userId: payload.readerId,
                            readAt: new Date().toISOString(),
                        },
                    ],
                };
            })
        );
    };

    const subscribeToReadReceipts = () => {
        if (!room) return;
        if (readReceiptSubscriptionRef.current) {
            readReceiptSubscriptionRef.current.unsubscribe();
        }
        readReceiptSubscriptionRef.current = chatService.subscribeToReadReceipts(room.id, handleReadReceipt);
    };

    const subscribeToTyping = () => {
        if (!room || !currentUser) return;
        if (typingSubscriptionRef.current) {
            typingSubscriptionRef.current.unsubscribe();
        }
        typingSubscriptionRef.current = chatService.subscribeToTyping(room.id, (body) => {
            const senderId = Number(body);
            if (!senderId || senderId === currentUser.id) return;
            setIsPartnerTyping(true);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => setIsPartnerTyping(false), TYPING_INDICATOR_DURATION);
        });
    };

    const handleTyping = () => {
        if (!room || !currentUser) return;
        const now = Date.now();
        if (now - lastTypingSentRef.current > TYPING_THROTTLE_MS) {
            chatService.sendTyping(room.id, currentUser.id);
            lastTypingSentRef.current = now;
        }
    };

    const handleSend = () => {
        if (!inputText.trim() || isUploading) return;
        if (!room || !currentUser) return;

        const messageData = {
            roomId: room.id,
            senderId: currentUser.id,
            content: inputText,
            type: "TEXT",
        };

        const optimisticMsg = {
            ...messageData,
            id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            isOptimistic: true,
            readReceipts: [],
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        setInputText("");

        chatService.sendMessage(messageData);
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file || isUploading || !room || !currentUser) return;

        setIsUploading(true);
        const previewUrl = type === "image" ? URL.createObjectURL(file) : null;
        const optimisticMsg = {
            roomId: room.id,
            senderId: currentUser.id,
            content: file.name,
            fileName: file.name,
            type: type === "image" ? "IMAGE" : "FILE",
            fileUrl: previewUrl,
            id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            isOptimistic: true,
            readReceipts: [],
        };
        setMessages((prev) => [...prev, optimisticMsg]);

        try {
            const res = await chatService.sendFile(room.id, currentUser.id, file);
            if (res.data) {
                const serverMessage = normalizeMessage(res.data);
                setMessages((prev) => {
                    if (prev.some((m) => m.id === serverMessage.id)) {
                        return prev.filter((m) => m.id !== optimisticMsg.id);
                    }
                    const index = prev.findIndex((m) => m.id === optimisticMsg.id);
                    if (index !== -1) {
                        const updated = [...prev];
                        updated[index] = serverMessage;
                        return updated;
                    }
                    return [...prev, serverMessage];
                });
            }
        } catch (err) {
            console.error("Failed to upload file", err);
            setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
            alert("Failed to upload file. Please try again.");
        } finally {
            setIsUploading(false);
            e.target.value = null;
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleRevokeMessage = async (message) => {
        if (!message?.id || !currentUser) return;
        setRevokingMessageId(message.id);
        try {
            await chatService.deleteMessage(message.id, currentUser.id);
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === message.id
                        ? { ...m, isDeleted: true, content: "" }
                        : m
                )
            );
        } catch (err) {
            console.error("Failed to revoke message", err);
            const serverMessage =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message;
            alert(
                `Không thể thu hồi tin nhắn. ${
                    serverMessage || "Vui lòng thử lại."
                }`
            );
        } finally {
            setRevokingMessageId(null);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputText(value);
        handleTyping();
    };

    const getRoomName = () => {
        if (!room) return "Conversation";
        if (room.type === "ONE_TO_ONE") {
            if (currentUser && room.members) {
                const other = room.members.find((m) => m.userId !== currentUser.id);
                if (other) return other.user?.fullName || other.user?.username || "Chat Room";
            }
            return room.name || "Chat Room";
        }
        return room.name;
    };

    if (!room || !currentUser) {
        return (
            <div className="chat-window-empty">
                <MessageSquare size={64} />
                <p>Select a conversation to start chatting</p>
            </div>
        );
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <img
                    src={room.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(getRoomName())}&background=random`}
                    alt="Avatar"
                    className="conversation-avatar"
                    style={{ width: "40px", height: "40px" }}
                />
                <div className="chat-header-info">
                    <div className="chat-header-name">{getRoomName()}</div>
                    <div className="chat-header-status">Online</div>
                </div>
            </div>

            <div className="message-list" ref={messageListRef}>
                {isPartnerTyping && <div className="typing-indicator">Đang gõ...</div>}
                {messages.map((msg, index) => (
                    <ChatBubble
                        key={msg.id || index}
                        message={msg}
                        isMe={msg.senderId === currentUser.id}
                        currentUserId={currentUser.id}
                        onRevoke={
                            msg.senderId === currentUser.id && !msg.isDeleted
                                ? () => handleRevokeMessage(msg)
                                : undefined
                        }
                        isRevoking={revokingMessageId === msg.id}
                    />
                ))}
            </div>

            <div className="chat-input-area">
                <div className="chat-input-wrapper">
                    <input
                        type="file"
                        ref={imageInputRef}
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "image")}
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={(e) => handleFileUpload(e, "file")}
                    />
                    <button
                        className="icon-btn"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        <Image size={20} />
                    </button>
                    <button
                        className="icon-btn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        <Paperclip size={20} />
                    </button>
                    <input
                        type="text"
                        className="chat-input"
                        placeholder={isUploading ? "Uploading..." : "Type a message..."}
                        value={inputText}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        disabled={isUploading}
                    />
                    <button
                        className="chat-send-btn"
                        onClick={handleSend}
                        disabled={!inputText.trim() || isUploading}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
