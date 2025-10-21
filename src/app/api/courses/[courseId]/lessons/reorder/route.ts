import { NextRequest } from 'next/server';
import { authenticateRequest } from '../../../../_lib/auth';
import { db, resetLessonOrder, touchCourse } from '../../../../_lib/store';
import { errorResponse, jsonResponse } from '../../../../_lib/utils';
import { getCourseById } from '../../../_utils';

const parseId = (value: string) => {
  const id = Number(value);
  return Number.isNaN(id) ? null : id;
};

interface AulaReorder {
  id: number;
  ordemAula: number;
}

export async function PATCH(request: NextRequest, { params }: { params: { courseId: string } }) {
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
    const aulas = Array.isArray(body?.aulas) ? (body.aulas as AulaReorder[]) : [];

    if (!aulas.length) {
      return errorResponse('Lista de aulas é obrigatória.', 400);
    }

    const lessonIds = new Set<number>();

    for (const aula of aulas) {
      if (typeof aula.id !== 'number' || typeof aula.ordemAula !== 'number') {
        return errorResponse('Estrutura da lista de aulas inválida.', 400);
      }
      lessonIds.add(aula.id);
      const lesson = db.lessons.find((item) => item.courseId === courseId && item.id === aula.id);
      if (!lesson) {
        return errorResponse(`Aula ${aula.id} não pertence ao curso informado.`, 404);
      }
      lesson.ordemAula = aula.ordemAula;
    }

    if (lessonIds.size !== aulas.length) {
      return errorResponse('Existem aulas duplicadas na solicitação.', 400);
    }

    resetLessonOrder(courseId);
    touchCourse(courseId);

    const updatedLessons = db.lessons
      .filter((lesson) => lesson.courseId === courseId)
      .sort((a, b) => a.ordemAula - b.ordemAula);

    return jsonResponse({ lessons: updatedLessons });
  } catch (error) {
    console.error(error);
    return errorResponse('Não foi possível processar a requisição.', 500);
  }
}
