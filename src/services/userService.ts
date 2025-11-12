// src/services/userService.js

import { apiRequest, ApiError } from "./api";
import { parseCookies } from "nookies";

/**
 * @typedef {Object} UserDetails
 * @property {number} id
 * @property {string} fullName
 * @property {string} cpf
 * @property {string} birthDate - A data virá como string no formato "YYYY-MM-DD"
 * @property {string} email
 * @property {boolean} active
 * @property {string} createdAt
 */

/**
 * Busca os detalhes do usuário atualmente autenticado.
 * (Assume a existência de um endpoint GET /users/me no backend)
 * @returns {Promise<UserDetails>}
 */
export async function getCurrentUserDetails() {
  const token = parseCookies().jwt_token;
  if (!token) {
    throw new ApiError("Usuário não autenticado", 401);
  }

  // No backend, um endpoint como este precisaria ser criado.
  // Ele usaria o CurrentUserService para buscar os dados do usuário logado.
  return apiRequest("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}