import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Clock, Table, TrendingUp, Users } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";
import { adminRequest } from "../../../hooks/useAdminApi";

function normList(data) {
  if (Array.isArray(data)) return data;
  return data?.results || [];
}

function hourFromTime(t) {
  if (t == null) return null;
  const s = String(t);
  const m = s.match(/^(\d{1,2})/);
  return m ? parseInt(m[1], 10) : null;
}

/** Только поля из ответа /staff/bookings/ */
function PKICard({ title, data, Icon, comment }) {
  return (
    <div className="admin-surface flex min-w-0 flex-row justify-between p-5 md:p-6.25 w-full">
      <div className="flex min-w-0 flex-col items-start">
        <p className="text-sm text-[#7A7269]">{title}</p>
        <p className="text-3xl font-semibold text-[#3D3935]">{data}</p>
        {comment ? <p className="text-sm text-[#7A7269]">{comment}</p> : null}
      </div>
      {React.createElement(Icon, {
        className: "h-12 w-12 shrink-0 rounded-xl bg-[#8B6F47]/10 p-3",
        color: "#8B6F47",
      })}
    </div>
  );
}

function SummaryCard({ Icon, title, content, stroke, fill }) {
  return (
    <div className="admin-surface flex flex-col items-start p-5 md:p-6.25">
      {React.createElement(Icon, {
        style: { backgroundColor: fill },
        className: "h-10 w-10 rounded-xl p-2",
        color: stroke,
      })}
      <p className="text-base font-semibold text-[#3D3935]">{title}</p>
      <p className="text-left text-sm text-[#7A7269]">{content}</p>
    </div>
  );
}

const RANGE_DAYS = 30;

