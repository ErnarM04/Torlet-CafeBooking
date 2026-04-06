import React, { useEffect, useMemo } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import NavMenu from "../features/admin/components/NavMenu";
import Header from "../features/admin/components/Header";
import Dashboard from "../features/admin/pages/Dashboard";
import Bookings from "../features/admin/pages/BookingsManagement";
import OrdersPlaceholder from "../features/admin/pages/OrdersPlaceholder";
import Customers from "../features/admin/pages/Customers";
import Settings from "../features/admin/pages/Settings";
import Analytics from "../features/admin/pages/Analytics";
import AdminLogin from "../features/admin/pages/AdminLogin";
import AdminProfile from "../features/admin/pages/AdminProfile";
import RestaurantsManagement from "../features/admin/pages/RestaurantsManagement";
import LocationsManagement from "../features/admin/pages/LocationsManagement";
import TablesManagement from "../features/admin/pages/TablesManagement";
import TimeSlotsManagement from "../features/admin/pages/TimeSlotsManagement";
import useAdminAuth from "../hooks/useAdminAuth";

const ADMIN_NAV_SEGMENTS = new Set([
  "dashboard",
  "restaurants",
  "locations",
  "tables",
  "time-slots",
  "bookings",
  "orders",
  "customers",
  "analytics",
  "profile",
  "settings",
]);

function segmentToNavKey(segment) {
  if (segment === "time-slots") return "timeSlots";
  return segment;
}

function AdminProtectedLayout() {
  const location = useLocation();
  const { t } = useTranslation();
  const isLoggedIn = useAdminAuth((s) => s.isLoggedIn);
  const fetchProfile = useAdminAuth((s) => s.fetchProfile);
  const logout = useAdminAuth((s) => s.logout);

  const title = useMemo(() => {
    const p = location.pathname.replace(/\/+$/, "");
    const after = p.replace(/^\/admin\/?/, "");
    const segment = (after.split("/")[0] || "dashboard").toLowerCase();
    const safe = ADMIN_NAV_SEGMENTS.has(segment) ? segment : "dashboard";
    const key = segmentToNavKey(safe);
    return t(`admin.nav.${key}`);
  }, [location.pathname, t]);

  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      const ok = await fetchProfile();
      if (!ok) return;
      const { is_staff, is_restaurant_staff } = useAdminAuth.getState();
      if (!is_staff && !is_restaurant_staff) {
        logout();
      }
    })();
  }, [isLoggedIn, fetchProfile, logout]);

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <NavMenu />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} />
        <Outlet />
      </div>
    </div>
  );
}

export default function Admin() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route element={<AdminProtectedLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="restaurants" element={<RestaurantsManagement />} />
        <Route path="locations" element={<LocationsManagement />} />
        <Route path="tables" element={<TablesManagement />} />
        <Route path="time-slots" element={<TimeSlotsManagement />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="orders" element={<OrdersPlaceholder />} />
        <Route path="customers" element={<Customers />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
