import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Building2, Clock, Bell, Bot, Shield, Plus, Save } from "lucide-react";
import useAdminAuth from "../../../hooks/useAdminAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
const PREFS_URL = `${API_BASE_URL}/auth/notification-preferences/`;

const DEFAULT_STAFF_PREFS = {
    new_booking_alerts: true,
    booking_confirmations: true,
    daily_summary: false,
};

export default function Settings(){
    const access = useAdminAuth((state) => state.access);
    const [notificationPrefs, setNotificationPrefs] = useState(DEFAULT_STAFF_PREFS);
    const [prefsLoading, setPrefsLoading] = useState(true);
    const [prefsSaving, setPrefsSaving] = useState(false);
    const [prefsError, setPrefsError] = useState("");

    const loadNotificationPrefs = useCallback(async () => {
        if (!access) return;
        setPrefsLoading(true);
        setPrefsError("");
        try {
            const response = await axios.get(PREFS_URL, {
                headers: { Authorization: `Bearer ${access}` },
            });
            setNotificationPrefs({ ...DEFAULT_STAFF_PREFS, ...response.data.preferences });
        } catch (err) {
            setPrefsError(err.response?.data?.detail || "Failed to load notification settings.");
        } finally {
            setPrefsLoading(false);
        }
    }, [access]);

    useEffect(() => {
        loadNotificationPrefs();
    }, [loadNotificationPrefs]);

    const updateNotificationPref = async (key, value) => {
        const previous = notificationPrefs;
        const next = { ...notificationPrefs, [key]: value };
        setNotificationPrefs(next);
        setPrefsSaving(true);
        setPrefsError("");
        try {
            const response = await axios.patch(
                PREFS_URL,
                { [key]: value },
                { headers: { Authorization: `Bearer ${access}` } },
            );
            setNotificationPrefs({ ...DEFAULT_STAFF_PREFS, ...response.data.preferences });
        } catch (err) {
            setNotificationPrefs(previous);
            setPrefsError(err.response?.data?.detail || "Failed to save notification settings.");
        } finally {
            setPrefsSaving(false);
        }
    };

    return (
        <div className="admin-page max-w-5xl">
            <div className="admin-surface flex flex-col p-4 md:p-6.25 gap-6">
                <div className="flex flex-row items-center gap-3">
                    <Building2 className="bg-[#8B6F47]/10 w-10 h-10 p-2 rounded-xl" color="#8B6F47" size={24}/>
                    <p className="text-xl text-[#3D3935] font-semibold">Café Information</p>
                </div>
                <div className="flex flex-col gap-4">
                    <fieldset className="d-fieldset">
                        <legend className="d-fieldset-legend text-[#3D3935] text-sm font-medium">Cafe Name</legend>
                        <input className="d-input w-full px-4 py-2.5 bg-white rounded-xl border-[#8B6F47]/15 text-base text-[#3D3935] outline-none" type="text" placeholder="The Cozy Cafe"/>
                    </fieldset>
                    <div className="flex flex-col md:flex-row gap-4">
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#3D3935] text-sm font-medium">Email</legend>
                            <input className="d-input w-full px-4 py-2.5 bg-white rounded-xl border-[#8B6F47]/15 text-base text-[#3D3935] outline-none" type="text" placeholder="admin@cafe.com"/>
                        </fieldset>
                        <fieldset className="d-fieldset">
                            <legend className="d-fieldset-legend text-[#3D3935] text-sm font-medium">Phone</legend>
                            <input className="d-input w-full px-4 py-2.5 bg-white rounded-xl border-[#8B6F47]/15 text-base text-[#3D3935] outline-none" type="text" placeholder="+1 234-567-8900"/>
                        </fieldset>
                    </div>
                    <fieldset className="d-fieldset">
                        <legend className="d-fieldset-legend text-[#3D3935] text-sm font-medium">Address</legend>
                        <input className="d-input w-full px-4 py-2.5 bg-white rounded-xl border-[#8B6F47]/15 text-base text-[#3D3935] outline-none" type="text" placeholder="123 Main Street, City, State 12345"/>
                    </fieldset>
                </div>
            </div>
            <div className="admin-surface flex flex-col p-4 md:p-6.25 gap-6">
                <div className="flex flex-row items-center gap-3">
                    <Clock className="bg-[#8B6F47]/10 w-10 h-10 p-2 rounded-xl" color="#8B6F47" size={24}/>
                    <p className="text-xl text-[#3D3935] font-semibold">Working Hours</p>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-center justify-start">
                        <p className="w-full sm:min-w-32 sm:w-auto text-start text-base text-[#3D3935] font-medium">Monday</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="text-[#7A7269] text-base">to</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="flex flex-row gap-2 items-center text-[#3D3935] text-sm"><input className="d-checkbox" type="checkbox" title="Open"/>Open</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-center justify-start">
                        <p className="w-full sm:min-w-32 sm:w-auto text-start text-base text-[#3D3935] font-medium">Tuesday</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="text-[#7A7269] text-base">to</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="flex flex-row gap-2 items-center text-[#3D3935] text-sm"><input className="d-checkbox" type="checkbox" title="Open"/>Open</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-center justify-start">
                        <p className="w-full sm:min-w-32 sm:w-auto text-start text-base text-[#3D3935] font-medium">Wednesday</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="text-[#7A7269] text-base">to</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="flex flex-row gap-2 items-center text-[#3D3935] text-sm"><input className="d-checkbox" type="checkbox" title="Open"/>Open</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-center justify-start">
                        <p className="w-full sm:min-w-32 sm:w-auto text-start text-base text-[#3D3935] font-medium">Thursday</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="text-[#7A7269] text-base">to</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="flex flex-row gap-2 items-center text-[#3D3935] text-sm"><input className="d-checkbox" type="checkbox" title="Open"/>Open</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-center justify-start">
                        <p className="w-full sm:min-w-32 sm:w-auto text-start text-base text-[#3D3935] font-medium">Friday</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="text-[#7A7269] text-base">to</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="flex flex-row gap-2 items-center text-[#3D3935] text-sm"><input className="d-checkbox" type="checkbox" title="Open"/>Open</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-center justify-start">
                        <p className="w-full sm:min-w-32 sm:w-auto text-start text-base text-[#3D3935] font-medium">Saturday</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="text-[#7A7269] text-base">to</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="flex flex-row gap-2 items-center text-[#3D3935] text-sm"><input className="d-checkbox" type="checkbox" title="Open"/>Open</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-center justify-start">
                        <p className="w-full sm:min-w-32 sm:w-auto text-start text-base text-[#3D3935] font-medium">Sunday</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="text-[#7A7269] text-base">to</p>
                        <input className="d-input min-w-32 text-center" type="time" value="23:59"/>
                        <p className="flex flex-row gap-2 items-center text-[#3D3935] text-sm"><input className="d-checkbox" type="checkbox" title="Open"/>Open</p>
                    </div>
                </div>
            </div>
            <div className="admin-surface flex flex-col p-4 md:p-6.25 gap-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                    <div className="flex flex-row items-center gap-3">
                        <Building2 className="bg-[#8B6F47]/10 w-10 h-10 p-2 rounded-xl" color="#8B6F47" size={24}/>
                        <p className="text-xl text-[#3D3935] font-semibold">Branches</p>
                    </div>
                    <button className="d-btn d-btn-primary rounded-xl "><Plus/>Add Branch</button>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between p-4 bg-[#F5EFE7] rounded-xl">
                        <div className="flex flex-col text-start">
                            <p className="text-base text-[#3D3935] font-medium">Main Branch</p>
                            <p className="text-sm text-[#7A7269]">123 Main Street, City</p>
                        </div>
                        <span className="d-badge d-badge-success">Active</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between p-4 bg-[#F5EFE7] rounded-xl">
                        <div className="flex flex-col text-start">
                            <p className="text-base text-[#3D3935] font-medium">Main Branch</p>
                            <p className="text-sm text-[#7A7269]">123 Main Street, City</p>
                        </div>
                        <span className="d-badge d-badge-success">Active</span>
                    </div>
                </div>
            </div>
            <div className="admin-surface flex flex-col p-4 md:p-6.25 gap-6">
                    <div className="flex flex-row items-center gap-3">
                        <Bell className="bg-[#8B6F47]/10 w-10 h-10 p-2 rounded-xl" color="#8B6F47" size={24}/>
                        <p className="text-xl text-[#3D3935] font-semibold">Notifications</p>
                    </div>
                {prefsError ? <p className="text-sm text-red-600">{prefsError}</p> : null}
                {prefsLoading ? (
                    <p className="text-sm text-[#7A7269]">Loading notification preferences...</p>
                ) : (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between p-4 bg-[#F5EFE7] rounded-xl">
                        <div className="flex flex-col text-start">
                            <p className="text-base text-[#3D3935] font-medium">New Booking Alerts</p>
                            <p className="text-sm text-[#7A7269]">Get notified when new bookings are made</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={Boolean(notificationPrefs.new_booking_alerts)}
                            disabled={prefsSaving}
                            onChange={(e) => updateNotificationPref("new_booking_alerts", e.target.checked)}
                            className="d-toggle border-[#8B6F47] bg-[#FAF7F2] text-[#E8DFD0] checked:border-[#8B6F47] checked:text-[#8B6F47]"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between p-4 bg-[#F5EFE7] rounded-xl">
                        <div className="flex flex-col text-start">
                            <p className="text-base text-[#3D3935] font-medium">Booking Confirmations</p>
                            <p className="text-sm text-[#7A7269]">Notify when bookings are confirmed</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={Boolean(notificationPrefs.booking_confirmations)}
                            disabled={prefsSaving}
                            onChange={(e) => updateNotificationPref("booking_confirmations", e.target.checked)}
                            className="d-toggle border-[#8B6F47] bg-[#FAF7F2] text-[#E8DFD0] checked:border-[#8B6F47] checked:text-[#8B6F47]"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between p-4 bg-[#F5EFE7] rounded-xl">
                        <div className="flex flex-col text-start">
                            <p className="text-base text-[#3D3935] font-medium">Daily Summary</p>
                            <p className="text-sm text-[#7A7269]">Receive daily booking summary emails</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={Boolean(notificationPrefs.daily_summary)}
                            disabled={prefsSaving}
                            onChange={(e) => updateNotificationPref("daily_summary", e.target.checked)}
                            className="d-toggle border-[#8B6F47] bg-[#FAF7F2] text-[#E8DFD0] checked:border-[#8B6F47] checked:text-[#8B6F47]"
                        />
                    </div>
                </div>
                )}
            </div>
            <div className="admin-surface flex flex-col p-4 md:p-6.25 gap-6">
                    <div className="flex flex-row items-center gap-3">
                        <Bot className="bg-[#8B6F47]/10 w-10 h-10 p-2 rounded-xl" color="#8B6F47" size={24}/>
                        <p className="text-xl text-[#3D3935] font-semibold">AI Assistant Configuration</p>
                    </div>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between p-4 bg-[#F5EFE7] rounded-xl">
                        <div className="flex flex-col text-start">
                            <p className="text-base text-[#3D3935] font-medium">Enable AI Assistant</p>
                            <p className="text-sm text-[#7A7269]">Allow AI to help with booking insights</p>
                        </div>
                        <input type="checkbox" defaultChecked className="d-toggle border-[#8B6F47] bg-[#FAF7F2] text-[#E8DFD0] checked:border-[#8B6F47] checked:text-[#8B6F47]"/>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between p-4 bg-[#F5EFE7] rounded-xl">
                        <div className="flex flex-col text-start">
                            <p className="text-base text-[#3D3935] font-medium">Auto-suggestions</p>
                            <p className="text-sm text-[#7A7269]">Get AI-powered recommendations</p>
                        </div>
                        <input type="checkbox" defaultChecked className="d-toggle border-[#8B6F47] bg-[#FAF7F2] text-[#E8DFD0] checked:border-[#8B6F47] checked:text-[#8B6F47]"/>
                    </div>
                </div>
            </div>
            <div className="admin-surface flex flex-col p-4 md:p-6.25 gap-6">
                    <div className="flex flex-row items-center gap-3">
                        <Shield className="bg-[#8B6F47]/10 w-10 h-10 p-2 rounded-xl" color="#8B6F47" size={24}/>
                        <p className="text-xl text-[#3D3935] font-semibold">Security</p>
                    </div>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between p-4 bg-[#F5EFE7] rounded-xl">
                        <div className="flex flex-col text-start">
                            <p className="text-base text-[#3D3935] font-medium">Change Password</p>
                            <p className="text-sm text-[#7A7269]">Update your account password</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between p-4 bg-[#F5EFE7] rounded-xl">
                        <div className="flex flex-col text-start">
                            <p className="text-base text-[#3D3935] font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-[#7A7269]">Add an extra layer of security</p>
                        </div>
                    </div>
                </div>
            </div>
            <button className="d-btn d-btn-primary text-base font-normal justify-self-end w-full sm:w-fit rounded-xl"><Save size={20}/>Save changes</button>
        </div>
    );
}