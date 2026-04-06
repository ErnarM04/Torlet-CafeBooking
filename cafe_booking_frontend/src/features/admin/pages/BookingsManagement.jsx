import React, { useCallback, useEffect, useState } from "react";
import { Check, CircleSlash, RefreshCw, UserPlus, Utensils, XCircle } from "lucide-react";
import { adminRequest } from "../../../hooks/useAdminApi";

const STATUSES = ["", "pending", "confirmed", "seated", "completed", "cancelled", "no_show"];

function badgeClass(status) {
  if (status === "confirmed" || status === "seated")
    return "d-badge border-0 bg-emerald-600 text-white";
  if (status === "pending") return "d-badge d-badge-warning";
  if (status === "completed") return "d-badge bg-[#8B6F47] text-white border-0";
  if (status === "cancelled" || status === "no_show") return "d-badge d-badge-error";
  return "d-badge d-badge-ghost";
}

export default function BookingsManagement() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (status) params.status = status;
      if (search.trim()) params.search = search.trim();
      params.ordering = "-booking_date,-booking_time";
      const { data } = await adminRequest({
        path: "/staff/bookings/",
        params,
      });
      setRows(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      setError(e.response?.data?.detail || e.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const t = setTimeout(() => load(), search ? 400 : 0);
    return () => clearTimeout(t);
  }, [load, search, status]);

  async function postAction(id, action, body = {}) {
    setBusyId(id);
    setError("");
    try {
      await adminRequest({
        method: "post",
        path: `/staff/bookings/${id}/${action}/`,
        data: body,
      });
      await load();
    } catch (e) {
      const d = e.response?.data?.detail;
      setError(Array.isArray(d) ? d.join(" ") : d || e.message);
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="admin-page">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="admin-filter-grid flex-1">
          <input
            type="search"
            placeholder="Search phone, name, booking #…"
            className="d-input admin-search w-full rounded-xl border-[#E8DFD0] px-3 py-2.5"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="d-select admin-select w-full rounded-xl"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s || "all"} value={s}>
                {s ? s.replace("_", " ") : "All statuses"}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="d-btn d-btn-outline rounded-xl border-[#c9b89a]"
          onClick={() => load()}
        >
          <RefreshCw size={18} /> Refresh
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <span className="d-loading d-loading-dots" />
      ) : (
        <div className="admin-surface admin-table-wrap">
          <table className="d-table d-table-untitled text-sm">
            <thead>
              <tr>
                <th>Booking</th>
                <th>Guest</th>
                <th>When</th>
                <th>Table</th>
                <th>Guests</th>
                <th>Status</th>
                <th className="min-w-[200px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.booking_id}>
                  <td className="font-mono text-xs">{b.booking_number}</td>
                  <td>
                    <div className="font-medium">
                      {b.customer_first_name} {b.customer_last_name}
                    </div>
                    <div className="text-xs text-[#7A7269]">{b.customer_phone}</div>
                  </td>
                  <td>
                    {b.booking_date}
                    <div className="text-xs text-[#7A7269]">{String(b.booking_time).slice(0, 5)}</div>
                  </td>
                  <td>{b.table_number || "—"}</td>
                  <td>{b.number_of_guests}</td>
                  <td>
                    <span className={badgeClass(b.status)}>{b.status}</span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {b.status === "pending" ? (
                        <button
                          type="button"
                          title="Confirm"
                          disabled={busyId === b.booking_id}
                          className="d-btn d-btn-ghost d-btn-xs"
                          onClick={() => postAction(b.booking_id, "confirm")}
                        >
                          <Check size={14} />
                        </button>
                      ) : null}
                      {b.status === "confirmed" ? (
                        <button
                          type="button"
                          title="Seat"
                          disabled={busyId === b.booking_id}
                          className="d-btn d-btn-ghost d-btn-xs"
                          onClick={() => postAction(b.booking_id, "seat")}
                        >
                          <Utensils size={14} />
                        </button>
                      ) : null}
                      {(b.status === "confirmed" || b.status === "seated") ? (
                        <button
                          type="button"
                          title="Complete"
                          disabled={busyId === b.booking_id}
                          className="d-btn d-btn-ghost d-btn-xs"
                          onClick={() => postAction(b.booking_id, "complete")}
                        >
                          <Check size={14} />
                        </button>
                      ) : null}
                      {(b.status === "pending" || b.status === "confirmed") ? (
                        <>
                          <button
                            type="button"
                            title="No-show"
                            disabled={busyId === b.booking_id}
                            className="d-btn d-btn-ghost d-btn-xs"
                            onClick={() => postAction(b.booking_id, "no_show")}
                          >
                            <CircleSlash size={14} />
                          </button>
                          <button
                            type="button"
                            title="Cancel"
                            disabled={busyId === b.booking_id}
                            className="d-btn d-btn-ghost d-btn-xs text-red-700"
                            onClick={() => {
                              const reason = window.prompt("Cancellation reason (optional)") ?? "";
                              postAction(b.booking_id, "cancel", {
                                cancellation_reason: reason,
                              });
                            }}
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      ) : null}
                      <button
                        type="button"
                        title="Assign to me"
                        disabled={busyId === b.booking_id}
                        className="d-btn d-btn-ghost d-btn-xs"
                        onClick={() => postAction(b.booking_id, "assign_me")}
                      >
                        <UserPlus size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? (
            <p className="p-4 text-sm text-[#7A7269]">No bookings match filters.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
