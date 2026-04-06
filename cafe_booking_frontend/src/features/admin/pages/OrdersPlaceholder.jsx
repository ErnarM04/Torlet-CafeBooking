import React from "react";
import { Link } from "react-router";
import { ShoppingBag } from "lucide-react";

/**
 * Food orders / POS are not modelled in the API yet.
 * Use Bookings for table reservations.
 */
export default function OrdersPlaceholder() {
  return (
    <div className="admin-page">
      <div className="admin-surface flex max-w-lg flex-col gap-4 p-8 text-left">
        <ShoppingBag className="h-10 w-10 text-[#8B6F47]" />
        <h2 className="text-xl font-semibold text-[#3D3935]">Orders &amp; POS</h2>
        <p className="text-sm leading-relaxed text-[#7A7269]">
          This project currently covers table reservations only. Order totals, menus, and
          kitchen tickets are not in the database yet. Manage guest reservations under{" "}
          <strong>Bookings</strong>.
        </p>
        <Link to="/admin/bookings" className="d-btn d-btn-primary w-fit border-0 font-normal">
          Open bookings
        </Link>
      </div>
    </div>
  );
}
