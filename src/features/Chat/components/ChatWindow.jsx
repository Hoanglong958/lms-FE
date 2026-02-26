import React, { useState, useEffect, useRef } from "react";
import { Send, Image, Paperclip, MessageSquare } from "lucide-react";
import { chatService } from "@utils/chatService";
import ChatBubble from "./ChatBubble";

export default function ChatWindow({ room, currentUser }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const subscriptionRef = useRef(null);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (room) {
            loadMessages();
            subscribeToRoom();
        }
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
            }
        };
    }, [room]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadMessages = async () => {
        try {
            const res = await chatService.getMessages(room.id);
            setMessages(res.data.content.reverse() || []);
        } catch (err) {
            console.error("Failed to load messages", err);
        }
    };

    const subscribeToRoom = () => {
        if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
        }
        subscriptionRef.current = chatService.subscribeToRoom(room.id, (message) => {
            setMessages((prev) => {
                // 1. Check if this exact message (by ID) already exists
                if (message.id && prev.some((m) => m.id === message.id)) {
                    return prev;
                }

                // 2. Check if this is a reconciliation for an optimistic message
                // We match by sender, type, and content (or temporary identifier)
                const optimisticIndex = prev.findIndex(m =>
                    m.isOptimistic &&
                    m.senderId === message.senderId &&
                    m.type === message.type &&
                    (m.content === message.content || (m.type !== 'TEXT' && m.fileName === message.content))
                );

                if (optimisticIndex !== -1) {
                    const newMessages = [...prev];
                    newMessages[optimisticIndex] = message; // Replace with server version
                    return newMessages;
                }

                return [...prev, message];
            });
        });
    };

    const handleSend = () => {
        if (!inputText.trim() || isUploading) return;

        const messageData = {
            roomId: room.id,
            senderId: currentUser.id,
            content: inputText,
            type: "TEXT"
        };

        // Optimistic Update
        const optimisticMsg = {
            ...messageData,
            id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            isOptimistic: true
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setInputText("");

        chatService.sendMessage(messageData);
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file || isUploading) return;

        setIsUploading(true);
        // Optimistic Preview
        const previewUrl = type === 'image' ? URL.createObjectURL(file) : null;
        const optimisticMsg = {
            roomId: room.id,
            senderId: currentUser.id,
            content: file.name,
            fileName: file.name, // Helper for matching
            type: type === 'image' ? 'IMAGE' : 'FILE',
            fileUrl: previewUrl,
            id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            isOptimistic: true
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const res = await chatService.sendFile(room.id, currentUser.id, file);
            if (res.data) {
                setMessages((prev) => {
                    // 1. Check if the WebSocket message already arrived and replaced it
                    if (prev.some(m => m.id === res.data.id)) {
                        return prev.filter(m => m.id !== optimisticMsg.id);
                    }

                    // 2. Otherwise replace the specific optimistic message
                    const index = prev.findIndex(m => m.id === optimisticMsg.id);
                    if (index !== -1) {
                        const newMessages = [...prev];
                        newMessages[index] = res.data;
                        return newMessages;
                    }

                    return [...prev, res.data];
                });
            }
        } catch (err) {
            console.error("Failed to upload file", err);
            // Remove optimistic message on failure
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
            alert("Failed to upload file. Please try again.");
        } finally {
            setIsUploading(false);
            e.target.value = null; // Reset input
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const getRoomName = () => {
        if (!room) return "Conversation";
        if (room.type === "ONE_TO_ONE") {
            if (currentUser && room.members) {
                const other = room.members.find(m => m.userId !== currentUser.id);
                if (other) return other.user?.fullName || other.user?.username || "Chat Room";
            }
            return room.name || "Chat Room";
        }
        return room.name;
    };

    if (!room) {
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

            <div className="message-list">
                {messages.map((msg, index) => (
                    <ChatBubble
                        key={msg.id || index}
                        message={msg}
                        isMe={msg.senderId === currentUser.id}
                    />
                ))}
                <div ref={messagesEndRef} />
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
                        onChange={(e) => setInputText(e.target.value)}
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
