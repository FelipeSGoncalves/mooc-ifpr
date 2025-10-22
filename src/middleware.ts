import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from 'jwt-decode';

const protectedAdminRoutes = ["/adm"];
const protectedStudentRoutes = ["/aluno"];
const publicAuthRoutes = ["/auth/login", "/auth/cadastro"];

interface DecodedToken {
  role: 'ADMIN' | 'STUDENT';
  exp: number;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("jwt_token")?.value;
  const { pathname } = request.nextUrl;

  const isTryingToAccessAdmin = protectedAdminRoutes.some((prefix) => pathname.startsWith(prefix));
  const isTryingToAccessStudent = protectedStudentRoutes.some((prefix) => pathname.startsWith(prefix));

  // 1. Se o usuário NÃO tem token e tenta acessar QUALQUER rota protegida
  if (!token && (isTryingToAccessAdmin || isTryingToAccessStudent)) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // 2. Se o usuário TEM um token, decodificamos e validamos
  if (token) {
    try {
      const decoded: DecodedToken = jwtDecode(token);

      // Checa se o token expirou
      if (Date.now() >= decoded.exp * 1000) {
        throw new Error("Token expirado");
      }

      // NOVA LÓGICA DE PROTEÇÃO DE ROTA BASEADA NA ROLE
      // -----------------------------------------------------------------
      // Se é uma rota de ADMIN, mas o usuário não é ADMIN, redireciona
      if (isTryingToAccessAdmin && decoded.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/aluno/dashboard', request.url));
      }

      // Se é uma rota de ALUNO, mas o usuário não é STUDENT, redireciona
      if (isTryingToAccessStudent && decoded.role !== 'STUDENT') {
        return NextResponse.redirect(new URL('/adm/dashboard', request.url));
      }
      // -----------------------------------------------------------------

      // Se o usuário já logado tenta acessar as páginas de login/cadastro,
      // redirecionamos para o seu respectivo dashboard
      if (publicAuthRoutes.some((p) => pathname.startsWith(p))) {
        const dashboardUrl = decoded.role === 'ADMIN' ? '/adm/dashboard' : '/aluno/dashboard';
        return NextResponse.redirect(new URL(dashboardUrl, request.url));
      }

    } catch (error) {
      // Se o token for inválido (expirado, malformado, etc.)
      console.error("Erro na validação do token:", error);
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('jwt_token'); // Limpa o cookie inválido do navegador
      return response;
    }
  }

  // Se nenhuma das condições acima for atendida, permite o acesso
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Aplica o middleware a todas as rotas, exceto arquivos estáticos e de API
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};