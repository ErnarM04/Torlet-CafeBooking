import { create } from "zustand";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
const AUTH_URL = `${API_BASE_URL}/auth`;
const ADMIN_AUTH_STORAGE_KEY = "cafe_admin_auth_state";

function readStored() {
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function snapshotFromState(s) {
  return {
    access: s.access,
    refreshToken: s.refreshToken,
    first_name: s.first_name,
    last_name: s.last_name,
    email: s.email,
    phone_number: s.phone_number,
    user_id: s.user_id,
    staff_id: s.staff_id,
    is_staff: s.is_staff,
    is_restaurant_staff: s.is_restaurant_staff,
    isLoggedIn: Boolean(s.access),
  };
}

function persistState(get) {
  localStorage.setItem(
    ADMIN_AUTH_STORAGE_KEY,
    JSON.stringify(snapshotFromState(get())),
  );
}

function clearStored() {
  localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
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

const initial = readStored() || {};

const useAdminAuth = create((set, get) => ({
  access: initial.access || "",
  refreshToken: initial.refreshToken || "",
  first_name: initial.first_name || "",
  last_name: initial.last_name || "",
  email: initial.email || "",
  phone_number: initial.phone_number || "",
  user_id: initial.user_id || "",
  staff_id: initial.staff_id || "",
  is_staff: Boolean(initial.is_staff),
  is_restaurant_staff: Boolean(initial.is_restaurant_staff),
  isLoggedIn: Boolean(initial.access),

  _applyProfile(d) {
    set({
      first_name: d.first_name || "",
      last_name: d.last_name || "",
      email: d.email || "",
      phone_number: d.phone_number || "",
      user_id: d.user_id ? String(d.user_id) : "",
      staff_id: d.staff_id ? String(d.staff_id) : "",
      is_staff: Boolean(d.is_staff),
      is_restaurant_staff: Boolean(d.is_restaurant_staff),
    });
    persistState(get);
  },

  setAccess(newAccess) {
    set({ access: newAccess, isLoggedIn: Boolean(newAccess) });
    persistState(get);
  },

  refreshAccessToken: async (refreshToken) => {
    try {
      const response = await axios.post(`${AUTH_URL}/refresh/`, {
        refresh: refreshToken,
      });
      const { access } = response.data;
      get().setAccess(access);
      return true;
    } catch {
      get().logout();
      return false;
    }
  },

  authorizedRequest: async (config) => {
    let access = get().access;
    const { refreshToken } = get();

    if (!access && refreshToken) {
      await get().refreshAccessToken(refreshToken);
      access = get().access;
    }

    if (!access) {
      throw new Error("Admin authentication required");
    }

    const run = (token) =>
      axios({
        ...config,
        headers: {
          ...(config.headers || {}),
          Authorization: `Bearer ${token}`,
        },
      });

    try {
      return await run(access);
    } catch (error) {
      if (error?.response?.status !== 401 || !refreshToken) throw error;
      const refreshed = await get().refreshAccessToken(refreshToken);
      if (!refreshed) throw error;
      return await run(get().access);
    }
  },

  fetchProfile: async () => {
    const { access } = get();
    if (!access) return false;
    try {
      const response = await axios.get(`${AUTH_URL}/profile/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      get()._applyProfile(response.data);
      return true;
    } catch (error) {
      if (error.response?.status === 401) get().logout();
      return false;
    }
  },

  login: async (phone_number, password) => {
    try {
      const response = await axios.post(`${AUTH_URL}/login/`, {
        phone_number,
        password,
      });
      const { access, refresh, user } = response.data;

      const profileRes = await axios.get(`${AUTH_URL}/profile/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      const profile = profileRes.data;

      if (!profile.is_staff && !profile.is_restaurant_staff) {
        return {
          success: false,
          error:
            "This account does not have staff access. Use the guest app or contact an administrator.",
        };
      }

      set({
        access,
        refreshToken: refresh,
        first_name: user.first_name || profile.first_name || "",
        last_name: user.last_name || profile.last_name || "",
        email: user.email ?? profile.email ?? "",
        phone_number: user.phone_number || profile.phone_number || "",
        user_id: profile.user_id ? String(profile.user_id) : "",
        staff_id: profile.staff_id ? String(profile.staff_id) : "",
        is_staff: Boolean(profile.is_staff),
        is_restaurant_staff: Boolean(profile.is_restaurant_staff),
        isLoggedIn: true,
      });
      persistState(get);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: axiosErrorMessage(
          error,
          "Invalid phone number or password.",
        ),
      };
    }
  },

  updateProfile: async (payload) => {
    const response = await get().authorizedRequest({
      method: "patch",
      url: `${AUTH_URL}/profile/`,
      data: payload,
    });
    get()._applyProfile(response.data);
    return response.data;
  },

  logout: () => {
    clearStored();
    set({
      access: "",
      refreshToken: "",
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      user_id: "",
      staff_id: "",
      is_staff: false,
      is_restaurant_staff: false,
      isLoggedIn: false,
    });
  },
}));

export default useAdminAuth;
