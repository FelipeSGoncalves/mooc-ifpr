// src/services/configurationService.ts

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

// --- ÁREAS DE CONHECIMENTO ---

export async function getKnowledgeAreas(): Promise<PaginatedResponse<ConfigItem>> {
  const token = parseCookies().jwt_token;
  if (!token) throw new ApiError("Usuário não autenticado", 401);
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