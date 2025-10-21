export type UserRole = 'admin' | 'student';

export interface User {
  id: number;
  fullName: string;
  cpf: string;
  birthDate: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeArea {
  id: number;
  name: string;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Campus {
  id: number;
  name: string;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: number;
  name: string;
  description: string;
  knowledgeAreaId: number;
  campusId: number;
  professorName: string;
  workload: number;
  visible: boolean;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: number;
  courseId: number;
  titulo: string;
  descricao: string;
  urlVideo: string;
  ordemAula: number;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: number;
  userId: number;
  cursoId: number;
  concluido: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LessonProgress {
  id: number;
  enrollmentId: number;
  lessonId: number;
  concluido: boolean;
  updatedAt: string;
}

export interface Session {
  token: string;
  userId: number;
  createdAt: number;
}

export interface PagedResult<T> {
  content: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}
