import React, { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { adminRequest } from "../../../hooks/useAdminApi";
import AdminDialog from "../components/AdminDialog";

const emptyForm = {
  name: "",
  description: "",
  cuisine_type: "",
  address: "",
  city: "Almaty",
  latitude: "",
  longitude: "",
  images: "[]",
  is_active: true,
  rating: "",
  total_reviews: "",
};

export default function RestaurantsManagement() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await adminRequest({ path: "/cafes/restaurants/" });
      setRows(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      setError(e.response?.data?.detail || e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  async function openEdit(r) {
    setEditingId(r.restaurant_id);
    setDialogOpen(true);
    setError("");
    try {
      const { data } = await adminRequest({
        path: `/cafes/restaurants/${r.restaurant_id}/`,
      });
      setForm({
        name: data.name || "",
        description: data.description || "",
        cuisine_type: data.cuisine_type || "",
        address: data.address || "",
        city: data.city || "Almaty",
        latitude: data.latitude != null ? String(data.latitude) : "",
        longitude: data.longitude != null ? String(data.longitude) : "",
        images: JSON.stringify(data.images || [], null, 0),
        is_active: data.is_active !== false,
        rating: data.rating != null ? String(data.rating) : "",
        total_reviews: data.total_reviews != null ? String(data.total_reviews) : "",
      });
    } catch (e) {
      setError(e.response?.data?.detail || e.message || "Failed to load restaurant");
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    let images = [];
    try {
      images = JSON.parse(form.images || "[]");
      if (!Array.isArray(images)) throw new Error();
    } catch {
      setError("Images must be a JSON array of URLs.");
      setSaving(false);
      return;
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      cuisine_type: form.cuisine_type.trim(),
      address: form.address.trim(),
      city: form.city.trim() || "Almaty",
      images,
      is_active: form.is_active,
    };
    if (form.latitude !== "") payload.latitude = form.latitude;
    if (form.longitude !== "") payload.longitude = form.longitude;
    if (form.rating !== "") payload.rating = parseFloat(form.rating);
    if (form.total_reviews !== "") payload.total_reviews = parseInt(form.total_reviews, 10);

    try {
      if (editingId) {
        await adminRequest({
          method: "patch",
          path: `/cafes/restaurants/${editingId}/`,
          data: payload,
        });
      } else {
        await adminRequest({
          method: "post",
          path: "/cafes/restaurants/",
          data: payload,
        });
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      const d = e.response?.data;
      setError(
        typeof d?.detail === "string"
          ? d.detail
          : JSON.stringify(d || e.message),
      );
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(id) {
    if (!window.confirm("Deactivate this restaurant? It will be hidden from guests.")) return;
    try {
      await adminRequest({ method: "delete", path: `/cafes/restaurants/${id}/` });
      await load();
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    }
  }

  return (
    <div className="admin-page">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[#7A7269] text-sm">
          Create and manage restaurants. Delete deactivates (soft) for guests.
        </p>
        <button
          type="button"
          className="d-btn d-btn-primary rounded-xl font-normal"
          onClick={openCreate}
        >
          <Plus size={18} /> Add restaurant
        </button>
      </div>
      {error && !dialogOpen ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}
      {loading ? (
        <span className="d-loading d-loading-dots" />
      ) : (
        <div className="admin-surface admin-table-wrap">
          <table className="d-table d-table-untitled text-sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Cuisine</th>
                <th>Rating</th>
                <th>Active</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.restaurant_id}>
                  <td className="font-medium text-[#3D3935]">{r.name}</td>
                  <td>{r.city}</td>
                  <td>{r.cuisine_type}</td>
                  <td>{r.rating}</td>
                  <td>{r.is_active ? "Yes" : "No"}</td>
                  <td className="flex gap-1">
                    <button
                      type="button"
                      className="d-btn d-btn-ghost d-btn-sm"
                      onClick={() => openEdit(r)}
                      aria-label="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className="d-btn d-btn-ghost d-btn-sm text-red-700"
                      onClick={() => deactivate(r.restaurant_id)}
                      aria-label="Deactivate"
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
        title={editingId ? "Edit restaurant" : "New restaurant"}
        footer={
          <button
            type="button"
            className="d-btn d-btn-primary border-0"
            disabled={saving}
            onClick={save}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        }
      >
        {error && dialogOpen ? (
          <p className="mb-3 text-sm text-red-600">{error}</p>
        ) : null}
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#5D4E37]">Name</span>
            <input
              className="d-input w-full rounded-xl border-[#E8DFD0]"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#5D4E37]">Description</span>
            <textarea
              className="d-textarea w-full rounded-xl border-[#E8DFD0] min-h-[72px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#5D4E37]">Cuisine type</span>
            <input
              className="d-input w-full rounded-xl border-[#E8DFD0]"
              value={form.cuisine_type}
              onChange={(e) => setForm({ ...form, cuisine_type: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#5D4E37]">Address</span>
            <input
              className="d-input w-full rounded-xl border-[#E8DFD0]"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#5D4E37]">City</span>
            <input
              className="d-input w-full rounded-xl border-[#E8DFD0]"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-[#5D4E37]">Latitude</span>
              <input
                className="d-input w-full rounded-xl border-[#E8DFD0]"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-[#5D4E37]">Longitude</span>
              <input
                className="d-input w-full rounded-xl border-[#E8DFD0]"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#5D4E37]">Images (JSON array of URLs)</span>
            <textarea
              className="d-textarea font-mono text-xs rounded-xl border-[#E8DFD0]"
              rows={3}
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-[#5D4E37]">Rating</span>
              <input
                className="d-input w-full rounded-xl border-[#E8DFD0]"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-[#5D4E37]">Total reviews</span>
              <input
                className="d-input w-full rounded-xl border-[#E8DFD0]"
                type="number"
                min="0"
                value={form.total_reviews}
                onChange={(e) => setForm({ ...form, total_reviews: e.target.value })}
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
            Active (visible to guests)
          </label>
        </div>
      </AdminDialog>
    </div>
  );
}
