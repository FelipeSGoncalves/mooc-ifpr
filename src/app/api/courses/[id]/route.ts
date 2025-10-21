import { NextRequest } from 'next/server';
import { authenticateRequest } from '../../_lib/auth';
import { createTimestamp, db } from '../../_lib/store';
import { errorResponse, jsonResponse } from '../../_lib/utils';
import { getCourseById, serializeCourse } from '../_utils';

const parseId = (value: string) => {
  const id = Number(value);
  return Number.isNaN(id) ? null : id;
};

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = authenticateRequest(request);
  if (auth instanceof Response) {
    return auth;
  }

  const id = parseId(params.id);
  if (id === null) {
    return errorResponse('Identificador inválido.', 400);
  }

  const course = getCourseById(id);
  if (!course) {
    return errorResponse('Curso não encontrado.', 404);
  }

  return jsonResponse({ course: serializeCourse(course) });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = authenticateRequest(request, ['admin']);
  if (auth instanceof Response) {
    return auth;
  }

  const id = parseId(params.id);
  if (id === null) {
    return errorResponse('Identificador inválido.', 400);
  }

  const course = getCourseById(id);
  if (!course) {
    return errorResponse('Curso não encontrado.', 404);
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

    course.name = name;
    course.description = description;
    course.knowledgeAreaId = Number(knowledgeAreaId);
    course.campusId = Number(campusId);
    course.professorName = professorName;
    course.workload = Number(workload);
    course.visible = visible;
    course.updatedAt = createTimestamp();

    return jsonResponse({ course: serializeCourse(course) });
  } catch (error) {
    console.error(error);
    return errorResponse('Não foi possível processar a requisição.', 500);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = authenticateRequest(request, ['admin']);
  if (auth instanceof Response) {
    return auth;
  }

  const id = parseId(params.id);
  if (id === null) {
    return errorResponse('Identificador inválido.', 400);
  }

  const course = getCourseById(id);
  if (!course) {
    return errorResponse('Curso não encontrado.', 404);
  }

  try {
    const body = await request.json();
    const { visible } = body ?? {};

    if (typeof visible !== 'boolean') {
      return errorResponse('Campo "visible" é obrigatório.', 400);
    }

    course.visible = visible;
    course.updatedAt = createTimestamp();

    return jsonResponse({ course: serializeCourse(course) });
  } catch (error) {
    console.error(error);
    return errorResponse('Não foi possível processar a requisição.', 500);
  }
}
