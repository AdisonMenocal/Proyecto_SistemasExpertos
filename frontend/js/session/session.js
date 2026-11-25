import { apiRequest } from "../api/api-client.js";

const TOKEN_KEY = "blog_expertos_token";

export function saveToken(token) {
  if (!token || typeof token !== "string") {
    throw new Error("La respuesta del servidor no contiene un token válido.");
  }
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

/**
 * Obtiene el usuario autenticado. Si la API devuelve 401,
 * la sesión se invalida y se elimina el token.
 */
export async function getCurrentUser() {
  const token = getToken();
  if (!token) return null;

  try {
    return await apiRequest("/auth/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    if (error.status === 401) clearSession();
    throw error;
  }
}

export async function logout(redirectTo = "../index.html") {
  clearSession();
  window.location.href = redirectTo;
}
