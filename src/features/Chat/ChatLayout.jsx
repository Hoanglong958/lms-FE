import React, { useState, useEffect } from "react";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import { chatService } from "@utils/chatService";
import "./Chat.css";

export default function ChatLayout() {
    const [currentUser, setCurrentUser] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userJson = localStorage.getItem("loggedInUser");
        if (userJson) {
            const user = JSON.parse(userJson);
            setCurrentUser(user);
            loadRooms(user.id);
            chatService.connect((notification) => {
                if (notification.type === "CHAT") {
                    loadRooms(user.id);
                    window.dispatchEvent(new Event('chat-unread-updated'));
                }
            }, user.id);

            const handleChatRead = () => {
                loadRooms(user.id);
            };
            window.addEventListener('chat-read', handleChatRead);

            return () => {
                chatService.disconnect();
                window.removeEventListener('chat-read', handleChatRead);
            };
        }
        return () => chatService.disconnect();
    }, []);

    const loadRooms = async (userId) => {
        try {
            const res = await chatService.getRooms(userId);
            setRooms(res.data || []);
        } catch (err) {
            console.error("Failed to load rooms", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRoom = (room) => {
        setSelectedRoom(room);
    };

    if (loading) return <div className="chat-loading">Loading conversations...</div>;

    return (
        <div className="chat-layout">
            <ChatSidebar
                rooms={rooms}
                selectedRoom={selectedRoom}
                onSelectRoom={handleSelectRoom}
                currentUser={currentUser}
            />
            <ChatWindow
                room={selectedRoom}
                currentUser={currentUser}
            />
        </div>
    );
}
