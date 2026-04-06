import React, { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { adminRequest } from "../../../hooks/useAdminApi";
import AdminDialog from "../components/AdminDialog";

const TABLE_TYPES = [
  "indoor",
  "outdoor",
  "vip",
  "terrace",
  "bar",
  "private",
];

const emptyForm = {
  location: "",
  table_number: "",
  table_type: "indoor",
  min_guests: "1",
  max_guests: "4",
  description: "",
  is_available: true,
  is_active: true,
};

export default function TablesManagement() {
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

  const loadTables = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = filterLocation ? { location: filterLocation } : {};
      const { data } = await adminRequest({ path: "/cafes/tables/", params });
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
    loadTables();
  }, [loadTables]);

  function openCreate() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      location: filterLocation || "",
    });
    setDialogOpen(true);
  }

  async function openEdit(row) {
    setEditingId(row.table_id);
    setDialogOpen(true);
    setError("");
    try {
      const { data } = await adminRequest({ path: `/cafes/tables/${row.table_id}/` });
      setForm({
        location: data.location,
        table_number: data.table_number || "",
        table_type: data.table_type || "indoor",
        min_guests: String(data.min_guests ?? 1),
        max_guests: String(data.max_guests ?? 4),
        description: data.description || "",
        is_available: data.is_available !== false,
        is_active: data.is_active !== false,
      });
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    const payload = {
      location: form.location,
      table_number: form.table_number.trim(),
      table_type: form.table_type,
      min_guests: parseInt(form.min_guests, 10),
      max_guests: parseInt(form.max_guests, 10),
      description: form.description.trim(),
      is_available: form.is_available,
      is_active: form.is_active,
    };

    try {
      if (editingId) {
        await adminRequest({
          method: "patch",
          path: `/cafes/tables/${editingId}/`,
          data: payload,
        });
      } else {
        await adminRequest({
          method: "post",
          path: "/cafes/tables/",
          data: payload,
        });
      }
      setDialogOpen(false);
      await loadTables();
    } catch (e) {
      const d = e.response?.data;
      setError(typeof d?.detail === "string" ? d.detail : JSON.stringify(d || e.message));
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(id) {
    if (!window.confirm("Deactivate this table?")) return;
    try {
      await adminRequest({ method: "delete", path: `/cafes/tables/${id}/` });
      await loadTables();
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
                {loc.restaurant_name} — {loc.address?.slice(0, 40)}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="d-btn d-btn-primary rounded-xl font-normal" onClick={openCreate}>
          <Plus size={18} /> Add table
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
                <th>#</th>
                <th>Location</th>
                <th>Type</th>
                <th>Guests</th>
                <th>Avail</th>
                <th>Active</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.table_id}>
                  <td className="font-medium">{r.table_number}</td>
                  <td className="max-w-[160px] truncate">{r.location_name}</td>
                  <td>{r.table_type}</td>
                  <td>
                    {r.min_guests}–{r.max_guests}
                  </td>
                  <td>{r.is_available ? "Yes" : "No"}</td>
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
                      onClick={() => deactivate(r.table_id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingId ? "Edit table" : "New table"}
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
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#5D4E37]">Table number</span>
            <input
              className="d-input rounded-xl border-[#E8DFD0]"
              value={form.table_number}
              onChange={(e) => setForm({ ...form, table_number: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#5D4E37]">Type</span>
            <select
              className="d-select admin-select rounded-xl"
              value={form.table_type}
              onChange={(e) => setForm({ ...form, table_type: e.target.value })}
            >
              {TABLE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-[#5D4E37]">Min guests</span>
              <input
                type="number"
                min={1}
                className="d-input rounded-xl border-[#E8DFD0]"
                value={form.min_guests}
                onChange={(e) => setForm({ ...form, min_guests: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-[#5D4E37]">Max guests</span>
              <input
                type="number"
                min={1}
                className="d-input rounded-xl border-[#E8DFD0]"
                value={form.max_guests}
                onChange={(e) => setForm({ ...form, max_guests: e.target.value })}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#5D4E37]">Description</span>
            <textarea
              className="d-textarea rounded-xl border-[#E8DFD0] min-h-[60px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="d-checkbox"
              checked={form.is_available}
              onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
            />
            Available for booking
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