export default function Analytics() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminRequest({
        path: "/staff/bookings/",
        params: { ordering: "booking_date" },
      });
      setBookings(normList(res.data));
    } catch (e) {
      setError(e.response?.data?.detail || e.message || t("admin.analyticsLoadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const computed = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const from = new Date(today);
    from.setDate(from.getDate() - RANGE_DAYS);

    const inRange = (b) => {
      if (!b.booking_date) return false;
      const d = new Date(`${b.booking_date}T12:00:00`);
      return d >= from && d <= today;
    };

    const recent = bookings.filter(inRange);

    const byHour = Array.from({ length: 24 }, (_, h) => ({
      time: `${h}:00`,
      value: 0,
    }));
    recent.forEach((b) => {
      const h = hourFromTime(b.booking_time);
      if (h != null && h >= 0 && h < 24) byHour[h].value += 1;
    });

    const byDateMap = {};
    recent.forEach((b) => {
      if (!b.booking_date) return;
      byDateMap[b.booking_date] = (byDateMap[b.booking_date] || 0) + 1;
    });
    const lineData = Object.entries(byDateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, value]) => ({ day: day.slice(5), value }));

    const byTable = {};
    bookings.forEach((b) => {
      if (!b.table_number) return;
      const k = b.table_number;
      byTable[k] = (byTable[k] || 0) + 1;
    });
    const tableUtil = Object.entries(byTable)
      .map(([num, value]) => ({ tables: t("admin.analyticsTablePrefix", { num }), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);

    const withTable = bookings.filter((b) => b.table_number).length;
    const tableShare =
      bookings.length > 0 ? Math.round((withTable / bookings.length) * 100) : 0;

    const perCustomer = {};
    bookings.forEach((b) => {
      const id = b.customer;
      if (id == null) return;
      perCustomer[id] = (perCustomer[id] || 0) + 1;
    });
    const unique = Object.keys(perCustomer).length;
    const repeaters = Object.values(perCustomer).filter((n) => n > 1).length;
    const repeatPct = unique > 0 ? Math.round((repeaters / unique) * 100) : 0;

    const avgPerDay = (recent.length / Math.max(RANGE_DAYS, 1)).toFixed(1);
    const peak = [...byHour].sort((a, b) => b.value - a.value)[0];
    const peakLabel = peak?.value > 0 ? peak.time : "—";

    const weekend = recent.filter((b) => {
      const d = new Date(`${b.booking_date}T12:00:00`);
      const w = d.getDay();
      return w === 0 || w === 6;
    }).length;

    const lunch = recent.filter((b) => {
      const h = hourFromTime(b.booking_time);
      return h != null && h >= 12 && h < 14;
    }).length;

    let s1 = "";
    let s2 = "";
    let s3 = "";
    if (bookings.length === 0) {
      s1 = t("admin.analyticsEmptySample");
      s2 = t("admin.analyticsEmptyHint");
      s3 = "";
    } else {
      s1 =
        weekend > 0
          ? t("admin.analyticsWeekendLine", {
              days: RANGE_DAYS,
              weekend,
              recent: recent.length,
            })
          : t("admin.analyticsWindowOnly", { days: RANGE_DAYS, recent: recent.length });
      s2 =
        lunch > 0
          ? t("admin.analyticsLunchLine", { lunch })
          : t("admin.analyticsNoLunch");
      s3 =
        unique > 0
          ? t("admin.analyticsRepeatLine", { repeaters, unique, repeatPct })
          : "";
    }

    return {
      barData: byHour,
      lineData: lineData.length ? lineData : [{ day: "—", value: 0 }],
      tableUtil: tableUtil.length ? tableUtil : [{ tables: "—", value: 0 }],
      total: bookings.length,
      inRange: recent.length,
      avgPerDay,
      peakLabel,
      peakCount: peak?.value || 0,
      tableShare,
      repeatPct,
      s1,
      s2,
      s3,
    };
  }, [bookings, t]);

  if (loading) {
    return (
      <div className="admin-page flex items-center justify-center py-20">
        <span className="d-loading d-loading-dots scale-125" />
      </div>
    );
  }

  return (
    <div className="admin-page gap-8">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <p className="text-start text-sm text-[#7A7269]">
        {t("admin.analyticsSource", {
          total: computed.total,
          days: RANGE_DAYS,
          inRange: computed.inRange,
        })}
      </p>

      <div className="admin-card-grid">
        <PKICard
          title={t("admin.analyticsAvgDay")}
          data={computed.avgPerDay}
          Icon={TrendingUp}
          comment={t("admin.analyticsAvgComment", { days: RANGE_DAYS })}
        />
        <PKICard
          title={t("admin.analyticsPeak")}
          data={computed.peakLabel}
          Icon={Clock}
          comment={
            computed.peakCount
              ? t("admin.analyticsPeakBookings", { count: computed.peakCount })
              : t("admin.analyticsPeakNone")
          }
        />
        <PKICard
          title={t("admin.analyticsTableShare")}
          data={`${computed.tableShare}%`}
          Icon={Table}
          comment={t("admin.analyticsTableComment")}
        />
        <PKICard
          title={t("admin.analyticsRepeat")}
          data={computed.total ? `${computed.repeatPct}%` : "—"}
          Icon={Users}
          comment={t("admin.analyticsRepeatComment")}
        />
      </div>

      <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="admin-surface flex w-full flex-col gap-4 p-4 md:p-6.25">
          <p className="text-start text-base font-semibold text-[#3D3935]">
            {t("admin.analyticsChartHours", { days: RANGE_DAYS })}
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={computed.barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 9 }} interval={3} />
              <YAxis width={36} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#8B6F47" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="admin-surface flex w-full flex-col gap-4 p-4 md:p-6.25">
          <p className="text-start text-base font-semibold text-[#3D3935]">
            {t("admin.analyticsChartDates")}
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={computed.lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis width={36} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8B6F47"
                strokeWidth={3}
                dot={{ r: 6 }}
                activeDot={{ r: 6, fill: "#8B6F47" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-surface flex flex-col gap-4 p-4 md:p-6.25 w-full">
        <p className="text-start text-base font-semibold text-[#3D3935]">
          {t("admin.analyticsChartTables")}
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={computed.tableUtil} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" hide />
            <YAxis dataKey="tables" type="category" width={100} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#D4B896" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          Icon={TrendingUp}
          fill="#DCFCE7"
          stroke="#00A63E"
          title={t("admin.analyticsSumWeekend")}
          content={computed.s1}
        />
        <SummaryCard
          Icon={Clock}
          fill="#FFEDD4"
          stroke="#F54900"
          title={t("admin.analyticsSumLunch")}
          content={computed.s2}
        />
        <SummaryCard
          Icon={Users}
          fill="#DBEAFE"
          stroke="#155DFC"
          title={t("admin.analyticsSumRepeat")}
          content={computed.s3 || t("admin.analyticsNoCustomer")}
        />
      </div>
    </div>
  );
}
