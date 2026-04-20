import React from "react";
import { User } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import useAuth from "../../../hooks/useAuth";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import torletLogo from "../../../assets/torlet-logo.png";

function Header() {
  const { t } = useTranslation();
  const isLoggedIn = useAuth((state) => state.isLoggedIn);

  return (
    <header className="bg-white border border-[#E8DFD0] shadow">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <Link
          to="/customer/"
          className="flex flex-row items-center gap-2 shrink-0"
        >
          <img src={torletLogo} alt="Torlet logo" className="h-10 w-10 rounded-xl object-contain" />
          <p className="text-xl font-bold text-[#5D4E37]">{t("landing.brand")}</p>
        </Link>
        <nav
          className="order-3 flex w-full basis-full items-center justify-start gap-4 overflow-x-auto pb-1 sm:order-none sm:flex-1 sm:w-auto sm:basis-auto sm:justify-center sm:pb-0 sm:gap-6 md:gap-8 [scrollbar-width:thin]"
          aria-label="Main"
        >
          <Link
            to="/customer/"
            className="whitespace-nowrap text-sm text-[#7D6E5C] cursor-pointer hover:text-[#5D4E37]"
          >
            {t("customer.navHome")}
          </Link>
          <Link
            to="/customer/cafes"
            className="whitespace-nowrap text-sm text-[#7D6E5C] cursor-pointer hover:text-[#5D4E37]"
          >
            {t("customer.navBook")}
          </Link>
          <Link
            to="/customer/history"
            className="whitespace-nowrap text-sm text-[#7D6E5C] cursor-pointer hover:text-[#5D4E37]"
          >
            {t("customer.navHistory")}
          </Link>
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
        <Link
          to={isLoggedIn ? "/customer/profile" : "/customer/login"}
          className="shrink-0"
          aria-label={isLoggedIn ? t("customer.navAriaProfile") : t("customer.navAriaLogin")}
        >
          <User
            className="p-2 bg-[#E8DFD0] rounded-full"
            color="#8B6F47"
            size={40}
          />
        </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
