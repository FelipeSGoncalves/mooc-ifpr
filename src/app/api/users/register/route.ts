import { NextRequest } from 'next/server';
import { counters, createTimestamp, db } from '../../_lib/store';
import { errorResponse, jsonResponse } from '../../_lib/utils';

const sanitizeUser = (userId: number) => {
  const user = db.users.find((item) => item.id === userId);
  if (!user) {
    return null;
  }

  const { password: _password, ...publicUser } = user;
  void _password;
  return publicUser;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, cpf, birthDate, email, password } = body ?? {};

    if (!fullName || !cpf || !birthDate || !email || !password) {
      return errorResponse('Todos os campos são obrigatórios.', 400);
    }

    const existingUser = db.users.find((item) => item.email.toLowerCase() === String(email).toLowerCase());

    if (existingUser) {
      return errorResponse('E-mail já cadastrado.', 409);
    }

    const id = counters.user;
    const timestamp = createTimestamp();

    db.users.push({
      id,
      fullName,
      cpf,
      birthDate,
      email,
      password,
      role: 'student',
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return jsonResponse({ user: sanitizeUser(id) }, 201);
  } catch (error) {
    console.error(error);
    return errorResponse('Não foi possível processar a requisição.', 500);
  }
}
