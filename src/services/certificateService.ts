// src/services/certificateService.ts

import { API_BASE_URL, ApiError } from "./api";
import { parseCookies } from "nookies";

/**
 * Tenta gerar e baixar o PDF do certificado para uma matrícula.
 * @param enrollmentId O ID da matrícula do aluno no curso.
 */
export async function generateCertificate(enrollmentId: number) {
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
    // Se a resposta não for OK, tentamos ler a mensagem de erro JSON do backend
    const errorData = await response.json();
    const message = errorData.message || "Não foi possível gerar o certificado. Verifique se sua solicitação já foi aprovada.";
    throw new ApiError(message, response.status, errorData);
  }

  // Se a resposta for OK, o corpo é o arquivo PDF
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "certificado-mooc-ifpr.pdf"; // Nome do arquivo a ser baixado
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}