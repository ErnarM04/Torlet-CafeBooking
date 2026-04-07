import React from "react";
import { useTranslation } from "react-i18next";

/**
 * Compact EN / RU / KZ toggle; syncs with i18n + localStorage via config.js
 */
export default function LanguageSwitcher({ className = "" }) {
  const { i18n, t } = useTranslation();
  const lng = i18n.resolvedLanguage || i18n.language || "en";
  const isEn = lng.startsWith("en");
  const isRu = lng.startsWith("ru");
  const isKk = lng.startsWith("kk");

  return (
    <div
      className={`inline-flex rounded-xl border border-[#E8DFD0] bg-[#FAF7F2] p-0.5 text-xs font-medium ${className}`}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        className={
          isEn
            ? "rounded-[10px] bg-[#8B6F47] px-2.5 py-1 text-white"
            : "rounded-[10px] px-2.5 py-1 text-[#5D4E37] hover:bg-white/60"
        }
        onClick={() => i18n.changeLanguage("en")}
      >
        {t("common.langEn")}
      </button>
      <button
        type="button"
        className={
          isRu
            ? "rounded-[10px] bg-[#8B6F47] px-2.5 py-1 text-white"
            : "rounded-[10px] px-2.5 py-1 text-[#5D4E37] hover:bg-white/60"
        }
        onClick={() => i18n.changeLanguage("ru")}
      >
        {t("common.langRu")}
      </button>
      <button
        type="button"
        className={
          isKk
            ? "rounded-[10px] bg-[#8B6F47] px-2.5 py-1 text-white"
            : "rounded-[10px] px-2.5 py-1 text-[#5D4E37] hover:bg-white/60"
        }
        onClick={() => i18n.changeLanguage("kk")}
      >
        {t("common.langKk")}
      </button>
    </div>
  );
}
