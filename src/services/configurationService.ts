import { apiRequest, ApiError } from "./api";
import { parseCookies } from "nookies";

interface PaginatedResponse<T> {
  conteudo: T[];
}

export interface ConfigItem {
  id: number;
  name: string;
  visible: boolean;
}

export interface AutoApproveConfig {
  enabled: boolean;
  enabledAt?: string;
  disabledAt?: string;
}

// --- ÁREAS DE CONHECIMENTO ---

export async function getKnowledgeAreas(): Promise<PaginatedResponse<ConfigItem>> {
  const token = parseCookies().jwt_token;
  if (!token) throw new ApiError("Usuário não autenticado", 401);
  // Removemos o filtro "active=true" para o ADMIN ver todos (visíveis e ocultos)
  return apiRequest(`/knowledge-area?size=100`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createKnowledgeArea(name: string): Promise<ConfigItem> {
  const token = parseCookies().jwt_token;
  if (!token) throw new ApiError("Usuário não autenticado", 401);
  return apiRequest(`/knowledge-area`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, visible: true }),
  });
}

export async function updateKnowledgeArea(id: number, name: string, visible: boolean): Promise<ConfigItem> {
  const token = parseCookies().jwt_token;
  if (!token) throw new ApiError("Usuário não autenticado", 401);
  return apiRequest(`/knowledge-area/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, visible }),
  });
}

// --- CAMPI ---

export async function getCampuses(): Promise<PaginatedResponse<ConfigItem>> {
  const token = parseCookies().jwt_token;
  if (!token) throw new ApiError("Usuário não autenticado", 401);
  return apiRequest(`/campus?size=100`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createCampus(name: string): Promise<ConfigItem> {
  const token = parseCookies().jwt_token;
  if (!token) throw new ApiError("Usuário não autenticado", 401);
  return apiRequest(`/campus`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, visible: true }),
  });
}

export async function updateCampus(id: number, name: string, visible: boolean): Promise<ConfigItem> {
  const token = parseCookies().jwt_token;
  if (!token) throw new ApiError("Usuário não autenticado", 401);
  return apiRequest(`/campus/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, visible }),
  });
}

// --- AUTO APROVAÇÃO ---

export async function getAutoApproveStatus(): Promise<AutoApproveConfig> {
  const token = parseCookies().jwt_token;
  if (!token) throw new ApiError("Usuário não autenticado", 401);
  return apiRequest(`/admin/auto-approve`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateAutoApproveStatus(enabled: boolean): Promise<AutoApproveConfig> {
  const token = parseCookies().jwt_token;
  if (!token) throw new ApiError("Usuário não autenticado", 401);
  return apiRequest(`/admin/auto-approve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ enabled }),
  });
}