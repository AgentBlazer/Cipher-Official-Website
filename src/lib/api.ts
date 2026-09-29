// Base URL of the backend API. Empty in local dev so requests go through the Vite proxy;
// set VITE_API_URL (e.g. https://cipher-backend-api.onrender.com) for production builds.
export const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
