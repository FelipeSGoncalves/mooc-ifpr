import { apiRequest, ApiError } from "./api";
import { parseCookies } from "nookies";

/**
 * @typedef {Object} UserDetails
 * @property {number} id
 * @property {string} fullName
 * @property {string} cpf
 * @property {string} birthDate
 * @property {string} email
 * @property {boolean} active
 * @property {string} createdAt
 */

/**
 * Busca os detalhes do usuário atualmente autenticado.
 */
export interface UserDetails {
  id: number;
  fullName: string;
  cpf: string;
  birthDate: string; // Formato ISO: YYYY-MM-DD
  email: string;
  active: boolean;
  createdAt: string;
}

export interface UpdateUserPayload {
  fullName: string;
  cpf: string;
  birthDate: string;
  email: string;
}

/**
 * Busca os detalhes do usuário atualmente autenticado.
 * Endpoint: GET /users/me
 */
export async function getCurrentUserDetails() {
  const token = parseCookies().jwt_token;
  if (!token) {
    throw new ApiError("Usuário não autenticado", 401);
  }

  return apiRequest<UserDetails>("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Atualiza os dados do usuário atualmente autenticado.
 * Endpoint: PUT /users/me
 */
export async function updateCurrentUser(payload: UpdateUserPayload) {
  const token = parseCookies().jwt_token;
  if (!token) {
    throw new ApiError("Usuário não autenticado", 401);
  }

  return apiRequest<UserDetails>("/users/me", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

/**
 * Busca a contagem total de alunos registrados.
 * Endpoint: GET /users/count/students
 */
export async function getStudentCount(): Promise<number> {
  const token = parseCookies().jwt_token;
  if (!token) {
    throw new ApiError("Usuário não autenticado", 401);
  }

  return apiRequest<number>("/users/count/students", {
    headers: { Authorization: `Bearer ${token}` },
  });
}