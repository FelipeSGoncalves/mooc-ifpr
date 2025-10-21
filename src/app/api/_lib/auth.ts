import { NextRequest } from 'next/server';
import { db } from './store';
import { User, UserRole } from './types';

export interface AuthResult {
  user: User;
}

const getAuthorizationHeader = (request: NextRequest) =>
  request.headers.get('authorization') || request.headers.get('Authorization');

export const authenticateRequest = (request: NextRequest, roles?: UserRole[]): AuthResult | Response => {
  const authorization = getAuthorizationHeader(request);

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ message: 'Token não informado.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = authorization.substring(7).trim();
  const session = db.sessions.find((item) => item.token === token);

  if (!session) {
    return new Response(JSON.stringify({ message: 'Sessão inválida ou expirada.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const user = db.users.find((item) => item.id === session.userId);

  if (!user) {
    return new Response(JSON.stringify({ message: 'Usuário não encontrado.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (roles && !roles.includes(user.role)) {
    return new Response(JSON.stringify({ message: 'Usuário sem permissão para executar esta ação.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return { user };
};
