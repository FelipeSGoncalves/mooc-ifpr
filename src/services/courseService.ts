import { apiRequest, ApiError } from "./api";
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
export interface PaginatedResponse<T> {
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

  // Agora usando o apiRequest, que vai lidar com o header e o token corretamente.
  return apiRequest(`/courses/${courseId}/thumbnail`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
}

export interface LessonSummary {
  id: number;
  titulo: string;
  descricao: string;
  urlVideo: string;
  ordemAula: number;
  miniatura?: string | null;
  concluido?: boolean;
}

export interface CourseDetails {
  campus: { id: number; nome: string };
  id: number;
  nome: string;
  descricao: string;
  nomeProfessor: string;
  miniatura: string | null;
  cargaHoraria: number;
  visivel: boolean;
  areaConhecimento: { id: number; nome: string };
  aulas: LessonSummary[];

  inscricaoInfo?: {
    inscricaoId: number;
    estaInscrito: boolean;
    concluido: boolean;
    inscritoEm: string;
    concluidoEm: string | null;
    totalAulas: number;
    aulasConcluidas: number;
    // --- CAMPOS ADICIONADOS ---
    certificateStatus?: 'analise' | 'aprovado' | 'reprovado';
    certificateStatusDescription?: string;
  };
}

export interface CourseUpdatePayload {
  nome: string;
  descricao: string;
  cargaHoraria: number;
  nomeProfessor: string;
  areaConhecimentoId: number;
  campusId: number;
  visivel?: boolean;
}


export async function patchCourseVisibility(id: number | string, visivel: boolean) {
  const token = parseCookies().jwt_token;
  if (!token) {
      throw new ApiError("Usuário não autenticado", 401);
  }

  // O endpoint retorna o objeto do curso atualizado, igual ao PUT
  return apiRequest<CourseDetails>(`/courses/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ visivel }),
  });
}

/**
 * Busca os detalhes completos de um único curso.
 */
export async function getCourseDetails(id: string | number): Promise<CourseDetails> {
  const token = parseCookies().jwt_token;

  return apiRequest<CourseDetails>(`/courses/${id}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
}

/**
 * Atualiza os dados de um curso existente.
 */
export async function updateCourse(id: string | number, courseData: CourseUpdatePayload) {
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