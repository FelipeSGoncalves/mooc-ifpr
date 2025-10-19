import { apiRequest, ApiError } from "./api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  cpf: string;
  birthDate: string;
  email: string;
  password: string;
}

interface LoginResponseShape {
  access_token?: string;
  token?: string;
  data?: LoginResponseShape;
  [key: string]: unknown;
}

function extractToken(data: LoginResponseShape | null | undefined): string | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  if (typeof data.access_token === "string" && data.access_token.length > 0) {
    return data.access_token;
  }

  if (typeof data.token === "string" && data.token.length > 0) {
    return data.token;
  }

  if (data.data && typeof data.data === "object") {
    return extractToken(data.data as LoginResponseShape);
  }

  return null;
}

export async function login(payload: LoginPayload) {
  const data = await apiRequest<LoginResponseShape>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const token = extractToken(data);

  if (!token) {
    throw new ApiError(
      "Token de autenticação não encontrado na resposta do servidor.",
      500,
      data
    );
  }

  return { token, data };
}

export async function registerUser(payload: RegisterPayload) {
  return apiRequest<unknown>("/users/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
