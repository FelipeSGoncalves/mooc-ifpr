// src/services/certificateService.ts

import { API_BASE_URL, ApiError, apiRequest } from "./api";
import { parseCookies } from "nookies";

// Interface para a resposta da validação
export interface ValidationResponse {
  isValid: boolean;
  message: string;
  studentName?: string;
  studentCpf?: string;
  courseName?: string;
  workload?: string;
  campusName?: string;
  completionDate?: string;
}

/**
 * Tenta gerar e baixar o PDF do certificado para uma matrícula.
 * Requer autenticação.
 */
export async function generateCertificate(enrollmentId: number) {
  // ... (código existente, sem alterações)
  const token = parseCookies().jwt_token;
  if (!token) {
    throw new ApiError("Usuário não autenticado", 401);
  }

  const response = await fetch(`${API_BASE_URL}/certificates/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ enrollmentId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData.message || "Não foi possível gerar o certificado.";
    throw new ApiError(message, response.status, errorData);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "certificado-mooc-ifpr.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Valida um certificado enviando o arquivo PDF.
 * Endpoint público.
 */
export async function validateCertificateByPdf(file: File): Promise<ValidationResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<ValidationResponse>("/certificates/validate/pdf", {
    method: 'POST',
    body: formData,
  });
}

/**
 * Valida um certificado usando seu código único.
 * Endpoint público.
 */
export async function validateCertificateByCode(certificateCode: string): Promise<ValidationResponse> {
  return apiRequest<ValidationResponse>("/certificates/validate/code", {
    method: 'POST',
    body: JSON.stringify({ certificateCode }),
  });
}
/**
 * Valida um certificado via URL (GET) usando o código.
 * Endpoint público.
 */
export async function validateCertificateByLink(code: string): Promise<ValidationResponse> {
  return apiRequest<ValidationResponse>(`/certificates/validate/code/${code}`, {
    method: 'GET',
  });
}