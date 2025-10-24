import { apiRequest, ApiError } from "./api";
import { parseCookies } from "nookies";

// Interface para os detalhes completos de uma aula
export interface LessonDetails {
  concluido: any;
  id: number;
  cursoId: number;
  titulo: string;
  descricao: string;
  miniatura: string | null;
  urlVideo: string;
  ordemAula: number;
  curso: {
    id: number;
    nome: string;
  };
}

/**
 * Busca os detalhes de uma aula específica dentro de um curso.
 * Requer autenticação.
 */
export async function getLessonDetails(courseId: string | number, lessonId: string | number): Promise<LessonDetails> {
  const token = parseCookies().jwt_token;
  if (!token) {
    throw new ApiError("Usuário não autenticado", 401);
  }

  return apiRequest<LessonDetails>(`/courses/${courseId}/lessons/${lessonId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Marca o progresso de uma aula para um aluno.
 * @param enrollmentId O ID da matrícula do aluno no curso.
 * @param lessonId O ID da aula a ser marcada.
 * @param concluido O status de conclusão.
 */
export async function markLessonProgress(enrollmentId: number, lessonId: number, concluido: boolean) {
    const token = parseCookies().jwt_token;
    if (!token) {
        throw new ApiError("Usuário não autenticado", 401);
    }

    return apiRequest<any>(`/enrollments/${enrollmentId}/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ concluido }),
    });
}

export async function getLessonsByCourse(courseId: string | number): Promise<any[]> {
  const token = parseCookies().jwt_token;
  if (!token) {
    throw new ApiError("Usuário não autenticado", 401);
  }

  return apiRequest<any[]>(`/courses/${courseId}/lessons`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}