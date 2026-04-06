import React, { useCallback, useEffect, useState } from "react";
import { Mail, Pencil, Phone, Search } from "lucide-react";
import { adminRequest } from "../../../hooks/useAdminApi";
import AdminDialog from "../components/AdminDialog";

export default function Customers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loyalty, setLoyalty] = useState("0");
  const [prefsJson, setPrefsJson] = useState("{}");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = search.trim() ? { search: search.trim() } : {};
      const { data } = await adminRequest({ path: "/staff/customers/", params });
      setRows(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      setError(e.response?.data?.detail || e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => load(), search ? 400 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  function openEdit(c) {
    setEditing(c);
    setLoyalty(String(c.loyalty_points ?? 0));
    setPrefsJson(JSON.stringify(c.preferences || {}, null, 2));
    setDialogOpen(true);
  }

  async function save() {
    if (!editing) return;
    let prefs;
    try {
      prefs = JSON.parse(prefsJson || "{}");
      if (typeof prefs !== "object" || prefs === null) throw new Error();
    } catch {
      setError("Preferences must be valid JSON object.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await adminRequest({
        method: "patch",
        path: `/staff/customers/${editing.user}/`,
        data: {
          loyalty_points: parseInt(loyalty, 10) || 0,
          preferences: prefs,
        },
      });
      setDialogOpen(false);
      await load();
    } catch (e) {
      const d = e.response?.data;
      setError(typeof d?.detail === "string" ? d.detail : JSON.stringify(d || e.message));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <label className="d-input admin-search flex w-full max-w-md items-center gap-2 rounded-xl border-[#E8DFD0] p-2.5">
        <Search size={20} color="#7A7269" />
        <input
          type="search"
          className="grow outline-none bg-transparent"
          placeholder="Search by phone, name, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      {error && !dialogOpen ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <span className="d-loading d-loading-dots" />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((c) => (
            <div key={c.user} className="admin-surface flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#8B6F47] text-lg font-semibold text-white">
                  {(c.first_name?.[0] || "?") + (c.last_name?.[0] || "")}
                </div>
                <button
                  type="button"
                  className="d-btn d-btn-ghost d-btn-sm"
                  onClick={() => openEdit(c)}
                  aria-label="Edit"
                >
                  <Pencil size={16} />
                </button>
              </div>
              <p className="text-left text-base font-semibold text-[#3D3935]">
                {c.first_name} {c.last_name}
              </p>
              <div className="flex flex-col gap-1.5 text-left text-sm text-[#7A7269]">
                <span className="flex items-center gap-2">
                  <Phone size={16} /> {c.phone_number}
                </span>
                <span className="flex items-center gap-2">
                  <Mail size={16} /> {c.email || "—"}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 border-t border-[#E8DFD0] pt-3 text-sm">
                <div>
                  <p className="text-xs text-[#7A7269]">Bookings</p>
                  <p className="font-semibold text-[#8B6F47]">{c.total_bookings}</p>
                </div>
                <div>
                  <p className="text-xs text-[#7A7269]">Loyalty</p>
                  <p className="font-semibold text-[#3D3935]">{c.loyalty_points}</p>
                </div>
                <div>
                  <p className="text-xs text-[#7A7269]">Cancelled</p>
                  <p className="font-semibold text-[#3D3935]">{c.cancelled_bookings}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Edit customer"
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
        {error && dialogOpen ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[#5D4E37]">Loyalty points</span>
          <input
            type="number"
            min={0}
            className="d-input rounded-xl border-[#E8DFD0]"
            value={loyalty}
            onChange={(e) => setLoyalty(e.target.value)}
          />
        </label>
        <label className="mt-3 flex flex-col gap-1 text-sm">
          <span className="text-[#5D4E37]">Preferences (JSON)</span>
          <textarea
            className="d-textarea font-mono text-xs rounded-xl border-[#E8DFD0]"
            rows={8}
            value={prefsJson}
            onChange={(e) => setPrefsJson(e.target.value)}
          />
        </label>
      </AdminDialog>
    </div>
  );
}
