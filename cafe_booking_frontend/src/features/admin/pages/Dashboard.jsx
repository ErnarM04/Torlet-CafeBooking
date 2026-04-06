import React, { useEffect, useState } from "react";
import { Building2, Calendar, CircleCheckBig, Table } from "lucide-react";
import { Link } from "react-router";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { adminRequest } from "../../../hooks/useAdminApi";

function normList(data) {
  if (Array.isArray(data)) return data;
  return data?.results || [];
}

function PKICard({ title, data, Icon, comment }) {
  return (
    <div className="admin-surface flex min-w-0 flex-row justify-between p-5 md:p-6.25 w-full">
      <div className="flex min-w-0 flex-col items-start">
        <p className="text-sm text-[#7A7269]">{title}</p>
        <p className="text-3xl font-semibold text-[#3D3935]">{data}</p>
        {comment ? <p className="text-sm text-[#7A7269]">{comment}</p> : null}
      </div>
      <Icon className="h-12 w-12 shrink-0 rounded-xl bg-[#8B6F47]/10 p-3" color="#8B6F47" />
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    restaurants: 0,
    locations: 0,
    tables: 0,
    bookings: 0,
    pending: 0,
  });
  const [recent, setRecent] = useState([]);
  const [chart, setChart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [resR, resL, resT, resB] = await Promise.all([
          adminRequest({ path: "/cafes/restaurants/" }),
          adminRequest({ path: "/cafes/locations/" }),
          adminRequest({ path: "/cafes/tables/" }),
          adminRequest({
            path: "/staff/bookings/",
            params: { ordering: "-created_at" },
          }),
        ]);
        if (cancelled) return;
        const bookings = normList(resB.data);
        const pending = bookings.filter((b) => b.status === "pending").length;
        setStats({
          restaurants: normList(resR.data).length,
          locations: normList(resL.data).length,
          tables: normList(resT.data).length,
          bookings: bookings.length,
          pending,
        });
        setRecent(bookings.slice(0, 6));

        const byDay = {};
        bookings.forEach((b) => {
          const d = b.booking_date;
          if (!d) return;
          byDay[d] = (byDay[d] || 0) + 1;
        });
        const sorted = Object.entries(byDay)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-7)
          .map(([day, value]) => ({ day: day.slice(5), value }));
        setChart(sorted.length ? sorted : [{ day: "—", value: 0 }]);
      } catch {
        if (!cancelled) {
          setChart([{ day: "—", value: 0 }]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="admin-page gap-8">
      {loading ? <span className="d-loading d-loading-dots" /> : null}
      <div className="admin-card-grid">
        <PKICard title="Restaurants" data={stats.restaurants} Icon={Building2} comment="All records (incl. inactive)" />
        <PKICard title="Locations" data={stats.locations} Icon={Calendar} />
        <PKICard title="Tables" data={stats.tables} Icon={Table} />
        <PKICard
          title="Bookings (loaded)"
          data={stats.bookings}
          Icon={CircleCheckBig}
          comment={stats.pending ? `${stats.pending} pending` : "None pending"}
        />
      </div>
      <p className="text-sm text-[#7A7269]">
        Manage data under{" "}
        <Link className="text-[#8B6F47] underline-offset-2 hover:underline" to="/admin/restaurants">
          Restaurants
        </Link>
        ,{" "}
        <Link className="text-[#8B6F47] underline-offset-2 hover:underline" to="/admin/tables">
          Tables
        </Link>
        ,{" "}
        <Link className="text-[#8B6F47] underline-offset-2 hover:underline" to="/admin/bookings">
          Bookings
        </Link>
        .
      </p>
      <div className="admin-surface flex flex-col gap-4 p-4 md:p-6.25">
        <p className="text-start text-base font-semibold text-[#3D3935]">
          Bookings by date (last buckets)
        </p>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#8B6F47" fill="#8B6F47" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="admin-surface flex flex-col gap-4 p-4 md:p-6.25">
        <p className="text-base font-semibold text-[#3D3935] text-start">Recent bookings</p>
        <div className="admin-table-wrap">
          <table className="d-table text-sm">
            <thead>
              <tr>
                <th>Number</th>
                <th>Guest</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((b) => (
                <tr key={b.booking_id}>
                  <td className="font-mono text-xs">{b.booking_number}</td>
                  <td>
                    {b.customer_first_name} {b.customer_last_name}
                  </td>
                  <td>
                    {b.booking_date} {String(b.booking_time).slice(0, 5)}
                  </td>
                  <td>{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {recent.length === 0 ? (
            <p className="p-4 text-sm text-[#7A7269]">No bookings yet.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
