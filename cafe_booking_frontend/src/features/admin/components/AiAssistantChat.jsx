import React, { useEffect, useRef, useState } from "react";
import { Bot, Send, X } from "lucide-react";

export default function AiAssistantChat({ open, onClose }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I’m your cafe admin assistant. Ask about bookings, tables, or today’s summary.",
    },
  ]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, messages]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const userMsg = { id: `u-${Date.now()}`, role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: "This is a demo reply. Connect your AI backend here to get real answers.",
        },
      ]);
    }, 400);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] pointer-events-none"
      aria-hidden={false}
    >
      <div
        className="absolute inset-0 bg-black/20 pointer-events-auto md:bg-transparent"
        onClick={onClose}
        aria-label="Close chat overlay"
      />
      <div
        id="admin-ai-chat"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-chat-title"
        className="pointer-events-auto fixed bottom-4 right-4 left-4 md:left-auto z-[101] flex w-auto max-w-md flex-col overflow-hidden rounded-2xl border border-[#8B6F47]/15 bg-[#FAF8F5] shadow-2xl md:w-[22rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-[#8B6F47]/15 bg-white px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#8B6F47]/10">
              <Bot className="h-5 w-5 text-[#8B6F47]" />
            </div>
            <div className="min-w-0">
              <p
                id="ai-chat-title"
                className="truncate text-sm font-semibold text-[#3D3935]"
              >
                AI Assistant
              </p>
              <p className="truncate text-xs text-[#7A7269]">Torlet Admin</p>
            </div>
          </div>
          <button
            type="button"
            className="d-btn d-btn-ghost h-9 w-9 shrink-0 p-0"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex max-h-[min(360px,50vh)] flex-col gap-2 overflow-y-auto px-3 py-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.role === "user"
                  ? "ml-8 rounded-xl rounded-br-sm bg-[#8B6F47] px-3 py-2 text-sm text-white"
                  : "mr-8 rounded-xl rounded-bl-sm border border-[#8B6F47]/15 bg-white px-3 py-2 text-sm text-[#3D3935]"
              }
            >
              {msg.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="flex gap-2 border-t border-[#8B6F47]/15 bg-white p-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something…"
            className="d-input flex-1 rounded-xl border border-[#8B6F47]/15 bg-[#FAF8F5] text-sm text-[#3D3935] placeholder:text-[#7A7269]"
          />
          <button
            type="submit"
            className="d-btn d-btn-primary rounded-xl px-3"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
