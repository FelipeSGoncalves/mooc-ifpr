import { NextRequest } from 'next/server';
import { authenticateRequest } from '../../../_lib/auth';
import { createTimestamp } from '../../../_lib/store';
import { errorResponse, jsonResponse } from '../../../_lib/utils';
import { getCourseById, serializeCourse } from '../../_utils';

const parseId = (value: string) => {
  const id = Number(value);
  return Number.isNaN(id) ? null : id;
};

const findThumbnailFile = (formData: FormData): File | null => {
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'object' && 'arrayBuffer' in value) {
      if (key.trim().toLowerCase() === 'thumbnail') {
        return value as File;
      }
    }
  }
  return null;
};

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
    const formData = await request.formData();
    const file = findThumbnailFile(formData);

    if (!file) {
      return errorResponse('Arquivo "thumbnail" é obrigatório.', 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const mimeType = file.type || 'application/octet-stream';

    course.thumbnail = `data:${mimeType};base64,${base64}`;
    course.updatedAt = createTimestamp();

    return jsonResponse({ course: serializeCourse(course) });
  } catch (error) {
    console.error(error);
    return errorResponse('Não foi possível processar a requisição.', 500);
  }
}
