import { NextRequest } from 'next/server';
import { authenticateRequest } from '../../../_lib/auth';
import { counters, createTimestamp, db, findCourseLessons, touchCourse } from '../../../_lib/store';
import { errorResponse, jsonResponse } from '../../../_lib/utils';
import { getCourseById } from '../../_utils';

const parseId = (value: string) => {
  const id = Number(value);
  return Number.isNaN(id) ? null : id;
};

export async function POST(request: NextRequest, { params }: { params: { courseId: string } }) {
  const auth = authenticateRequest(request, ['admin']);
  if (auth instanceof Response) {
    return auth;
  }

  const courseId = parseId(params.courseId);
  if (courseId === null) {
    return errorResponse('Identificador de curso inválido.', 400);
  }

  const course = getCourseById(courseId);
  if (!course) {
    return errorResponse('Curso não encontrado.', 404);
  }

  try {
    const body = await request.json();
    const { titulo, descricao, urlVideo } = body ?? {};

    if (!titulo || !descricao || !urlVideo) {
      return errorResponse('Campos "titulo", "descricao" e "urlVideo" são obrigatórios.', 400);
    }

    const id = counters.lesson;
    const timestamp = createTimestamp();
    const ordemAula = findCourseLessons(courseId).length + 1;

    const lesson = {
      id,
      courseId,
      titulo,
      descricao,
      urlVideo,
      ordemAula,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    db.lessons.push(lesson);
    touchCourse(courseId);

    return jsonResponse({ lesson }, 201);
  } catch (error) {
    console.error(error);
    return errorResponse('Não foi possível processar a requisição.', 500);
  }
}

export async function GET(request: NextRequest, { params }: { params: { courseId: string } }) {
  const auth = authenticateRequest(request);
  if (auth instanceof Response) {
    return auth;
  }

  const courseId = parseId(params.courseId);
  if (courseId === null) {
    return errorResponse('Identificador de curso inválido.', 400);
  }

  const course = getCourseById(courseId);
  if (!course) {
    return errorResponse('Curso não encontrado.', 404);
  }

  const lessons = findCourseLessons(courseId).sort((a, b) => a.ordemAula - b.ordemAula);

  return jsonResponse({ lessons });
}
