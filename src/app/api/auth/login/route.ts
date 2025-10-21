import { NextRequest } from 'next/server';
import { createTimestamp, db } from '../../_lib/store';
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

const createToken = (userId: number) => {
  const random = Math.random().toString(36).substring(2);
  const base = Buffer.from(`${userId}:${Date.now()}:${random}`).toString('base64');
  return base.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      return errorResponse('E-mail e senha são obrigatórios.', 400);
    }

    const user = db.users.find((item) => item.email.toLowerCase() === String(email).toLowerCase());

    if (!user || user.password !== password) {
      return errorResponse('Credenciais inválidas.', 401);
    }

    const token = createToken(user.id);
    const sessionIndex = db.sessions.findIndex((item) => item.userId === user.id);

    if (sessionIndex >= 0) {
      db.sessions[sessionIndex] = { token, userId: user.id, createdAt: Date.now() };
    } else {
      db.sessions.push({ token, userId: user.id, createdAt: Date.now() });
    }

    user.updatedAt = createTimestamp();

    return jsonResponse({ access_token: token, user: sanitizeUser(user.id) });
  } catch (error) {
    console.error(error);
    return errorResponse('Não foi possível processar a requisição.', 500);
  }
}
