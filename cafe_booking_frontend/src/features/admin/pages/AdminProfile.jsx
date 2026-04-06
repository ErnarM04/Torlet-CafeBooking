import React, { useEffect, useState } from "react";
import { IdCard, LogOut, Mail, Phone, Save, Shield, User } from "lucide-react";
import { Navigate, useNavigate } from "react-router";
import useAdminAuth from "../../../hooks/useAdminAuth";

export default function AdminProfile() {
  const navigate = useNavigate();
  const isLoggedIn = useAdminAuth((s) => s.isLoggedIn);
  const fetchProfile = useAdminAuth((s) => s.fetchProfile);
  const updateProfile = useAdminAuth((s) => s.updateProfile);
  const logout = useAdminAuth((s) => s.logout);

  const first_name = useAdminAuth((s) => s.first_name);
  const last_name = useAdminAuth((s) => s.last_name);
  const email = useAdminAuth((s) => s.email);
  const phone_number = useAdminAuth((s) => s.phone_number);
  const staff_id = useAdminAuth((s) => s.staff_id);
  const is_staff = useAdminAuth((s) => s.is_staff);
  const is_restaurant_staff = useAdminAuth((s) => s.is_restaurant_staff);

  const [fn, setFn] = useState(first_name);
  const [ln, setLn] = useState(last_name);
  const [em, setEm] = useState(email);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk] = useState(false);

  useEffect(() => {
    if (isLoggedIn) fetchProfile();
  }, [isLoggedIn, fetchProfile]);

  useEffect(() => {
    setFn(first_name);
    setLn(last_name);
    setEm(email);
  }, [first_name, last_name, email]);

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaveError("");
    setSaveOk(false);
    setSaving(true);
    try {
      await updateProfile({
        first_name: fn.trim(),
        last_name: ln.trim(),
        email: em.trim(),
      });
      setSaveOk(true);
    } catch (err) {
      const d = err.response?.data;
      let msg = "Could not save changes.";
      if (typeof d?.detail === "string") msg = d.detail;
      else if (d?.email?.length) msg = d.email[0];
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <p className="text-2xl font-semibold text-[#3D3935] md:text-3xl">Profile</p>

      <div className="admin-surface flex flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-row flex-wrap items-center gap-4">
            <User className="h-16 w-16 shrink-0 rounded-full bg-[#8B6F47] p-4 text-white" />
            <div>
              <p className="text-xl font-semibold text-[#3D3935]">
                {first_name} {last_name}
              </p>
              <p className="text-sm text-[#7A7269]">Restaurant staff</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {is_staff ? (
                  <span className="rounded-full bg-[#8B6F47]/15 px-3 py-0.5 text-xs font-medium text-[#8B6F47]">
                    Staff (Django)
                  </span>
                ) : null}
                {is_restaurant_staff ? (
                  <span className="rounded-full bg-[#E8DFD0] px-3 py-0.5 text-xs font-medium text-[#5D4E37]">
                    Cafe staff profile
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="d-btn d-btn-outline border-[#c9b89a] text-[#5D4E37]"
            onClick={() => {
              logout();
              navigate("/admin/login", { replace: true });
            }}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border border-[#E8DFD0] bg-[#FAF7F2] p-4">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#8B6F47]" />
            <div>
              <p className="text-xs text-[#7A7269]">Phone (login)</p>
              <p className="text-sm font-medium text-[#3D3935]">{phone_number || "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-[#E8DFD0] bg-[#FAF7F2] p-4">
            <IdCard className="mt-0.5 h-5 w-5 shrink-0 text-[#8B6F47]" />
            <div>
              <p className="text-xs text-[#7A7269]">Staff ID</p>
              <p className="break-all text-sm font-medium text-[#3D3935]">
                {staff_id || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-surface flex flex-col gap-6 p-6 md:p-8">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#8B6F47]" />
          <p className="text-lg font-semibold text-[#3D3935]">Edit details</p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSave}>
          <fieldset className="d-fieldset">
            <legend className="d-fieldset-legend text-sm text-[#5D4E37]">First name</legend>
            <input
              className="d-input w-full max-w-md rounded-xl border-[#E8DFD0]"
              value={fn}
              onChange={(e) => setFn(e.target.value)}
            />
          </fieldset>
          <fieldset className="d-fieldset">
            <legend className="d-fieldset-legend text-sm text-[#5D4E37]">Last name</legend>
            <input
              className="d-input w-full max-w-md rounded-xl border-[#E8DFD0]"
              value={ln}
              onChange={(e) => setLn(e.target.value)}
            />
          </fieldset>
          <fieldset className="d-fieldset">
            <legend className="d-fieldset-legend flex items-center gap-1 text-sm text-[#5D4E37]">
              <Mail className="h-3.5 w-3.5" /> Email
            </legend>
            <input
              className="d-input w-full max-w-md rounded-xl border-[#E8DFD0]"
              type="email"
              value={em}
              onChange={(e) => setEm(e.target.value)}
            />
          </fieldset>
          {saveError ? <p className="text-sm text-red-600">{saveError}</p> : null}
          {saveOk ? (
            <p className="text-sm text-[#5D7D4E]">Profile updated.</p>
          ) : null}
          <button
            type="submit"
            className="d-btn d-btn-primary w-full max-w-xs border-0"
            disabled={saving}
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
