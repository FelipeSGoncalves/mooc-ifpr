// src/services/certificateRequestService.ts

import { apiRequest, ApiError } from "./api";
import { parseCookies } from "nookies";

// Interface para a resposta paginada
interface PaginatedResponse<T> {
  conteudo: T[];
  totalPaginas: number;
  totalElementos: number;
}

// Interface que define a estrutura de uma solicitação de certificado
export interface CertificateRequest {
  id: string;
  enrollmentId: number;
  status: 'analise' | 'aprovado' | 'reprovado';
  statusDescription: string;
  createdAt: string;
  rejectionReason: string | null;
  student: {
    id: number;
    fullName: string;
    cpf: string;
    email: string;
  };
  course: {
    id: number;
    name: string;
    workload: number;
    campusName: string;
  };
}

/**
 * Busca a lista paginada de solicitações de certificado.
 * @param status Filtra as solicitações por status.
 */
export async function getCertificateRequests(status?: 'analise' | 'aprovado' | 'reprovado'): Promise<PaginatedResponse<CertificateRequest>> {
  const token = parseCookies().jwt_token;
  if (!token) {
    throw new ApiError("Usuário não autenticado", 401);
  }

  const params = new URLSearchParams();
  if (status) {
    params.append("status", status);
  }
  params.append("size", "50"); // Busca até 50 por vez

  return apiRequest<PaginatedResponse<CertificateRequest>>(`/certificate-requests?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Atualiza o status de uma solicitação de certificado.
 * @param requestId O ID da solicitação.
 * @param status O novo status ('aprovado' ou 'reprovado').
 * @param rejectionReason O motivo da reprovação (opcional).
 */
export async function updateCertificateRequestStatus(
  requestId: string,
  status: 'aprovado' | 'reprovado',
  rejectionReason?: string
): Promise<CertificateRequest> {
  const token = parseCookies().jwt_token;
  if (!token) {
    throw new ApiError("Usuário não autenticado", 401);
  }

  const payload = {
    status,
    ...(status === 'reprovado' && { motivoReprovacao: rejectionReason }),
  };

  return apiRequest<CertificateRequest>(`/certificate-requests/${requestId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}