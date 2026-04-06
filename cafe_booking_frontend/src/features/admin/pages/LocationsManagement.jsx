import React, { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { adminRequest } from "../../../hooks/useAdminApi";
import AdminDialog from "../components/AdminDialog";

const emptyForm = {
  restaurant: "",
  address: "",
  city: "Almaty",
  latitude: "",
  longitude: "",
  opening_hours: "",
  is_active: true,
};

export default function LocationsManagement() {
  const [restaurants, setRestaurants] = useState([]);
  const [filterRestaurant, setFilterRestaurant] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadRestaurants = useCallback(async () => {
    try {
      const { data } = await adminRequest({ path: "/cafes/restaurants/" });
      setRestaurants(Array.isArray(data) ? data : data.results || []);
    } catch {
      /* ignore */
    }
  }, []);

  const loadLocations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = filterRestaurant ? { restaurant: filterRestaurant } : {};
      const { data } = await adminRequest({
        path: "/cafes/locations/",
        params,
      });
      setRows(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      setError(e.response?.data?.detail || e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [filterRestaurant]);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  function openCreate() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      restaurant: filterRestaurant || "",
    });
    setDialogOpen(true);
  }

  async function openEdit(row) {
    setEditingId(row.location_id);
    setDialogOpen(true);
    setError("");
    try {
      const { data } = await adminRequest({
        path: `/cafes/locations/${row.location_id}/`,
      });
      setForm({
        restaurant:
          typeof data.restaurant === "object" && data.restaurant
            ? data.restaurant.restaurant_id
            : data.restaurant || "",
        address: data.address || "",
        city: data.city || "Almaty",
        latitude: data.latitude != null ? String(data.latitude) : "",
        longitude: data.longitude != null ? String(data.longitude) : "",
        opening_hours: data.opening_hours || "",
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
      restaurant: form.restaurant,
      address: form.address.trim(),
      city: form.city.trim() || "Almaty",
      opening_hours: form.opening_hours.trim(),
      is_active: form.is_active,
    };
    if (form.latitude !== "") payload.latitude = form.latitude;
    if (form.longitude !== "") payload.longitude = form.longitude;

    try {
      if (editingId) {
        await adminRequest({
          method: "patch",
          path: `/cafes/locations/${editingId}/`,
          data: payload,
        });
      } else {
        await adminRequest({
          method: "post",
          path: "/cafes/locations/",
          data: payload,
        });
      }
      setDialogOpen(false);
      await loadLocations();
    } catch (e) {
      const d = e.response?.data;
      setError(typeof d?.detail === "string" ? d.detail : JSON.stringify(d || e.message));
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(id) {
    if (!window.confirm("Deactivate this location?")) return;
    try {
      await adminRequest({ method: "delete", path: `/cafes/locations/${id}/` });
      await loadLocations();
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    }
  }

  return (
    <div className="admin-page">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <label className="flex flex-col gap-1 text-sm min-w-[200px]">
          <span className="text-[#5D4E37]">Filter by restaurant</span>
          <select
            className="d-select admin-select rounded-xl"
            value={filterRestaurant}
            onChange={(e) => setFilterRestaurant(e.target.value)}
          >
            <option value="">All</option>
            {restaurants.map((r) => (
              <option key={r.restaurant_id} value={r.restaurant_id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="d-btn d-btn-primary rounded-xl font-normal"
          onClick={openCreate}
        >
          <Plus size={18} /> Add location
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
                <th>Restaurant</th>
                <th>Address</th>
                <th>City</th>
                <th>Hours</th>
                <th>Active</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.location_id}>
                  <td>{r.restaurant_name}</td>
                  <td className="max-w-[200px] truncate">{r.address}</td>
                  <td>{r.city}</td>
                  <td className="max-w-[140px] truncate">{r.opening_hours}</td>
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
                      onClick={() => deactivate(r.location_id)}
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
        title={editingId ? "Edit location" : "New location"}
        footer={
          <button
            type="button"
            className="d-btn d-btn-primary border-0"
            disabled={saving || !form.restaurant}
            onClick={save}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        }
      >
        {error && dialogOpen ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#5D4E37]">Restaurant</span>
            <select
              className="d-select admin-select rounded-xl"
              value={form.restaurant}
              onChange={(e) => setForm({ ...form, restaurant: e.target.value })}
            >
              <option value="">Select…</option>
              {restaurants.map((r) => (
                <option key={r.restaurant_id} value={r.restaurant_id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#5D4E37]">Address</span>
            <input
              className="d-input rounded-xl border-[#E8DFD0]"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#5D4E37]">City</span>
            <input
              className="d-input rounded-xl border-[#E8DFD0]"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#5D4E37]">Opening hours</span>
            <input
              className="d-input rounded-xl border-[#E8DFD0]"
              placeholder="Mon–Sun 10:00–22:00"
              value={form.opening_hours}
              onChange={(e) => setForm({ ...form, opening_hours: e.target.value })}
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-[#5D4E37]">Latitude</span>
              <input
                className="d-input rounded-xl border-[#E8DFD0]"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-[#5D4E37]">Longitude</span>
              <input
                className="d-input rounded-xl border-[#E8DFD0]"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              />
            </label>
          </div>
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
