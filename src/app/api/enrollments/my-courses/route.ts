import { NextRequest } from 'next/server';
import { authenticateRequest } from '../../_lib/auth';
import { db } from '../../_lib/store';
import { jsonResponse, paginate } from '../../_lib/utils';
import { recalculateEnrollmentStatus, serializeEnrollment } from '../_utils';

export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request);
  if (auth instanceof Response) {
    return auth;
  }

  const searchParams = request.nextUrl.searchParams;
  const nome = searchParams.get('nome');
  const concluido = searchParams.get('concluido');
  const page = Number(searchParams.get('page') ?? '0');
  const size = Number(searchParams.get('size') ?? '10');
  const direction = (searchParams.get('direction') ?? 'desc').toLowerCase();

  let items = db.enrollments.filter((enrollment) => enrollment.userId === auth.user.id);

  items.forEach((enrollment) => recalculateEnrollmentStatus(enrollment));

  if (nome) {
    items = items.filter((enrollment) => {
      const course = db.courses.find((courseItem) => courseItem.id === enrollment.cursoId);
      return course?.name.toLowerCase().includes(nome.toLowerCase());
    });
  }

  if (concluido && ['true', 'false'].includes(concluido.toLowerCase())) {
    const concluidoFlag = concluido.toLowerCase() === 'true';
    items = items.filter((enrollment) => enrollment.concluido === concluidoFlag);
  }

  items.sort((a, b) => {
    const directionMultiplier = direction === 'asc' ? 1 : -1;
    return directionMultiplier * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  });

  const result = paginate(items, Number.isNaN(page) ? 0 : page, Number.isNaN(size) ? 10 : size);

  return jsonResponse({
    ...result,
    content: result.content.map((enrollment) => serializeEnrollment(enrollment)),
  });
}
