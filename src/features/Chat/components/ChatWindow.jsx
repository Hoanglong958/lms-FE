import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Settings, Search, X, Image, Paperclip, Send } from "lucide-react";
import { chatService } from "@utils/chatService";
import { SERVER_URL } from "@config";
import ChatBubble from "./ChatBubble";

const TYPING_THROTTLE_MS = 2000;
const TYPING_INDICATOR_DURATION = 2500;

export default function ChatWindow({ room, currentUser }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [isPartnerTyping, setIsPartnerTyping] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [revokingMessageId, setRevokingMessageId] = useState(null);

    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const [toolsTab, setToolsTab] = useState("images");
    const [images, setImages] = useState([]);
    const [files, setFiles] = useState([]);
    const [imagesPage, setImagesPage] = useState(0);
    const [filesPage, setFilesPage] = useState(0);
    const [imagesHasMore, setImagesHasMore] = useState(true);
    const [filesHasMore, setFilesHasMore] = useState(true);
    const [attachmentsLoading, setAttachmentsLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [highlightMessageId, setHighlightMessageId] = useState(null);

    const historyPageRef = useRef(0);
    const historyHasMoreRef = useRef(true);
    const isHistoryLoadingRef = useRef(false);

    const messageListRef = useRef(null);
    const messageNodeMapRef = useRef(new Map());
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
        resetRoomState();
        loadMessagesFirstPage();
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

    const scrollToMessage = (messageId) => {
        const node = messageNodeMapRef.current.get(String(messageId));
        if (!node) return false;

        node.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightMessageId(String(messageId));
        window.setTimeout(() => {
            setHighlightMessageId((prev) => (prev === String(messageId) ? null : prev));
        }, 2500);
        return true;
    };

    const resetRoomState = () => {
        setMessages([]);
        historyPageRef.current = 0;
        historyHasMoreRef.current = true;
        isHistoryLoadingRef.current = false;

        setIsToolsOpen(false);
        setToolsTab("images");
        setImages([]);
        setFiles([]);
        setImagesPage(0);
        setFilesPage(0);
        setImagesHasMore(true);
        setFilesHasMore(true);
        setSearchKeyword("");
        setSearchResults([]);
        setHighlightMessageId(null);
    };

    const loadMessagesFirstPage = async () => {
        try {
            const res = await chatService.getMessages(room.id, 0, 30);
            const pageData = res?.data;
            const payload = pageData?.content || [];
            const normalized = [...payload].reverse().map(normalizeMessage);
            setMessages(normalized);
            historyPageRef.current = 0;
            historyHasMoreRef.current = !!pageData && !pageData.last;
            setTimeout(() => {
                scrollToBottom("instant");
                isRoomChangeRef.current = false;
            }, 0);
        } catch (err) {
            console.error("Failed to load messages", err);
            isRoomChangeRef.current = false;
        }
    };

    const loadOlderMessages = async () => {
        if (!room) return false;
        if (!historyHasMoreRef.current || isHistoryLoadingRef.current) return false;

        isHistoryLoadingRef.current = true;
        const nextPage = historyPageRef.current + 1;
        try {
            const list = messageListRef.current;
            const previousScrollHeight = list?.scrollHeight || 0;
            const previousScrollTop = list?.scrollTop || 0;

            const res = await chatService.getMessages(room.id, nextPage, 30);
            const pageData = res?.data;
            const payload = pageData?.content || [];
            const normalized = [...payload].reverse().map(normalizeMessage);

            setMessages((prev) => {
                const existingIds = new Set(prev.filter((m) => m.id).map((m) => String(m.id)));
                const merged = normalized.filter((m) => !m.id || !existingIds.has(String(m.id)));
                return [...merged, ...prev];
            });

            historyPageRef.current = nextPage;
            historyHasMoreRef.current = !!pageData && !pageData.last;

            window.setTimeout(() => {
                const newScrollHeight = list?.scrollHeight || 0;
                if (list) {
                    list.scrollTop = previousScrollTop + (newScrollHeight - previousScrollHeight);
                }
            }, 0);

            return normalized.length > 0;
        } catch (err) {
            console.error("Failed to load older messages", err);
            return false;
        } finally {
            isHistoryLoadingRef.current = false;
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

    const openTools = async (tab) => {
        setIsToolsOpen(true);
        if (tab) setToolsTab(tab);
        if (tab === "images" || !tab) {
            await loadAttachments("IMAGE", true);
        }
        if (tab === "files") {
            await loadAttachments("FILE", true);
        }
    };

    const loadAttachments = async (type, reset = false) => {
        if (!room || attachmentsLoading) return;

        if (type === "IMAGE" && !reset && !imagesHasMore) return;
        if (type === "FILE" && !reset && !filesHasMore) return;

        setAttachmentsLoading(true);
        try {
            const page = type === "IMAGE" ? (reset ? 0 : imagesPage) : (reset ? 0 : filesPage);
            console.log("[loadAttachments] roomId", room.id, "type", type, "page", page);
            const res = await chatService.getAttachments(room.id, type, page, 30);
            console.log("[loadAttachments] response", res);
            const pageData = res?.data;
            const payload = pageData?.content || [];
            const normalized = payload.map(normalizeMessage);
            console.log("[loadAttachments] normalized", normalized);
            if (type === "IMAGE") {
                setImages((prev) => (reset ? normalized : [...prev, ...normalized]));
                setImagesPage(page + 1);
                setImagesHasMore(!!pageData && !pageData.last);
            } else {
                setFiles((prev) => (reset ? normalized : [...prev, ...normalized]));
                setFilesPage(page + 1);
                setFilesHasMore(!!pageData && !pageData.last);
            }
        } catch (err) {
            console.error("Failed to load attachments", err);
        } finally {
            setAttachmentsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!room) return;
        const keyword = searchKeyword.trim();
        if (!keyword) {
            setSearchResults([]);
            return;
        }
        setSearchLoading(true);
        try {
            const res = await chatService.searchMessages(room.id, keyword, 0, 50);
            const pageData = res?.data;
            const payload = pageData?.content || [];
            const normalized = payload.map(normalizeMessage);
            setSearchResults(normalized);
        } catch (err) {
            console.error("Search messages failed", err);
        } finally {
            setSearchLoading(false);
        }
    };

    const ensureMessageLoadedAndScroll = async (messageId) => {
        if (!messageId) return;
        const targetId = String(messageId);
        if (messages.some((m) => m.id && String(m.id) === targetId)) {
            window.setTimeout(() => scrollToMessage(targetId), 0);
            return;
        }

        let attempts = 0;
        while (attempts < 12) {
            attempts += 1;
            const loaded = await loadOlderMessages();
            if (!loaded) break;

            // Wait one tick for React to render newly prepended messages
            await new Promise((resolve) => window.setTimeout(resolve, 0));

            const found = messageNodeMapRef.current.has(targetId);
            if (found) {
                window.setTimeout(() => scrollToMessage(targetId), 0);
                return;
            }
        }

        window.setTimeout(() => scrollToBottom("smooth"), 0);
    };

    const handleMessageListScroll = async (e) => {
        if (!historyHasMoreRef.current) return;
        const el = e.currentTarget;
        if (el.scrollTop <= 30) {
            await loadOlderMessages();
        }
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

    const getRoomAvatar = () => {
        let path = room.avatar;
        let name = getRoomName();
        if (room.type === "ONE_TO_ONE" && currentUser && room.members) {
            const other = room.members.find((m) => m.userId !== currentUser.id);
            if (other && other.user?.avatar) {
                path = other.user.avatar;
            }
        }
        
        if (!path) {
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
        }
        if (path.startsWith("http") || path.startsWith("blob:")) return path;
        return `${SERVER_URL}${path}`;
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
        <div className={isToolsOpen ? "chat-window with-tools" : "chat-window"}>
            <div className="chat-header">
                <img
                    src={getRoomAvatar()}
                    alt="Avatar"
                    className="conversation-avatar"
                    style={{ width: "40px", height: "40px" }}
                />
                <div className="chat-header-info">
                    <div className="chat-header-name">{getRoomName()}</div>
                    <div className="chat-header-status">Online</div>
                </div>

                <div className="chat-header-actions">
                    <button
                        className="icon-btn"
                        onClick={() => {
                            if (isToolsOpen) {
                                setIsToolsOpen(false);
                                return;
                            }
                            openTools("images");
                        }}
                        title="Công cụ"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            <div className="message-list" ref={messageListRef} onScroll={handleMessageListScroll}>
                {isPartnerTyping && <div className="typing-indicator">Đang gõ...</div>}
                {messages.map((msg, index) => (
                    <div
                        key={msg.id || index}
                        ref={(node) => {
                            if (msg.id && node) {
                                messageNodeMapRef.current.set(String(msg.id), node);
                            }
                            if (msg.id && !node) {
                                messageNodeMapRef.current.delete(String(msg.id));
                            }
                        }}
                        className={
                            msg.id && highlightMessageId === String(msg.id)
                                ? "chat-message-highlight"
                                : undefined
                        }
                    >
                        <ChatBubble
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
                    </div>
                ))}
            </div>

            {isToolsOpen && (
                <div className="chat-tools-panel">
                    <div className="chat-tools-header">
                        <div className="chat-tools-title">Công cụ</div>
                        <button className="chat-tools-close" onClick={() => setIsToolsOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className="chat-tools-tabs">
                        <button
                            className={toolsTab === "images" ? "active" : ""}
                            onClick={async () => {
                                setToolsTab("images");
                                await loadAttachments("IMAGE", true);
                            }}
                        >
                            Ảnh
                        </button>
                        <button
                            className={toolsTab === "files" ? "active" : ""}
                            onClick={async () => {
                                setToolsTab("files");
                                await loadAttachments("FILE", true);
                            }}
                        >
                            File
                        </button>
                        <button
                            className={toolsTab === "search" ? "active" : ""}
                            onClick={() => setToolsTab("search")}
                        >
                            Tìm
                        </button>
                    </div>

                    <div className="chat-tools-body">
                        {toolsTab === "images" && (
                            <>
                                <div className="chat-tools-grid">
                                    {images.map((m) => (
                                        <button
                                            key={m.id}
                                            className="chat-tools-image"
                                            onClick={() => ensureMessageLoadedAndScroll(m.id)}
                                            title="Xem trong đoạn chat"
                                        >
                                            <img src={m.fileUrl} alt={m.content || "image"} />
                                        </button>
                                    ))}
                                </div>
                                {imagesHasMore && (
                                    <button
                                        className="chat-tools-load-more"
                                        onClick={() => loadAttachments("IMAGE", false)}
                                        disabled={attachmentsLoading}
                                    >
                                        {attachmentsLoading ? "Đang tải..." : "Tải thêm"}
                                    </button>
                                )}
                            </>
                        )}

                        {toolsTab === "files" && (
                            <>
                                <div className="chat-tools-files">
                                    {files.map((m) => (
                                        <div key={m.id} className="chat-tools-file-row">
                                            <a href={m.fileUrl} target="_blank" rel="noreferrer" className="chat-tools-file-link">
                                                {m.content || "Tệp"}
                                            </a>
                                            <button
                                                className="chat-tools-jump"
                                                onClick={() => ensureMessageLoadedAndScroll(m.id)}
                                                title="Nhảy đến tin nhắn"
                                            >
                                                ↗
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {filesHasMore && (
                                    <button
                                        className="chat-tools-load-more"
                                        onClick={() => loadAttachments("FILE", false)}
                                        disabled={attachmentsLoading}
                                    >
                                        {attachmentsLoading ? "Đang tải..." : "Tải thêm"}
                                    </button>
                                )}
                            </>
                        )}

                        {toolsTab === "search" && (
                            <>
                                <div className="chat-tools-search">
                                    <div className="chat-tools-search-box">
                                        <Search size={16} />
                                        <input
                                            value={searchKeyword}
                                            onChange={(e) => setSearchKeyword(e.target.value)}
                                            placeholder="Nhập nội dung cần tìm..."
                                        />
                                    </div>
                                    <button
                                        className="chat-tools-search-btn"
                                        onClick={handleSearch}
                                        disabled={searchLoading}
                                    >
                                        {searchLoading ? "Đang tìm..." : "Tìm"}
                                    </button>
                                </div>

                                <div className="chat-tools-search-results">
                                    {searchResults.map((m) => (
                                        <button
                                            key={m.id}
                                            className="chat-tools-search-item"
                                            onClick={() => ensureMessageLoadedAndScroll(m.id)}
                                        >
                                            <div className="chat-tools-search-text">{m.content}</div>
                                            <div className="chat-tools-search-meta">
                                                {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

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
