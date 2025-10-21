import { NextRequest } from 'next/server';
import { authenticateRequest } from '../../../../_lib/auth';
import { createTimestamp, db, touchCourse } from '../../../../_lib/store';
import { errorResponse, jsonResponse } from '../../../../_lib/utils';
import { getCourseById } from '../../../_utils';

const parseId = (value: string) => {
  const id = Number(value);
  return Number.isNaN(id) ? null : id;
};

const findLesson = (courseId: number, lessonId: number) =>
  db.lessons.find((lesson) => lesson.courseId === courseId && lesson.id === lessonId);

export async function GET(request: NextRequest, { params }: { params: { courseId: string; lessonId: string } }) {
  const auth = authenticateRequest(request);
  if (auth instanceof Response) {
    return auth;
  }

  const courseId = parseId(params.courseId);
  const lessonId = parseId(params.lessonId);

  if (courseId === null || lessonId === null) {
    return errorResponse('Identificador inválido.', 400);
  }

  const course = getCourseById(courseId);
  if (!course) {
    return errorResponse('Curso não encontrado.', 404);
  }

  const lesson = findLesson(courseId, lessonId);
  if (!lesson) {
    return errorResponse('Aula não encontrada.', 404);
  }

  return jsonResponse({ lesson });
}

export async function PUT(request: NextRequest, { params }: { params: { courseId: string; lessonId: string } }) {
  const auth = authenticateRequest(request, ['admin']);
  if (auth instanceof Response) {
    return auth;
  }

  const courseId = parseId(params.courseId);
  const lessonId = parseId(params.lessonId);

  if (courseId === null || lessonId === null) {
    return errorResponse('Identificador inválido.', 400);
  }

  const course = getCourseById(courseId);
  if (!course) {
    return errorResponse('Curso não encontrado.', 404);
  }

  const lesson = findLesson(courseId, lessonId);
  if (!lesson) {
    return errorResponse('Aula não encontrada.', 404);
  }

  try {
    const body = await request.json();
    const { titulo, descricao, urlVideo } = body ?? {};

    if (!titulo || !descricao || !urlVideo) {
      return errorResponse('Campos "titulo", "descricao" e "urlVideo" são obrigatórios.', 400);
    }

    lesson.titulo = titulo;
    lesson.descricao = descricao;
    lesson.urlVideo = urlVideo;
    lesson.updatedAt = createTimestamp();
    touchCourse(courseId);

    return jsonResponse({ lesson });
  } catch (error) {
    console.error(error);
    return errorResponse('Não foi possível processar a requisição.', 500);
  }
}
