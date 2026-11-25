import { API_URL } from "../config/api.js";

export async function apiRequest(endpoint, options = {}) {
    const headers = {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    const contentType = response.headers.get("content-type") || "";

    const data = contentType.includes("application/json")
        ? await response.json().catch(() => ({}))
        : await response.text().catch(() => "");

    if (!response.ok) {
        const message = typeof data === "object"
            ? (data.message || data.error || "La solicitud no pudo completarse.")
            : (data || "La solicitud no pudo completarse.");

        const error = new Error(message);
        error.status = response.status;
        error.data = data;

        throw error;
    }

    return data;
}