/** In dev, use Vite proxy (empty base). Set VITE_API_URL=http://127.0.0.1:3001 to bypass proxy if needed. */
const API_BASE = import.meta.env.VITE_API_URL || "";

function getToken() {
  return localStorage.getItem("suarabumi_token");
}

export function setAuth(token, user) {
  if (token) localStorage.setItem("suarabumi_token", token);
  if (user) localStorage.setItem("suarabumi_user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("suarabumi_token");
  localStorage.removeItem("suarabumi_user");
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("suarabumi_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function formatApiError(res, data) {
  if (res.status === 502 || res.status === 503) {
    return (
      "Backend tidak terjangkau (Bad Gateway). Jalankan di terminal: cd E:\\Projects\\Suarabumi lalu npm run dev:all"
    );
  }
  if (res.status === 401) {
    clearAuth();
    return "Sesi habis atau token tidak valid. Silakan masuk lagi.";
  }
  if (res.status === 404) {
    return "Data pengguna tidak ditemukan. Keluar lalu masuk lagi (demo: putra.wijaya@email.com / password123).";
  }
  const err = data?.error;
  if (typeof err === "string") return err;
  if (err?.fieldErrors) {
    const first = Object.values(err.fieldErrors).flat()[0];
    if (first) return String(first);
  }
  if (err?.formErrors?.length) return String(err.formErrors[0]);
  return res.statusText || "Request failed";
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      "Tidak bisa menghubungi server. Pastikan backend berjalan (npm run dev:all)."
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(formatApiError(res, data));
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (body) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getDashboard: () => request("/api/dashboard"),
  getChallengeOverview: () => request("/api/challenges/overview"),
  joinChallenge: (challengeId) =>
    request(`/api/challenges/${challengeId}/join`, { method: "POST" }),
  getLeaderboard: (limit = 10) => request(`/api/leaderboard?limit=${limit}`),
  getBadges: () => request("/api/badges"),
  getProfile: () => request("/api/profile"),
  updateProfile: (body) =>
    request("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  getProfileStats: () => request("/api/profile/stats"),
  getProfileBadges: () => request("/api/profile/badges"),
  getProfileActivities: () => request("/api/profile/activities"),
  deleteProfile: () =>
    request("/api/profile", {
      method: "DELETE",
    }),
  getClimateImpact: () => request("/api/climate-impact"),
  checkHealth: () => request("/health"),
};
