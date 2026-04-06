import React, { useState } from "react";
import { Ban, Coffee } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import useAdminAuth from "../../../hooks/useAdminAuth";
import LanguageSwitcher from "../../../components/LanguageSwitcher";

export default function AdminLogin() {
  const { t } = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const login = useAdminAuth((s) => s.login);
  const isLoggedIn = useAdminAuth((s) => s.isLoggedIn);

  function validate(e) {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError(t("customer.loginErrPhone"));
      return false;
    }
    if (!password) {
      setError(t("customer.loginErrPass"));
      return false;
    }
    setError("");
    return true;
  }

  if (isLoggedIn) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="relative flex min-h-screen flex-1 w-full min-w-0 flex-col items-center justify-center gap-8 bg-[#FAF7F2] px-4 py-8">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <LanguageSwitcher />
      </div>
      <div className="flex flex-col items-center text-center">
        <div className="flex flex-row items-center gap-3">
          <Coffee className="rounded-full bg-[#8B6F47] p-3" size={56} color="white" />
          <div className="text-start">
            <p className="text-2xl font-bold text-[#3D3935] sm:text-3xl">{t("admin.brand")}</p>
            <p className="text-sm text-[#7A7269]">{t("admin.loginStaff")}</p>
          </div>
        </div>
        <p className="mt-2 text-base text-[#7D6E5C]">{t("admin.loginHint")}</p>
      </div>

      <div className="w-full max-w-md flex flex-col gap-6 rounded-2xl border border-[#E8DFD0] bg-white p-6 shadow sm:p-8">
        <form
          className="flex flex-col gap-6"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!validate(e)) return;
            const result = await login(phoneNumber.trim(), password);
            if (result.success) {
              navigate("/admin/dashboard", { replace: true });
            } else {
              setError(result.error || t("admin.loginFailed"));
            }
          }}
        >
          <fieldset className="d-fieldset">
            <legend className="d-fieldset-legend text-sm font-medium text-[#5D4E37]">{t("admin.loginPhone")}</legend>
            <input
              className="d-input w-full rounded-[14px] border-[#E8DFD0] bg-white px-4 py-2.5 text-base text-[#3D3935]"
              type="text"
              autoComplete="username"
              placeholder="+77000000009"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </fieldset>
          <fieldset className="d-fieldset">
            <legend className="d-fieldset-legend text-sm font-medium text-[#5D4E37]">{t("admin.loginPass")}</legend>
            <input
              className="d-input w-full rounded-[14px] border-[#E8DFD0] bg-white px-4 py-2.5 text-base text-[#3D3935]"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </fieldset>
          {error ? (
            <div role="alert" className="d-alert d-alert-error">
              <Ban />
              <span>{error}</span>
            </div>
          ) : null}
          <button type="submit" className="h-12 rounded-[14px] bg-[#8B6F47] text-base text-white">
            {t("admin.loginSubmit")}
          </button>
        </form>
        <Link to="/" className="text-center text-sm text-[#8B6F47]">
          {t("common.back")}
        </Link>
      </div>
    </div>
  );
}
