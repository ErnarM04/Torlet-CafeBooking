import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { adminRequest } from "../../../hooks/useAdminApi";
import AdminDialog from "../components/AdminDialog";
import TableMap from "../../../components/konva/TableMap";

const TABLE_TYPES = ["indoor", "outdoor", "vip", "terrace", "bar", "private"];

const emptyForm = {
  location: "",
  table_number: "",
  table_type: "indoor",
  min_guests: "1",
  max_guests: "4",
  position_x: "",
  position_y: "",
  shape: "rect",
  width: "",
  height: "",
  radius: "",
  rotation: "0",
  description: "",
  is_available: true,
  is_active: true,
};

export default function TablesManagement() {
  const { t } = useTranslation();
  const [locations, setLocations] = useState([]);
  const [filterLocation, setFilterLocation] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [pendingEdit, setPendingEdit] = useState({ id: null, at: 0 });
  const [showAdvanced, setShowAdvanced] = useState(false);
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

  // Make the hall constructor visible by default.
  useEffect(() => {
    if (filterLocation) return;
    if (!locations.length) return;
    setFilterLocation(locations[0].location_id);
  }, [locations, filterLocation]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  function openCreate() {
    setEditingId(null);
    setPendingEdit({ id: null, at: 0 });
    setShowAdvanced(false);
    setForm({
      ...emptyForm,
      location: filterLocation || "",
    });
    setDialogOpen(true);
  }

  async function openEdit(row) {
    setEditingId(row.table_id);
    setPendingEdit({ id: null, at: 0 });
    setShowAdvanced(true);
    setDialogOpen(true);
    setError("");
    try {
      const { data } = await adminRequest({
        path: `/cafes/tables/${row.table_id}/`,
      });
      setForm({
        location: data.location,
        table_number: data.table_number || "",
        table_type: data.table_type || "indoor",
        min_guests: String(data.min_guests ?? 1),
        max_guests: String(data.max_guests ?? 4),
        position_x: data.position_x ?? "",
        position_y: data.position_y ?? "",
        shape: data.shape || "rect",
        width: data.width ?? "",
        height: data.height ?? "",
        radius: data.radius ?? "",
        rotation: String(data.rotation ?? 0),
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
      position_x: form.position_x === "" ? null : parseInt(form.position_x, 10),
      position_y: form.position_y === "" ? null : parseInt(form.position_y, 10),
      shape: form.shape,
      width: form.width === "" ? null : parseInt(form.width, 10),
      height: form.height === "" ? null : parseInt(form.height, 10),
      radius: form.radius === "" ? null : parseInt(form.radius, 10),
      rotation: form.rotation === "" ? 0 : parseInt(form.rotation, 10),
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
    if (!window.confirm(t("admin.tablesDeactivateConfirm"))) return;
    try {
      await adminRequest({ method: "delete", path: `/cafes/tables/${id}/` });
      setRows((prev) =>
        prev.map((r) => (r.table_id === id ? { ...r, is_active: false } : r)),
      );
      if (editingId === id) {
        setEditingId(null);
        setPendingEdit({ id: null, at: 0 });
      }
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    }
  }

  function nextDuplicateNumber(baseNumber) {
    const existing = new Set(rows.map((r) => String(r.table_number || "").toLowerCase()));
    const base = `${String(baseNumber || "T").trim()}-copy`;
    if (!existing.has(base.toLowerCase())) return base;
    let i = 2;
    while (existing.has(`${base}-${i}`.toLowerCase())) i += 1;
    return `${base}-${i}`;
  }

  async function duplicateTable(row) {
    setError("");
    try {
      await adminRequest({
        method: "post",
        path: "/cafes/tables/",
        data: {
          location: row.location,
          table_number: nextDuplicateNumber(row.table_number),
          table_type: row.table_type || "indoor",
          min_guests: row.min_guests ?? 1,
          max_guests: row.max_guests ?? 4,
          position_x: row.position_x == null ? null : Number(row.position_x) + 20,
          position_y: row.position_y == null ? null : Number(row.position_y) + 20,
          shape: row.shape || "rect",
          width: row.width ?? null,
          height: row.height ?? null,
          radius: row.radius ?? null,
          rotation: row.rotation ?? 0,
          description: row.description || "",
          is_available: row.is_available !== false,
          is_active: row.is_active !== false,
        },
      });
      await loadTables();
    } catch (e) {
      setError(e.response?.data?.detail || e.message || "Failed to duplicate table");
    }
  }

  const tablesForMap = useMemo(() => {
    if (!filterLocation) return [];
    return rows.filter(
      (r) => String(r.location) === String(filterLocation) && r.is_active !== false,
    );
  }, [rows, filterLocation]);

  async function moveOnMap(tableId, pos) {
    try {
      await adminRequest({
        method: "patch",
        path: `/cafes/tables/${tableId}/`,
        data: { position_x: pos.x, position_y: pos.y },
      });
      setRows((prev) =>
        prev.map((t) =>
          t.table_id === tableId
            ? { ...t, position_x: pos.x, position_y: pos.y }
            : t,
        ),
      );
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    }
  }

  async function transformOnMap(tableId, patch) {
    try {
      await adminRequest({
        method: "patch",
        path: `/cafes/tables/${tableId}/`,
        data: patch,
      });
      setRows((prev) =>
        prev.map((t) => (t.table_id === tableId ? { ...t, ...patch } : t)),
      );
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    }
  }

  return (
    <div className="admin-page">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <label className="flex flex-col gap-1 text-sm min-w-[220px]">
          <span className="text-[#5D4E37]">{t("admin.tablesFilterByLocation")}</span>
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
        <button
          type="button"
          className="d-btn d-btn-primary rounded-xl font-normal"
          onClick={openCreate}
        >
          <Plus size={18} /> {t("admin.tablesAdd")}
        </button>
      </div>

      {filterLocation ? (
        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-[#E8DFD0] bg-white p-4">
          <p className="text-sm font-medium text-[#5D4E37]">{t("admin.tablesHallConstructor")}</p>
          <p className="text-sm text-[#7A7269]">
            {t("admin.tablesHallHint")}
          </p>
          <TableMap
            tables={tablesForMap}
            editable
            selectedId={editingId}
            onSelect={(id) => {
              if (!id) {
                setEditingId(null);
                setPendingEdit({ id: null, at: 0 });
                return;
              }
              // First click: select (for drag/resize). Second click (same id): open edit dialog.
              const now = Date.now();
              const isSecondClick =
                pendingEdit.id === id && now - pendingEdit.at <= 650;
              setEditingId(id);
              setPendingEdit({ id, at: now });
              if (isSecondClick) {
                const row = rows.find((r) => r.table_id === id);
                if (row) openEdit(row);
              }
            }}
            onMove={moveOnMap}
            onTransform={transformOnMap}
            aspectRatio={2}
            minHeight={280}
            maxHeight={460}
          />
        </div>
      ) : (
        <p className="mt-4 text-sm text-[#7A7269]">
          {t("admin.tablesSelectLocationHint")}
        </p>
      )}
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
                      title={t("admin.tablesDuplicate")}
                      onClick={() => duplicateTable(r)}
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      type="button"
                      className="d-btn d-btn-ghost d-btn-sm"
                      onClick={() => {
                        const now = Date.now();
                        const isSecondClick =
                          pendingEdit.id === r.table_id &&
                          now - pendingEdit.at <= 650;
                        setEditingId(r.table_id);
                        setPendingEdit({ id: r.table_id, at: now });
                        if (isSecondClick) openEdit(r);
                      }}
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
        title={editingId ? t("admin.tablesEditTitle") : t("admin.tablesNewTitle")}
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
        {error && dialogOpen ? (
          <p className="mb-3 text-sm text-red-600">{error}</p>
        ) : null}
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
              onChange={(e) =>
                setForm({ ...form, table_number: e.target.value })
              }
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
                onChange={(e) =>
                  setForm({ ...form, min_guests: e.target.value })
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-[#5D4E37]">Max guests</span>
              <input
                type="number"
                min={1}
                className="d-input rounded-xl border-[#E8DFD0]"
                value={form.max_guests}
                onChange={(e) =>
                  setForm({ ...form, max_guests: e.target.value })
                }
              />
            </label>
          </div>

          <div className="rounded-xl border border-[#E8DFD0] bg-[#FAF7F2] p-3">
            <button
              type="button"
              className="d-btn d-btn-ghost h-8 min-h-0 px-2 text-sm text-[#5D4E37]"
              onClick={() => setShowAdvanced((v) => !v)}
            >
              {showAdvanced ? t("admin.tablesHideAdditional") : t("admin.tablesAdditional")}
            </button>
            {showAdvanced ? (
              <div className="mt-3 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-[#5D4E37]">Map X</span>
                    <input
                      className="d-input rounded-xl border-[#E8DFD0]"
                      value={form.position_x}
                      onChange={(e) => setForm({ ...form, position_x: e.target.value })}
                      placeholder="120"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-[#5D4E37]">Map Y</span>
                    <input
                      className="d-input rounded-xl border-[#E8DFD0]"
                      value={form.position_y}
                      onChange={(e) => setForm({ ...form, position_y: e.target.value })}
                      placeholder="80"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-[#5D4E37]">Shape</span>
                    <select
                      className="d-select admin-select rounded-xl"
                      value={form.shape}
                      onChange={(e) => setForm({ ...form, shape: e.target.value })}
                    >
                      <option value="rect">rect</option>
                      <option value="round">round</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-[#5D4E37]">Rotation</span>
                    <input
                      className="d-input rounded-xl border-[#E8DFD0]"
                      value={form.rotation}
                      onChange={(e) => setForm({ ...form, rotation: e.target.value })}
                      placeholder="0"
                    />
                  </label>
                </div>
                {form.shape === "round" ? (
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-[#5D4E37]">Radius</span>
                    <input
                      className="d-input rounded-xl border-[#E8DFD0]"
                      value={form.radius}
                      onChange={(e) => setForm({ ...form, radius: e.target.value })}
                      placeholder="28"
                    />
                  </label>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="text-[#5D4E37]">Width</span>
                      <input
                        className="d-input rounded-xl border-[#E8DFD0]"
                        value={form.width}
                        onChange={(e) => setForm({ ...form, width: e.target.value })}
                        placeholder="64"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="text-[#5D4E37]">Height</span>
                      <input
                        className="d-input rounded-xl border-[#E8DFD0]"
                        value={form.height}
                        onChange={(e) => setForm({ ...form, height: e.target.value })}
                        placeholder="48"
                      />
                    </label>
                  </div>
                )}
              </div>
            ) : null}
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[#5D4E37]">Description</span>
            <textarea
              className="d-textarea rounded-xl border-[#E8DFD0] min-h-[60px]"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="d-checkbox"
              checked={form.is_available}
              onChange={(e) =>
                setForm({ ...form, is_available: e.target.checked })
              }
            />
            Available for booking
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="d-checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
            />
            Active
          </label>
        </div>
      </AdminDialog>
    </div>
  );
}
