const API_BASE_URL = "http://127.0.0.1:8000/api";

const ACCESS_TOKEN_KEY = "cafe_access_token";
const REFRESH_TOKEN_KEY = "cafe_refresh_token";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens({ access, refresh }) {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export async function login(phoneNumber, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone_number: phoneNumber,
      password,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Login failed");
  }

  setTokens({ access: data.access, refresh: data.refresh });
  return data;
}

export async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) {
    throw new Error("No refresh token");
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh }),
  });

  const data = await response.json();
  if (!response.ok) {
    clearTokens();
    throw new Error(data.detail || "Token refresh failed");
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
  return data.access;
}

async function authorizedFetch(url, options = {}) {
  const token = getAccessToken();
  const headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : "",
  };

  let response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    try {
      const newAccess = await refreshAccessToken();
      response = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${newAccess}`,
        },
      });
    } catch {
      clearTokens();
      throw new Error("Session expired. Please log in again.");
    }
  }

  return response;
}

export async function fetchProfile() {
  const response = await authorizedFetch(`${API_BASE_URL}/auth/profile/`, {
    method: "GET",
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load profile");
  }

  return data;
}

