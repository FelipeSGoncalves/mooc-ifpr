import { NextRequest } from 'next/server';
import { authenticateRequest } from '../_lib/auth';
import { counters, createTimestamp, db } from '../_lib/store';
import { errorResponse, jsonResponse, paginate } from '../_lib/utils';
import { serializeCourse, getCourseById } from './_utils';

export async function POST(request: NextRequest) {
  const auth = authenticateRequest(request, ['admin']);
  if (auth instanceof Response) {
    return auth;
  }

  try {
    const body = await request.json();
    const { name, description, knowledgeAreaId, campusId, professorName, workload, visible } = body ?? {};

    if (!name || !description || !knowledgeAreaId || !campusId || !professorName || !workload || typeof visible !== 'boolean') {
      return errorResponse('Campos obrigatórios não foram preenchidos.', 400);
    }

    const knowledgeArea = db.knowledgeAreas.find((item) => item.id === Number(knowledgeAreaId));
    if (!knowledgeArea) {
      return errorResponse('Área de conhecimento não encontrada.', 404);
    }

    const campus = db.campuses.find((item) => item.id === Number(campusId));
    if (!campus) {
      return errorResponse('Campus não encontrado.', 404);
    }

    const id = counters.course;
    const timestamp = createTimestamp();

    const course = {
      id,
      name,
      description,
      knowledgeAreaId: Number(knowledgeAreaId),
      campusId: Number(campusId),
      professorName,
      workload: Number(workload),
      visible,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    db.courses.push(course);

    return jsonResponse({ course: serializeCourse(getCourseById(id)) }, 201);
  } catch (error) {
    console.error(error);
    return errorResponse('Não foi possível processar a requisição.', 500);
  }
}

export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request);
  if (auth instanceof Response) {
    return auth;
  }

  const searchParams = request.nextUrl.searchParams;
  const nome = searchParams.get('nome');
  const visivel = searchParams.get('visivel');
  const areaConhecimentoId = searchParams.get('areaConhecimentoId');
  const campusId = searchParams.get('campusId');
  const page = Number(searchParams.get('page') ?? '0');
  const size = Number(searchParams.get('size') ?? '10');
  const direction = (searchParams.get('direction') ?? 'desc').toLowerCase();

  let items = [...db.courses];

  if (nome) {
    items = items.filter((item) => item.name.toLowerCase().includes(nome.toLowerCase()));
  }

  if (visivel && ['true', 'false'].includes(visivel.toLowerCase())) {
    const visibleFlag = visivel.toLowerCase() === 'true';
    items = items.filter((item) => item.visible === visibleFlag);
  }

  if (areaConhecimentoId) {
    items = items.filter((item) => item.knowledgeAreaId === Number(areaConhecimentoId));
  }

  if (campusId) {
    items = items.filter((item) => item.campusId === Number(campusId));
  }

  items.sort((a, b) => {
    const directionMultiplier = direction === 'asc' ? 1 : -1;
    return directionMultiplier * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  });

  const result = paginate(items, Number.isNaN(page) ? 0 : page, Number.isNaN(size) ? 10 : size);

  return jsonResponse({
    ...result,
    content: result.content.map((course) => serializeCourse(getCourseById(course.id))),
  });
}
