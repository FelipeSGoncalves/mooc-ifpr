import { NextRequest } from 'next/server';
import { authenticateRequest } from '../_lib/auth';
import { counters, createTimestamp, db } from '../_lib/store';
import { errorResponse, jsonResponse, paginate } from '../_lib/utils';

export async function POST(request: NextRequest) {
  const auth = authenticateRequest(request, ['admin']);
  if (auth instanceof Response) {
    return auth;
  }

  try {
    const body = await request.json();
    const { name, visible } = body ?? {};

    if (!name || typeof visible !== 'boolean') {
      return errorResponse('Campos "name" e "visible" são obrigatórios.', 400);
    }

    const exists = db.campuses.some((item) => item.name.toLowerCase() === String(name).toLowerCase());

    if (exists) {
      return errorResponse('Campus já cadastrado.', 409);
    }

    const id = counters.campus;
    const timestamp = createTimestamp();

    const campus = {
      id,
      name,
      visible,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    db.campuses.push(campus);

    return jsonResponse({ campus }, 201);
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
  const name = searchParams.get('name');
  const active = searchParams.get('active');
  const page = Number(searchParams.get('page') ?? '0');
  const size = Number(searchParams.get('size') ?? '10');
  const direction = (searchParams.get('direction') ?? 'asc').toLowerCase();

  let items = [...db.campuses];

  if (name) {
    items = items.filter((item) => item.name.toLowerCase().includes(name.toLowerCase()));
  }

  if (active !== null) {
    if (['true', 'false'].includes(active.toLowerCase())) {
      const activeFlag = active.toLowerCase() === 'true';
      items = items.filter((item) => item.visible === activeFlag);
    }
  }

  items.sort((a, b) => {
    if (direction === 'desc') {
      return b.name.localeCompare(a.name);
    }
    return a.name.localeCompare(b.name);
  });

  const result = paginate(items, Number.isNaN(page) ? 0 : page, Number.isNaN(size) ? 10 : size);

  return jsonResponse(result);
}
