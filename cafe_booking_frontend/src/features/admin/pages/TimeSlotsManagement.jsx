import React, { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { adminRequest } from "../../../hooks/useAdminApi";
import AdminDialog from "../components/AdminDialog";

const DEFAULT_DAYS =
  '["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]';

const emptyForm = {
  location: "",
  start_time: "12:00",
  end_time: "15:00",
  duration: "3 hours",
  days_of_week: DEFAULT_DAYS,
  max_bookings: "10",
  is_active: true,
};

function toTimeInput(iso) {
  if (!iso) return "";
  const s = String(iso);
  return s.length >= 5 ? s.slice(0, 5) : s;
}

function toApiTime(val) {
  if (!val) return "12:00:00";
  return val.length === 5 ? `${val}:00` : val;
}

export default function TimeSlotsManagement() {
  const [locations, setLocations] = useState([]);
  const [filterLocation, setFilterLocation] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadLocations = useCallback(async () => {
    try {
      const { data } = await adminRequest({ path: "/cafes/locations/" });
      setLocations(Array.isArray(data) ? data : data.results || []);
    } catch {
      setLocations([]);
    }
  }, []);

  const loadSlots = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = filterLocation ? { location: filterLocation } : {};
      const { data } = await adminRequest({ path: "/cafes/time-slots/", params });
      setRows(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      setError(e.response?.data?.detail || e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [filterLocation]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  function openCreate() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      location: filterLocation || "",
    });
    setDialogOpen(true);
  }

  async function openEdit(row) {
    setEditingId(row.time_slot_id);
    setDialogOpen(true);
    setError("");
    try {
      const { data } = await adminRequest({
        path: `/cafes/time-slots/${row.time_slot_id}/`,
      });
      setForm({
        location: data.location,
        start_time: toTimeInput(data.start_time),
        end_time: toTimeInput(data.end_time),
        duration: data.duration || "",
        days_of_week: JSON.stringify(data.days_of_week || [], null, 0),
        max_bookings: String(data.max_bookings ?? 10),
        is_active: data.is_active !== false,
      });
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    let days;
    try {
      days = JSON.parse(form.days_of_week || "[]");
      if (!Array.isArray(days)) throw new Error();
    } catch {
      setError("Days must be a JSON array, e.g. [\"Monday\",\"Friday\"]");
      setSaving(false);
      return;
    }

    const payload = {
      location: form.location,
      start_time: toApiTime(form.start_time),
      end_time: toApiTime(form.end_time),
      duration: form.duration.trim(),
      days_of_week: days,
      max_bookings: parseInt(form.max_bookings, 10),
      is_active: form.is_active,
    };

    try {
      if (editingId) {
        await adminRequest({
          method: "patch",
          path: `/cafes/time-slots/${editingId}/`,
          data: payload,
        });
      } else {
        await adminRequest({
          method: "post",
          path: "/cafes/time-slots/",
          data: payload,
        });
      }
      setDialogOpen(false);
      await loadSlots();
    } catch (e) {
      const d = e.response?.data;
      setError(typeof d?.detail === "string" ? d.detail : JSON.stringify(d || e.message));
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(id) {
    if (!window.confirm("Deactivate this time slot?")) return;
    try {
      await adminRequest({ method: "delete", path: `/cafes/time-slots/${id}/` });
      await loadSlots();
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    }
  }

  return (
    <div className="admin-page">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <label className="flex flex-col gap-1 text-sm min-w-[220px]">
          <span className="text-[#5D4E37]">Filter by location</span>
          <select
            className="d-select admin-select rounded-xl"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          >
            <option value="">All</option>
            {locations.map((loc) => (
              <option key={loc.location_id} value={loc.location_id}>
                {loc.restaurant_name} — {loc.city}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="d-btn d-btn-primary rounded-xl font-normal" onClick={openCreate}>
          <Plus size={18} /> Add time slot
        </button>
      </div>
      {error && !dialogOpen ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <span className="d-loading d-loading-dots" />
      ) : (
        <div className="admin-surface admin-table-wrap">
          <table className="d-table d-table-untitled text-sm">
            <thead>
              <tr>
                <th>Location</th>
                <th>Start</th>
                <th>End</th>
                <th>Duration</th>
                <th>Max bookings</th>
                <th>Active</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const loc = locations.find((l) => l.location_id === r.location);
                const locLabel = loc
                  ? `${loc.restaurant_name} · ${loc.city}`
                  : String(r.location).slice(0, 8) + "…";
                return (
                <tr key={r.time_slot_id}>
                  <td className="max-w-[180px] truncate" title={r.location}>
                    {locLabel}
                  </td>
                  <td>{String(r.start_time).slice(0, 5)}</td>
                  <td>{String(r.end_time).slice(0, 5)}</td>
                  <td>{r.duration}</td>
                  <td>{r.max_bookings}</td>
                  <td>{r.is_active ? "Yes" : "No"}</td>
                  <td className="flex gap-1">
                    <button
                      type="button"
                      className="d-btn d-btn-ghost d-btn-sm"
                      onClick={() => openEdit(r)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className="d-btn d-btn-ghost d-btn-sm text-red-700"
                      onClick={() => deactivate(r.time_slot_id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AdminDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingId ? "Edit time slot" : "New time slot"}
        footer={
          <button
            type="button"
            className="d-btn d-btn-primary border-0"
            disabled={saving || !form.location}
            onClick={save}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        }
      >
        {error && dialogOpen ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#5D4E37]">Location</span>
            <select
              className="d-select admin-select rounded-xl"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            >
              <option value="">Select…</option>
              {locations.map((loc) => (
                <option key={loc.location_id} value={loc.location_id}>
                  {loc.restaurant_name} — {loc.city}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-[#5D4E37]">Start</span>
              <input
                type="time"
                className="d-input rounded-xl border-[#E8DFD0]"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-[#5D4E37]">End</span>
              <input
                type="time"
                className="d-input rounded-xl border-[#E8DFD0]"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#5D4E37]">Duration label</span>
            <input
              className="d-input rounded-xl border-[#E8DFD0]"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#5D4E37]">Days of week (JSON)</span>
            <textarea
              className="d-textarea font-mono text-xs rounded-xl border-[#E8DFD0]"
              rows={3}
              value={form.days_of_week}
              onChange={(e) => setForm({ ...form, days_of_week: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#5D4E37]">Max bookings per slot</span>
            <input
              type="number"
              min={1}
              className="d-input rounded-xl border-[#E8DFD0]"
              value={form.max_bookings}
              onChange={(e) => setForm({ ...form, max_bookings: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="d-checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Active
          </label>
        </div>
      </AdminDialog>
    </div>
  );
}
