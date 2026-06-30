import { LogOut, User, Bell } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";
import useBookings from "../../../hooks/useBookings";
import { useNavigate } from "react-router";
import {
    getBrowserNotificationPermission,
    requestBrowserNotificationPermission,
} from "../../../utils/browserNotifications";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
const PREFS_URL = `${API_BASE_URL}/auth/notification-preferences/`;

const DEFAULT_PREFS = {
    notifications_enabled: true,
    in_app_enabled: true,
    email_enabled: true,
    sms_enabled: false,
    browser_push_enabled: true,
    promotions_enabled: true,
    reminders_enabled: true,
};

function Settings(){
    const logout = useAuth((state) => state.logout);
    const access = useAuth((state) => state.access);
    const fetchNotificationPreferences = useBookings((state) => state.fetchNotificationPreferences);
    const navigate = useNavigate();
    const [prefs, setPrefs] = useState(DEFAULT_PREFS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [browserPermission, setBrowserPermission] = useState(getBrowserNotificationPermission());

    const loadPrefs = useCallback(async () => {
        if (!access) return;
        setLoading(true);
        setError("");
        try {
            const response = await axios.get(PREFS_URL, {
                headers: { Authorization: `Bearer ${access}` },
            });
            setPrefs({ ...DEFAULT_PREFS, ...response.data.preferences });
            await fetchNotificationPreferences();
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to load notification settings.");
        } finally {
            setLoading(false);
        }
    }, [access, fetchNotificationPreferences]);

    useEffect(() => {
        loadPrefs();
    }, [loadPrefs]);

    const updatePref = async (key, value) => {
        if (key === "browser_push_enabled" && value) {
            const permission = await requestBrowserNotificationPermission();
            setBrowserPermission(permission);
            if (permission !== "granted") {
                setError(
                    permission === "denied"
                        ? "Browser notifications are blocked. Enable them in your browser settings."
                        : "Browser notifications are not supported on this device.",
                );
                return;
            }
        }

        const next = { ...prefs, [key]: value };
        setPrefs(next);
        setSaving(true);
        setError("");
        try {
            const response = await axios.patch(
                PREFS_URL,
                { [key]: value },
                { headers: { Authorization: `Bearer ${access}` } },
            );
            setPrefs({ ...DEFAULT_PREFS, ...response.data.preferences });
            await fetchNotificationPreferences();
        } catch (err) {
            setPrefs(prefs);
            setError(err.response?.data?.detail || "Failed to save notification settings.");
        } finally {
            setSaving(false);
        }
    };

    const requestBrowserPermission = async () => {
        setSaving(true);
        setError("");
        const permission = await requestBrowserNotificationPermission();
        setBrowserPermission(permission);
        if (permission === "granted") {
            await updatePref("browser_push_enabled", true);
        } else if (permission === "denied") {
            setError("Browser notifications are blocked. Enable them in your browser settings.");
        } else if (permission === "unsupported") {
            setError("Browser notifications are not supported on this device.");
        }
        setSaving(false);
    };

    return (
        <div className="w-full flex justify-center bg-[#FAF7F2] min-w-0">
            <div className="max-w-5xl w-full flex flex-col py-8 sm:py-12 px-4 md:px-6 gap-6 sm:gap-8 min-w-0">
                <p className="text-[#5D4E37] text-2xl sm:text-3xl text-start">Settings</p>
                <div className="bg-white flex flex-col justify-start gap-6 p-6.25 rounded-2xl border border-[#E8DFD0] shadow">
                    <div className="flex flex-row gap-3 items-center">
                        <User className="w-10 h-10 p-2.5 rounded-[10px] bg-[#FAF7F2]" color="#8B6F47" size={20}/>
                        <p className="text-xl text-[#5D4E37] text-start">Personal Information</p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#5D4E37] text-sm font-normal">Full Name</legend>
                            <input className="d-input w-full px-4 py-3 bg-[#FAF7F2] rounded-[14px] border-[#E8DFD0] text-base text-[#0A0A0A] outline-none" type="text" placeholder="Full Name"/>
                        </fieldset>
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#5D4E37] text-sm font-normal">Email</legend>
                            <input className="d-input w-full px-4 py-3 bg-[#FAF7F2] rounded-[14px] border-[#E8DFD0] text-base text-[#0A0A0A] outline-none" type="email" placeholder="Email"/>
                        </fieldset>
                        <button className="d-btn d-btn-primary rounded-[10px] font-normal">Save Changes</button>
                    </div>
                </div>
                <div className="bg-white flex flex-col gap-6 p-6.25 rounded-2xl border border-[#E8DFD0] shadow">
                    <div className="flex flex-row gap-3 items-center">
                        <Bell className="w-10 h-10 p-2.5 rounded-[10px] bg-[#FAF7F2]" color="#8B6F47" size={20}/>
                        <p className="text-xl text-[#5D4E37] text-start">Notifications</p>
                    </div>
                    {error ? <p className="text-sm text-red-600">{error}</p> : null}
                    {loading ? (
                        <p className="text-sm text-[#7D6E5C]">Loading preferences...</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-row justify-between items-center">
                                <p className="text-base text-[#5D4E37]">In-app notifications</p>
                                <input
                                    type="checkbox"
                                    checked={Boolean(prefs.in_app_enabled)}
                                    disabled={saving}
                                    onChange={(e) => updatePref("in_app_enabled", e.target.checked)}
                                    className="d-toggle border-[#8B6F47] bg-[#FAF7F2] text-[#E8DFD0] checked:border-[#8B6F47] checked:text-[#8B6F47]"
                                />
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-base text-[#5D4E37]">Browser notifications</p>
                                    <p className="text-sm text-[#7D6E5C]">
                                        Permission: {browserPermission}
                                    </p>
                                </div>
                                {browserPermission === "granted" ? (
                                    <input
                                        type="checkbox"
                                        checked={Boolean(prefs.browser_push_enabled)}
                                        disabled={saving}
                                        onChange={(e) => updatePref("browser_push_enabled", e.target.checked)}
                                        className="d-toggle border-[#8B6F47] bg-[#FAF7F2] text-[#E8DFD0] checked:border-[#8B6F47] checked:text-[#8B6F47]"
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        className="d-btn d-btn-outline rounded-[10px]"
                                        disabled={saving || browserPermission === "unsupported"}
                                        onClick={requestBrowserPermission}
                                    >
                                        Allow in browser
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-row justify-between items-center">
                                <p className="text-base text-[#5D4E37]">Email reminders</p>
                                <input
                                    type="checkbox"
                                    checked={Boolean(prefs.email_enabled)}
                                    disabled={saving}
                                    onChange={(e) => updatePref("email_enabled", e.target.checked)}
                                    className="d-toggle border-[#8B6F47] bg-[#FAF7F2] text-[#E8DFD0] checked:border-[#8B6F47] checked:text-[#8B6F47]"
                                />
                            </div>
                            <div className="flex flex-row justify-between items-center">
                                <p className="text-base text-[#5D4E37]">Booking reminders (24h before)</p>
                                <input
                                    type="checkbox"
                                    checked={Boolean(prefs.reminders_enabled)}
                                    disabled={saving}
                                    onChange={(e) => updatePref("reminders_enabled", e.target.checked)}
                                    className="d-toggle border-[#8B6F47] bg-[#FAF7F2] text-[#E8DFD0] checked:border-[#8B6F47] checked:text-[#8B6F47]"
                                />
                            </div>
                            <div className="flex flex-row justify-between items-center">
                                <p className="text-base text-[#5D4E37]">Promotions & Updates</p>
                                <input
                                    type="checkbox"
                                    checked={Boolean(prefs.promotions_enabled)}
                                    disabled={saving}
                                    onChange={(e) => updatePref("promotions_enabled", e.target.checked)}
                                    className="d-toggle border-[#8B6F47] bg-[#FAF7F2] text-[#E8DFD0] checked:border-[#8B6F47] checked:text-[#8B6F47]"
                                />
                            </div>
                        </div>
                    )}
                </div>
                <button
                    className="flex flex-row gap-3 h-15 bg-white border border-[#E8DFD0] rounded-[14px] text-base text-[#5D4E37] items-center justify-center"
                    onClick={() => {
                        logout();
                        navigate("/customer/login");
                    }}
                >
                    <LogOut color="#5D4E37" size={18}/>Log Out
                </button>
            </div>
        </div>
    );
}

export default Settings;
