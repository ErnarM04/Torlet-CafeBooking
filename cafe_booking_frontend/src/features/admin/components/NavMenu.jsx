import React, { useMemo } from "react";
import {
  LayoutDashboard,
  Building2,
  MapPin,
  LayoutGrid,
  Clock,
  Calendar,
  ShoppingBag,
  Users,
  ChartColumn,
  UserCircle,
  Settings,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import torletLogo from "../../../assets/torlet-logo.png";

const PAGES = [
  { path: "dashboard", navKey: "dashboard", Icon: LayoutDashboard },
  { path: "restaurants", navKey: "restaurants", Icon: Building2 },
  { path: "locations", navKey: "locations", Icon: MapPin },
  { path: "tables", navKey: "tables", Icon: LayoutGrid },
  { path: "time-slots", navKey: "timeSlots", Icon: Clock },
  { path: "bookings", navKey: "bookings", Icon: Calendar },
  { path: "orders", navKey: "orders", Icon: ShoppingBag },
  { path: "customers", navKey: "customers", Icon: Users },
  { path: "analytics", navKey: "analytics", Icon: ChartColumn },
  { path: "profile", navKey: "profile", Icon: UserCircle },
  { path: "settings", navKey: "settings", Icon: Settings },
];

export default function NavMenu() {
  const location = useLocation();
  const { t } = useTranslation();

  const currentPath = useMemo(() => {
    const p = location.pathname.replace(/\/+$/, "");
    const after = p.replace(/^\/admin\/?/, "");
    return (after.split("/")[0] || "dashboard").toLowerCase();
  }, [location.pathname]);

  return (
    <div className="w-full lg:max-w-64 bg-white border-b lg:border-b-0 lg:border-r border-[#8B6F47]/15">
      <div className="flex gap-2 p-4 md:p-6">
        <img src={torletLogo} alt="Torlet logo" className="h-10 w-10 rounded-xl object-contain" />
        <div className="flex flex-col items-start min-w-0">
          <p className="text-base text-[#3D3935] font-semibold truncate">{t("admin.brand")}</p>
          <p className="text-xs text-[#7A7269]">{t("admin.brandSub")}</p>
        </div>
      </div>
      <nav className="flex flex-row lg:flex-col h-max gap-1 p-2 md:p-4 overflow-x-auto lg:overflow-visible">
        {PAGES.map(({ path, navKey, Icon }) => {
          const label = t(`admin.nav.${navKey}`);
          const active = path === currentPath;
          return active ? (
            <div
              key={path}
              className="flex bg-[#8B6F47] rounded-xl items-center justify-start gap-2 md:gap-3 p-3 cursor-pointer whitespace-nowrap"
            >
              {React.createElement(Icon, { className: "w-5 h-5 shrink-0", color: "white" })}
              <p className="text-base text-white">{label}</p>
            </div>
          ) : (
            <Link
              key={path}
              className="flex items-center justify-start gap-2 md:gap-3 p-3 rounded-xl cursor-pointer whitespace-nowrap hover:bg-[#F5EFE7]"
              to={`/admin/${path}`}
            >
              {React.createElement(Icon, { className: "w-5 h-5 shrink-0" })}
              <p className="text-base">{label}</p>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
