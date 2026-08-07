import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

interface ChatMessage {
  id: string;
  sender: string;
  senderRole: "client" | "driver" | "admin";
  text: string;
  time: string;
}

interface UseSocketOptions {
  roomId: string | null;
  userId: string;
  role: "client" | "driver" | "admin";
  enabled?: boolean;
}

export function useSocket({ roomId, userId, role, enabled = true }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || !roomId) return;

    const socket = io(window.location.origin, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join_room", { roomId, userId, role });
    });

    socket.on("disconnect", () => setIsConnected(false));

    socket.on("message_history", (history: ChatMessage[]) => {
      setMessages(history);
    });

    socket.on("new_message", (msg: ChatMessage) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on("user_typing", ({ sender }: { sender: string }) => {
      setTypingUser(sender);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setTypingUser(null), 2500);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setMessages([]);
    };
  }, [roomId, userId, role, enabled]);

  const sendMessage = useCallback((text: string, senderName: string) => {
    if (!socketRef.current || !roomId || !text.trim()) return;
    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      sender: senderName,
      senderRole: role,
      text: text.trim(),
      time: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
    };
    socketRef.current.emit("send_message", { roomId, message: msg });
  }, [roomId, role]);

  const sendTyping = useCallback((senderName: string) => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit("typing", { roomId, sender: senderName });
  }, [roomId]);

  const sendTripStatus = useCallback((status: string, data?: any) => {
    if (!socketRef.current || !roomId) return;
    socketRef.current.emit("trip_status", { roomId, status, data });
  }, [roomId]);

  return { messages, isConnected, typingUser, sendMessage, sendTyping, sendTripStatus };
}
