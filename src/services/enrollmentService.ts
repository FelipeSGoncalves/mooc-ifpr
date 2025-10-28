import { parseCookies } from "nookies";
import { apiRequest, ApiError } from "./api";
import type { PaginatedResponse } from "./courseService";

// Adicionando a nova função getMyCourses
/**
 * Busca os cursos em que o aluno está matriculado.
 * @param searchTerm - Filtra por nome do curso.
 * @param completed - Filtra por status de conclusão (true para concluídos, false para em andamento).
 * @param direction - Ordena por data de inscrição.
 */
export interface StudentCourseSummary {
  enrollmentId: number;
  cursoId: number;
  nome: string;
  nomeProfessor: string;
  miniatura: string | null;
  cargaHoraria: number;
  concluido: boolean;
  campus: { id: number; nome: string };
  areaConhecimento: { id: number; nome: string };
}

export async function getMyCourses(
  searchTerm?: string,
  completed?: boolean | null,
  direction: "asc" | "desc" = "desc"
) {
  const token = parseCookies().jwt_token;
  if (!token) {
    throw new ApiError("Usuário não autenticado", 401);
  }

  const params = new URLSearchParams();
  if (searchTerm) params.append("nome", searchTerm);
  if (completed !== null && completed !== undefined) {
    params.append("concluido", String(completed));
  }
  params.append("direction", direction);
  params.append("size", "100");

  // A interface da resposta paginada é a mesma do courseService
  return apiRequest<PaginatedResponse<StudentCourseSummary>>(`/enrollments/my-courses?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}


/**
 * Enrolls the logged-in student in a course.
 * @param courseId The ID of the course to enroll in.
 */
export async function enrollInCourse(courseId: number | string) {
  const token = parseCookies().jwt_token;
  if (!token) {
    throw new ApiError("User not authenticated", 401);
  }

  return apiRequest<void>("/enrollments", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ cursoId: courseId }),
  });
}

/**
 * Cancels a student's enrollment in a course.
 * @param enrollmentId The ID of the enrollment.
 */
export async function cancelEnrollment(enrollmentId: number | string) {
  const token = parseCookies().jwt_token;
  if (!token) {
    throw new ApiError("User not authenticated", 401);
  }

  // Note: Backend endpoint for DELETE might not exist yet.
  // This is prepared for when `DELETE /enrollments/{id}` is implemented.
  return apiRequest<void>(`/enrollments/${enrollmentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}