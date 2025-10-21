import { NextRequest } from 'next/server';
import { authenticateRequest } from '../../../../../_lib/auth';
import { createTimestamp, db } from '../../../../../_lib/store';
import { errorResponse, jsonResponse } from '../../../../../_lib/utils';
import { getCourseById } from '../../../../courses/_utils';
import { createProgressEntry, recalculateEnrollmentStatus, serializeEnrollment } from '../../../../enrollments/_utils';

const parseId = (value: string) => {
  const id = Number(value);
  return Number.isNaN(id) ? null : id;
};

export async function POST(
  request: NextRequest,
  { params }: { params: { enrollmentId: string; lessonId: string } },
) {
  const auth = authenticateRequest(request);
  if (auth instanceof Response) {
    return auth;
  }

  const enrollmentId = parseId(params.enrollmentId);
  const lessonId = parseId(params.lessonId);

  if (enrollmentId === null || lessonId === null) {
    return errorResponse('Identificadores inválidos.', 400);
  }

  const enrollment = db.enrollments.find((item) => item.id === enrollmentId);
  if (!enrollment) {
    return errorResponse('Matrícula não encontrada.', 404);
  }

  if (auth.user.role !== 'admin' && enrollment.userId !== auth.user.id) {
    return errorResponse('Usuário sem permissão para atualizar esta matrícula.', 403);
  }

  const course = getCourseById(enrollment.cursoId);
  if (!course) {
    return errorResponse('Curso vinculado não encontrado.', 404);
  }

  const lesson = db.lessons.find((item) => item.courseId === course.id && item.id === lessonId);
  if (!lesson) {
    return errorResponse('Aula não pertence ao curso informado.', 404);
  }

  try {
    const body = await request.json();
    const { concluido } = body ?? {};

    if (typeof concluido !== 'boolean') {
      return errorResponse('Campo "concluido" é obrigatório.', 400);
    }

    let progress = db.lessonProgress.find(
      (item) => item.enrollmentId === enrollmentId && item.lessonId === lessonId,
    );

    if (progress) {
      progress.concluido = concluido;
      progress.updatedAt = createTimestamp();
    } else {
      progress = createProgressEntry(enrollmentId, lessonId, concluido);
    }

    recalculateEnrollmentStatus(enrollment);

    return jsonResponse({
      enrollment: serializeEnrollment(enrollment),
      progress,
    });
  } catch (error) {
    console.error(error);
    return errorResponse('Não foi possível processar a requisição.', 500);
  }
}
