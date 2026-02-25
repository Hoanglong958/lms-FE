import api from "@services/api";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { SERVER_URL } from "@config";

const CHAT_API = "/api/chat";
const WS_URL = `${SERVER_URL}/ws`;

let stompClient = null;

export const chatService = {
    // REST APIs
    getRooms(userId) {
        return api.get(`${CHAT_API}/rooms/me`, { params: { userId } });
    },

    getOrCreateOneToOne(userId1, userId2) {
        return api.post(`${CHAT_API}/rooms/one-to-one`, { userId1, userId2 });
    },

    createGroup(data) {
        return api.post(`${CHAT_API}/rooms/group`, data);
    },

    getMessages(roomId, page = 0, size = 30) {
        return api.get(`${CHAT_API}/messages/history`, { params: { roomId, page, size } });
    },

    getUnreadCount(roomId, userId) {
        return api.get(`${CHAT_API}/rooms/${roomId}/unread-count`, { params: { userId } });
    },

    markRead(roomId, userId) {
        return api.post(`${CHAT_API}/rooms/${roomId}/read-all`, null, { params: { userId } });
    },

    sendFile(roomId, senderId, file) {
        const formData = new FormData();
        formData.append("roomId", roomId);
        formData.append("senderId", senderId);
        formData.append("file", file);
        return api.post(`${CHAT_API}/messages/file`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    // WebSocket
    connect(onMessageReceived, onTypingReceived) {
        const socket = new SockJS(WS_URL);
        stompClient = new Client({
            webSocketFactory: () => socket,
            debug: (str) => {
                console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        stompClient.onConnect = (frame) => {
            console.log("Connected to STOMP");
            // Global user notification subscription could be here
        };

        stompClient.onStompError = (frame) => {
            console.error("Broker reported error: " + frame.headers["message"]);
            console.error("Additional details: " + frame.body);
        };

        stompClient.activate();
    },

    disconnect() {
        if (stompClient) {
            stompClient.deactivate();
        }
    },

    subscribeToRoom(roomId, onMessage) {
        if (!stompClient || !stompClient.connected) return null;
        return stompClient.subscribe(`/topic/rooms/${roomId}`, (msg) => {
            onMessage(JSON.parse(msg.body));
        });
    },

    subscribeToTyping(roomId, onTyping) {
        if (!stompClient || !stompClient.connected) return null;
        return stompClient.subscribe(`/topic/rooms/${roomId}/typing`, (msg) => {
            onTyping(msg.body); // Usually senderId
        });
    },

    sendMessage(data) {
        if (stompClient && stompClient.connected) {
            stompClient.publish({
                destination: "/app/chat.sendMessage",
                body: JSON.stringify(data),
            });
        }
    },

    sendTyping(roomId, userId) {
        if (stompClient && stompClient.connected) {
            stompClient.publish({
                destination: "/app/chat.typing",
                body: JSON.stringify({ roomId, senderId: userId }),
            });
        }
    },
};
