// 1. IMPORTAÇÕES CORRIGIDAS: Adicionamos API_BASE_URL e ApiError
import { apiRequest, ApiError, API_BASE_URL } from "./api";
import { parseCookies } from "nookies";

// Interface para as Áreas de Conhecimento
export interface KnowledgeArea {
  id: number;
  name: string;
}

// Interface para um Curso na lista (corresponde ao DTO do backend)
export interface Course {
  id: number;
  nome: string;
  miniatura: string | null;
  cargaHoraria: number;
  areaConhecimento: {
    id: number;
    nome: string;
  };
}

// Interface para a resposta paginada da API
interface PaginatedResponse<T> {
  conteudo: T[];
  totalPaginas: number;
  totalElementos: number;
}

/**
 * Busca a lista de cursos com filtros.
 * @param visible - Filtra por visibilidade (true para alunos, null para admin ver todos)
 */
export async function getCourses(
  searchTerm?: string,
  areaId?: number | null,
  direction: "asc" | "desc" = "desc",
  visible: boolean | null = null
) {
  const params = new URLSearchParams();
  if (searchTerm) params.append("name", searchTerm);
  if (areaId) params.append("knowledgeAreaId", String(areaId));
  if (visible !== null) params.append("visible", String(visible));
  params.append("direction", direction);
  params.append("size", "100");

  return apiRequest<PaginatedResponse<Course>>(`/courses?${params.toString()}`);
}

/**
 * Busca todas as áreas de conhecimento, filtrando por visibilidade.
 */
export async function getKnowledgeAreas() {
  const params = new URLSearchParams({ size: "100", active: "true" });
  return apiRequest<PaginatedResponse<KnowledgeArea>>(`/knowledge-area?${params.toString()}`);
}

/**
 * Faz o upload da thumbnail de um curso.
 * @param courseId O ID do curso ao qual a imagem pertence.
 * @param thumbnail O arquivo da imagem.
 */
export async function uploadCourseThumbnail(courseId: number, thumbnail: File) {
  const token = parseCookies().jwt_token;
  if (!token) {
    throw new ApiError("Usuário não autenticado", 401);
  }

  const formData = new FormData();
  formData.append("thumbnail", thumbnail);

  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/thumbnail`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new ApiError(errorData.message || "Falha no upload da imagem", response.status, errorData);
  }

  return response.json();
}

export interface CourseDetails {
  id: number;
  nome: string;
  descricao: string;
  nomeProfessor: string;
  miniatura: string | null;
  cargaHoraria: number;
  visivel: boolean;
  areaConhecimento: { id: number; nome: string };
  aulas: any[]; // Defina um tipo melhor se necessário
}

/**
 * Busca os detalhes completos de um único curso.
 */
export async function getCourseDetails(id: string | number): Promise<CourseDetails> {
  return apiRequest<CourseDetails>(`/courses/${id}`);
}

/**
 * Atualiza os dados de um curso existente.
 */
export async function updateCourse(id: string | number, courseData: any) {
    const token = parseCookies().jwt_token;
    if (!token) {
        throw new ApiError("Usuário não autenticado", 401);
    }

    return apiRequest<CourseDetails>(`/courses/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(courseData),
    });
}