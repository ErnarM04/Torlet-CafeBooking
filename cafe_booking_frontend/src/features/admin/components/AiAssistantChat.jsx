import React, { useEffect, useRef, useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { adminRequest } from "../../../hooks/useAdminApi";

export default function AiAssistantChat({ open, onClose }) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        text: t("admin.aiWelcome"),
      },
    ]);
  }, [open, t]);

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

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    const userMsg = { id: `u-${Date.now()}`, role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);
    const history = messages
      .filter((m) => m.id !== "welcome")
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.text }));
    try {
      const res = await adminRequest({
        method: "post",
        path: "/staff/assistant/chat/",
        data: { message: text, history },
      });
      const reply = res.data?.reply || t("admin.aiError");
      setMessages((m) => [
        ...m,
        { id: `a-${Date.now()}`, role: "assistant", text: reply },
      ]);
    } catch (err) {
      const status = err.response?.status;
      const detail =
        err.response?.data?.detail ||
        (status === 503 ? t("admin.aiNotConfigured") : null) ||
        err.message ||
        t("admin.aiError");
      setMessages((m) => [
        ...m,
        { id: `a-${Date.now()}`, role: "assistant", text: String(detail) },
      ]);
    } finally {
      setSending(false);
    }
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
                {t("admin.aiAssistant")}
              </p>
              <p className="truncate text-xs text-[#7A7269]">
                {t("admin.aiSubtitle")}
              </p>
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

        <div className="flex max-h-[min(360px,50vh)] flex-col gap-2 overflow-y-auto px-3 py-3 whitespace-pre-wrap">
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
          {sending ? (
            <p className="mr-8 text-xs text-[#7A7269]">{t("admin.aiThinking")}</p>
          ) : null}
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
            placeholder={t("admin.aiPlaceholder")}
            disabled={sending}
            className="d-input flex-1 rounded-xl border border-[#8B6F47]/15 bg-[#FAF8F5] text-sm text-[#3D3935] placeholder:text-[#7A7269] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="d-btn d-btn-primary rounded-xl px-3 disabled:opacity-60"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
