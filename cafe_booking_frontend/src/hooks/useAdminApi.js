import useAdminAuth from "./useAdminAuth";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

function buildUrl(path) {
  if (path.startsWith("http")) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE}${p}`;
}

/** Authenticated request for admin panel (staff JWT). */
export async function adminRequest({ method = "get", path, data, params, headers }) {
  const auth = useAdminAuth.getState();
  const h = { ...(headers || {}) };
  const m = (method || "get").toLowerCase();
  if (data != null && m !== "get" && m !== "head") {
    h["Content-Type"] = h["Content-Type"] || "application/json";
  }
  return auth.authorizedRequest({
    method,
    url: buildUrl(path),
    data: m === "get" || m === "head" ? undefined : data,
    params,
    headers: h,
  });
}

export { BASE as ADMIN_API_BASE };
