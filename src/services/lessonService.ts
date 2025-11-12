import { apiRequest, ApiError } from "./api";
import { parseCookies } from "nookies";

// Interface para os detalhes completos de uma aula
export interface LessonDetails {
  concluido?: boolean;
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

// Interface para o payload de atualização
export interface LessonUpdatePayload {
    titulo: string;
    descricao: string;
    urlVideo: string;
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
 * Atualiza os dados de uma aula existente.
 */
export async function updateLesson(courseId: string | number, lessonId: string | number, payload: LessonUpdatePayload): Promise<LessonDetails> {
    const token = parseCookies().jwt_token;
    if (!token) {
        throw new ApiError("Usuário não autenticado", 401);
    }

    return apiRequest<LessonDetails>(`/courses/${courseId}/lessons/${lessonId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
    });
}


/**
 * Marca o progresso de uma aula para um aluno.
 */
export async function markLessonProgress(enrollmentId: number, lessonId: number, concluido: boolean): Promise<void> {
    const token = parseCookies().jwt_token;
    if (!token) {
        throw new ApiError("Usuário não autenticado", 401);
    }

    return apiRequest<void>(`/enrollments/${enrollmentId}/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ concluido }),
    });
}

export async function getLessonsByCourse(courseId: string | number): Promise<LessonDetails[]> {
  const token = parseCookies().jwt_token;
  if (!token) {
    throw new ApiError("Usuário não autenticado", 401);
  }

  return apiRequest<LessonDetails[]>(`/courses/${courseId}/lessons`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
