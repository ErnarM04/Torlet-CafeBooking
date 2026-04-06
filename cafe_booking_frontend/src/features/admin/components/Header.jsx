import React, { useState } from "react";
import { Link } from "react-router";
import { Bot, Bell, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import AiAssistantChat from "./AiAssistantChat";
import useAdminAuth from "../../../hooks/useAdminAuth";
import LanguageSwitcher from "../../../components/LanguageSwitcher";

function Header({ title }) {
  const { t } = useTranslation();
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const first_name = useAdminAuth((s) => s.first_name);
  const last_name = useAdminAuth((s) => s.last_name);
  const email = useAdminAuth((s) => s.email);
  const phone_number = useAdminAuth((s) => s.phone_number);
  const isLoggedIn = useAdminAuth((s) => s.isLoggedIn);

  const displayName =
    [first_name, last_name].filter(Boolean).join(" ").trim() || t("admin.staffFallbackName");
  const subline = email || phone_number || "";

  return (
    <div className="min-w-full flex flex-col md:flex-row gap-3 md:gap-4 justify-between bg-white border-b border-[#8B6F47]/15 px-4 py-3 md:px-8 md:py-4 items-start md:items-center">
      <p className="text-[#3D3935] text-2xl md:text-3xl font-semibold select-none">
        {title}
      </p>
      <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-end">
        <LanguageSwitcher />
        <button
          type="button"
          className="d-btn d-btn-primary rounded-xl flex flex-row p-4 gap-2"
          onClick={() => setAiChatOpen((open) => !open)}
          aria-expanded={aiChatOpen}
          aria-controls="admin-ai-chat"
        >
          <Bot />
          <p className="text-sm md:text-base">{t("admin.aiAssistant")}</p>
        </button>
        <button type="button" className="d-btn d-btn-ghost w-10 h-10 p-2" aria-label={t("admin.notifications")}>
          <Bell />
        </button>
        {isLoggedIn ? (
          <Link
            to="/admin/profile"
            className="hidden sm:flex flex-row items-center gap-3 p-2 rounded-xl hover:bg-[#F5EFE7] transition-colors"
          >
            <div className="text-end min-w-0">
              <p className="text-[#3D3935] text-sm font-semibold truncate max-w-[10rem] md:max-w-[14rem]">
                {displayName}
              </p>
              <p className="text-[#7A7269] text-xs truncate max-w-[10rem] md:max-w-[14rem]">
                {subline || t("admin.profileLink")}
              </p>
            </div>
            <User
              className="bg-[#8B6F47] rounded-full w-9 h-9 p-2 shrink-0"
              color="white"
              size={36}
            />
          </Link>
        ) : (
          <Link to="/admin/login" className="d-btn d-btn-outline text-sm">
            {t("admin.signIn")}
          </Link>
        )}
      </div>
      <AiAssistantChat open={aiChatOpen} onClose={() => setAiChatOpen(false)} />
    </div>
  );
}

export default Header;
