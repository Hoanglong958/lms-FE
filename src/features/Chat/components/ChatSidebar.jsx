import React, { useState, useEffect } from "react";
import { Search, Plus, X, UserPlus, Loader2 } from "lucide-react";
import { userService } from "@utils/userService";
import { chatService } from "@utils/chatService";

export default function ChatSidebar({ rooms, selectedRoom, onSelectRoom, currentUser }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const filteredRooms = rooms.filter(room => {
        const name = room.name || "Conversation";
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const getRoomName = (room) => {
        if (room.type === "ONE_TO_ONE") {
            // Find the other member
            if (currentUser && room.members) {
                const other = room.members.find(m => m.userId !== currentUser.id);
                if (other) return other.fullName || other.username;
            }
            return room.name || "Chat Room";
        }
        return room.name;
    };

    // User Search Logic
    useEffect(() => {
        if (!userSearchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await userService.getAllUsers({ keyword: userSearchTerm, size: 10 });
                // Handle various response structures
                const data = res.data?.data?.content || res.data?.content || res.data?.data || res.data || [];
                // Filter out current user
                setSearchResults(data.filter(u => u.id !== currentUser?.id));
            } catch (err) {
                console.error("User search failed", err);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [userSearchTerm, currentUser]);

    const handleStartChat = async (targetUser) => {
        try {
            const res = await chatService.getOrCreateOneToOne(currentUser.id, targetUser.id);
            const newRoom = res.data;
            onSelectRoom(newRoom);
            setShowSearchModal(false);
            setUserSearchTerm("");
            setSearchResults([]);
        } catch (err) {
            alert("Failed to start chat session");
        }
    };

    return (
        <div className="chat-sidebar">
            <div className="chat-sidebar-header">
                <h2>Chats</h2>
                <button
                    className="icon-btn"
                    title="Find people"
                    onClick={() => setShowSearchModal(true)}
                >
                    <UserPlus size={20} />
                </button>
            </div>

            <div className="chat-search">
                <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="conversation-list">
                {filteredRooms.length > 0 ? (
                    filteredRooms.map((room) => (
                        <div
                            key={room.id}
                            className={`conversation-item ${selectedRoom?.id === room.id ? "active" : ""}`}
                            onClick={() => onSelectRoom(room)}
                        >
                            <img
                                src={room.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(getRoomName(room))}&background=random`}
                                alt="Avatar"
                                className="conversation-avatar"
                            />
                            <div className="conversation-info">
                                <div className="conversation-top">
                                    <span className="conversation-name">{getRoomName(room)}</span>
                                    <span className="conversation-time">
                                        {room.lastMessageAt ? new Date(room.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                    </span>
                                </div>
                                <div className="conversation-last-msg">
                                    {room.lastMessage || "No messages yet"}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-rooms">No conversations found</div>
                )}
            </div>

            {/* User Search Modal */}
            {showSearchModal && (
                <div className="user-search-modal-overlay">
                    <div className="user-search-modal">
                        <div className="user-search-header">
                            <h3>Find Users</h3>
                            <button onClick={() => setShowSearchModal(false)}><X size={20} /></button>
                        </div>
                        <div className="user-search-input-wrapper">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                placeholder="Enter name or email..."
                                value={userSearchTerm}
                                onChange={(e) => setUserSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="user-search-results">
                            {isSearching ? (
                                <div className="search-status"><Loader2 className="animate-spin" /> Searching...</div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map(user => (
                                    <div key={user.id} className="user-result-item" onClick={() => handleStartChat(user)}>
                                        <div className="user-result-avatar">
                                            {(user.fullName || user.username || "?").charAt(0).toUpperCase()}
                                        </div>
                                        <div className="user-result-info">
                                            <div className="user-result-name">{user.fullName || user.username}</div>
                                            <div className="user-result-role">{user.role || (user.roles?.[0]?.name) || "User"}</div>
                                        </div>
                                        <button className="start-chat-btn">Message</button>
                                    </div>
                                ))
                            ) : userSearchTerm.trim() ? (
                                <div className="search-status">No users found</div>
                            ) : (
                                <div className="search-status">Start typing to find accounts</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
