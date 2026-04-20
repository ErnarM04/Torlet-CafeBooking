import { create } from "zustand";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
const URL = `${API_BASE_URL}/auth`;
const AUTH_STORAGE_KEY = "cafe_auth_state";

function readStoredAuth() {
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function persistAuth(state) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

function clearStoredAuth() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

function axiosErrorMessage(error, fallback) {
    const data = error.response?.data;
    if (!data) return fallback;
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) return data.detail.join(" ");
    if (data.non_field_errors?.length) return data.non_field_errors.join(" ");
    if (data.phone_number?.length) return data.phone_number[0];
    if (data.password?.length) return data.password[0];
    return fallback;
}

const useAuth = create((set) => ({
    access: readStoredAuth()?.access || "",
    refreshToken: readStoredAuth()?.refreshToken || "",
    first_name: readStoredAuth()?.first_name || "",
    last_name: readStoredAuth()?.last_name || "",
    phone_number: readStoredAuth()?.phone_number || "",
    email: readStoredAuth()?.email || "",
    isLoggedIn: Boolean(readStoredAuth()?.access),
    setAccess: (newAccess) => {
        set((state) => {
            const next = { ...state, access: newAccess, isLoggedIn: Boolean(newAccess) };
            persistAuth(next);
            return { access: newAccess, isLoggedIn: Boolean(newAccess) };
        });
    },
    setToken: (newAccess, newRefresh) => {
        set((state) => {
            const next = { ...state, access: newAccess, refreshToken: newRefresh, isLoggedIn: Boolean(newAccess) };
            persistAuth(next);
            return { access: newAccess, refreshToken: newRefresh, isLoggedIn: Boolean(newAccess) };
        });
    },
    setUser: (first_name, last_name, email, phone_number) => {
        set((state) => {
            const next = { ...state, first_name, last_name, email, phone_number };
            persistAuth(next);
            return { first_name, last_name, email, phone_number };
        });
    },
    refreshAccessToken: async (refreshToken) => {
        try {
            const response = await axios.post(URL + "/refresh/", {
                refresh: refreshToken,
            });
            const { access } = response.data;
            useAuth.getState().setAccess(access);
            return true;
        } catch (error) {
            console.log(error);
            useAuth.getState().logout();
            return false;
        }
    },
    fetchProfile: async () => {
        const { access } = useAuth.getState();
        if (!access) return false;
        try {
            const response = await axios.get(URL + "/profile/", {
                headers: {
                    Authorization: `Bearer ${access}`,
                },
            });
            const { first_name, last_name, email, phone_number } = response.data;
            useAuth.getState().setUser(first_name || "", last_name || "", email || "", phone_number || "");
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    },
    login: async (phone_number, password) => {
        try {
            const response = await axios.post(URL + "/login/", {
                phone_number,
                password,
            });

            const { access, refresh, user } = response.data;
            const { first_name, last_name, email, phone_number: phone } = user;

            set({
                access,
                refreshToken: refresh,
                first_name,
                last_name,
                email,
                phone_number: phone,
                isLoggedIn: true,
            });
            persistAuth({
                access,
                refreshToken: refresh,
                first_name,
                last_name,
                email,
                phone_number: phone,
                isLoggedIn: true,
            });

            return { success: true };
        } catch (error) {
            console.log(error);
            return {
                success: false,
                error: axiosErrorMessage(
                    error,
                    "Invalid phone number or password.",
                ),
            };
        }
    },
    register: async (first_name, last_name, email, phone_number, password) => {
        try {
            await axios.post(URL + "/register/", {
                phone_number,
                first_name,
                last_name,
                email,
                password,
            });
            const { success } = await useAuth.getState().login(phone_number, password);
            return success;
        } catch (error) {
            console.log(error);
            return false;
        }
    },

    requestSmsCode: async (phone_number) => {
        try {
            const res = await axios.post(URL + "/sms/send/", { phone_number });
            return { success: true, dev_code: res.data?.dev_code };
        } catch (error) {
            return { success: false, error: axiosErrorMessage(error, "Failed to send SMS code.") };
        }
    },

    verifySmsCode: async (phone_number, code) => {
        try {
            await axios.post(URL + "/sms/verify/", { phone_number, code });
            return { success: true };
        } catch (error) {
            return { success: false, error: axiosErrorMessage(error, "Invalid or expired code.") };
        }
    },
    logout: () => {
        clearStoredAuth();
        set({
            access: "",
            refreshToken: "",
            first_name: "",
            last_name: "",
            phone_number: "",
            email: "",
            isLoggedIn: false,
        });
    },
}));

export default useAuth;