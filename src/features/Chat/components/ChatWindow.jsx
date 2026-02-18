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
            setMessages((prev) => [...prev, message]);
        });
    };

    const handleSend = () => {
        if (!inputText.trim()) return;

        const messageData = {
            roomId: room.id,
            senderId: currentUser.id,
            content: inputText,
            type: "TEXT"
        };

        chatService.sendMessage(messageData);
        setInputText("");
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
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
                    src={room.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.name || "Room")}&background=random`}
                    alt="Avatar"
                    className="conversation-avatar"
                    style={{ width: "40px", height: "40px" }}
                />
                <div className="chat-header-info">
                    <div className="chat-header-name">{room.name || "Conversation"}</div>
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
                    <button className="icon-btn"><Image size={20} /></button>
                    <button className="icon-btn"><Paperclip size={20} /></button>
                    <input
                        type="text"
                        className="chat-input"
                        placeholder="Type a message..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button
                        className="chat-send-btn"
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
