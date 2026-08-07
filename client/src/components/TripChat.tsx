import { useState, useRef, useEffect, useCallback } from "react";
import { Send, MessageCircle, X, Minimize2, Wifi, WifiOff } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";

interface TripChatProps {
  tripId: string | null;
  userId: string;
  userName: string;
  role: "client" | "driver";
  otherPartyName: string;
  className?: string;
}

export function TripChat({ tripId, userId, userName, role, otherPartyName, className }: TripChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { messages, isConnected, typingUser, sendMessage, sendTyping } = useSocket({
    roomId: tripId,
    userId,
    role,
    enabled: !!tripId,
  });

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  // Count unread when chat is closed
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.senderRole !== role) {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;
    sendMessage(inputText, userName);
    setInputText("");
    inputRef.current?.focus();
  }, [inputText, sendMessage, userName]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    typingDebounceRef.current = setTimeout(() => sendTyping(userName), 300);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  if (!tripId) return null;

  return (
    <div className={cn("fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3", className)}>
      {/* Chat window */}
      {isOpen && (
        <div className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          style={{ height: "420px" }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-500 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                {otherPartyName[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{otherPartyName}</p>
                <div className="flex items-center gap-1">
                  {isConnected
                    ? <><Wifi size={10} className="text-green-200" /><span className="text-green-200 text-xs">En línea</span></>
                    : <><WifiOff size={10} className="text-red-300" /><span className="text-red-300 text-xs">Conectando...</span></>
                  }
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
              <Minimize2 size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle size={32} className="text-slate-300 mb-2" />
                <p className="text-xs text-slate-400">Inicia la conversación con {otherPartyName}</p>
              </div>
            )}
            {messages.map((msg) => {
              const isMe = msg.senderRole === role;
              return (
                <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                    isMe
                      ? "bg-green-500 text-white rounded-br-sm"
                      : "bg-white text-slate-900 rounded-bl-sm border border-slate-200"
                  )}>
                    {!isMe && <p className="text-xs font-semibold mb-0.5 text-green-600">{msg.sender}</p>}
                    <p className="leading-relaxed break-words">{msg.text}</p>
                    <p className={cn("text-xs mt-0.5 text-right", isMe ? "text-green-100" : "text-slate-400")}>{msg.time}</p>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {typingUser && typingUser !== userName && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                  <div className="flex items-center gap-1">
                    <div className="flex gap-0.5">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 ml-1">escribiendo...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-3 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                disabled={!isConnected}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || !isConnected}
                className="w-9 h-9 rounded-full bg-green-500 hover:bg-green-600 disabled:bg-slate-300 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send size={15} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-xl shadow-green-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 relative"
      >
        {isOpen
          ? <X size={22} className="text-white" />
          : <MessageCircle size={22} className="text-white" />
        }
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {!isOpen && isConnected && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-300 border-2 border-white rounded-full" />
        )}
      </button>
    </div>
  );
}
