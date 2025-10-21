import { NextRequest } from 'next/server';
import { authenticateRequest } from '../_lib/auth';
import { counters, createTimestamp, db } from '../_lib/store';
import { errorResponse, jsonResponse } from '../_lib/utils';
import { getCourseById } from '../courses/_utils';
import { serializeEnrollment } from './_utils';

export async function POST(request: NextRequest) {
  const auth = authenticateRequest(request);
  if (auth instanceof Response) {
    return auth;
  }

  try {
    const body = await request.json();
    const { cursoId } = body ?? {};

    if (!cursoId) {
      return errorResponse('Campo "cursoId" é obrigatório.', 400);
    }

    const course = getCourseById(Number(cursoId));
    if (!course) {
      return errorResponse('Curso não encontrado.', 404);
    }

    const existingEnrollment = db.enrollments.find((item) => item.userId === auth.user.id && item.cursoId === course.id);

    if (existingEnrollment) {
      return jsonResponse({ enrollment: serializeEnrollment(existingEnrollment) });
    }

    const id = counters.enrollment;
    const timestamp = createTimestamp();

    const enrollment = {
      id,
      userId: auth.user.id,
      cursoId: course.id,
      concluido: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    db.enrollments.push(enrollment);

    return jsonResponse({ enrollment: serializeEnrollment(enrollment) }, 201);
  } catch (error) {
    console.error(error);
    return errorResponse('Não foi possível processar a requisição.', 500);
  }
}
